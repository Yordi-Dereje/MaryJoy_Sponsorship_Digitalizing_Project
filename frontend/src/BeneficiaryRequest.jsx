import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useRoleNavigation } from "./hooks/useRoleNavigation";
import {
  ArrowLeft,
  ChevronUp,
  ChevronDown,
  Eye,
  Search,
  RefreshCw,
  Users,
  User
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
  const [activeCard, setActiveCard] = useState("all");

  // Fetch from backend
  const fetchData = async () => {
    try {
      setLoading(true);
      setRefreshing(true);

      const response = await fetch('http://localhost:5000/api/sponsor_requests?status=pending');

      if (!response.ok) {
        throw new Error(`Failed to fetch sponsor requests (status ${response.status})`);
      }

      const payload = await response.json();
      const requests = Array.isArray(payload)
        ? payload
        : payload?.requests || payload?.data || [];

      const normalized = (requests || [])
        .filter((request) => request?.sponsor_status === 'active')
        .map((request) => {
          const sponsorId = `${request.sponsor_cluster_id}-${request.sponsor_specific_id}`;
          const sponsorType = request.sponsor_type === 'individual' ? 'private' : (request.sponsor_type || 'private');
          const residency = request.is_diaspora ? 'diaspora' : 'local';
          const currentChildren = request.current_children ?? 0;
          const currentElders = request.current_elders ?? 0;
          const requestedChildren = request.number_of_child_beneficiaries ?? 0;
          const requestedElders = request.number_of_elderly_beneficiaries ?? 0;

          return {
            id: request.id,
            sponsorId,
            name: request.sponsor_full_name || `Sponsor ${sponsorId}`,
            type: sponsorType,
            residency,
            phone: request.phone_number || 'N/A',
            currentBeneficiaries: `${currentChildren} children & ${currentElders} elders`,
            requestedAddition: `${requestedChildren} children & ${requestedElders} elders`,
            status: request.status,
            updatedBy: request.reviewed_by ? `User ${request.reviewed_by}` : 'Admin',
            updatedAt: request.request_date,
            monthlyCommitment: Number(request.estimated_monthly_commitment || 0),
            sponsorDetails: {
              cluster_id: request.sponsor_cluster_id,
              specific_id: request.sponsor_specific_id,
              full_name: request.sponsor_full_name,
              type: request.sponsor_type,
              is_diaspora: request.is_diaspora,
              phone_number: request.phone_number,
              status: request.sponsor_status,
              beneficiaryCount: {
                children: currentChildren,
                elders: currentElders
              }
            }
          };
        });

      setSponsorData(normalized);
      setAllSponsors(normalized);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to load sponsor requests');
      console.error('Error fetching data:', err);
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
    setActiveCard(filterType);
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
    return "bg-[#e0f2ff] text-[#0066cc]";
  };

  const handleRefresh = () => {
    fetchData();
  };

  const handleCardFilterClick = (filterType, value) => {
    setActiveCard(value);
    setCurrentFilter(value);
    setStatusFilter("all");
    setSearchInput("");
  };

  const getSortIndicator = (columnIndex) => {
    if (columnIndex === currentSortColumn) {
      return currentSortDirection === "asc" ? (
        <ChevronUp className="w-4 h-4 inline ml-1" />
      ) : (
        <ChevronDown className="w-4 h-4 inline ml-1" />
      );
    }
    return null;
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
    <div className="min-h-screen bg-[#f5f7fa] p-4 sm:p-6 lg:p-6 font-inter text-[#1e293b]">
      <div className="container mx-auto bg-[#ffffff] rounded-xl shadow-[0_5px_15px_rgba(0,0,0,0.08)] p-4 sm:p-6 lg:p-8 flex flex-col h-[90vh]">
        <div className="flex items-center mb-6 gap-4">
          <button
            onClick={() => navigateToDashboard()}
            className="flex items-center justify-center w-12 h-12 bg-[#ffffff] text-[#032990] rounded-lg shadow-[0_4px_8px_rgba(0,0,0,0.1)] transition-all duration-300 border-2 border-[#f0f3ff] hover:bg-[#032990] hover:text-white group"
          >
            <ArrowLeft className="w-6 h-6 stroke-[#032990] transition-colors duration-300 group-hover:stroke-white" />
          </button>
          <h1 className="text-[#032990] font-bold text-3xl m-0">
            Sponsor Request Management
          </h1>
        </div>

        {/* Statistics Cards - Updated theme */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-4 mb-6 overflow-x-auto pb-2">
          <div
            className={`p-4 rounded-lg shadow-[0_3px_8px_rgba(0,0,0,0.05)] border-l-4 border-[#0066cc] bg-gradient-to-br from-[#e0f2ff] to-[#cce5ff] cursor-pointer transition-transform duration-200 hover:scale-[1.02] min-w-[180px] ${
              activeCard === "all"
                ? "!border-[#032990] !bg-gradient-to-br !from-[#f0f3ff] !to-[#e6eeff]"
                : ""
            }`}
            onClick={() => {
              setActiveCard("all");
              setCurrentFilter("all");
              setStatusFilter("all");
              setSearchInput("");
            }}
          >
            <div className="text-2xl font-bold text-[#1e293b]">
              {totalSponsors}
            </div>
            <div className="text-sm text-[#64748b]">Active Sponsors</div>
          </div>

          <div
            className={`p-4 rounded-lg shadow-[0_3px_8px_rgba(0,3px_8px_rgba(0,0,0,0.05)] border-l-4 border-[#0066cc] bg-gradient-to-br from-[#e0f2ff] to-[#cce5ff] cursor-pointer transition-transform duration-200 hover:scale-[1.02] min-w-[180px] ${
              activeCard === "pending"
                ? "!border-[#032990] !bg-gradient-to-br !from-[#f0f3ff] !to-[#e6eeff]"
                : ""
            }`}
            onClick={() => handleCardFilterClick("status", "pending")}
          >
            <div className="text-2xl font-bold text-[#1e293b]">
              {pendingSponsors}
            </div>
            <div className="text-sm text-[#64748b]">Pending Review</div>
          </div>

          

          <div
            className={`p-4 rounded-lg shadow-[0_3px_8px_rgba(0,0,0,0.05)] border-l-4 border-[#0066cc] bg-gradient-to-br from-[#e0f2ff] to-[#cce5ff] cursor-pointer transition-transform duration-200 hover:scale-[1.02] min-w-[180px] ${
              activeCard === "local"
                ? "!border-[#032990] !bg-gradient-to-br !from-[#f0f3ff] !to-[#e6eeff]"
                : ""
            }`}
            onClick={() => handleCardFilterClick("residency", "local")}
          >
            <div className="text-2xl font-bold text-[#1e293b]">
              {localSponsors}
            </div>
            <div className="text-sm text-[#64748b]">Local</div>
          </div>

          <div
            className={`p-4 rounded-lg shadow-[0_3px_8px_rgba(0,0,0,0.05)] border-l-4 border-[#0066cc] bg-gradient-to-br from-[#e0f2ff] to-[#cce5ff] cursor-pointer transition-transform duration-200 hover:scale-[1.02] min-w-[180px] ${
              activeCard === "diaspora"
                ? "!border-[#032990] !bg-gradient-to-br !from-[#f0f3ff] !to-[#e6eeff]"
                : ""
            }`}
            onClick={() => handleCardFilterClick("residency", "diaspora")}
          >
            <div className="text-2xl font-bold text-[#1e293b]">
              {diasporaSponsors}
            </div>
            <div className="text-sm text-[#64748b]">Diaspora</div>
          </div>

          <div
            className={`p-4 rounded-lg shadow-[0_3px_8px_rgba(0,0,0,0.05)] border-l-4 border-[#0066cc] bg-gradient-to-br from-[#e0f2ff] to-[#cce5ff] cursor-pointer transition-transform duration-200 hover:scale-[1.02] min-w-[180px] ${
              activeCard === "private"
                ? "!border-[#032990] !bg-gradient-to-br !from-[#f0f3ff] !to-[#e6eeff]"
                : ""
            }`}
            onClick={() => handleCardFilterClick("type", "private")}
          >
            <div className="text-2xl font-bold text-[#1e293b]">
              {privateSponsors}
            </div>
            <div className="text-sm text-[#64748b]">Private</div>
          </div>

          <div
            className={`p-4 rounded-lg shadow-[0_3px_8px_rgba(0,0,0,0.05)] border-l-4 border-[#0066cc] bg-gradient-to-br from-[#e0f2ff] to-[#cce5ff] cursor-pointer transition-transform duration-200 hover:scale-[1.02] min-w-[180px] ${
              activeCard === "organization"
                ? "!border-[#032990] !bg-gradient-to-br !from-[#f0f3ff] !to-[#e6eeff]"
                : ""
            }`}
            onClick={() => handleCardFilterClick("type", "organization")}
          >
            <div className="text-2xl font-bold text-[#1e293b]">
              {organizationSponsors}
            </div>
            <div className="text-sm text-[#64748b]">Organization</div>
          </div>
        </div>

        {/* Search */}
        <div className="flex flex-wrap gap-4 mb-6 items-center">
          <div className="relative flex-1 min-w-[300px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#64748b]" />
            <input
              type="text"
              id="searchInput"
              className="pl-10 p-3.5 w-full border border-[#cfd8dc] rounded-lg focus:outline-none focus:ring-2 focus:ring-[rgba(3,41,144,0.2)] focus:border-[#032990] shadow-[0_2px_5px_rgba(0,0,0,0.05)] transition-all duration-200"
              placeholder="Search by sponsor ID, name, or phone number..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
          </div>
        </div>

        {/* Table */}
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
                    className={`px-6 py-3 text-left text-xs font-medium text-[#032990] uppercase tracking-wider cursor-pointer hover:bg-[#e0e8ff] transition-colors duration-200 ${
                      index === 0 ? "rounded-tl-lg" : index === 8 ? "rounded-tr-lg" : ""
                    }`}
                    onClick={() => handleSort(index)}
                  >
                    {header}
                    {getSortIndicator(index)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-[#ffffff] divide-y divide-[#e2e8f0]">
              {sponsorData.map((sponsor, index) => (
                <tr
                  key={sponsor.id}
                  className={`hover:bg-[#f0f3ff] transition-colors duration-200 cursor-pointer even:bg-[#f8fafc]`}
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
                      className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getTypeClasses(
                        sponsor.type
                      )}`}
                    >
                      {sponsor.type === "private" ? "Private" : "Organization"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span
                      className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getResidencyClasses(
                        sponsor.residency
                      )}`}
                    >
                      {sponsor.residency === "local" ? "Local" : "Diaspora"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-[#64748b]">
                    {sponsor.phone || "N/A"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                    <span className="bg-[#e0f2ff] text-[#0066cc] px-3 py-1 rounded-full text-xs font-medium">
                      {sponsor.currentBeneficiaries}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                    <span className="bg-[#e0f2ff] text-[#0066cc] px-3 py-1 rounded-full text-xs font-medium">
                      {sponsor.requestedAddition}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm" onClick={(e) => e.stopPropagation()}>
                    <select
                      className={`p-1.5 rounded-md border border-[#cfd8dc] text-sm bg-[#ffffff] text-[#0066cc] focus:outline-none focus:ring-1 focus:ring-[#0066cc] ${getStatusClasses(
                        sponsor.status
                      )}`}
                      value={sponsor.status}
                      onChange={(e) => updateStatus(sponsor.id, e.target.value)}
                    >
                      <option value="pending" className="bg-[#e6f3ff] text-[#0066cc]">Pending Review</option>
                      <option value="processing" className="bg-[#e6f3ff] text-[#0066cc]">Under Review</option>
                      <option value="approved" className="bg-[#e6f3ff] text-[#0066cc]">Approved</option>
                      <option value="rejected" className="bg-[#e6f3ff] text-[#0066cc]">Rejected</option>
                    </select>
                    <div className="text-xs text-[#64748b] mt-1">
                      Updated by {sponsor.updatedBy} on {sponsor.updatedAt}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm" onClick={(e) => e.stopPropagation()}>
                    <button
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium bg-[#f0f3ff] text-[#032990] hover:bg-[#e0e8ff] transition-colors duration-200"
                      onClick={() => viewDetails(sponsor)}
                    >
                      <Eye className="w-4 h-4" />
                      View
                    </button>
                  </td>
                </tr>
              ))}
              {sponsorData.length === 0 && (
                <tr>
                  <td colSpan="9" className="px-6 py-8 text-center text-[#64748b]">
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
