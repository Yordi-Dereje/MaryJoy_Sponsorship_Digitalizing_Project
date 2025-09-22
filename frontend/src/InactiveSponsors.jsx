import React, { useState, useEffect } from "react";
import { useRoleNavigation } from "./hooks/useRoleNavigation";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Search, ChevronUp, ChevronDown, RefreshCw } from "lucide-react";

const InactiveSponsors = () => {
  const { navigateToDashboard } = useRoleNavigation();
  const navigate = useNavigate();
  const [allSponsors, setAllSponsors] = useState([]);
  const [displayedSponsors, setDisplayedSponsors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchInput, setSearchInput] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [residencyFilter, setResidencyFilter] = useState("all");
  const [beneficiaryFilter, setBeneficiaryFilter] = useState("all");
  const [currentSortColumn, setCurrentSortColumn] = useState(0);
  const [currentSortDirection, setCurrentSortDirection] = useState("asc");
  const [activeCard, setActiveCard] = useState("all");
  const [refreshing, setRefreshing] = useState(false);

  // Fetch ALL inactive sponsors from backend
  const fetchInactiveSponsors = async () => {
    try {
      setLoading(true);
      setRefreshing(true);
      const response = await fetch(`http://localhost:5000/api/sponsors/inactive`);

      if (!response.ok) {
        throw new Error("Failed to fetch inactive sponsors");
      }

      const data = await response.json();
      console.log("Fetched inactive sponsors:", data.sponsors); // Debug log
      
      // Transform the data to match the expected structure
      const transformedSponsors = data.sponsors.map(sponsor => ({
        ...sponsor,
        // Ensure we have all required fields with proper defaults
        id: sponsor.id || `${sponsor.cluster_id}-${sponsor.specific_id}`,
        name: sponsor.full_name || sponsor.name || "N/A",
        type: sponsor.type || "individual",
        residency: sponsor.is_diaspora ? "Diaspora" : "Local",
        phone: sponsor.phone_number || sponsor.phone || "N/A",
        // Use accurate counts provided by backend; fallback to zeros
        beneficiaryCount: sponsor.beneficiaryCount || { children: 0, elders: 0 }
      }));
      
      setAllSponsors(transformedSponsors);
      setDisplayedSponsors(transformedSponsors);
    } catch (err) {
      setError(err.message);
      console.error("Error fetching inactive sponsors:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchInactiveSponsors();
  }, []);

  // Filter and sort based on current criteria
  useEffect(() => {
    if (!allSponsors.length) return;

    let filteredData = allSponsors.filter((sponsor) => {
      // Search filter
      const searchMatch =
        searchInput === "" ||
        (sponsor.id && sponsor.id.toLowerCase().includes(searchInput.toLowerCase())) ||
        (sponsor.name && sponsor.name.toLowerCase().includes(searchInput.toLowerCase())) ||
        (sponsor.phone && sponsor.phone.toLowerCase().includes(searchInput.toLowerCase()));

      // Type filter
      const typeMatch = typeFilter === "all" || 
        (typeFilter === "Individual" && sponsor.type === "individual") ||
        (typeFilter === "Organization" && sponsor.type === "organization");

      // Residency filter
      const residencyMatch = residencyFilter === "all" || sponsor.residency === residencyFilter;

      // Beneficiary type filter
      const children = Number(sponsor.beneficiaryCount?.children || 0);
      const elders = Number(sponsor.beneficiaryCount?.elders || 0);

      let beneficiaryMatch = true;
      switch (beneficiaryFilter) {
        case "child":
          beneficiaryMatch = children > 0 && elders === 0;
          break;
        case "elderly":
          beneficiaryMatch = elders > 0 && children === 0;
          break;
        case "both":
          beneficiaryMatch = children > 0 && elders > 0;
          break;
        case "all":
        default:
          beneficiaryMatch = true;
      }

      return searchMatch && typeMatch && residencyMatch && beneficiaryMatch;
    });

    // Sort the filtered data
    const sortedData = [...filteredData].sort((a, b) => {
      let aValue, bValue;

      switch (currentSortColumn) {
        case 0:
          aValue = a.id || "";
          bValue = b.id || "";
          break;
        case 1:
          aValue = a.name || "";
          bValue = b.name || "";
          break;
        case 2:
          aValue = a.type || "";
          bValue = b.type || "";
          break;
        case 3:
          aValue = a.residency || "";
          bValue = b.residency || "";
          break;
        case 4:
          aValue = a.phone || "";
          bValue = b.phone || "";
          break;
        case 5:
          aValue = (a.beneficiaryCount?.children || 0) + (a.beneficiaryCount?.elders || 0);
          bValue = (b.beneficiaryCount?.children || 0) + (b.beneficiaryCount?.elders || 0);
          break;
        default:
          return 0;
      }

      if (typeof aValue === "string") {
        return currentSortDirection === "asc"
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      } else {
        return currentSortDirection === "asc"
          ? aValue - bValue
          : bValue - aValue;
      }
    });

    setDisplayedSponsors(sortedData);
  }, [
    allSponsors,
    searchInput,
    typeFilter,
    residencyFilter,
    beneficiaryFilter,
    currentSortColumn,
    currentSortDirection,
  ]);

  const handleSort = (columnIndex) => {
    if (columnIndex === currentSortColumn) {
      setCurrentSortDirection(currentSortDirection === "asc" ? "desc" : "asc");
    } else {
      setCurrentSortColumn(columnIndex);
      setCurrentSortDirection("asc");
    }
  };

  const getSortIndicator = (columnIndex) =>
    columnIndex === currentSortColumn ? (
      currentSortDirection === "asc" ? (
        <ChevronUp className="w-4 h-4 inline ml-1" />
      ) : (
        <ChevronDown className="w-4 h-4 inline ml-1" />
      )
    ) : null;

  const getSponsorTypeClasses = (type) =>
    "bg-[#ffe0e0] text-[#cc0000]";

  const getResidencyClasses = (residency) =>
    "bg-[#ffe0e0] text-[#cc0000]";

  const getBeneficiaryCountClasses = (children, elders) => {
    return "bg-[#ffe0e0] text-[#cc0000]";
  };

  // Calculate statistics based on ALL inactive sponsors
  const totalInactiveSponsors = allSponsors.length;
  const privateSponsors = allSponsors.filter(s => s.type === "individual").length;
  const organizationSponsors = allSponsors.filter(s => s.type === "organization").length;
  const localSponsors = allSponsors.filter(s => s.residency === "Local").length;
  const diasporaSponsors = allSponsors.filter(s => s.residency === "Diaspora").length;

  // Calculate beneficiary type statistics
  const childOnlySponsors = allSponsors.filter(sponsor => {
    const children = Number(sponsor.beneficiaryCount?.children || 0);
    const elders = Number(sponsor.beneficiaryCount?.elders || 0);
    return children > 0 && elders === 0;
  }).length;

  const elderlyOnlySponsors = allSponsors.filter(sponsor => {
    const children = Number(sponsor.beneficiaryCount?.children || 0);
    const elders = Number(sponsor.beneficiaryCount?.elders || 0);
    return elders > 0 && children === 0;
  }).length;

  const bothSponsors = allSponsors.filter(sponsor => {
    const children = Number(sponsor.beneficiaryCount?.children || 0);
    const elders = Number(sponsor.beneficiaryCount?.elders || 0);
    return children > 0 && elders > 0;
  }).length;

  // Fix click handling for beneficiary filters
  const handleCardFilterClick = (filterType, value) => {
    setActiveCard(value);

    if (filterType === "type") {
      setTypeFilter(value);
      setResidencyFilter("all");
      setBeneficiaryFilter("all");
    } else if (filterType === "residency") {
      setResidencyFilter(value);
      setTypeFilter("all");
      setBeneficiaryFilter("all");
    } else if (filterType === "beneficiary") {
      setBeneficiaryFilter(value);
      setTypeFilter("all");
      setResidencyFilter("all");
    } else {
      setTypeFilter("all");
      setResidencyFilter("all");
      setBeneficiaryFilter("all");
    }

    setSearchInput("");
  };

  const handleBack = () => {
    navigateToDashboard();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f5f7fa] p-8 text-[#1e293b] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#032990] mx-auto"></div>
          <p className="mt-4 text-lg">Loading inactive sponsors...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#f5f7fa] p-8 text-[#1e293b] flex items-center justify-center">
        <div className="text-center text-[#cc0000]">
          <p className="text-lg">Error: {error}</p>
          <button
            onClick={() => window.location.reload()}
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
          <h1 className="text-[#cc0000] font-bold text-3xl m-0">
            Inactive Sponsors
          </h1>
        </div>

        {/* Stats Cards - All in one row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-8 gap-4 mb-6 overflow-x-auto pb-2">
          <div
            className={`p-4 rounded-lg shadow-[0_3px_8px_rgba(0,0,0,0.05)] border-l-4 border-[#cc0000] bg-gradient-to-br from-[#ffe0e0] to-[#ffcccc] cursor-pointer transition-transform duration-200 hover:scale-[1.02] min-w-[180px] ${
              activeCard === "all"
                ? "!border-[#cc0000] !bg-gradient-to-br !from-[#fff0f0] !to-[#ffe6e6]"
                : ""
            }`}
            onClick={() => {
              setActiveCard("all");
              setTypeFilter("all");
              setResidencyFilter("all");
              setBeneficiaryFilter("all");
              setSearchInput("");
            }}
          >
            <div className="text-2xl font-bold text-[#1e293b]">
              {totalInactiveSponsors}
            </div>
            <div className="text-sm text-[#64748b]">Total Inactive</div>
          </div>
          <div
            className={`p-4 rounded-lg shadow-[0_3px_8px_rgba(0,0,0,0.05)] border-l-4 border-[#cc0000] bg-gradient-to-br from-[#ffe0e0] to-[#ffcccc] cursor-pointer transition-transform duration-200 hover:scale-[1.02] min-w-[180px] ${
              activeCard === "Individual"
                ? "!border-[#cc0000] !bg-gradient-to-br !from-[#fff0f0] !to-[#ffe6e6]"
                : ""
            }`}
            onClick={() => handleCardFilterClick("type", "Individual")}
          >
            <div className="text-2xl font-bold text-[#1e293b]">
              {privateSponsors}
            </div>
            <div className="text-sm text-[#64748b]">Individual</div>
          </div>
          <div
            className={`p-4 rounded-lg shadow-[0_3px_8px_rgba(0,0,0,0.05)] border-l-4 border-[#cc0000] bg-gradient-to-br from-[#ffe0e0] to-[#ffcccc] cursor-pointer transition-transform duration-200 hover:scale-[1.02] min-w-[180px] ${
              activeCard === "Organization"
                ? "!border-[#cc0000] !bg-gradient-to-br !from-[#fff0f0] !to-[#ffe6e6]"
                : ""
            }`}
            onClick={() => handleCardFilterClick("type", "Organization")}
          >
            <div className="text-2xl font-bold text-[#1e293b]">
              {organizationSponsors}
            </div>
            <div className="text-sm text-[#64748b]">Organizations</div>
          </div>
          <div
            className={`p-4 rounded-lg shadow-[0_3px_8px_rgba(0,0,0,0.05)] border-l-4 border-[#cc0000] bg-gradient-to-br from-[#ffe0e0] to-[#ffcccc] cursor-pointer transition-transform duration-200 hover:scale-[1.02] min-w-[180px] ${
              activeCard === "Local"
                ? "!border-[#cc0000] !bg-gradient-to-br !from-[#fff0f0] !to-[#ffe6e6]"
                : ""
            }`}
            onClick={() => handleCardFilterClick("residency", "Local")}
          >
            <div className="text-2xl font-bold text-[#1e293b]">
              {localSponsors}
            </div>
            <div className="text-sm text-[#64748b]">Local</div>
          </div>
          <div
            className={`p-4 rounded-lg shadow-[0_3px_8px_rgba(0,0,0,0.05)] border-l-4 border-[#cc0000] bg-gradient-to-br from-[#ffe0e0] to-[#ffcccc] cursor-pointer transition-transform duration-200 hover:scale-[1.02] min-w-[180px] ${
              activeCard === "Diaspora"
                ? "!border-[#cc0000] !bg-gradient-to-br !from-[#fff0f0] !to-[#ffe6e6]"
                : ""
            }`}
            onClick={() => handleCardFilterClick("residency", "Diaspora")}
          >
            <div className="text-2xl font-bold text-[#1e293b]">
              {diasporaSponsors}
            </div>
            <div className="text-sm text-[#64748b]">Diaspora</div>
          </div>
          <div
            className={`p-4 rounded-lg shadow-[0_3px_8px_rgba(0,0,0,0.05)] border-l-4 border-[#cc0000] bg-gradient-to-br from-[#ffe0e0] to-[#ffcccc] cursor-pointer transition-transform duration-200 hover:scale-[1.02] min-w-[180px] ${
              beneficiaryFilter === "child"
                ? "!border-[#cc0000] !bg-gradient-to-br !from-[#fff0f0] !to-[#ffe6e6]"
                : ""
            }`}
            onClick={() => handleCardFilterClick("beneficiary", "child")}
          >
            <div className="text-2xl font-bold text-[#1e293b]">
              {childOnlySponsors}
            </div>
            <div className="text-sm text-[#64748b]">Child Only</div>
          </div>
          <div
            className={`p-4 rounded-lg shadow-[0_3px_8px_rgba(0,0,0,0.05)] border-l-4 border-[#cc0000] bg-gradient-to-br from-[#ffe0e0] to-[#ffcccc] cursor-pointer transition-transform duration-200 hover:scale-[1.02] min-w-[180px] ${
              beneficiaryFilter === "elderly"
                ? "!border-[#cc0000] !bg-gradient-to-br !from-[#fff0f0] !to-[#ffe6e6]"
                : ""
            }`}
            onClick={() => handleCardFilterClick("beneficiary", "elderly")}
          >
            <div className="text-2xl font-bold text-[#1e293b]">
              {elderlyOnlySponsors}
            </div>
            <div className="text-sm text-[#64748b]">Elderly Only</div>
          </div>
          <div
            className={`p-4 rounded-lg shadow-[0_3px_8px_rgba(0,0,0,0.05)] border-l-4 border-[#cc0000] bg-gradient-to-br from-[#ffe0e0] to-[#ffcccc] cursor-pointer transition-transform duration-200 hover:scale-[1.02] min-w-[180px] ${
              beneficiaryFilter === "both"
                ? "!border-[#cc0000] !bg-gradient-to-br !from-[#fff0f0] !to-[#ffe6e6]"
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
              className="pl-10 p-3.5 w-full border border-[#cfd8dc] rounded-lg focus:outline-none focus:ring-2 focus:ring-[rgba(204,0,0,0.2)] focus:border-[#cc0000] shadow-[0_2px_5px_rgba(0,0,0,0.05)] transition-all duration-200"
              placeholder="Search by sponsor ID, name, or phone number..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto flex-1 border border-[#e2e8f0] rounded-lg shadow-[0_2px_5px_rgba(0,0,0,0.05)]">
          <table className="min-w-full divide-y divide-[#e2e8f0]">
            <thead className="bg-[#fff0f0] sticky top-0">
              <tr>
                {[
                  "Sponsor ID",
                  "Name",
                  "Type",
                  "Residency",
                  "Phone Number",
                  "Beneficiary Count",
                ].map((header, index) => (
                  <th
                    key={header}
                    className={`px-6 py-3 text-left text-xs font-medium text-[#cc0000] uppercase tracking-wider cursor-pointer hover:bg-[#ffe0e0] transition-colors duration-200 ${
                      index === 0
                        ? "rounded-tl-lg"
                        : index === 5
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
              {displayedSponsors.map((sponsor) => (
                <tr
                  key={sponsor.id}
                  className="hover:bg-[#fff0f0] transition-colors duration-200 cursor-pointer even:bg-[#f8fafc]"
                  onClick={() => navigate(`/sponsors/${sponsor.cluster_id}/${sponsor.specific_id}`, { state: { sponsor, fromInactive: true } })}
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#cc0000]">
                    {sponsor.id || "N/A"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#1a1a1a]">
                    {sponsor.name || "N/A"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span
                      className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getSponsorTypeClasses(
                        sponsor.type
                      )}`}
                    >
                      {sponsor.type === "individual" ? "Individual" : "Organization"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span
                      className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getResidencyClasses(
                        sponsor.residency
                      )}`}
                    >
                      {sponsor.residency || "N/A"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-[#64748b]">
                    {sponsor.phone || "N/A"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span
                      className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getBeneficiaryCountClasses(
                        sponsor.beneficiaryCount?.children || 0,
                        sponsor.beneficiaryCount?.elders || 0
                      )}`}
                    >
                      {(sponsor.beneficiaryCount?.children || 0) > 0 && (
                        <span>{`${
                          sponsor.beneficiaryCount.children
                        } ${
                          sponsor.beneficiaryCount.children === 1
                            ? "child"
                            : "children"
                        }`}</span>
                      )}
                      {(sponsor.beneficiaryCount?.children || 0) > 0 &&
                        (sponsor.beneficiaryCount?.elders || 0) > 0 &&
                        " & "}
                      {(sponsor.beneficiaryCount?.elders || 0) > 0 && (
                        <span>{`${
                          sponsor.beneficiaryCount.elders
                        } ${
                          sponsor.beneficiaryCount.elders === 1
                            ? "elder"
                            : "elders"
                        }`}</span>
                      )}
                      {(sponsor.beneficiaryCount?.children || 0) === 0 &&
                        (sponsor.beneficiaryCount?.elders || 0) === 0 && (
                          <span>No beneficiaries</span>
                        )}
                    </span>
                  </td>
                </tr>
              ))}
              {displayedSponsors.length === 0 && (
                <tr>
                  <td
                    colSpan="6"
                    className="px-6 py-8 text-center text-[#64748b]"
                  >
                    No inactive sponsors found matching your criteria.
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

export default InactiveSponsors;
