import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, ChevronUp, ChevronDown } from "lucide-react";

const ChildList = () => {
  const navigate = useNavigate();
  const [allChildren, setAllChildren] = useState([]);
  const [displayedChildren, setDisplayedChildren] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchInput, setSearchInput] = useState("");
  const [childrenFilter, setChildrenFilter] = useState("all");
  const [currentSortColumn, setCurrentSortColumn] = useState(0);
  const [currentSortDirection, setCurrentSortDirection] = useState("asc");

  // Handle back button click
  const handleBack = () => {
    navigate("/admin_dashboard");
  };

  // Fetch ALL data from backend (without search initially)
  useEffect(() => {
    const fetchChildren = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `http://localhost:5000/api/beneficiaries/children`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch data");
        }

        const data = await response.json();
        setAllChildren(data.beneficiaries);
        setDisplayedChildren(data.beneficiaries);
      } catch (err) {
        setError(err.message);
        console.error("Error fetching children:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchChildren();
  }, []);

  // Filter and sort based on current criteria
  useEffect(() => {
    if (!allChildren.length) return;

    let filteredData = allChildren.filter((child) => {
      // Search filter
      const searchMatch = 
        searchInput === "" ||
        (child.sponsorId && child.sponsorId.toLowerCase().includes(searchInput.toLowerCase())) ||
        (child.guardian_name && child.guardian_name.toLowerCase().includes(searchInput.toLowerCase())) ||
        (child.child_name && child.child_name.toLowerCase().includes(searchInput.toLowerCase())) ||
        (child.phone && child.phone.toLowerCase().includes(searchInput.toLowerCase()));

      // Children count filter
      let countMatch = true;
      if (childrenFilter !== "all") {
        if (childrenFilter === "10+") {
          countMatch = child.childrenCount >= 10;
        } else {
          countMatch = child.childrenCount.toString() === childrenFilter;
        }
      }
      
      return searchMatch && countMatch;
    });

    // Sort the filtered data
    const sortedData = [...filteredData].sort((a, b) => {
      let aValue, bValue;

      switch (currentSortColumn) {
        case 0:
          aValue = a.sponsorId || "";
          bValue = b.sponsorId || "";
          break;
        case 1:
          aValue = a.guardian_name || "";
          bValue = b.guardian_name || "";
          break;
        case 2:
          aValue = a.child_name || "";
          bValue = b.child_name || "";
          break;
        case 3:
          aValue = a.age || 0;
          bValue = b.age || 0;
          break;
        case 4:
          aValue = a.gender || "";
          bValue = b.gender || "";
          break;
        case 5:
          aValue = a.phone || "";
          bValue = b.phone || "";
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
        if (aValue < bValue) return currentSortDirection === "asc" ? -1 : 1;
        if (aValue > bValue) return currentSortDirection === "asc" ? 1 : -1;
        return 0;
      }
    });

    setDisplayedChildren(sortedData);
  }, [allChildren, searchInput, childrenFilter, currentSortColumn, currentSortDirection]);

  const handleSort = (columnIndex) => {
    if (columnIndex === currentSortColumn) {
      setCurrentSortDirection(currentSortDirection === "asc" ? "desc" : "asc");
    } else {
      setCurrentSortColumn(columnIndex);
      setCurrentSortDirection("asc");
    }
  };

  const handleRowClick = (childId, childName) => {
    alert(`Showing details for: ${childName}`);
    // navigate(`/child-details/${childId}`);
  };

  const getGenderClasses = (gender) => {
    return gender === "male"
      ? "bg-[#e0f2ff] text-[#0066cc]"
      : "bg-[#ffe6f2] text-[#cc0066]";
  };

  const totalChildren = allChildren.length;
  const uniqueGuardians = new Set(allChildren.map((child) => child.guardian_name)).size;

  if (loading) {
    return (
      <div className="font-poppins bg-[#f5f7fa] p-8 text-[#032990] min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#032990] mx-auto"></div>
          <p className="mt-4 text-lg">Loading children data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="font-poppins bg-[#f5f7fa] p-8 text-[#032990] min-h-screen flex items-center justify-center">
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
    <div className="font-poppins bg-[#f5f7fa] p-4 sm:p-6 lg:p-8 text-[#032990] leading-relaxed min-h-screen">
      <div className="max-w-7xl mx-auto bg-[#ffffff] p-4 sm:p-6 lg:p-8 rounded-xl shadow-[0_5px_15px_rgba(0,0,0,0.08)] flex flex-col min-h-[90vh]">
        <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
          <h1 className="text-[#032990] font-bold text-3xl m-0">
            Child Beneficiaries
          </h1>
          {/* Updated back button with onClick handler */}
          <button
            onClick={handleBack}
            className="flex items-center justify-center w-12 h-12 bg-[#ffffff] text-[#032990] rounded-lg shadow-[0_4px_8px_rgba(0,0,0,0.1)] transition-all duration-300 border-2 border-[#f0f3ff] hover:bg-[#032990] hover:text-white group"
          >
            <ArrowLeft className="w-6 h-6 stroke-[#032990] transition-colors duration-300 group-hover:stroke-white" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div className="p-4 rounded-lg flex-1 min-w-[200px] shadow-[0_3px_10px_rgba(0,0,0,0.08)] text-center border-l-4 border-[#032990] bg-gradient-to-br from-[#eff6ff] to-[#dbeafe]">
            <div className="text-2xl font-bold text-[#032990]">
              {totalChildren}
            </div>
            <div className="text-sm text-[#64748b]">Total Children</div>
          </div>
          <div className="p-4 rounded-lg flex-1 min-w-[200px] shadow-[0_3px_10px_rgba(0,0,0,0.08)] text-center border-l-4 border-[#032990] bg-gradient-to-br from-[#eff6ff] to-[#dbeafe]">
            <div className="text-2xl font-bold text-[#032990]">
              {uniqueGuardians}
            </div>
            <div className="text-sm text-[#64748b]">Guardians/Parents</div>
          </div>
        </div>

        <div className="flex flex-wrap gap-4 mb-6 items-center">
          <input
            type="text"
            id="searchInput"
            className="flex-1 min-w-[300px] p-3.5 rounded-lg border border-[#cfd8dc] text-base bg-[#ffffff] transition-all duration-300 shadow-[0_2px_5px_rgba(0,0,0,0.05)] focus:outline-none focus:border-[#EAA108] focus:ring-3 focus:ring-[rgba(234,161,8,0.2)]"
            placeholder="Search by sponsor ID, guardian name, child name, or phone number..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />

          <div className="flex items-center gap-2 bg-[#f0f3ff] p-2 rounded-lg">
            <span className="font-medium text-sm text-[#032990] whitespace-nowrap">
              Children per Guardian:
            </span>
            <div className="relative">
              <select
                id="childrenFilter"
                className="p-2.5 rounded-md border border-[#cfd8dc] bg-[#ffffff] text-sm min-w-[100px] appearance-none pr-10 focus:outline-none focus:border-[#EAA108] focus:ring-2 focus:ring-[rgba(234,161,8,0.2)]"
                value={childrenFilter}
                onChange={(e) => setChildrenFilter(e.target.value)}
              >
                <option value="all">All</option>
                {[...Array(10).keys()].map((i) => (
                  <option key={i + 1} value={(i + 1).toString()}>
                    {i + 1} Child{i > 0 ? "ren" : ""}
                  </option>
                ))}
                <option value="10+">10+ Children</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748b] pointer-events-none" />
            </div>
          </div>
        </div>

        <div className="overflow-y-auto flex-1 rounded-lg border border-[#e2e8f0]">
          <table className="w-full border-separate border-spacing-0">
            <thead>
              <tr>
                <th
                  className={`bg-[#f0f3ff] text-[#032990] font-semibold p-4 text-left text-sm sticky top-0 cursor-pointer select-none rounded-tl-lg hover:bg-[#e0e8ff] transition-colors duration-200 ${
                    currentSortColumn === 0
                      ? currentSortDirection === "asc"
                        ? "sort-asc"
                        : "sort-desc"
                      : ""
                  }`}
                  onClick={() => handleSort(0)}
                >
                  Sponsor ID{" "}
                  {currentSortColumn === 0 &&
                    (currentSortDirection === "asc" ? (
                      <ChevronUp className="inline w-3 h-3 ml-1" />
                    ) : (
                      <ChevronDown className="inline w-3 h-3 ml-1" />
                    ))}
                </th>
                <th
                  className={`bg-[#f0f3ff] text-[#032990] font-semibold p-4 text-left text-sm sticky top-0 cursor-pointer select-none hover:bg-[#e0e8ff] transition-colors duration-200 ${
                    currentSortColumn === 1
                      ? currentSortDirection === "asc"
                        ? "sort-asc"
                        : "sort-desc"
                      : ""
                  }`}
                  onClick={() => handleSort(1)}
                >
                  Guardian Name{" "}
                  {currentSortColumn === 1 &&
                    (currentSortDirection === "asc" ? (
                      <ChevronUp className="inline w-3 h-3 ml-1" />
                    ) : (
                      <ChevronDown className="inline w-3 h-3 ml-1" />
                    ))}
                </th>
                <th
                  className={`bg-[#f0f3ff] text-[#032990] font-semibold p-4 text-left text-sm sticky top-0 cursor-pointer select-none hover:bg-[#e0e8ff] transition-colors duration-200 ${
                    currentSortColumn === 2
                      ? currentSortDirection === "asc"
                        ? "sort-asc"
                        : "sort-desc"
                      : ""
                  }`}
                  onClick={() => handleSort(2)}
                >
                  Child Name{" "}
                  {currentSortColumn === 2 &&
                    (currentSortDirection === "asc" ? (
                      <ChevronUp className="inline w-3 h-3 ml-1" />
                    ) : (
                      <ChevronDown className="inline w-3 h-3 ml-1" />
                    ))}
                </th>
                <th
                  className={`bg-[#f0f3ff] text-[#032990] font-semibold p-4 text-left text-sm sticky top-0 cursor-pointer select-none hover:bg-[#e0e8ff] transition-colors duration-200 ${
                    currentSortColumn === 3
                      ? currentSortDirection === "asc"
                        ? "sort-asc"
                        : "sort-desc"
                      : ""
                  }`}
                  onClick={() => handleSort(3)}
                >
                  Age{" "}
                  {currentSortColumn === 3 &&
                    (currentSortDirection === "asc" ? (
                      <ChevronUp className="inline w-3 h-3 ml-1" />
                    ) : (
                      <ChevronDown className="inline w-3 h-3 ml-1" />
                    ))}
                </th>
                <th className="bg-[#f0f3ff] text-[#032990] font-semibold p-4 text-left text-sm sticky top-0 cursor-pointer select-none hover:bg-[#e0e8ff] transition-colors duration-200">
                  Gender
                </th>
                <th className="bg-[#f0f3ff] text-[#032990] font-semibold p-4 text-left text-sm sticky top-0 cursor-pointer select-none rounded-tr-lg hover:bg-[#e0e8ff] transition-colors duration-200">
                  Guardian Phone
                </th>
              </tr>
            </thead>
            <tbody>
              {displayedChildren.map((child) => (
                <tr
                  key={child.id}
                  className="bg-[#ffffff] transition-colors duration-200 even:bg-[#f8fafc] hover:bg-[#fff7ea] cursor-pointer"
                  onClick={() => handleRowClick(child.id, child.child_name)}
                >
                  <td className="p-4 text-left text-sm align-middle border-b border-[#e2e8f0] font-semibold text-[#032990]">
                    {child.sponsorId || 'N/A'}
                  </td>
                  <td className="p-4 text-left text-sm align-middle border-b border-[#e2e8f0] text-[#444]">
                    {child.guardian_name || 'N/A'}
                  </td>
                  <td className="p-4 text-left text-sm align-middle border-b border-[#e2e8f0] font-semibold text-[#1a1a1a]">
                    {child.child_name}
                  </td>
                  <td className="p-4 text-left text-sm align-middle border-b border-[#e2e8f0] text-[#444]">
                    {child.age}
                  </td>
                  <td className="p-4 text-left text-sm align-middle border-b border-[#e2e8f0]">
                    <span
                      className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${getGenderClasses(
                        child.gender
                      )}`}
                    >
                      {child.gender}
                    </span>
                  </td>
                  <td className="p-4 text-left text-sm align-middle border-b border-[#e2e8f0] text-[#444]">
                    {child.phone || 'N/A'}
                  </td>
                </tr>
              ))}
              {displayedChildren.length === 0 && (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-gray-500">
                    No children found matching your criteria.
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

export default ChildList;
