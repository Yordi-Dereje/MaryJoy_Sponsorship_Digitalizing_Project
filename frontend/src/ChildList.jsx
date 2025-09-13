import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ChevronUp, ChevronDown, Search } from "lucide-react";

const ChildList = () => {
  const navigate = useNavigate();
  const [allChildren, setAllChildren] = useState([]);
  const [displayedChildren, setDisplayedChildren] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [childrenFilter, setChildrenFilter] = useState("all");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });
  const [refreshing, setRefreshing] = useState(false);

  // Fetch ALL data from backend
  const fetchChildrenData = async () => {
    try {
      setLoading(true);
      setRefreshing(true);
      const response = await fetch(
        `http://localhost:5000/api/beneficiaries/children?status=active`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch data");
      }
      const data = await response.json();
      setAllChildren(data.beneficiaries);
    } catch (err) {
      setError(err.message);
      console.error("Error fetching children:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchChildrenData();
  }, []);

  // Handle refresh
  const handleRefresh = () => {
    fetchChildrenData();
  };

  // Handle beneficiary row click
  const handleBeneficiaryClick = (child) => {
    // Map the child data to match what SpecificBeneficiary expects
    const beneficiaryData = {
      id: child.id,
      type: "child", // Explicitly set type to "child"
      full_name: child.child_name,
      gender: child.gender,
      date_of_birth: child.date_of_birth,
      status: child.status,
      guardian_id: child.guardian_id,
      address_id: child.address_id,
      support_letter_url: child.support_letter_url,
      guardian_name: child.guardian_name,
      phone: child.phone,
      sponsorId: child.sponsorId,
      age: child.age
    };

    navigate(`/specific_beneficiary/${child.id}`, {
      state: { beneficiary: beneficiaryData }
    });
  };

  // Handle sort request
  const handleSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  // Filter and sort data
  useEffect(() => {
    if (!allChildren.length) return;

    // Filter data based on search term and children count
    let filteredData = allChildren.filter((child) => {
      // Search filter
      const searchMatch =
        searchTerm === "" ||
        (child.sponsorId && child.sponsorId.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (child.guardian_name && child.guardian_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (child.child_name && child.child_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (child.phone && child.phone.toLowerCase().includes(searchTerm.toLowerCase()));

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
      if (!sortConfig.key) return 0;

      let aValue, bValue;
      switch (sortConfig.key) {
        case 'sponsorId':
          aValue = a.sponsorId || "";
          bValue = b.sponsorId || "";
          break;
        case 'guardian_name':
          aValue = a.guardian_name || "";
          bValue = b.guardian_name || "";
          break;
        case 'child_name':
          aValue = a.child_name || "";
          bValue = b.child_name || "";
          break;
        case 'age':
          aValue = a.age || 0;
          bValue = b.age || 0;
          break;
        case 'gender':
          aValue = a.gender || "";
          bValue = b.gender || "";
          break;
        case 'phone':
          aValue = a.phone || "";
          bValue = b.phone || "";
          break;
        default:
          aValue = "";
          bValue = "";
      }

      if (typeof aValue === "number" && typeof bValue === "number") {
        return sortConfig.direction === 'ascending' ? aValue - bValue : bValue - aValue;
      } else {
        if (aValue < bValue) return sortConfig.direction === 'ascending' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'ascending' ? 1 : -1;
        return 0;
      }
    });

    setDisplayedChildren(sortedData);
  }, [allChildren, searchTerm, childrenFilter, sortConfig]);

  const getGenderClasses = (gender) => {
    return gender === "male"
      ? "bg-[#e0f2ff] text-[#0066cc]"
      : "bg-[#ffe6f2] text-[#cc0066]";
  };

  const totalChildren = allChildren.length;
  const uniqueGuardians = new Set(allChildren.map((child) => child.guardian_name)).size;

  // Handle back button click
  const handleBack = () => {
    navigate("/admin_dashboard");
  };

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
        {/* Header with back button and refresh */}
        <div className="flex items-center mb-6 gap-4">
          <button
            onClick={handleBack}
            className="flex items-center justify-center w-12 h-12 bg-[#ffffff] text-[#032990] rounded-lg shadow-[0_4px_8px_rgba(0,0,0,0.1)] transition-all duration-300 border-2 border-[#f0f3ff] hover:bg-[#032990] hover:text-white group"
          >
            <ArrowLeft className="w-6 h-6 stroke-[#032990] transition-colors duration-300 group-hover:stroke-white" />
          </button>
          <h1 className="text-[#032990] font-bold text-3xl m-0">
            Active Child Beneficiaries
          </h1>
          <div className="ml-auto">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className={`flex items-center px-4 py-2 bg-gray-200 text-gray-800 rounded-lg shadow-md transition-all duration-300 hover:bg-gray-300 ${
                refreshing ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              <svg
                className={`w-5 h-5 mr-2 ${refreshing ? "animate-spin" : ""}`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              Refresh
            </button>
          </div>
        </div>

        {/* Stats cards */}
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

        {/* Search and filter controls */}
        <div className="flex flex-wrap gap-4 mb-6 items-center">
          <div className="relative flex-1 min-w-[300px]">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              className="pl-10 pr-4 py-3.5 rounded-lg border border-[#cfd8dc] text-base bg-[#ffffff] w-full transition-all duration-300 shadow-[0_2px_5px_rgba(0,0,0,0.05)] focus:outline-none focus:border-[#EAA108] focus:ring-3 focus:ring-[rgba(234,161,8,0.2)]"
              placeholder="Search by sponsor ID, guardian name, child name, or phone number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2 bg-[#f0f3ff] p-2 rounded-lg">
            <span className="font-medium text-sm text-[#032990] whitespace-nowrap">
              Children per Guardian:
            </span>
            <div className="relative">
              <select
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

        {/* Children table */}
        <div className="overflow-y-auto flex-1 rounded-lg border border-[#e2e8f0]">
          <table className="w-full border-separate border-spacing-0">
            <thead>
              <tr>
                <th
                  className={`bg-[#f0f3ff] text-[#032990] font-semibold p-4 text-left text-sm sticky top-0 cursor-pointer select-none rounded-tl-lg hover:bg-[#e0e8ff] transition-colors duration-200`}
                  onClick={() => handleSort('sponsorId')}
                >
                  <div className="flex items-center">
                    Sponsor ID
                    {sortConfig.key === 'sponsorId' && (
                      sortConfig.direction === 'ascending' ? (
                        <ChevronUp className="ml-1 w-3 h-3" />
                      ) : (
                        <ChevronDown className="ml-1 w-3 h-3" />
                      )
                    )}
                  </div>
                </th>
                <th
                  className={`bg-[#f0f3ff] text-[#032990] font-semibold p-4 text-left text-sm sticky top-0 cursor-pointer select-none hover:bg-[#e0e8ff] transition-colors duration-200`}
                  onClick={() => handleSort('guardian_name')}
                >
                  <div className="flex items-center">
                    Guardian Name
                    {sortConfig.key === 'guardian_name' && (
                      sortConfig.direction === 'ascending' ? (
                        <ChevronUp className="ml-1 w-3 h-3" />
                      ) : (
                        <ChevronDown className="ml-1 w-3 h-3" />
                      )
                    )}
                  </div>
                </th>
                <th
                  className={`bg-[#f0f3ff] text-[#032990] font-semibold p-4 text-left text-sm sticky top-0 cursor-pointer select-none hover:bg-[#e0e8ff] transition-colors duration-200`}
                  onClick={() => handleSort('child_name')}
                >
                  <div className="flex items-center">
                    Child Name
                    {sortConfig.key === 'child_name' && (
                      sortConfig.direction === 'ascending' ? (
                        <ChevronUp className="ml-1 w-3 h-3" />
                      ) : (
                        <ChevronDown className="ml-1 w-3 h-3" />
                      )
                    )}
                  </div>
                </th>
                <th
                  className={`bg-[#f0f3ff] text-[#032990] font-semibold p-4 text-left text-sm sticky top-0 cursor-pointer select-none hover:bg-[#e0e8ff] transition-colors duration-200`}
                  onClick={() => handleSort('age')}
                >
                  <div className="flex items-center">
                    Age
                    {sortConfig.key === 'age' && (
                      sortConfig.direction === 'ascending' ? (
                        <ChevronUp className="ml-1 w-3 h-3" />
                      ) : (
                        <ChevronDown className="ml-1 w-3 h-3" />
                      )
                    )}
                  </div>
                </th>
                <th
                  className={`bg-[#f0f3ff] text-[#032990] font-semibold p-4 text-left text-sm sticky top-0 cursor-pointer select-none hover:bg-[#e0e8ff] transition-colors duration-200`}
                  onClick={() => handleSort('gender')}
                >
                  <div className="flex items-center">
                    Gender
                    {sortConfig.key === 'gender' && (
                      sortConfig.direction === 'ascending' ? (
                        <ChevronUp className="ml-1 w-3 h-3" />
                      ) : (
                        <ChevronDown className="ml-1 w-3 h-3" />
                      )
                    )}
                  </div>
                </th>
                <th
                  className={`bg-[#f0f3ff] text-[#032990] font-semibold p-4 text-left text-sm sticky top-0 cursor-pointer select-none rounded-tr-lg hover:bg-[#e0e8ff] transition-colors duration-200`}
                  onClick={() => handleSort('phone')}
                >
                  <div className="flex items-center">
                    Guardian Phone
                    {sortConfig.key === 'phone' && (
                      sortConfig.direction === 'ascending' ? (
                        <ChevronUp className="ml-1 w-3 h-3" />
                      ) : (
                        <ChevronDown className="ml-1 w-3 h-3" />
                      )
                    )}
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {displayedChildren.map((child) => (
                <tr
                  key={child.id}
                  className="bg-[#ffffff] transition-colors duration-200 even:bg-[#f8fafc] hover:bg-[#fff7ea] cursor-pointer"
                  onClick={() => handleBeneficiaryClick(child)}
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
                    {allChildren.length === 0
                      ? "No children data available."
                      : "No children found matching your criteria."}
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

