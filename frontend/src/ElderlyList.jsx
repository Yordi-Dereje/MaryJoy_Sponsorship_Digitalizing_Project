import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useRoleNavigation } from "./hooks/useRoleNavigation";
import { ArrowLeft, ChevronUp, ChevronDown, Search, Download } from "lucide-react";

const ElderlyList = () => {
  const { navigateToDashboard } = useRoleNavigation();
  const navigate = useNavigate();
  const [allElderly, setAllElderly] = useState([]);
  const [displayedElderly, setDisplayedElderly] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchInput, setSearchInput] = useState("");
  const [currentSortColumn, setCurrentSortColumn] = useState(0);
  const [currentSortDirection, setCurrentSortDirection] = useState("asc");

  // Handle back button click
  const handleBack = () => {
    navigateToDashboard(); 
  };

  // Fetch ALL data from backend
  const fetchElderly = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `http://localhost:5000/api/beneficiaries/elderly?status=active`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch data");
      }
      const data = await response.json();
      setAllElderly(data.beneficiaries);
      setDisplayedElderly(data.beneficiaries);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching elderly:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchElderly();
  }, []);

  // Handle export to Excel
  const handleExport = () => {
    // Create CSV content
    const headers = ['Sponsor ID', 'Elderly Name', 'Age', 'Gender', 'Phone'];
    const csvContent = [
      headers.join(','),
      ...displayedElderly.map(elderly => [
        elderly.sponsorId || 'N/A',
        `"${(elderly.elderlyName || 'N/A').replace(/"/g, '""')}"`,
        elderly.age,
        elderly.gender,
        elderly.phone || 'N/A'
      ].join(','))
    ].join('\n');

    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'elderly_data.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Handle row click - navigate to specific beneficiary
  const handleRowClick = (elderly) => {
    // Map the elderly data to match what SpecificBeneficiary expects
    const beneficiaryData = {
      id: elderly.id,
      type: "elderly", // Explicitly set type to "elderly"
      full_name: elderly.elderlyName,
      gender: elderly.gender,
      date_of_birth: elderly.date_of_birth,
      status: elderly.status,
      address_id: elderly.address_id,
      support_letter_url: elderly.support_letter_url,
      phone: elderly.phone,
      sponsorId: elderly.sponsorId,
      age: elderly.age
    };

    navigate(`/specific_beneficiary/${elderly.id}`, {
      state: { beneficiary: beneficiaryData }
    });
  };

  // Filter and sort based on current criteria
  useEffect(() => {
    if (!allElderly.length) return;
    let filteredData = allElderly.filter((elderly) => {
      return searchInput === "" ||
        (elderly.sponsorId && elderly.sponsorId.toLowerCase().includes(searchInput.toLowerCase())) ||
        (elderly.elderlyName && elderly.elderlyName.toLowerCase().includes(searchInput.toLowerCase())) ||
        (elderly.phone && elderly.phone.toLowerCase().includes(searchInput.toLowerCase()));
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
          aValue = a.elderlyName || "";
          bValue = b.elderlyName || "";
          break;
        case 2:
          aValue = a.age || 0;
          bValue = b.age || 0;
          break;
        case 3:
          aValue = a.gender || "";
          bValue = b.gender || "";
          break;
        case 4:
          aValue = a.phone || "";
          bValue = b.phone || "";
          break;
        default:
          aValue = a.sponsorId || "";
          bValue = b.sponsorId || "";
      }
      if (typeof aValue === "number") {
        return currentSortDirection === "asc"
          ? aValue - bValue
          : bValue - aValue;
      } else {
        return currentSortDirection === "asc"
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
    });
    setDisplayedElderly(sortedData);
  }, [allElderly, searchInput, currentSortColumn, currentSortDirection]);

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

  const getGenderClasses = (gender) => {
    return gender === "male"
      ? "bg-[#e0f2ff] text-[#0066cc]"
      : "bg-[#ffe6f2] text-[#cc0066]";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f5f7fa] p-8 text-[#1e293b] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#032990] mx-auto"></div>
          <p className="mt-4 text-lg">Loading elderly beneficiaries...</p>
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

  const totalElderlyBeneficiaries = allElderly.length;

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
            Active Elderly Beneficiaries
          </h1>
        </div>

        <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
          <div className="p-4 rounded-lg flex-1 min-w-[200px] shadow-[0_3px_10px_rgba(0,0,0,0.08)] text-center border-l-4 border-[#032990] bg-gradient-to-br from-[#eff6ff] to-[#dbeafe]">
            <div className="text-3xl font-bold text-[#032990]">
              {totalElderlyBeneficiaries}
            </div>
            <div className="text-sm text-[#64748b]">
              Total Elderly Beneficiaries
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-4 mb-6 items-center">
          <div className="relative flex-1 min-w-[300px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#64748b]" />
            <input
              type="text"
              id="searchInput"
              className="pl-10 p-3.5 w-full border border-[#cfd8dc] rounded-lg focus:outline-none focus:ring-2 focus:ring-[rgba(234,161,8,0.2)] focus:border-[#EAA108] transition-all duration-200 shadow-[0_2px_5px_rgba(0,0,0,0.05)]"
              placeholder="Search by sponsor ID, elderly name, or phone number..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
          </div>

          <button
            onClick={handleExport}
            className="w-[10%] min-w-[100px] px-4 py-3.5 bg-[#032990] text-white rounded-lg border border-[#cfd8dc] shadow-[0_2px_5px_rgba(0,0,0,0.05)] hover:bg-[#021f70] transition-all duration-300 flex items-center justify-center"
            title="Export to Excel"
          >
            <Download className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-x-auto flex-1 border border-[#e2e8f0] rounded-lg shadow-[0_2px_5px_rgba(0,0,0,0.05)]">
          <table className="min-w-full border-separate border-spacing-0">
            <thead className="bg-[#f0f3ff] sticky top-0">
              <tr>
                <th
                  className={`px-4 py-3 text-left text-sm font-semibold text-[#032990] uppercase tracking-wider cursor-pointer hover:bg-[#e0e8ff] transition-colors duration-200 rounded-tl-lg`}
                  onClick={() => handleSort(0)}
                >
                  Sponsor ID
                  {getSortIndicator(0)}
                </th>
                <th
                  className={`px-4 py-3 text-left text-sm font-semibold text-[#032990] uppercase tracking-wider cursor-pointer hover:bg-[#e0e8ff] transition-colors duration-200`}
                  onClick={() => handleSort(1)}
                >
                  Elderly Name
                  {getSortIndicator(1)}
                </th>
                <th
                  className={`px-4 py-3 text-left text-sm font-semibold text-[#032990] uppercase tracking-wider cursor-pointer hover:bg-[#e0e8ff] transition-colors duration-200`}
                  onClick={() => handleSort(2)}
                >
                  Age
                  {getSortIndicator(2)}
                </th>
                <th
                  className={`px-4 py-3 text-left text-sm font-semibold text-[#032990] uppercase tracking-wider cursor-pointer hover:bg-[#e0e8ff] transition-colors duration-200`}
                  onClick={() => handleSort(3)}
                >
                  Gender
                  {getSortIndicator(3)}
                </th>
                <th
                  className={`px-4 py-3 text-left text-sm font-semibold text-[#032990] uppercase tracking-wider cursor-pointer hover:bg-[#e0e8ff] transition-colors duration-200 rounded-tr-lg`}
                  onClick={() => handleSort(4)}
                >
                  Phone
                  {getSortIndicator(4)}
                </th>
              </tr>
            </thead>
            <tbody className="bg-[#ffffff]">
              {displayedElderly.map((item) => (
                <tr
                  key={item.id}
                  className="hover:bg-[#fff7ea] transition-colors duration-200 cursor-pointer even:bg-[#f8fafc]"
                  onClick={() => handleRowClick(item)}
                >
                  <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-[#032990] border-b border-[#e2e8f0]">
                    {item.sponsorId || 'N/A'}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-[#1a1a1a] border-b border-[#e2e8f0]">
                    {item.elderlyName}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-[#1e293b] border-b border-[#e2e8f0]">
                    {item.age}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm border-b border-[#e2e8f0]">
                    <span
                      className={`px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getGenderClasses(
                        item.gender
                      )}`}
                    >
                      {item.gender}
                    </span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-[#1e293b] border-b border-[#e2e8f0]">
                    {item.phone || 'N/A'}
                  </td>
                </tr>
              ))}
              {displayedElderly.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-4 py-8 text-center text-gray-500">
                    No elderly beneficiaries found matching your criteria.
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

export default ElderlyList;
