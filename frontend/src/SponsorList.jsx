import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Search, ChevronUp, ChevronDown } from "lucide-react";

const SponsorList = () => {
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

  // Fetch ALL data from backend (without filters initially)
  useEffect(() => {
    const fetchSponsors = async () => {
      try {
        setLoading(true);
        const response = await fetch(`http://localhost:5000/api/sponsors`);

        if (!response.ok) {
          throw new Error("Failed to fetch data");
        }

        const data = await response.json();
        console.log("Fetched sponsors:", data.sponsors); // Debug log
        setAllSponsors(data.sponsors || []);
        setDisplayedSponsors(data.sponsors || []);
      } catch (err) {
        setError(err.message);
        console.error("Error fetching sponsors:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSponsors();
  }, []);

  // Filter and sort based on current criteria
  useEffect(() => {
    if (!allSponsors.length) return;

    let filteredData = allSponsors.filter((sponsor) => {
      // Search filter
      const searchMatch =
        searchInput === "" ||
        (sponsor.id &&
          sponsor.id.toLowerCase().includes(searchInput.toLowerCase())) ||
        (sponsor.name &&
          sponsor.name.toLowerCase().includes(searchInput.toLowerCase())) ||
        (sponsor.phone &&
          sponsor.phone.toLowerCase().includes(searchInput.toLowerCase()));

      // Type filter
      const typeMatch = typeFilter === "all" || sponsor.type === typeFilter;

      // Residency filter
      const residencyMatch =
        residencyFilter === "all" || sponsor.residency === residencyFilter;

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
          aValue =
            (a.beneficiaryCount?.children || 0) +
            (a.beneficiaryCount?.elders || 0);
          bValue =
            (b.beneficiaryCount?.children || 0) +
            (b.beneficiaryCount?.elders || 0);
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
    type === "Private"
      ? "bg-[#e0f2ff] text-[#0066cc]"
      : "bg-[#e6f7ff] text-[#08979c]";

  const getResidencyClasses = (residency) =>
    residency === "Local"
      ? "bg-[#e6f4ff] text-[#0b6bcb]"
      : "bg-[#e0f7fa] text-[#00838f]";

  const getBeneficiaryCountClasses = (children, elders) => {
    if (children > 0 && elders > 0)
      return "bg-gradient-to-r from-[#ffebee] to-[#fff2e8] text-[#389e0d]";
    if (children > 0) return "bg-[#ffebee] text-[#c62828]";
    if (elders > 0) return "bg-[#fff2e8] text-[#d46b08]";
    return "bg-[#f8fafc] text-[#64748b]";
  };

  // Fix beneficiary count calculations
  // ✅ Calculate sponsor counts safely
  const childOnlySponsors = allSponsors.filter((sponsor) => {
    const children = parseInt(sponsor.beneficiaryCount?.children ?? 0, 10);
    const elders = parseInt(sponsor.beneficiaryCount?.elders ?? 0, 10);
    return children === 0 && elders > 0;
  }).length;

  const elderlyOnlySponsors = allSponsors.filter((sponsor) => {
    const children = parseInt(sponsor.beneficiaryCount?.children ?? 0, 10);
    const elders = parseInt(sponsor.beneficiaryCount?.elders ?? 0, 10);
    return elders > 0 && children === 0;
  }).length;

  const bothSponsors = allSponsors.filter((sponsor) => {
    const children = parseInt(sponsor.beneficiaryCount?.children ?? 0, 10);
    const elders = parseInt(sponsor.beneficiaryCount?.elders ?? 0, 10);
    return children > 0 && elders > 0;
  }).length;

  // ✅ Fix click handling for beneficiary filters
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

      // 🔎 Ensure "child", "elderly", and "both" return counts correctly
      if (value === "child") {
        console.log("Child-only sponsors:", childOnlySponsors);
      } else if (value === "elderly") {
        console.log("Elderly-only sponsors:", elderlyOnlySponsors);
      } else if (value === "both") {
        console.log("Both sponsors:", bothSponsors);
      }
    } else {
      setTypeFilter("all");
      setResidencyFilter("all");
      setBeneficiaryFilter("all");
    }

    setSearchInput("");
  };
  const handleBack = () => {
    navigate("/admin_dashboard");
  };

  // Calculate statistics based on ALL sponsors
  const totalActiveSponsors = allSponsors.length;
  const privateSponsors = allSponsors.filter(
    (s) => s.type === "Private"
  ).length;
  const organizationSponsors = allSponsors.filter(
    (s) => s.type === "Organization"
  ).length;
  const localSponsors = allSponsors.filter(
    (s) => s.residency === "Local"
  ).length;
  const diasporaSponsors = allSponsors.filter(
    (s) => s.residency === "Diaspora"
  ).length;

  // Debug: Log sponsor data to check beneficiary counts
  useEffect(() => {
    if (allSponsors.length > 0) {
      console.log(
        "All sponsors beneficiary counts:",
        allSponsors.map((s) => ({
          id: s.id,
          name: s.name,
          beneficiaryCount: s.beneficiaryCount,
        }))
      );
    }
  }, [allSponsors]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f5f7fa] p-8 text-[#1e293b] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#032990] mx-auto"></div>
          <p className="mt-4 text-lg">Loading sponsors...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#f5f7fa] p-8 text-[#1e293b] flex items-center justify-center">
        <div className="text-center text-red-600">
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
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <h1 className="text-3xl font-bold text-[#032990]">Sponsor List</h1>
          <button
            onClick={handleBack}
            className="flex items-center justify-center w-12 h-12 bg-[#ffffff] text-[#032990] rounded-lg shadow-[0_4px_8px_rgba(0,0,0,0.1)] hover:bg-[#032990] hover:text-white transition-all duration-300 border-2 border-[#f0f3ff]"
          >
            <ArrowLeft className="w-6 h-6 stroke-[#032990] group-hover:stroke-white transition-colors duration-300" />
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div
            className={`p-4 rounded-lg shadow-[0_3px_8px_rgba(0,0,0,0.05)] border-l-4 border-[#0066cc] bg-gradient-to-br from-[#e0f2ff] to-[#cce5ff] cursor-pointer transition-transform duration-200 hover:scale-[1.02] ${
              activeCard === "Private"
                ? "!border-[#032990] !bg-gradient-to-br !from-[#f0f3ff] !to-[#e6eeff]"
                : ""
            }`}
            onClick={() => handleCardFilterClick("type", "Private")}
          >
            <div className="text-3xl font-bold text-[#1e293b]">
              {privateSponsors}
            </div>
            <div className="text-sm text-[#64748b]">Private Sponsors</div>
          </div>
          <div
            className={`p-4 rounded-lg shadow-[0_3px_8px_rgba(0,0,0,0.05)] border-l-4 border-[#08979c] bg-gradient-to-br from-[#e6f7ff] to-[#d1f0ff] cursor-pointer transition-transform duration-200 hover:scale-[1.02] ${
              activeCard === "Organization"
                ? "!border-[#032990] !bg-gradient-to-br !from-[#f0f3ff] !to-[#e6eeff]"
                : ""
            }`}
            onClick={() => handleCardFilterClick("type", "Organization")}
          >
            <div className="text-3xl font-bold text-[#1e293b]">
              {organizationSponsors}
            </div>
            <div className="text-sm text-[#64748b]">Organizations</div>
          </div>
          <div
            className={`p-4 rounded-lg shadow-[0_3px_8px_rgba(0,0,0,0.05)] border-l-4 border-[#0b6bcb] bg-gradient-to-br from-[#e6f4ff] to-[#cce5ff] cursor-pointer transition-transform duration-200 hover:scale-[1.02] ${
              activeCard === "Local"
                ? "!border-[#032990] !bg-gradient-to-br !from-[#f0f3ff] !to-[#e6eeff]"
                : ""
            }`}
            onClick={() => handleCardFilterClick("residency", "Local")}
          >
            <div className="text-3xl font-bold text-[#1e293b]">
              {localSponsors}
            </div>
            <div className="text-sm text-[#64748b]">Local</div>
          </div>
          <div
            className={`p-4 rounded-lg shadow-[0_3px_8px_rgba(0,0,0,0.05)] border-l-4 border-[#00838f] bg-gradient-to-br from-[#e0f7fa] to-[#b2ebf2] cursor-pointer transition-transform duration-200 hover:scale-[1.02] ${
              activeCard === "Diaspora"
                ? "!border-[#032990] !bg-gradient-to-br !from-[#f0f3ff] !to-[#e6eeff]"
                : ""
            }`}
            onClick={() => handleCardFilterClick("residency", "Diaspora")}
          >
            <div className="text-3xl font-bold text-[#1e293b]">
              {diasporaSponsors}
            </div>
            <div className="text-sm text-[#64748b]">Diaspora</div>
          </div>
        </div>

        {/* Beneficiary Filter Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div
            className={`p-4 rounded-lg shadow-[0_3px_8px_rgba(0,0,0,0.05)] border-l-4 border-[#0066cc] bg-gradient-to-br from-[#e0f2ff] to-[#cce5ff] cursor-pointer transition-transform duration-200 hover:scale-[1.02] ${
              beneficiaryFilter === "child"
                ? "!border-[#032990] !bg-gradient-to-br !from-[#f0f3ff] !to-[#e6eeff]"
                : ""
            }`}
            onClick={() => handleCardFilterClick("beneficiary", "child")}
          >
            <div className="text-2xl font-bold text-[#1e293b]">
              {childOnlySponsors}
            </div>
            <div className="text-sm text-[#64748b]">
              Child Beneficiaries Only
            </div>
          </div>

          <div
            className={`p-4 rounded-lg shadow-[0_3px_8px_rgba(0,0,0,0.05)] border-l-4 border-[#08979c] bg-gradient-to-br from-[#e6f7ff] to-[#d1f0ff] cursor-pointer transition-transform duration-200 hover:scale-[1.02] ${
              beneficiaryFilter === "elderly"
                ? "!border-[#032990] !bg-gradient-to-br !from-[#f0f3ff] !to-[#e6eeff]"
                : ""
            }`}
            onClick={() => handleCardFilterClick("beneficiary", "elderly")}
          >
            <div className="text-2xl font-bold text-[#1e293b]">
              {elderlyOnlySponsors}
            </div>
            <div className="text-sm text-[#64748b]">
              Elderly Beneficiaries Only
            </div>
          </div>

          <div
            className={`p-4 rounded-lg shadow-[0_3px_8px_rgba(0,0,0,0.05)] border-l-4 border-[#0b6bcb] bg-gradient-to-br from-[#e6f4ff] to-[#cce5ff] cursor-pointer transition-transform duration-200 hover:scale-[1.02] ${
              beneficiaryFilter === "both"
                ? "!border-[#032990] !bg-gradient-to-br !from-[#f0f3ff] !to-[#e6eeff]"
                : ""
            }`}
            onClick={() => handleCardFilterClick("beneficiary", "both")}
          >
            <div className="text-2xl font-bold text-[#1e293b]">
              {bothSponsors}
            </div>
            <div className="text-sm text-[#64748b]">Both Child & Elderly</div>
          </div>
        </div>

        {/* Search */}
        <div className="flex flex-wrap gap-4 mb-6 items-center">
          <div className="relative flex-1 min-w-[300px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#64748b]" />
            <input
              type="text"
              id="searchInput"
              className="pl-10 p-3.5 w-full border border-[#cfd8dc] rounded-lg focus:outline-none focus:ring-2 focus:ring-[rgba(234,161,8,0.2)] focus:border-[#EAA108] shadow-[0_2px_5px_rgba(0,0,0,0.05)] transition-all duration-200"
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
                  "Beneficiary Count",
                ].map((header, index) => (
                  <th
                    key={header}
                    className={`px-6 py-3 text-left text-xs font-medium text-[#032990] uppercase tracking-wider cursor-pointer hover:bg-[#e0e8ff] transition-colors duration-200 ${
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
                  className="hover:bg-[#fff7ea] transition-colors duration-200 cursor-pointer even:bg-[#f8fafc]"
                  onClick={() => alert(`Showing details for: ${sponsor.name}`)}
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#032990]">
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
                      {sponsor.type || "N/A"}
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
                        <span className="text-[#c62828]">{`${
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
                        <span className="text-[#d46b08]">{`${
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
                    className="px-6 py-8 text-center text-gray-500"
                  >
                    No sponsors found matching your criteria.
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

export default SponsorList;
