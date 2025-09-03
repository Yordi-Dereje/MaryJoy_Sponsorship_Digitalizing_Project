import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, ChevronUp, ChevronDown } from "lucide-react";

const SponsorBeneficiaries = () => {
  const navigate = useNavigate();
  const [allBeneficiaries, setAllBeneficiaries] = useState([]);
  const [displayedBeneficiaries, setDisplayedBeneficiaries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [beneficiaryFilter, setBeneficiaryFilter] = useState("all");
  const [currentSortColumn, setCurrentSortColumn] = useState(2); // Default sort by name
  const [currentSortDirection, setCurrentSortDirection] = useState("asc");

  // Handle back button click
  const handleBack = () => {
    navigate("/sponsor_dashboard");
  };

  // Create dummy data
  useEffect(() => {
    const dummyData = [
      // Child beneficiaries
      {
        id: 1,
        type: "child",
        name: "Tsion Abebe",
        age: 15,
        gender: "female",
        guardian: "Alem Asefa",
        phone: "+251991164564"
      },
      {
        id: 2,
        type: "child",
        name: "Nathan Solomon",
        age: 6,
        gender: "male",
        guardian: "Solomon Bekele",
        phone: "+251911200002"
      },
      {
        id: 3,
        type: "child",
        name: "Maya Meskel",
        age: 4,
        gender: "female",
        guardian: "Meskel Haile",
        phone: "+251911200003"
      },
      // Elderly beneficiaries
      {
        id: 4,
        type: "elderly",
        name: "Abebe Kebede",
        age: 72,
        gender: "male",
        guardian: "",
        phone: "+251911200005"
      },
      {
        id: 5,
        type: "elderly",
        name: "Worknesh Demisse",
        age: 75,
        gender: "female",
        guardian: "",
        phone: "+251911200006"
      }
    ];

    setAllBeneficiaries(dummyData);
    setDisplayedBeneficiaries(dummyData);
  }, []);

  // Filter and sort based on current criteria
  useEffect(() => {
    if (!allBeneficiaries.length) return;

    let filteredData = allBeneficiaries.filter((beneficiary) => {
      // Search filter
      const searchMatch = 
        searchInput === "" ||
        (beneficiary.name && beneficiary.name.toLowerCase().includes(searchInput.toLowerCase())) ||
        (beneficiary.guardian && beneficiary.guardian.toLowerCase().includes(searchInput.toLowerCase())) ||
        (beneficiary.phone && beneficiary.phone.toLowerCase().includes(searchInput.toLowerCase()));

      // Beneficiary type filter
      let typeMatch = true;
      if (beneficiaryFilter !== "all") {
        typeMatch = beneficiary.type === beneficiaryFilter;
      }
      
      return searchMatch && typeMatch;
    });

    // Sort the filtered data
    const sortedData = [...filteredData].sort((a, b) => {
      let aValue, bValue;

      switch (currentSortColumn) {
        case 0:
          aValue = a.type || "";
          bValue = b.type || "";
          break;
        case 1:
          aValue = a.guardian || "";
          bValue = b.guardian || "";
          break;
        case 2:
          aValue = a.name || "";
          bValue = b.name || "";
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

    setDisplayedBeneficiaries(sortedData);
  }, [allBeneficiaries, searchInput, beneficiaryFilter, currentSortColumn, currentSortDirection]);

  const handleSort = (columnIndex) => {
    if (columnIndex === currentSortColumn) {
      setCurrentSortDirection(currentSortDirection === "asc" ? "desc" : "asc");
    } else {
      setCurrentSortColumn(columnIndex);
      setCurrentSortDirection("asc");
    }
  };

  const handleRowClick = (beneficiaryId, beneficiaryName) => {
    if (beneficiaryName === "Tsion Abebe") {
      navigate("/specific_beneficiary");
    } else {
      alert(`Showing details for: ${beneficiaryName}`);
    }
  };

  const getGenderClasses = (gender) => {
    return gender === "male"
      ? "bg-[#e0f2ff] text-[#0066cc]"
      : "bg-[#ffe6f2] text-[#cc0066]";
  };

  const getTypeClasses = (type) => {
    return type === "child"
      ? "bg-[#e6f7ff] text-[#1890ff]"
      : "bg-[#fff2e8] text-[#fa8c16]";
  };

  const childCount = allBeneficiaries.filter(b => b.type === "child").length;
  const elderlyCount = allBeneficiaries.filter(b => b.type === "elderly").length;

  return (
    <div className="font-poppins bg-[#f5f7fa] p-4 sm:p-6 lg:p-8 text-[#032990] leading-relaxed min-h-screen">
      <div className="max-w-7xl mx-auto bg-[#ffffff] p-4 sm:p-6 lg:p-8 rounded-xl shadow-[0_5px_15px_rgba(0,0,0,0.08)] flex flex-col min-h-[90vh]">
        <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
          <h1 className="text-[#032990] font-bold text-3xl m-0">
            My Beneficiaries
          </h1>
          <button
            onClick={handleBack}
            className="flex items-center justify-center w-12 h-12 bg-[#ffffff] text-[#032990] rounded-lg shadow-[0_4px_8px_rgba(0,0,0,0.1)] transition-all duration-300 border-2 border-[#f0f3ff] hover:bg-[#032990] hover:text-white group"
          >
            <ArrowLeft className="w-6 h-6 stroke-[#032990] transition-colors duration-300 group-hover:stroke-white" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div 
            className={`p-4 rounded-lg flex-1 min-w-[200px] shadow-[0_3px_10px_rgba(0,0,0,0.08)] text-center border-l-4 border-[#1890ff] bg-gradient-to-br from-[#e6f7ff] to-[#bae7ff] cursor-pointer transition-all duration-300 hover:shadow-[0_5px_15px_rgba(24,144,255,0.2)] ${beneficiaryFilter === "child" ? "ring-2 ring-[#1890ff]" : ""}`}
            onClick={() => setBeneficiaryFilter(beneficiaryFilter === "child" ? "all" : "child")}
          >
            <div className="text-2xl font-bold text-[#1890ff]">
              {childCount}
            </div>
            <div className="text-sm text-[#64748b]">Child Beneficiaries</div>
          </div>
          <div 
            className={`p-4 rounded-lg flex-1 min-w-[200px] shadow-[0_3px_10px_rgba(0,0,0,0.08)] text-center border-l-4 border-[#fa8c16] bg-gradient-to-br from-[#fff7e6] to-[#ffe7ba] cursor-pointer transition-all duration-300 hover:shadow-[0_5px_15px_rgba(250,140,22,0.2)] ${beneficiaryFilter === "elderly" ? "ring-2 ring-[#fa8c16]" : ""}`}
            onClick={() => setBeneficiaryFilter(beneficiaryFilter === "elderly" ? "all" : "elderly")}
          >
            <div className="text-2xl font-bold text-[#fa8c16]">
              {elderlyCount}
            </div>
            <div className="text-sm text-[#64748b]">Elderly Beneficiaries</div>
          </div>
        </div>

        <div className="flex flex-wrap gap-4 mb-6 items-center">
          <input
            type="text"
            id="searchInput"
            className="flex-1 min-w-[300px] p-3.5 rounded-lg border border-[#cfd8dc] text-base bg-[#ffffff] transition-all duration-300 shadow-[0_2px_5px_rgba(0,0,0,0.05)] focus:outline-none focus:border-[#EAA108] focus:ring-3 focus:ring-[rgba(234,161,8,0.2)]"
            placeholder="Search by name, guardian, or phone number..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
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
                  Type{" "}
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
                  Guardian{" "}
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
                  Name{" "}
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
                <th
                  className={`bg-[#f0f3ff] text-[#032990] font-semibold p-4 text-left text-sm sticky top-0 cursor-pointer select-none hover:bg-[#e0e8ff] transition-colors duration-200 ${
                    currentSortColumn === 4
                      ? currentSortDirection === "asc"
                        ? "sort-asc"
                        : "sort-desc"
                      : ""
                  }`}
                  onClick={() => handleSort(4)}
                >
                  Gender{" "}
                  {currentSortColumn === 4 &&
                    (currentSortDirection === "asc" ? (
                      <ChevronUp className="inline w-3 h-3 ml-1" />
                    ) : (
                      <ChevronDown className="inline w-3 h-3 ml-1" />
                    ))}
                </th>
                <th
                  className={`bg-[#f0f3ff] text-[#032990] font-semibold p-4 text-left text-sm sticky top-0 cursor-pointer select-none rounded-tr-lg hover:bg-[#e0e8ff] transition-colors duration-200 ${
                    currentSortColumn === 5
                      ? currentSortDirection === "asc"
                        ? "sort-asc"
                        : "sort-desc"
                      : ""
                  }`}
                  onClick={() => handleSort(5)}
                >
                  Phone{" "}
                  {currentSortColumn === 5 &&
                    (currentSortDirection === "asc" ? (
                      <ChevronUp className="inline w-3 h-3 ml-1" />
                    ) : (
                      <ChevronDown className="inline w-3 h-3 ml-1" />
                    ))}
                </th>
              </tr>
            </thead>
            <tbody>
              {displayedBeneficiaries.map((beneficiary) => (
                <tr
                  key={beneficiary.id}
                  className="bg-[#ffffff] transition-colors duration-200 even:bg-[#f8fafc] hover:bg-[#fff7ea] cursor-pointer"
                  onClick={() => handleRowClick(beneficiary.id, beneficiary.name)}
                >
                  <td className="p-4 text-left text-sm align-middle border-b border-[#e2e8f0]">
                    <span
                      className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${getTypeClasses(
                        beneficiary.type
                      )}`}
                    >
                      {beneficiary.type}
                    </span>
                  </td>
                  <td className="p-4 text-left text-sm align-middle border-b border-[#e2e8f0] text-[#444]">
                    {beneficiary.guardian || 'N/A'}
                  </td>
                  <td className="p-4 text-left text-sm align-middle border-b border-[#e2e8f0] font-semibold text-[#1a1a1a]">
                    {beneficiary.name}
                  </td>
                  <td className="p-4 text-left text-sm align-middle border-b border-[#e2e8f0] text-[#444]">
                    {beneficiary.age}
                  </td>
                  <td className="p-4 text-left text-sm align-middle border-b border-[#e2e8f0]">
                    <span
                      className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${getGenderClasses(
                        beneficiary.gender
                      )}`}
                    >
                      {beneficiary.gender}
                    </span>
                  </td>
                  <td className="p-4 text-left text-sm align-middle border-b border-[#e2e8f0] text-[#444]">
                    {beneficiary.phone || 'N/A'}
                  </td>
                </tr>
              ))}
              {displayedBeneficiaries.length === 0 && (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-gray-500">
                    No beneficiaries found matching your criteria.
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

export default SponsorBeneficiaries;
