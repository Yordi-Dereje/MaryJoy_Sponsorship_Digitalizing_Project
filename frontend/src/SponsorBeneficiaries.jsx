import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ChevronUp, ChevronDown, Search } from "lucide-react";

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

  // Create dummy data with only the three children you specified
  useEffect(() => {
    const calculateAge = (birthDate) => {
      const today = new Date();
      const birth = new Date(birthDate);
      let age = today.getFullYear() - birth.getFullYear();
      const monthDiff = today.getMonth() - birth.getMonth();
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age--;
      }
      
      return age;
    };

    const dummyData = [
      // Child beneficiaries from the database
      {
        id: 8,
        type: "child",
        name: "Bereket Tadesse",
        gender: "male",
        birthDate: "2016-04-22",
        status: "active",
        age: calculateAge("2016-04-22"),
        guardian: "Solomon Tadesse",
        phone: "+251911200008",
        sponsorId: "SP-008"
      },
      {
        id: 10,
        type: "child",
        name: "Selam Tadesse",
        gender: "female",
        birthDate: "2012-02-28",
        status: "active",
        age: calculateAge("2012-02-28"),
        guardian: "Solomon Tadesse",
        phone: "+251911200010",
        sponsorId: "SP-010"
      },
      {
        id: 9,
        type: "child",
        name: "Meskel Tadesse",
        gender: "male",
        birthDate: "2014-09-05",
        status: "active",
        age: calculateAge("2014-09-05"),
        guardian: "Solomon Tadesse",
        phone: "+251911200009",
        sponsorId: "SP-009"
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
        (beneficiary.phone && beneficiary.phone.toLowerCase().includes(searchInput.toLowerCase())) ||
        (beneficiary.sponsorId && beneficiary.sponsorId.toLowerCase().includes(searchInput.toLowerCase()));

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

  const handleRowClick = (beneficiary) => {
    // Map the beneficiary data to match what SpecificBeneficiary expects
    const beneficiaryData = {
      id: beneficiary.id,
      type: "child",
      full_name: beneficiary.name,
      gender: beneficiary.gender,
      date_of_birth: beneficiary.birthDate,
      status: beneficiary.status,
      guardian_name: beneficiary.guardian,
      phone: beneficiary.phone,
      sponsorId: beneficiary.sponsorId,
      age: beneficiary.age
    };

    navigate(`/specific_beneficiary/${beneficiary.id}`, {
      state: { beneficiary: beneficiaryData }
    });
  };

  const getGenderClasses = (gender) => {
    return gender === "male"
      ? "bg-[#e0f2ff] text-[#032990]"
      : "bg-[#ffe6f2] text-[#032990]";
  };

  const getTypeClasses = (type) => {
    return type === "child"
      ? "bg-[#e6f7ff] text-[#032990]"
      : "bg-[#fff2e8] text-[#032990]";
  };

  const childCount = allBeneficiaries.filter(b => b.type === "child").length;
  const elderlyCount = allBeneficiaries.filter(b => b.type === "elderly").length;

  return (
    <div className="font-poppins bg-white p-4 sm:p-6 lg:p-8 text-black leading-relaxed min-h-screen">
      <div className="max-w-7xl mx-auto bg-white p-4 sm:p-6 lg:p-8 rounded-xl shadow-[0_5px_15px_rgba(0,0,0,0.08)] flex flex-col min-h-[90vh]">
        <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
          <h1 className="text-[#032990] font-bold text-3xl m-0">
            My Beneficiaries
          </h1>
          <button
            onClick={handleBack}
            className="flex items-center justify-center w-12 h-12 bg-white text-[#032990] rounded-lg shadow-[0_4px_8px_rgba(0,0,0,0.1)] transition-all duration-300 border-2 border-[#f0f3ff] hover:bg-[#032990] hover:text-white group"
          >
            <ArrowLeft className="w-6 h-6 stroke-[#032990] transition-colors duration-300 group-hover:stroke-white" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div 
            className={`p-4 rounded-lg flex-1 min-w-[200px] shadow-[0_3px_10px_rgba(0,0,0,0.08)] text-center border-l-4 border-[#032990] bg-white cursor-pointer transition-all duration-300 hover:shadow-[0_5px_15px_rgba(3,41,144,0.2)] ${beneficiaryFilter === "child" ? "ring-2 ring-[#032990]" : ""}`}
            onClick={() => setBeneficiaryFilter(beneficiaryFilter === "child" ? "all" : "child")}
          >
            <div className="text-2xl font-bold text-[#032990]">
              {childCount}
            </div>
            <div className="text-sm text-black">Child Beneficiaries</div>
          </div>
          <div 
            className={`p-4 rounded-lg flex-1 min-w-[200px] shadow-[0_3px_10px_rgba(0,0,0,0.08)] text-center border-l-4 border-[#032990] bg-white cursor-pointer transition-all duration-300 hover:shadow-[0_5px_15px_rgba(3,41,144,0.2)] ${beneficiaryFilter === "elderly" ? "ring-2 ring-[#032990]" : ""}`}
            onClick={() => setBeneficiaryFilter(beneficiaryFilter === "elderly" ? "all" : "elderly")}
          >
            <div className="text-2xl font-bold text-[#032990]">
              {elderlyCount}
            </div>
            <div className="text-sm text-black">Elderly Beneficiaries</div>
          </div>
        </div>

        <div className="flex flex-wrap gap-4 mb-6 items-center">
          <div className="relative flex-1 min-w-[300px]">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              className="pl-10 pr-4 py-3.5 rounded-lg border border-gray-300 text-base bg-white w-full transition-all duration-300 shadow-[0_2px_5px_rgba(0,0,0,0.05)] focus:outline-none focus:border-[#032990] focus:ring-3 focus:ring-[rgba(3,41,144,0.2)]"
              placeholder="Search by name, guardian, phone number, or sponsor ID..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-y-auto flex-1 rounded-lg border border-gray-300">
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
                  className="bg-white transition-colors duration-200 even:bg-gray-50 hover:bg-gray-100 cursor-pointer"
                  onClick={() => handleRowClick(beneficiary)}
                >
                  <td className="p-4 text-left text-sm align-middle border-b border-gray-300">
                    <span
                      className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${getTypeClasses(
                        beneficiary.type
                      )}`}
                    >
                      {beneficiary.type}
                    </span>
                  </td>
                  <td className="p-4 text-left text-sm align-middle border-b border-gray-300 text-black">
                    {beneficiary.guardian || 'N/A'}
                  </td>
                  <td className="p-4 text-left text-sm align-middle border-b border-gray-300 font-semibold text-black">
                    {beneficiary.name}
                  </td>
                  <td className="p-4 text-left text-sm align-middle border-b border-gray-300 text-black">
                    {beneficiary.age}
                  </td>
                  <td className="p-4 text-left text-sm align-middle border-b border-gray-300">
                    <span
                      className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${getGenderClasses(
                        beneficiary.gender
                      )}`}
                    >
                      {beneficiary.gender}
                    </span>
                  </td>
                  <td className="p-4 text-left text-sm align-middle border-b border-gray-300 text-black">
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