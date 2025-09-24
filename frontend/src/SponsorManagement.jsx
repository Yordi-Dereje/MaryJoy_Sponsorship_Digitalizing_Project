import React, { useState, useEffect } from "react";
import { useRoleNavigation } from "./hooks/useRoleNavigation";
import { useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  Search,
  ChevronUp,
  ChevronDown,
  ArrowLeft
} from "lucide-react";

const SponsorManagement = () => {
  const { navigateToDashboard } = useRoleNavigation();
  const navigate = useNavigate();
  const [sponsors, setSponsors] = useState([]);
  const [allSponsors, setAllSponsors] = useState([]);
  const [filteredSponsors, setFilteredSponsors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchInput, setSearchInput] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [residencyFilter, setResidencyFilter] = useState("all");
  const [beneficiaryTypeFilter, setBeneficiaryTypeFilter] = useState("all");
  const [currentSortColumn, setCurrentSortColumn] = useState(0);
  const [currentSortDirection, setCurrentSortDirection] = useState("asc");
  const [activeCard, setActiveCard] = useState("all");

  const handleBack = () => {
    navigateToDashboard(); 
  };

  // Fetch data from both sponsor_requests and sponsors tables
  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch only new sponsors for the table
      const requestsResponse = await fetch('http://localhost:5000/api/sponsor_requests?status=pending');
      const sponsorsResponse = await fetch('http://localhost:5000/api/sponsors?status=new');

      let requestsData = [];
      if (requestsResponse.ok) {
        requestsData = await requestsResponse.json();
      }

      let sponsorsData = [];
      if (sponsorsResponse.ok) {
        const response = await sponsorsResponse.json();
        sponsorsData = response.sponsors || [];
      }

      // Combine and transform data for the table
      const combinedData = [];

      // Add sponsor requests
      if (requestsData.length > 0) {
        combinedData.push(...requestsData.map(request => {
          const isOrganization = request.sponsor_cluster_id === '02';
          const type = isOrganization ? "organization" : "private";
          const residency = "diaspora";

          const childrenCount = request.number_of_child_beneficiaries || 0;
          const eldersCount = request.number_of_elderly_beneficiaries || 0;
          const totalBeneficiaries = request.total_beneficiaries || (childrenCount + eldersCount);

          return {
            id: `req-${request.id}`,
            sponsorId: `${request.sponsor_cluster_id}-${request.sponsor_specific_id}`,
            name: `New Sponsor Request ${request.sponsor_cluster_id}-${request.sponsor_specific_id}`,
            type: type,
            residency: residency,
            phone: "",
            childrenCount: childrenCount,
            eldersCount: eldersCount,
            totalBeneficiaries: totalBeneficiaries,
            monthlyCommitment: request.estimated_monthly_commitment || 0,
            createdAt: request.request_date || new Date().toISOString().split('T')[0],
            status: "new",
            isRequest: true
          };
        }));
      }

      // Add new sponsors
      if (sponsorsData.length > 0) {
        combinedData.push(...sponsorsData.map(sponsor => {
          const type = sponsor.type === "organization" ? "organization" : "private";
          const residency = sponsor.is_diaspora ? "diaspora" : "local";

          const childrenCount = sponsor.beneficiaryCount?.children || 0;
          const eldersCount = sponsor.beneficiaryCount?.elders || 0;
          const totalBeneficiaries = (childrenCount + eldersCount) || 0;

          return {
            id: sponsor.id || `${sponsor.cluster_id}-${sponsor.specific_id}`,
            sponsorId: sponsor.id || `${sponsor.cluster_id}-${sponsor.specific_id}`,
            name: sponsor.full_name || sponsor.name || "N/A",
            type: type,
            residency: residency,
            phone: sponsor.phone_number || sponsor.phone || "N/A",
            childrenCount: childrenCount,
            eldersCount: eldersCount,
            totalBeneficiaries: totalBeneficiaries,
            monthlyCommitment: sponsor.agreed_monthly_payment || 0,
            createdAt: sponsor.created_at?.split('T')[0] || new Date().toISOString().split('T')[0],
            status: "new",
            isRequest: false
          };
        }));
      }

      setAllSponsors(combinedData);
      setFilteredSponsors(combinedData);
    } catch (err) {
      setError(err.message);
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Calculate statistics for ALL sponsors (not filtered)
  const totalSponsors = allSponsors.length;
  const privateSponsors = allSponsors.filter((s) => s.type === "private").length;
  const organizationSponsors = allSponsors.filter((s) => s.type === "organization").length;
  const localSponsors = allSponsors.filter((s) => s.residency === "local").length;
  const diasporaSponsors = allSponsors.filter((s) => s.residency === "diaspora").length;

  // Calculate beneficiary type statistics for ALL sponsors
  const childOnlySponsors = allSponsors.filter(s =>
    s.childrenCount > 0 && s.eldersCount === 0
  ).length;

  const elderlyOnlySponsors = allSponsors.filter(s =>
    s.eldersCount > 0 && s.childrenCount === 0
  ).length;

  const bothSponsors = allSponsors.filter(s =>
    s.childrenCount > 0 && s.eldersCount > 0
  ).length;

  // Filter and sort based on current criteria
  useEffect(() => {
    if (!allSponsors.length) return;

    let filteredData = allSponsors.filter((sponsor) => {
      const searchTermLower = searchInput.toLowerCase();

      // Search filter
      const matchesSearch =
        searchInput === "" ||
        sponsor.name.toLowerCase().includes(searchTermLower) ||
        (sponsor.sponsorId && sponsor.sponsorId.toLowerCase().includes(searchTermLower)) ||
        (sponsor.phone && sponsor.phone.toLowerCase().includes(searchTermLower));

      // Type filter
      const matchesType = typeFilter === "all" || sponsor.type === typeFilter;

      // Residency filter
      const matchesResidency = residencyFilter === "all" || sponsor.residency === residencyFilter;

      // Beneficiary type filter
      let matchesBeneficiaryType = true;
      switch (beneficiaryTypeFilter) {
        case "children":
          matchesBeneficiaryType = sponsor.childrenCount > 0 && sponsor.eldersCount === 0;
          break;
        case "elders":
          matchesBeneficiaryType = sponsor.eldersCount > 0 && sponsor.childrenCount === 0;
          break;
        case "both":
          matchesBeneficiaryType = sponsor.childrenCount > 0 && sponsor.eldersCount > 0;
          break;
        case "all":
        default:
          matchesBeneficiaryType = true;
      }

      return matchesSearch && matchesType && matchesResidency && matchesBeneficiaryType;
    });

    // Sort the filtered data
    const sortedData = [...filteredData].sort((a, b) => {
      let aValue, bValue;
      switch (currentSortColumn) {
        case 0:
          aValue = a.name;
          bValue = b.name;
          break;
        case 1:
          aValue = a.type;
          bValue = b.type;
          break;
        case 2:
          aValue = a.residency;
          bValue = b.residency;
          break;
        case 3:
          aValue = a.phone;
          bValue = b.phone;
          break;
        case 4:
          aValue = a.totalBeneficiaries;
          bValue = b.totalBeneficiaries;
          break;
        case 5:
          aValue = a.monthlyCommitment;
          bValue = b.monthlyCommitment;
          break;
        case 6:
          aValue = new Date(a.createdAt);
          bValue = new Date(b.createdAt);
          break;
        default:
          return 0;
      }

      if (currentSortColumn === 6) {
        return currentSortDirection === "asc"
          ? aValue - bValue
          : bValue - aValue;
      } else if (typeof aValue === "string") {
        return currentSortDirection === "asc"
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      } else {
        return currentSortDirection === "asc"
          ? aValue - bValue
          : bValue - aValue;
      }
    });

    setFilteredSponsors(sortedData);
  }, [
    allSponsors,
    searchInput,
    typeFilter,
    residencyFilter,
    beneficiaryTypeFilter,
    currentSortColumn,
    currentSortDirection
  ]);

  const handleSort = (columnIndex) => {
    if (columnIndex === currentSortColumn) {
      setCurrentSortDirection(currentSortDirection === "asc" ? "desc" : "asc");
    } else {
      setCurrentSortColumn(columnIndex);
      setCurrentSortDirection("asc");
    }
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

  const getSponsorTypeClasses = (type) => {
    return type === "private"
      ? "bg-[#e0f2ff] text-[#0066cc]"
      : "bg-[#e6f7ff] text-[#08979c]";
  };

  const getResidencyClasses = (residency) => {
    return residency === "local"
      ? "bg-[#e6f4ff] text-[#0b6bcb]"
      : "bg-[#e0f7fa] text-[#00838f]";
  };

  const handleStatusChange = async (sponsorId, newStatus, sponsor) => {
    try {
      const isRequest = sponsorId.startsWith('req-');
      const actualId = isRequest ? sponsorId.replace('req-', '') : sponsorId;

      let endpoint = '';
      let method = 'PUT';
      let requestBody = {
        status: newStatus,
        reviewed_by: 1, // Replace with actual user ID
      };

      if (isRequest) {
        if (newStatus === 'approved') {
          endpoint = `http://localhost:5000/api/sponsor_requests/${actualId}/approve`;
          requestBody = {
            ...requestBody,
            cluster_id: sponsor.sponsorId.split('-')[0],
            specific_id: sponsor.sponsorId.split('-')[1],
            type: sponsor.type,
            full_name: sponsor.name.replace('New Sponsor ', ''),
            is_diaspora: sponsor.residency === 'diaspora',
            agreed_monthly_payment: sponsor.monthlyCommitment
          };
        } else if (newStatus === 'pending') {
          endpoint = `http://localhost:5000/api/sponsor_requests/${actualId}`;
          method = 'PUT';
        }
      } else {
        endpoint = `http://localhost:5000/api/sponsors/${sponsor.sponsorId.split('-')[0]}/${sponsor.sponsorId.split('-')[1]}`;
      }

      const response = await fetch(endpoint, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(`Failed to update status: ${response.statusText}`);
      }

      // Update the local state
      setAllSponsors(prevSponsors =>
        prevSponsors.map(s =>
          s.id === sponsorId ? { ...s, status: newStatus } : s
        )
      );

      // Show success message
      alert(`Status updated successfully to ${newStatus}`);

      // Refresh data if a request was approved
      if (isRequest && newStatus === 'approved') {
        fetchData();
      }
    } catch (error) {
      console.error('Error updating status:', error);
      alert(`Error updating status: ${error.message}`);
    }
  };

  // Fix click handling for filters
  const handleCardFilterClick = (filterType, value) => {
    setActiveCard(value);

    if (filterType === "type") {
      setTypeFilter(value);
      setResidencyFilter("all");
      setBeneficiaryTypeFilter("all");
    } else if (filterType === "residency") {
      setResidencyFilter(value);
      setTypeFilter("all");
      setBeneficiaryTypeFilter("all");
    } else if (filterType === "beneficiary") {
      setBeneficiaryTypeFilter(value);
      setTypeFilter("all");
      setResidencyFilter("all");
    } else {
      setTypeFilter("all");
      setResidencyFilter("all");
      setBeneficiaryTypeFilter("all");
    }

    setSearchInput("");
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f5f7fa] p-8 text-[#1e293b] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#032990] mx-auto"></div>
          <p className="mt-4 text-lg">Loading new sponsors...</p>
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
    <div className="min-h-screen bg-[#f5f7fa] p-4 sm:p-6 lg:p-8 font-inter text-[#1e293b]">
      <div className="container mx-auto bg-[#ffffff] rounded-xl shadow-[0_5px_15px_rgba(0,0,0,0.08)] p-4 sm:p-6 lg:p-8 flex flex-col h-[90vh]">
        <div className="flex items-center mb-6 gap-4">
          <button
            onClick={handleBack}
            className="flex items-center justify-center w-12 h-12 bg-[#ffffff] text-[#032990] rounded-lg shadow-[0_4px_8px_rgba(0,0,0,0.1)] transition-all duration-300 border-2 border-[#f0f3ff] hover:bg-[#032990] hover:text-white group"
          >
            <ArrowLeft className="w-6 h-6 stroke-[#032990] transition-colors duration-300 group-hover:stroke-white" />
          </button>
          <h1 className="text-[#032990] font-bold text-3xl m-0">
            Pending Sponsor Management
          </h1>
        </div>

        {/* Stats Cards - All in one row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-8 gap-4 mb-6 overflow-x-auto pb-2">
          <div
            className={`p-4 rounded-lg shadow-[0_3px_8px_rgba(0,0,0,0.05)] border-l-4 border-[#0066cc] bg-gradient-to-br from-[#e0f2ff] to-[#cce5ff] cursor-pointer transition-transform duration-200 hover:scale-[1.02] min-w-[180px] ${
              activeCard === "all"
                ? "!border-[#032990] !bg-gradient-to-br !from-[#f0f3ff] !to-[#e6eeff]"
                : ""
            }`}
            onClick={() => {
              setActiveCard("all");
              setTypeFilter("all");
              setResidencyFilter("all");
              setBeneficiaryTypeFilter("all");
              setSearchInput("");
            }}
          >
            <div className="text-2xl font-bold text-[#1e293b]">
              {totalSponsors}
            </div>
            <div className="text-sm text-[#64748b]">Total New Sponsors</div>
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
            <div className="text-sm text-[#64748b]">Private Sponsors</div>
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
            <div className="text-sm text-[#64748b]">Organizations</div>
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
              activeCard === "children"
                ? "!border-[#032990] !bg-gradient-to-br !from-[#f0f3ff] !to-[#e6eeff]"
                : ""
            }`}
            onClick={() => handleCardFilterClick("beneficiary", "children")}
          >
            <div className="text-2xl font-bold text-[#1e293b]">
              {childOnlySponsors}
            </div>
            <div className="text-sm text-[#64748b]">Children Only</div>
          </div>
          <div
            className={`p-4 rounded-lg shadow-[0_3px_8px_rgba(0,0,0,0.05)] border-l-4 border-[#0066cc] bg-gradient-to-br from-[#e0f2ff] to-[#cce5ff] cursor-pointer transition-transform duration-200 hover:scale-[1.02] min-w-[180px] ${
              activeCard === "elders"
                ? "!border-[#032990] !bg-gradient-to-br !from-[#f0f3ff] !to-[#e6eeff]"
                : ""
            }`}
            onClick={() => handleCardFilterClick("beneficiary", "elders")}
          >
            <div className="text-2xl font-bold text-[#1e293b]">
              {elderlyOnlySponsors}
            </div>
            <div className="text-sm text-[#64748b]">Elderly Only</div>
          </div>
          <div
            className={`p-4 rounded-lg shadow-[0_3px_8px_rgba(0,0,0,0.05)] border-l-4 border-[#0066cc] bg-gradient-to-br from-[#e0f2ff] to-[#cce5ff] cursor-pointer transition-transform duration-200 hover:scale-[1.02] min-w-[180px] ${
              activeCard === "both"
                ? "!border-[#032990] !bg-gradient-to-br !from-[#f0f3ff] !to-[#e6eeff]"
                : ""
            }`}
            onClick={() => handleCardFilterClick("beneficiary", "both")}
          >
            <div className="text-2xl font-bold text-[#1e293b]">
              {bothSponsors}
            </div>
            <div className="text-sm text-[#64748b]">Both</div>
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
              placeholder="Search by name, ID, or phone..."
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
                  "Name",
                  "Type",
                  "Residency",
                  "Phone Number",
                  "Total Beneficiaries",
                  "Monthly Commitment",
                  "Created At",
                  "Actions"
                ].map((header, index) => (
                  <th
                    key={header}
                    className={`px-6 py-3 text-left text-xs font-medium text-[#032990] uppercase tracking-wider cursor-pointer hover:bg-[#e0e8ff] transition-colors duration-200 ${
                      index === 0
                        ? "rounded-tl-lg"
                        : index === 7
                        ? "rounded-tr-lg"
                        : ""
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
              {filteredSponsors.map((sponsor, index) => (
                <tr
                  key={sponsor.id}
                  className={`hover:bg-[#f0f3ff] transition-colors duration-200 cursor-pointer even:bg-[#f8fafc]`}
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#1a1a1a]">
                    {sponsor.name}
                    {sponsor.isRequest && (
                      <span className="ml-2 inline-block px-2 py-1 text-xs font-medium text-yellow-800 bg-yellow-100 rounded-full">
                        Request
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span
                      className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getSponsorTypeClasses(
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
                      {sponsor.totalBeneficiaries}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-[#0066cc] font-medium">
                    ${sponsor.monthlyCommitment.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-[#1e293b]">
                    {formatDate(sponsor.createdAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <select
                      className="p-1.5 rounded-md border border-[#cfd8dc] text-sm bg-[#ffffff] text-[#0066cc] focus:outline-none focus:ring-1 focus:ring-[#0066cc]"
                      value={sponsor.status}
                      onChange={(e) => handleStatusChange(sponsor.id, e.target.value, sponsor)}
                    >
                      <option value="pending" className="bg-[#e6f3ff] text-[#0066cc]">Pending Review</option>
                      <option value="approved" className="bg-[#e6f3ff] text-[#0066cc]">Approved</option>
                    </select>
                  </td>
                </tr>
              ))}
              {filteredSponsors.length === 0 && (
                <tr>
                  <td colSpan="8" className="px-6 py-8 text-center text-[#64748b]">
                    No new sponsors found matching your criteria.
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

export default SponsorManagement;
