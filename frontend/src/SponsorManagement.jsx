import React, { useState, useEffect } from "react";
import { useRoleNavigation } from "./hooks/useRoleNavigation";
import { useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  Search,
  ChevronUp,
  ChevronDown,
  ChevronRight,
  ArrowLeft,
  Users,
  User
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
  const [expandedRows, setExpandedRows] = useState(new Set());

  const handleBack = () => {
    navigateToDashboard(); 
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Handle status change
  const handleStatusChange = async (sponsorId, newStatus, sponsor) => {
    try {
      if (sponsor.isRequest) {
        // Handle sponsor request status change
        const actualId = sponsor.id.replace('req-', '');
        let endpoint = `http://localhost:5000/api/sponsor_requests/${actualId}`;
        let requestBody = {
          status: newStatus,
          reviewed_by: 1, // Replace with actual user ID
        };

        if (newStatus === 'approved') {
          endpoint = `http://localhost:5000/api/sponsor_requests/${actualId}/approve`;
          requestBody = {
            ...requestBody,
            cluster_id: sponsor.sponsorId.split('-')[0],
            specific_id: sponsor.sponsorId.split('-')[1],
            type: sponsor.type,
            full_name: sponsor.name,
            phone_number: sponsor.phone,
            agreed_monthly_payment: sponsor.monthlyCommitment || 0,
            is_diaspora: sponsor.residency === 'diaspora'
          };
        }

        const response = await fetch(endpoint, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
          throw new Error('Failed to update sponsor request status');
        }

        alert(`Sponsor request ${newStatus} successfully!`);
      } else {
        // Handle existing sponsor status change
        const [cluster_id, specific_id] = sponsor.sponsorId.split('-');
        const response = await fetch(`http://localhost:5000/api/sponsors/${cluster_id}/${specific_id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            status: newStatus === 'approved' ? 'active' : newStatus
          })
        });

        if (!response.ok) {
          throw new Error('Failed to update sponsor status');
        }

        alert(`Sponsor ${newStatus} successfully!`);
      }

      // Refresh the data
      fetchData();
    } catch (error) {
      console.error('Error updating status:', error);
      alert(`Error: ${error.message}`);
    }
  };

  // Handle row click to navigate to sponsor details
  const handleRowClick = (sponsor) => {
    const [cluster_id, specific_id] = sponsor.sponsorId.split('-');
    navigate(`/sponsors/${cluster_id}/${specific_id}`);
  };

  // Toggle row expansion for beneficiary details
  const toggleRowExpansion = (sponsorId, event) => {
    event.stopPropagation();
    const newExpandedRows = new Set(expandedRows);
    if (newExpandedRows.has(sponsorId)) {
      newExpandedRows.delete(sponsorId);
    } else {
      newExpandedRows.add(sponsorId);
    }
    setExpandedRows(newExpandedRows);
  };

  // Fetch data from both sponsor_requests and sponsors tables
  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch all sponsor requests and new sponsors (not active ones)
      const requestsResponse = await fetch('http://localhost:5000/api/sponsor_requests');
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

      // Create a map to avoid duplicates and merge data by sponsor ID
      const sponsorMap = new Map();
      
      // Add sponsor requests first
      if (requestsData.length > 0) {
        requestsData.forEach(request => {
          const isOrganization = request.sponsor_cluster_id === '02';
          const type = isOrganization ? "organization" : "private";
          const residency = "diaspora";
          const sponsorId = `${request.sponsor_cluster_id}-${request.sponsor_specific_id}`;
          
          const childrenCount = request.number_of_child_beneficiaries || 0;
          const eldersCount = request.number_of_elderly_beneficiaries || 0;
          
          sponsorMap.set(sponsorId, {
            id: `req-${request.id}`,
            sponsorId: sponsorId,
            name: request.full_name || "N/A",
            type: type,
            residency: residency,
            phone: request.phone_number || "N/A",
            childrenCount: childrenCount,
            eldersCount: eldersCount,
            beneficiaryRequested: `${childrenCount} child & ${eldersCount} elderly`,
            monthlyCommitment: 0, // No estimated commitment in requests anymore
            createdAt: request.request_date || new Date().toISOString().split('T')[0],
            status: request.status || "pending",
            isRequest: true,
            requestData: request
          });
        });
      }
      
      // Add/merge sponsor data
      if (sponsorsData.length > 0) {
        sponsorsData.forEach(sponsor => {
          const type = sponsor.type === "organization" ? "organization" : (sponsor.type === 'individual' ? 'private' : sponsor.type);
          const residency = sponsor.is_diaspora ? "diaspora" : "local";
          const sponsorId = sponsor.id || `${sponsor.cluster_id}-${sponsor.specific_id}`;
          
          const childrenCount = sponsor.beneficiaryCount?.children || 0;
          const eldersCount = sponsor.beneficiaryCount?.elders || 0;
          
          // If sponsor already exists from request, merge the data
          if (sponsorMap.has(sponsorId)) {
            const existing = sponsorMap.get(sponsorId);
            sponsorMap.set(sponsorId, {
              ...existing,
              name: sponsor.full_name || sponsor.name || existing.name,
              phone: sponsor.phone_number || sponsor.phone || existing.phone,
              monthlyCommitment: sponsor.agreed_monthly_payment || sponsor.monthly_amount || existing.monthlyCommitment,
              createdAt: sponsor.created_at?.split('T')?.[0] || sponsor.starting_date || existing.createdAt,
              status: "new", // Set status to "new" after joining
              isRequest: false,
              sponsorData: sponsor
            });
          } else {
            // New sponsor entry
            sponsorMap.set(sponsorId, {
              id: sponsorId,
              sponsorId: sponsorId,
              name: sponsor.full_name || sponsor.name || "N/A",
              type: type,
              residency: residency,
              phone: sponsor.phone_number || sponsor.phone || "N/A",
              childrenCount: childrenCount,
              eldersCount: eldersCount,
              beneficiaryRequested: `${childrenCount} child & ${eldersCount} elderly`,
              monthlyCommitment: sponsor.agreed_monthly_payment || sponsor.monthly_amount || 0,
              createdAt: sponsor.created_at?.split('T')?.[0] || sponsor.starting_date || new Date().toISOString().split('T')[0],
              status: sponsor.status || "new",
              isRequest: false,
              sponsorData: sponsor
            });
          }
        });
      }
      
      const combinedData = Array.from(sponsorMap.values());
      
      // Filter to show only sponsors with "new" status after joining
      const newStatusSponsors = combinedData.filter(sponsor => 
        sponsor.status === "new"
      );

      setAllSponsors(newStatusSponsors);
      setFilteredSponsors(newStatusSponsors);
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
          aValue = a.beneficiaryRequested;
          bValue = b.beneficiaryRequested;
          break;
        case 6:
          aValue = a.monthlyCommitment;
          bValue = b.monthlyCommitment;
          break;
        case 7:
          aValue = new Date(a.createdAt);
          bValue = new Date(b.createdAt);
          break;
        default:
          return 0;
      }

      if (currentSortColumn === 7) {
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
                  "",
                  "ID",
                  "Full Name",
                  "Type",
                  "Residency",
                  "Phone Number",
                  "Beneficiary Requested",
                  "Monthly Commitment",
                  "Created At",
                  "Actions"
                ].map((header, index) => (
                  <th
                    key={header}
                    className={`px-6 py-3 text-left text-xs font-medium text-[#032990] uppercase tracking-wider ${index === 0 ? '' : 'cursor-pointer hover:bg-[#e0e8ff]'} transition-colors duration-200 ${
                      index === 0
                        ? "rounded-tl-lg w-12"
                        : index === 9
                        ? "rounded-tr-lg"
                        : ""
                    }`}
                    onClick={() => index > 0 && handleSort(index - 1)}
                  >
                    {header}
                    {getSortIndicator(index)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-[#ffffff] divide-y divide-[#e2e8f0]">
              {filteredSponsors.map((sponsor, index) => (
                <React.Fragment key={sponsor.id}>
                  <tr
                    className={`hover:bg-[#f0f3ff] transition-colors duration-200 cursor-pointer even:bg-[#f8fafc]`}
                    onClick={() => handleRowClick(sponsor)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm w-12" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={(e) => toggleRowExpansion(sponsor.sponsorId, e)}
                        className="p-1 hover:bg-gray-200 rounded transition-colors"
                      >
                        {expandedRows.has(sponsor.sponsorId) ? (
                          <ChevronDown className="w-4 h-4 text-[#032990]" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-[#032990]" />
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#032990]">
                      {sponsor.sponsorId}
                    </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#1a1a1a]">
                    {sponsor.name}
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
                      {sponsor.beneficiaryRequested}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-[#0066cc] font-medium">
                    {(sponsor.monthlyCommitment || 0).toLocaleString()} birr
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-[#1e293b]">
                    {formatDate(sponsor.createdAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm" onClick={(e) => e.stopPropagation()}>
                    <select
                      className="p-1.5 rounded-md border border-[#cfd8dc] text-sm bg-[#ffffff] text-[#0066cc] focus:outline-none focus:ring-1 focus:ring-[#0066cc]"
                      value={sponsor.status}
                      onChange={(e) => handleStatusChange(sponsor.id, e.target.value, sponsor)}
                    >
                      <option value="pending" className="bg-[#e6f3ff] text-[#0066cc]">Pending</option>
                      <option value="approved" className="bg-[#e6f3ff] text-[#0066cc]">Approved</option>
                    </select>
                  </td>
                </tr>
                
                {/* Expanded row for beneficiary details */}
                {expandedRows.has(sponsor.sponsorId) && (
                  <tr className="bg-[#f8fafc]">
                    <td colSpan="10" className="px-6 py-4">
                      <div className="bg-white rounded-lg p-4 border border-gray-200">
                        <h4 className="text-lg font-semibold text-[#032990] mb-3 flex items-center">
                          <Users className="mr-2" size={18} />
                          Requested Beneficiaries Details
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="flex items-center p-3 bg-blue-50 rounded-lg">
                            <User className="mr-3 text-blue-600" size={20} />
                            <div>
                              <p className="font-medium text-gray-800">Children</p>
                              <p className="text-sm text-gray-600">{sponsor.childrenCount} beneficiaries requested</p>
                            </div>
                          </div>
                          <div className="flex items-center p-3 bg-green-50 rounded-lg">
                            <Users className="mr-3 text-green-600" size={20} />
                            <div>
                              <p className="font-medium text-gray-800">Elderly</p>
                              <p className="text-sm text-gray-600">{sponsor.eldersCount} beneficiaries requested</p>
                            </div>
                          </div>
                        </div>
                        <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-700">
                            <strong>Total Requested:</strong> {sponsor.childrenCount + sponsor.eldersCount} beneficiaries
                            ({sponsor.childrenCount} children, {sponsor.eldersCount} elderly)
                          </p>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
              ))}
              {filteredSponsors.length === 0 && (
                <tr>
                  <td colSpan="10" className="px-6 py-8 text-center text-[#64748b]">
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
