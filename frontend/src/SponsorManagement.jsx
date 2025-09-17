import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  Search,
  ChevronUp,
  ChevronDown,
  RefreshCw
} from "lucide-react";

const SponsorManagement = () => {
  const navigate = useNavigate();
  const [sponsors, setSponsors] = useState([]);
  const [allSponsors, setAllSponsors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchInput, setSearchInput] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [residencyFilter, setResidencyFilter] = useState("all");
  const [beneficiaryTypeFilter, setBeneficiaryTypeFilter] = useState("all");
  const [currentSortColumn, setCurrentSortColumn] = useState(0);
  const [currentSortDirection, setCurrentSortDirection] = useState("asc");
  const [activeCard, setActiveCard] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // Mock data that simulates the database structure you provided
  const mockSponsorRequests = [
    {
      id: 1,
      sponsor_cluster_id: "02",
      sponsor_specific_id: "1009",
      full_name: "Ethiopian Hope Foundation",
      number_of_child_beneficiaries: 4,
      number_of_elderly_beneficiaries: 0,
      total_beneficiaries: 4,
      status: "pending",
      phone_number: "+13012233230",
      request_date: "2024-01-10",
      estimated_monthly_commitment: 700.00,
      created_by: 1,
      created_at: "2025-09-14 01:55:04.156581",
      reviewed_by: null,
      reviewed_at: null
    },
    {
      id: 2,
      sponsor_cluster_id: "02",
      sponsor_specific_id: "1010",
      full_name: "Abebe PLC",
      number_of_child_beneficiaries: 5,
      number_of_elderly_beneficiaries: 5,
      total_beneficiaries: 10,
      status: "pending",
      phone_number: "+13012233231",
      request_date: "2024-01-25",
      estimated_monthly_commitment: 800.00,
      created_by: 2,
      created_at: "2025-09-14 01:55:04.156581",
      reviewed_by: null,
      reviewed_at: null
    },
    {
      id: 3,
      sponsor_cluster_id: "02",
      sponsor_specific_id: "1011",
      full_name: "Serkalem Metal",
      number_of_child_beneficiaries: 1,
      number_of_elderly_beneficiaries: 1,
      total_beneficiaries: 2,
      phone_number: "+13012233232",
      status: "pending",
      request_date: "2024-02-05",
      estimated_monthly_commitment: 750.00,
      created_by: 3,
      created_at: "2025-09-14 01:55:04.156581",
      reviewed_by: null,
      reviewed_at: null
    }
  ];

  const mockSponsors = [
    {
      
    },
    
  ];

  // Simulate data fetching
  const fetchData = async () => {
    try {
      setLoading(true);
      setRefreshing(true);

      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));

      // Combine all data for statistics
      const allCombinedData = [];

      // Add all sponsor requests
      if (mockSponsorRequests.length > 0) {
        allCombinedData.push(...mockSponsorRequests.map(request => {
          const isOrganization = request.sponsor_cluster_id === '01';
          const type = isOrganization ? "organization" : "private";
          const residency = "diaspora";

          const childrenCount = request.number_of_child_beneficiaries || 0;
          const eldersCount = request.number_of_elderly_beneficiaries || 0;
          const totalBeneficiaries = request.total_beneficiaries || (childrenCount + eldersCount);

          return {
            id: `req-${request.id}`,
            sponsorId: `${request.sponsor_cluster_id}-${request.sponsor_specific_id}`,
            name: `${request.sponsor_cluster_id}-${request.sponsor_specific_id}`,
            type: type,
            residency: residency,
            phone: request.phone_number,
            childrenCount: childrenCount,
            eldersCount: eldersCount,
            totalBeneficiaries: totalBeneficiaries,
            monthlyCommitment: request.estimated_monthly_commitment || 0,
            createdAt: request.request_date || new Date().toISOString().split('T')[0],
            status: request.status || "pending",
            isRequest: true
          };
        }));
      }

      // Add all sponsors
      if (mockSponsors.length > 0) {
        allCombinedData.push(...mockSponsors.map(sponsor => {
          const type = sponsor.type === "organization" ? "organization" : "private";
          const residency = sponsor.is_diaspora ? "diaspora" : "local";

          // For demo purposes, using random beneficiary counts
          const childrenCount = Math.floor(Math.random() * 5);
          const eldersCount = Math.floor(Math.random() * 3);
          const totalBeneficiaries = childrenCount + eldersCount;

          return {
            id: `${sponsor.cluster_id}-${sponsor.specific_id}`,
            sponsorId: `${sponsor.cluster_id}-${sponsor.specific_id}`,
            name: sponsor.full_name || "N/A",
            type: type,
            residency: residency,
            phone: sponsor.phone_number || "N/A",
            childrenCount: childrenCount,
            eldersCount: eldersCount,
            totalBeneficiaries: totalBeneficiaries,
            monthlyCommitment: sponsor.agreed_monthly_payment || 0,
            createdAt: sponsor.created_at?.split('T')[0] || new Date().toISOString().split('T')[0],
            status: sponsor.status || "active",
            isRequest: false
          };
        }));
      }

      setAllSponsors(allCombinedData);

      // For the table, we'll use only new sponsors and pending requests
      const combinedData = [];

      // Add sponsor requests (pending ones)
      const pendingRequests = mockSponsorRequests.filter(request => request.status === "pending");
      if (pendingRequests.length > 0) {
        combinedData.push(...pendingRequests.map(request => {
          const isOrganization = request.sponsor_cluster_id === '02';
          const type = isOrganization ? "organization" : "private";
          const residency = "diaspora";

          const childrenCount = request.number_of_child_beneficiaries || 0;
          const eldersCount = request.number_of_elderly_beneficiaries || 0;
          const totalBeneficiaries = request.total_beneficiaries || (childrenCount + eldersCount);

          return {
            id: `req-${request.id}`,
            sponsorId: `${request.sponsor_cluster_id}-${request.sponsor_specific_id}`,
            name: `${request.full_name}`,
            type: type,
            residency: residency,
            phone: request.phone_number,
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
      const newSponsors = mockSponsors.filter(sponsor => sponsor.status === "new");
      if (newSponsors.length > 0) {
        combinedData.push(...newSponsors.map(sponsor => {
          const type = sponsor.type === "organization" ? "organization" : "private";
          const residency = sponsor.is_diaspora ? "diaspora" : "local";

          // For demo purposes, using random beneficiary counts
          const childrenCount = Math.floor(Math.random() * 5);
          const eldersCount = Math.floor(Math.random() * 3);
          const totalBeneficiaries = childrenCount + eldersCount;

          return {
            id: `${sponsor.cluster_id}-${sponsor.specific_id}`,
            sponsorId: `${sponsor.cluster_id}-${sponsor.specific_id}`,
            name: sponsor.full_name || "N/A",
            type: type,
            residency: residency,
            phone: sponsor.phone_number || "N/A",
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

      setSponsors(combinedData);
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

  // Calculate statistics from allSponsors
  const totalSponsors = sponsors.length;
  const totalAllSponsors = allSponsors.length;
  const privateSponsors = allSponsors.filter((s) => s.type === "private").length;
  const organizationSponsors = allSponsors.filter((s) => s.type === "organization").length;
  const localSponsors = allSponsors.filter((s) => s.residency === "local").length;
  const diasporaSponsors = allSponsors.filter((s) => s.residency === "diaspora").length;

  // Calculate beneficiary type statistics
  const childOnlySponsors = allSponsors.filter(s =>
    s.childrenCount > 0 && s.eldersCount === 0
  ).length;

  const elderlyOnlySponsors = allSponsors.filter(s =>
    s.eldersCount > 0 && s.childrenCount === 0
  ).length;

  const bothSponsors = allSponsors.filter(s =>
    s.childrenCount > 0 && s.eldersCount > 0
  ).length;

  const filterAndSortTable = () => {
    let filteredData = sponsors.filter((sponsor) => {
      const searchTermLower = searchInput.toLowerCase();

      // Search filter
      const matchesSearch =
        sponsor.name.toLowerCase().includes(searchTermLower) ||
        (sponsor.sponsorId && sponsor.sponsorId.toLowerCase().includes(searchTermLower)) ||
        (sponsor.phone && sponsor.phone.toLowerCase().includes(searchTermLower));

      // Type filter
      const matchesType = typeFilter === "all" || sponsor.type === typeFilter;

      // Residency filter
      const matchesResidency = residencyFilter === "all" || sponsor.residency === residencyFilter;

      // Beneficiary type filter
      const matchesBeneficiaryType = () => {
        if (beneficiaryTypeFilter === "all") return true;
        if (beneficiaryTypeFilter === "children") return sponsor.childrenCount > 0 && sponsor.eldersCount === 0;
        if (beneficiaryTypeFilter === "elders") return sponsor.eldersCount > 0 && sponsor.childrenCount === 0;
        if (beneficiaryTypeFilter === "both") return sponsor.childrenCount > 0 && sponsor.eldersCount > 0;
        return true;
      };

      return matchesSearch && matchesType && matchesResidency && matchesBeneficiaryType();
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
          aValue = a.childrenCount;
          bValue = b.childrenCount;
          break;
        case 6:
          aValue = a.eldersCount;
          bValue = b.eldersCount;
          break;
        case 7:
          aValue = a.monthlyCommitment;
          bValue = b.monthlyCommitment;
          break;
        case 8:
          aValue = new Date(a.createdAt);
          bValue = new Date(b.createdAt);
          break;
        default:
          return 0;
      }

      if (currentSortColumn === 8) {
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

    return sortedData;
  };

  useEffect(() => {
    const sortedData = filterAndSortTable();
    setSponsors(sortedData);
  }, [
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

      // In a real application, this would call your API
      alert(`Status updated for ${sponsorId} to ${newStatus}`);

      // Update the local state
      setSponsors(prevSponsors =>
        prevSponsors.map(s =>
          s.id === sponsorId ? { ...s, status: newStatus } : s
        )
      );

      // Refresh data if a request was approved
      if (isRequest && newStatus === 'approved') {
        fetchData();
      }
    } catch (error) {
      console.error('Error updating status:', error);
      alert(`Error updating status: ${error.message}`);
    }
  };

  const handleCardFilterClick = (filterType, value) => {
    if (filterType === "type") {
      setTypeFilter(value);
      setActiveCard(value === "all" ? null : value);
    } else if (filterType === "residency") {
      setResidencyFilter(value);
      setActiveCard(value === "all" ? null : value);
    } else if (filterType === "beneficiary") {
      setBeneficiaryTypeFilter(value);
      setActiveCard(value === "all" ? null : value);
    }

    // Reset other filters when one is selected
    if (filterType !== "type") setTypeFilter("all");
    if (filterType !== "residency") setResidencyFilter("all");
    if (filterType !== "beneficiary") setBeneficiaryTypeFilter("all");
  };

  const handleRefresh = () => {
    fetchData();
  };

  const handleNavClick = (path) => {
    navigate(path);
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
    <div className="min-h-screen bg-[#f5f7fa] p-6 font-inter text-[#1e293b]">
      <div className="container mx-auto bg-[#ffffff] rounded-xl shadow-[0_5px_15px_rgba(0,0,0,0.08)] p-6 flex flex-col h-[90vh]">
        <div className="flex items-center mb-6 gap-4">
          <button
            onClick={() => handleNavClick("/admin_dashboard")}
            className="flex items-center justify-center w-12 h-12 bg-[#ffffff] text-[#032990] rounded-lg shadow-[0_4px_8px_rgba(0,0,0,0.1)] transition-all duration-300 border border-[#e2e8f0] hover:bg-[#032990] hover:text-white group"
          >
            <ChevronLeft className="w-6 h-6 stroke-[#032990] group-hover:stroke-white transition-colors duration-300" />
          </button>
          <h1 className="text-3xl font-bold text-[#032990]">
            New Sponsor Management
          </h1>
        </div>

        {/* Statistics Cards - Improved layout */}
        <div className="flex overflow-x-auto pb-4 mb-6 gap-3 scrollbar-thin scrollbar-thumb-[#c5cae9] scrollbar-track-transparent">
          {/* Refresh Card - Total New Sponsors */}
          <div
            className={`flex-shrink-0 w-48 p-4 rounded-lg shadow-[0_2px_6px_rgba(0,0,0,0.05)] border-l-2 border-[#032990] bg-gradient-to-br from-[#f0f3ff] to-[#e6eeff] cursor-pointer transition-all duration-200 hover:scale-[1.02] ${
              refreshing ? "ring-2 ring-[#032990] shadow-md" : ""
            }`}
            onClick={handleRefresh}
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-[#032990]">{totalSponsors}</div>
                <div className="text-sm text-[#64748b]">Total New Sponsors</div>
              </div>
              {refreshing ? (
                <RefreshCw className="w-5 h-5 text-[#032990] animate-spin" />
              ) : (
                <RefreshCw className="w-5 h-5 text-[#032990]" />
              )}
            </div>
          </div>

          {/* Type Cards */}
          <div
            className={`flex-shrink-0 w-40 p-4 rounded-lg shadow-[0_2px_6px_rgba(0,0,0,0.05)] border-l-2 border-[#032990] bg-gradient-to-br from-[#f0f3ff] to-[#e6eeff] cursor-pointer transition-all duration-200 hover:scale-[1.02] ${
              activeCard === "private" ? "ring-2 ring-[#032990] shadow-md" : ""
            }`}
            onClick={() => handleCardFilterClick("type", "private")}
          >
            <div className="text-2xl font-bold text-[#032990]">0</div>
            <div className="text-sm text-[#64748b]">Individuals</div>
          </div>

          <div
            className={`flex-shrink-0 w-40 p-4 rounded-lg shadow-[0_2px_6px_rgba(0,0,0,0.05)] border-l-2 border-[#032990] bg-gradient-to-br from-[#f0f3ff] to-[#e6eeff] cursor-pointer transition-all duration-200 hover:scale-[1.02] ${
              activeCard === "organization" ? "ring-2 ring-[#032990] shadow-md" : ""
            }`}
            onClick={() => handleCardFilterClick("type", "organization")}
          >
            <div className="text-2xl font-bold text-[#032990]">3</div>
            <div className="text-sm text-[#64748b]">Organizations</div>
          </div>

          {/* Residency Cards */}
          <div
            className={`flex-shrink-0 w-40 p-4 rounded-lg shadow-[0_2px_6px_rgba(0,0,0,0.05)] border-l-2 border-[#032990] bg-gradient-to-br from-[#f0f3ff] to-[#e6eeff] cursor-pointer transition-all duration-200 hover:scale-[1.02] ${
              activeCard === "local" ? "ring-2 ring-[#032990] shadow-md" : ""
            }`}
            onClick={() => handleCardFilterClick("residency", "local")}
          >
            <div className="text-2xl font-bold text-[#032990]">0</div>
            <div className="text-sm text-[#64748b]">Local</div>
          </div>

          <div
            className={`flex-shrink-0 w-40 p-4 rounded-lg shadow-[0_2px_6px_rgba(0,0,0,0.05)] border-l-2 border-[#032990] bg-gradient-to-br from-[#f0f3ff] to-[#e6eeff] cursor-pointer transition-all duration-200 hover:scale-[1.02] ${
              activeCard === "diaspora" ? "ring-2 ring-[#032990] shadow-md" : ""
            }`}
            onClick={() => handleCardFilterClick("residency", "diaspora")}
          >
            <div className="text-2xl font-bold text-[#032990]">3</div>
            <div className="text-sm text-[#64748b]">Diaspora</div>
          </div>

          {/* Beneficiary Type Cards */}
          <div
            className={`flex-shrink-0 w-40 p-4 rounded-lg shadow-[0_2px_6px_rgba(0,0,0,0.05)] border-l-2 border-[#032990] bg-gradient-to-br from-[#f0f3ff] to-[#e6eeff] cursor-pointer transition-all duration-200 hover:scale-[1.02] ${
              activeCard === "children" ? "ring-2 ring-[#032990] shadow-md" : ""
            }`}
            onClick={() => handleCardFilterClick("beneficiary", "children")}
          >
            <div className="text-2xl font-bold text-[#032990]">1</div>
            <div className="text-sm text-[#64748b]">Children Only</div>
          </div>

          <div
            className={`flex-shrink-0 w-40 p-4 rounded-lg shadow-[0_2px_6px_rgba(0,0,0,0.05)] border-l-2 border-[#032990] bg-gradient-to-br from-[#f0f3ff] to-[#e6eeff] cursor-pointer transition-all duration-200 hover:scale-[1.02] ${
              activeCard === "elders" ? "ring-2 ring-[#032990] shadow-md" : ""
            }`}
            onClick={() => handleCardFilterClick("beneficiary", "elders")}
          >
            <div className="text-2xl font-bold text-[#032990]">0</div>
            <div className="text-sm text-[#64748b]">Elderly Only</div>
          </div>

          <div
            className={`flex-shrink-0 w-48 p-4 rounded-lg shadow-[0_2px_6px_rgba(0,0,0,0.05)] border-l-2 border-[#032990] bg-gradient-to-br from-[#f0f3ff] to-[#e6eeff] cursor-pointer transition-all duration-200 hover:scale-[1.02] ${
              activeCard === "both" ? "ring-2 ring-[#032990] shadow-md" : ""
            }`}
            onClick={() => handleCardFilterClick("beneficiary", "both")}
          >
            <div className="text-2xl font-bold text-[#032990]">2</div>
            <div className="text-sm text-[#64748b]">Both Children & Elders</div>
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
              placeholder="Search by name, ID, or phone..."
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
                  "Name",
                  "Type",
                  "Residency",
                  "Phone Number",
                  "Total Beneficiaries",
                  "Child Count",
                  "Elderly Count",
                  "Monthly Commitment",
                  "Created At",
                  "Actions"
                ].map((header, index) => (
                  <th
                    key={header}
                    className={`px-6 py-4 text-left text-sm font-semibold text-[#032990] uppercase tracking-wider cursor-pointer hover:bg-[#e0e8ff] transition-colors duration-200 ${
                      index === 0 ? "rounded-tl-lg" : index === 9 ? "rounded-tr-lg" : ""
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
              {sponsors.map((sponsor, index) => (
                <tr
                  key={sponsor.id}
                  className={`hover:bg-[#e6f3ff] transition-colors duration-200 ${
                    index % 2 === 0 ? 'bg-[#f8faff]' : 'bg-[#ffffff]'
                  }`}
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
                      className={`px-2 py-1 inline-block text-xs font-medium rounded-full ${getSponsorTypeClasses(
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
                    {sponsor.phone || "N/A"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                    <span className="bg-[#e0f2ff] text-[#0066cc] px-3 py-1 rounded-full text-xs font-medium">
                      {sponsor.totalBeneficiaries}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                    <span className="bg-[#e6f2ff] text-[#0066cc] px-3 py-1 rounded-full text-xs font-medium">
                      {sponsor.childrenCount}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                    <span className="bg-[#e6f7ff] text-[#0066cc] px-3 py-1 rounded-full text-xs font-medium">
                      {sponsor.eldersCount}
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
                      <option value="new" className="bg-[#e6f3ff] text-[#0066cc]">New</option>
                      <option value="pending" className="bg-[#e6f3ff] text-[#0066cc]">Pending</option>
                      <option value="approved" className="bg-[#e6f3ff] text-[#0066cc]">Approved</option>
                    </select>
                  </td>
                </tr>
              ))}
              {sponsors.length === 0 && (
                <tr>
                  <td colSpan="10" className="px-6 py-8 text-center text-gray-500">
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