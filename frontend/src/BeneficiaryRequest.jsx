import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useRoleNavigation } from "./hooks/useRoleNavigation";
import {
  ArrowLeft,
  ChevronUp,
  ChevronDown,
  Eye,
  Search,
  RefreshCw
} from "lucide-react";

const BeneficiaryRequest = () => {
  const navigate = useNavigate();
  const { navigateToDashboard } = useRoleNavigation();
  const [sponsorData, setSponsorData] = useState([]);
  const [allSponsors, setAllSponsors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentSortColumn, setCurrentSortColumn] = useState(0);
  const [currentSortDirection, setCurrentSortDirection] = useState("asc");
  const [currentFilter, setCurrentFilter] = useState("all");
  const [searchInput, setSearchInput] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [refreshing, setRefreshing] = useState(false);

  // Fetch from backend

  // Simulate data fetching
  const fetchData = async () => {
    try {
      setLoading(true);
      setRefreshing(true);

      const [requestsRes, sponsorsRes] = await Promise.all([
        fetch('http://localhost:5000/api/sponsor_requests?status=pending'),
        fetch('http://localhost:5000/api/sponsors?status=active')
      ]);

      const requests = requestsRes.ok ? await requestsRes.json() : [];
      const sponsors = sponsorsRes.ok ? (await sponsorsRes.json()).sponsors : [];

      // Only include requests where the sponsor exists and has active status
      const combinedData = (requests || []).filter(request => {
        const sponsor = sponsors.find(
          s => (s.cluster_id === request.sponsor_cluster_id && s.specific_id === request.sponsor_specific_id) || (s.id === `${request.sponsor_cluster_id}-${request.sponsor_specific_id}`)
        );
        // Only include if sponsor exists and is active (not new)
        return sponsor && sponsor.status === 'active';
      }).map(request => {
        const sponsor = sponsors.find(
          s => (s.cluster_id === request.sponsor_cluster_id && s.specific_id === request.sponsor_specific_id) || (s.id === `${request.sponsor_cluster_id}-${request.sponsor_specific_id}`)
        );

        const currentChildren = sponsor?.beneficiaryCount?.children || 0;
        const currentElders = sponsor?.beneficiaryCount?.elders || 0;

        return {
          id: request.id,
          sponsorId: `${request.sponsor_cluster_id}-${request.sponsor_specific_id}`,
          name: sponsor?.name || sponsor?.full_name || `Sponsor ${request.sponsor_cluster_id}-${request.sponsor_specific_id}`,
          type: (sponsor?.type === 'individual') ? 'private' : (sponsor?.type || 'private'),
          residency: sponsor?.is_diaspora ? 'diaspora' : 'local',
          phone: sponsor?.phone || sponsor?.phone_number || 'N/A',
          currentBeneficiaries: `${currentChildren} children & ${currentElders} elders`,
          requestedAddition: `${request.number_of_child_beneficiaries} children & ${request.number_of_elderly_beneficiaries} elders`,
          status: request.status,
          updatedBy: 'Admin',
          updatedAt: request.request_date,
          monthlyCommitment: Number(request.estimated_monthly_commitment || 0),
          sponsorDetails: sponsor
        };
      });

      setSponsorData(combinedData);
      setAllSponsors(combinedData);
    } catch (err) {
      setError(err.message);
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Calculate statistics
  const totalSponsors = allSponsors.length;
  const pendingSponsors = allSponsors.filter(s => s.status === "pending").length;
  const processingSponsors = allSponsors.filter(s => s.status === "processing").length;
  const localSponsors = allSponsors.filter(s => s.residency === "local").length;
  const diasporaSponsors = allSponsors.filter(s => s.residency === "diaspora").length;
  const privateSponsors = allSponsors.filter(s => s.type === "private").length;
  const organizationSponsors = allSponsors.filter(s => s.type === "organization").length;

  useEffect(() => {
    filterAndSortTable();
  }, [
    currentFilter,
    searchInput,
    statusFilter,
    currentSortColumn,
    currentSortDirection,
    allSponsors
  ]);

  const filterByCard = (filterType) => {
    setCurrentFilter(filterType);
    setStatusFilter("all");
    setSearchInput("");
  };

  const filterAndSortTable = () => {
    let filtered = allSponsors.filter((sponsor) => {
      let cardMatch = true;
      if (currentFilter !== "all") {
        if (currentFilter === "local" && sponsor.residency !== "local")
          cardMatch = false;
        if (currentFilter === "diaspora" && sponsor.residency !== "diaspora")
          cardMatch = false;
        if (currentFilter === "private" && sponsor.type !== "private")
          cardMatch = false;
        if (currentFilter === "organization" && sponsor.type !== "organization")
          cardMatch = false;
        if (currentFilter === "pending" && sponsor.status !== "pending")
          cardMatch = false;
        if (currentFilter === "processing" && sponsor.status !== "processing")
          cardMatch = false;
      }

      const textMatch =
        searchInput === "" ||
        sponsor.sponsorId.toLowerCase().includes(searchInput.toLowerCase()) ||
        sponsor.name.toLowerCase().includes(searchInput.toLowerCase()) ||
        sponsor.phone.toLowerCase().includes(searchInput.toLowerCase());

      const statusFilterMatch =
        statusFilter === "all" || sponsor.status === statusFilter;

      return cardMatch && textMatch && statusFilterMatch;
    });

    const sortedData = [...filtered].sort((a, b) => {
      let aValue, bValue;

      switch (currentSortColumn) {
        case 0:
          aValue = a.sponsorId;
          bValue = b.sponsorId;
          break;
        case 1:
          aValue = a.name;
          bValue = b.name;
          break;
        case 2:
          aValue = a.type;
          bValue = b.type;
          break;
        case 3:
          aValue = a.residency;
          bValue = b.residency;
          break;
        case 4:
          aValue = a.phone;
          bValue = b.phone;
          break;
        case 5:
          aValue = parseInt(a.currentBeneficiaries.match(/\d+/)?.[0] || 0);
          bValue = parseInt(b.currentBeneficiaries.match(/\d+/)?.[0] || 0);
          break;
        case 6:
          aValue = parseInt(a.requestedAddition.match(/\d+/)?.[0] || 0);
          bValue = parseInt(b.requestedAddition.match(/\d+/)?.[0] || 0);
          break;
        case 7:
          aValue = a.status;
          bValue = b.status;
          break;
        default:
          aValue = "";
          bValue = "";
      }

      if (typeof aValue === "number" && typeof bValue === "number") {
        return currentSortDirection === "asc"
          ? aValue - bValue
          : bValue - aValue;
      } else {
        return currentSortDirection === "asc"
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
    });

    setSponsorData(sortedData);
  };

  const handleSort = (columnIndex) => {
    if (columnIndex === currentSortColumn) {
      setCurrentSortDirection(currentSortDirection === "asc" ? "desc" : "asc");
    } else {
      setCurrentSortColumn(columnIndex);
      setCurrentSortDirection("asc");
    }
  };

  const updateStatus = async (sponsorId, newStatus) => {
    try {
      await fetch(`http://localhost:5000/api/sponsor_requests/${sponsorId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });

      setSponsorData(prevData => prevData.map(s => s.id === sponsorId ? { ...s, status: newStatus } : s));
      setAllSponsors(prevData => prevData.map(s => s.id === sponsorId ? { ...s, status: newStatus } : s));

      alert(`Status updated for sponsor ID ${sponsorId} to ${newStatus}`);
    } catch (error) {
      console.error('Error updating status:', error);
      alert(`Error updating status: ${error.message}`);
    }
  };

  const viewDetails = (sponsor) => {
    if (!sponsor?.sponsorDetails) return;
    const { cluster_id, specific_id } = sponsor.sponsorDetails;
    navigate(`/sponsors/${cluster_id}/${specific_id}`, { state: { sponsor: sponsor.sponsorDetails, fromBeneficiaryRequest: true } });
  };

  const getStatusClasses = (status) => {
    switch (status) {
      case "pending":
        return "bg-[#e6f7ff] text-[#08979c]";
      case "processing":
        return "bg-[#bae7ff] text-[#096dd9]";
      case "approved":
        return "bg-[#f6ffed] text-[#389e0d]";
      case "rejected":
        return "bg-[#fff1f0] text-[#cf1322]";
      default:
        return "";
    }
  };

  const getTypeClasses = (type) => {
    return type === "private"
      ? "bg-[#e0f2ff] text-[#0066cc]"
      : "bg-[#e6f7ff] text-[#08979c]";
  };

  const getResidencyClasses = (residency) => {
    return residency === "local"
      ? "bg-[#e6f4ff] text-[#0b6bcb]"
      : "bg-[#e0f7fa] text-[#00838f]";
  };

  const getBeneficiaryCountClasses = (countText) => {
    if (countText.includes("children") && countText.includes("elders")) {
      return "bg-gradient-to-r from-[#e6f7ff] to-[#e0f2ff] text-[#0066cc]";
    } else if (countText.includes("children")) {
      return "bg-[#e6f7ff] text-[#0066cc]";
    } else if (countText.includes("elders")) {
      return "bg-[#e0f2ff] text-[#0066cc]";
    }
    return "";
  };

  const handleRefresh = () => {
    fetchData();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f5f7fa] p-8 text-[#1e293b] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#032990] mx-auto"></div>
          <p className="mt-4 text-lg">Loading beneficiary requests...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#f5f7fa] p-8 text-[#1e293b] flex items-center justify-center">
        <div className="text-center text-[#0066cc]">
          <p className="text-lg">Error: {error}</p>
          <button
            onClick={fetchData}
            className="mt-4 px-6 py-2 bg-[#032990] text-white rounded-lg hover:bg-[#021f70]"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f7fa] p-6 font-inter text-[#1e293b]">
      <div className="container mx-auto bg-[#ffffff] rounded-xl shadow-[0_5px_15px_rgba(0,0,0,0.08)] p-6 flex flex-col h-[90vh]">
        <div className="flex items-center mb-6 gap-4">
          <button
            onClick={() => navigateToDashboard()}
            className="flex items-center justify-center w-12 h-12 bg-[#ffffff] text-[#032990] rounded-lg shadow-[0_4px_8px_rgba(0,0,0,0.1)] transition-all duration-300 border border-[#e2e8f0] hover:bg-[#032990] hover:text-white group"
          >
            <ArrowLeft className="w-6 h-6 stroke-[#032990] group-hover:stroke-white transition-colors duration-300" />
          </button>
          <h1 className="text-3xl font-bold text-[#032990]">
            Sponsor Request Management
          </h1>
        </div>

        {/* Statistics Cards */}
        <div className="flex overflow-x-auto pb-4 mb-6 gap-3 scrollbar-thin scrollbar-thumb-[#c5cae9] scrollbar-track-transparent">
          {/* Refresh Card - Total Active Sponsors */}
          <div
            className={`flex-shrink-0 w-48 p-4 rounded-lg shadow-[0_2px_6px_rgba(0,0,0,0.05)] border-l-2 border-[#032990] bg-gradient-to-br from-[#f0f3ff] to-[#e6eeff] cursor-pointer transition-all duration-200 hover:scale-[1.02] ${
              refreshing ? "ring-2 ring-[#032990] shadow-md" : ""
            }`}
            onClick={handleRefresh}
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-[#032990]">{totalSponsors}</div>
                <div className="text-sm text-[#64748b]">Active Sponsors</div>
              </div>
              {refreshing ? (
                <RefreshCw className="w-5 h-5 text-[#032990] animate-spin" />
              ) : (
                <RefreshCw className="w-5 h-5 text-[#032990]" />
              )}
            </div>
          </div>

          {/* Status Cards */}
          <div
            className={`flex-shrink-0 w-48 p-4 rounded-lg shadow-[0_2px_6px_rgba(0,0,0,0.05)] border-l-2 border-[#032990] bg-gradient-to-br from-[#f0f3ff] to-[#e6eeff] cursor-pointer transition-all duration-200 hover:scale-[1.02] ${
              currentFilter === "pending" ? "ring-2 ring-[#032990] shadow-md" : ""
            }`}
            onClick={() => filterByCard("pending")}
          >
            <div className="text-2xl font-bold text-[#032990]">{pendingSponsors}</div>
            <div className="text-sm text-[#64748b]">Pending Review</div>
          </div>

          <div
            className={`flex-shrink-0 w-48 p-4 rounded-lg shadow-[0_2px_6px_rgba(0,0,0,0.05)] border-l-2 border-[#032990] bg-gradient-to-br from-[#f0f3ff] to-[#e6eeff] cursor-pointer transition-all duration-200 hover:scale-[1.02] ${
              currentFilter === "processing" ? "ring-2 ring-[#032990] shadow-md" : ""
            }`}
            onClick={() => filterByCard("processing")}
          >
            <div className="text-2xl font-bold text-[#032990]">{processingSponsors}</div>
            <div className="text-sm text-[#64748b]">Under Review</div>
          </div>

          {/* Residency Cards */}
          <div
            className={`flex-shrink-0 w-48 p-4 rounded-lg shadow-[0_2px_6px_rgba(0,0,0,0.05)] border-l-2 border-[#032990] bg-gradient-to-br from-[#f0f3ff] to-[#e6eeff] cursor-pointer transition-all duration-200 hover:scale-[1.02] ${
              currentFilter === "local" ? "ring-2 ring-[#032990] shadow-md" : ""
            }`}
            onClick={() => filterByCard("local")}
          >
            <div className="text-2xl font-bold text-[#032990]">{localSponsors}</div>
            <div className="text-sm text-[#64748b]">Local</div>
          </div>

          <div
            className={`flex-shrink-0 w-48 p-4 rounded-lg shadow-[0_2px_6px_rgba(0,0,0,0.05)] border-l-2 border-[#032990] bg-gradient-to-br from-[#f0f3ff] to-[#e6eeff] cursor-pointer transition-all duration-200 hover:scale-[1.02] ${
              currentFilter === "diaspora" ? "ring-2 ring-[#032990] shadow-md" : ""
            }`}
            onClick={() => filterByCard("diaspora")}
          >
            <div className="text-2xl font-bold text-[#032990]">{diasporaSponsors}</div>
            <div className="text-sm text-[#64748b]">Diaspora</div>
          </div>

          {/* Type Cards */}
          <div
            className={`flex-shrink-0 w-48 p-4 rounded-lg shadow-[0_2px_6px_rgba(0,0,0,0.05)] border-l-2 border-[#032990] bg-gradient-to-br from-[#f0f3ff] to-[#e6eeff] cursor-pointer transition-all duration-200 hover:scale-[1.02] ${
              currentFilter === "private" ? "ring-2 ring-[#032990] shadow-md" : ""
            }`}
            onClick={() => filterByCard("private")}
          >
            <div className="text-2xl font-bold text-[#032990]">{privateSponsors}</div>
            <div className="text-sm text-[#64748b]">Private</div>
          </div>

          <div
            className={`flex-shrink-0 w-48 p-4 rounded-lg shadow-[0_2px_6px_rgba(0,0,0,0.05)] border-l-2 border-[#032990] bg-gradient-to-br from-[#f0f3ff] to-[#e6eeff] cursor-pointer transition-all duration-200 hover:scale-[1.02] ${
              currentFilter === "organization" ? "ring-2 ring-[#032990] shadow-md" : ""
            }`}
            onClick={() => filterByCard("organization")}
          >
            <div className="text-2xl font-bold text-[#032990]">{organizationSponsors}</div>
            <div className="text-sm text-[#64748b]">Organization</div>
          </div>
        </div>

        {/* Search and Filter Controls */}
        <div className="flex flex-wrap gap-4 mb-6 items-center">
          <div className="relative flex-1 min-w-[300px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#64748b]" />
            <input
              type="text"
              id="searchInput"
              className="pl-10 p-3.5 w-full border border-[#cfd8dc] rounded-lg bg-[#ffffff] text-base shadow-[0_2px_5px_rgba(0,0,0,0.05)] focus:outline-none focus:ring-3 focus:ring-[rgba(234,161,8,0.2)] focus:border-[#EAA108] transition-all duration-300"
              placeholder="Search by sponsor ID, name, or phone number..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
          </div>

          
        </div>

        {/* Sponsors Table with blue color scheme */}
        <div className="overflow-x-auto flex-1 border border-[#e2e8f0] rounded-lg shadow-[0_2px_5px_rgba(0,0,0,0.05)]">
          <table className="min-w-full divide-y divide-[#e2e8f0]">
            <thead className="bg-[#f0f3ff] sticky top-0">
              <tr>
                {[
                  "Sponsor ID",
                  "Name",
                  "Type",
                  "Residency",
                  "Phone Number",
                  "Current Beneficiaries",
                  "Requested Addition",
                  "Status",
                  "Actions"
                ].map((header, index) => (
                  <th
                    key={header}
                    className={`px-6 py-4 text-left text-sm font-semibold text-[#032990] uppercase tracking-wider cursor-pointer hover:bg-[#e0e8ff] transition-colors duration-200 ${
                      index === 0 ? "rounded-tl-lg" : index === 8 ? "rounded-tr-lg" : ""
                    }`}
                    onClick={() => handleSort(index)}
                  >
                    {header}
                    {currentSortColumn === index &&
                      (currentSortDirection === "asc" ? (
                        <ChevronUp className="w-4 h-4 inline ml-1" />
                      ) : (
                        <ChevronDown className="w-4 h-4 inline ml-1" />
                      ))}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-[#ffffff] divide-y divide-[#e2e8f0]">
              {sponsorData.map((sponsor, index) => (
                <tr
                  key={sponsor.id}
                  className={`hover:bg-[#e6f3ff] transition-colors duration-200 cursor-pointer ${
                    index % 2 === 0 ? 'bg-[#f8faff]' : 'bg-[#ffffff]'
                  }`}
                  onClick={() => viewDetails(sponsor)}
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#032990]">
                    {sponsor.sponsorId}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#1a1a1a]">
                    {sponsor.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span
                      className={`px-2 py-1 inline-block text-xs font-medium rounded-full ${getTypeClasses(
                        sponsor.type
                      )}`}
                    >
                      {sponsor.type === "private" ? "Private" : "Organization"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span
                      className={`px-2 py-1 inline-block text-xs font-medium rounded-full ${getResidencyClasses(
                        sponsor.residency
                      )}`}
                    >
                      {sponsor.residency === "local" ? "Local" : "Diaspora"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-[#1e293b]">
                    {sponsor.phone}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span
                      className={`px-2 py-1 inline-flex items-center text-xs font-medium rounded-full ${getBeneficiaryCountClasses(
                        sponsor.currentBeneficiaries
                      )}`}
                    >
                      {sponsor.currentBeneficiaries}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span
                      className={`px-2 py-1 inline-flex items-center text-xs font-medium rounded-full ${getBeneficiaryCountClasses(
                        sponsor.requestedAddition
                      )}`}
                    >
                      {sponsor.requestedAddition}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <select
                      className={`p-1.5 rounded-md border border-[#cfd8dc] text-sm bg-[#ffffff] focus:outline-none focus:ring-1 focus:ring-[#0066cc] ${getStatusClasses(
                        sponsor.status
                      )}`}
                      value={sponsor.status}
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) => updateStatus(sponsor.id, e.target.value)}
                    >
                      <option value="pending">Pending Review</option>
                      <option value="processing">Under Review</option>
                      <option value="approved">Approved</option>
                      <option value="rejected">Rejected</option>
                    </select>
                    <div className="text-xs text-[#64748b] mt-1">
                      Updated by {sponsor.updatedBy} on {sponsor.updatedAt}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium bg-[#f0f3ff] text-[#032990] hover:bg-[#e0e8ff] transition-colors duration-200"
                      onClick={(e) => { e.stopPropagation(); viewDetails(sponsor); }}
                    >
                      <Eye className="w-4 h-4" />
                      View
                    </button>
                  </td>
                </tr>
              ))}
              {sponsorData.length === 0 && (
                <tr>
                  <td colSpan="9" className="px-6 py-8 text-center text-gray-500">
                    No beneficiary requests found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default BeneficiaryRequest;
