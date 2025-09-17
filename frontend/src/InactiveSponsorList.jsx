import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Search,
  Filter,
  ChevronUp,
  ChevronDown,
  User,
  Phone,
  Calendar,
  Users,
  Hash
} from "lucide-react";

const InactiveSponsorList = () => {
  const navigate = useNavigate();
  const [searchInput, setSearchInput] = useState("");
  const [currentSortColumn, setCurrentSortColumn] = useState(4); // Default sort by end date
  const [currentSortDirection, setCurrentSortDirection] = useState("desc"); // Default descending

  // Sample data for inactive sponsors
  const inactiveSponsors = [
    {
      id: 1,
      sponsorId: "SP-001",
      name: "John Smith",
      phone: "+251 911 234 567",
      beneficiariesCount: 3,
      endDate: "2023-05-15",
      endTimestamp: new Date("2023-05-15")
    },
    {
      id: 2,
      sponsorId: "SP-002",
      name: "Maria Garcia",
      phone: "+251 922 345 678",
      beneficiariesCount: 1,
      endDate: "2023-08-22",
      endTimestamp: new Date("2023-08-22")
    },
    {
      id: 3,
      sponsorId: "SP-003",
      name: "David Johnson",
      phone: "+251 933 456 789",
      beneficiariesCount: 2,
      endDate: "2023-11-30",
      endTimestamp: new Date("2023-11-30")
    },
    {
      id: 4,
      sponsorId: "SP-004",
      name: "Sarah Williams",
      phone: "+251 944 567 890",
      beneficiariesCount: 5,
      endDate: "2024-01-10",
      endTimestamp: new Date("2024-01-10")
    },
    {
      id: 5,
      sponsorId: "SP-005",
      name: "Robert Brown",
      phone: "+251 955 678 901",
      beneficiariesCount: 2,
      endDate: "2024-02-28",
      endTimestamp: new Date("2024-02-28")
    }
  ];

  // Handle back button click
  const handleBack = () => {
    navigate(-1); // Go back to previous page
  };

  // Filter sponsors based on search input
  const filteredSponsors = inactiveSponsors.filter((sponsor) => {
    const searchTerm = searchInput.toLowerCase();
    return (
      sponsor.sponsorId.toLowerCase().includes(searchTerm) ||
      sponsor.name.toLowerCase().includes(searchTerm) ||
      sponsor.phone.toLowerCase().includes(searchTerm) ||
      sponsor.beneficiariesCount.toString().includes(searchTerm) ||
      sponsor.endDate.toLowerCase().includes(searchTerm)
    );
  });

  // Sort sponsors based on current sort column and direction
  const sortedSponsors = [...filteredSponsors].sort((a, b) => {
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
        aValue = a.phone;
        bValue = b.phone;
        break;
      case 3:
        aValue = a.beneficiariesCount;
        bValue = b.beneficiariesCount;
        break;
      case 4:
        aValue = a.endTimestamp;
        bValue = b.endTimestamp;
        break;
      default:
        aValue = "";
        bValue = "";
    }

    if (typeof aValue === "number" && typeof bValue === "number") {
      return currentSortDirection === "asc" ? aValue - bValue : bValue - aValue;
    } else if (aValue instanceof Date && bValue instanceof Date) {
      return currentSortDirection === "asc" 
        ? aValue.getTime() - bValue.getTime() 
        : bValue.getTime() - aValue.getTime();
    } else {
      if (aValue < bValue) return currentSortDirection === "asc" ? -1 : 1;
      if (aValue > bValue) return currentSortDirection === "asc" ? 1 : -1;
      return 0;
    }
  });

  const handleSort = (columnIndex) => {
    if (columnIndex === currentSortColumn) {
      setCurrentSortDirection(currentSortDirection === "asc" ? "desc" : "asc");
    } else {
      setCurrentSortColumn(columnIndex);
      setCurrentSortDirection("asc");
    }
  };

  const handleRowClick = (sponsorId, sponsorName) => {
    alert(`Showing details for: ${sponsorName}`);
    // navigate(`/sponsor-details/${sponsorId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-50 p-4 sm:p-6 lg:p-8 font-inter">
      <div className="max-w-7xl mx-auto bg-white p-4 sm:p-6 lg:p-8 rounded-2xl shadow-md">
        {/* Header */}
        <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={handleBack}
              className="flex items-center justify-center w-12 h-12 bg-white text-[#032990] rounded-lg shadow-sm transition-all duration-300 border border-[#032990]/20 hover:bg-[#032990]/5 hover:shadow-md group"
            >
              <ArrowLeft className="w-6 h-6 stroke-[#032990] transition-colors duration-300 group-hover:stroke-[#032990]" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-[#032990]">Inactive Sponsors</h1>
              <p className="text-gray-600">Former sponsors who are no longer active</p>
            </div>
          </div>
          <div className="bg-[#032990]/10 text-[#032990] px-4 py-2 rounded-lg flex items-center gap-2">
            <Users size={20} />
            <span className="font-semibold">{filteredSponsors.length} Inactive Sponsors</span>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-gradient-to-r from-[#032990]/5 to-[#032990]/10 p-4 rounded-xl border border-[#032990]/20 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#032990]/20 rounded-lg flex items-center justify-center text-[#032990]">
                <Hash size={20} />
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-600">Total Inactive</h3>
                <p className="text-2xl font-bold text-[#032990]">{inactiveSponsors.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-r from-[#032990]/5 to-[#032990]/10 p-4 rounded-xl border border-[#032990]/20 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#032990]/20 rounded-lg flex items-center justify-center text-[#032990]">
                <Users size={20} />
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-600">Total Beneficiaries Impacted</h3>
                <p className="text-2xl font-bold text-[#032990]">
                  {inactiveSponsors.reduce((acc, sponsor) => acc + sponsor.beneficiariesCount, 0)}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-r from-[#032990]/5 to-[#032990]/10 p-4 rounded-xl border border-[#032990]/20 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#032990]/20 rounded-lg flex items-center justify-center text-[#032990]">
                <Calendar size={20} />
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-600">Average Sponsorship Duration</h3>
                <p className="text-2xl font-bold text-[#032990]">18 months</p>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-wrap gap-4 mb-6 items-center">
          <div className="relative flex-1 min-w-[300px]">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 text-base bg-white transition-all duration-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#032990] focus:border-[#032990]"
              placeholder="Search by sponsor ID, name, phone, or end date..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors shadow-sm">
            <Filter size={18} />
            Filters
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
          <table className="w-full border-separate border-spacing-0">
            <thead>
              <tr className="bg-[#032990] text-white">
                <th
                  className="p-4 text-left text-sm font-semibold cursor-pointer select-none rounded-tl-xl hover:bg-[#021f70] transition-colors duration-200"
                  onClick={() => handleSort(0)}
                >
                  <div className="flex items-center gap-1">
                    <Hash size={16} />
                    Sponsor ID
                    {currentSortColumn === 0 && (
                      currentSortDirection === "asc" ? <ChevronUp size={16} /> : <ChevronDown size={16} />
                    )}
                  </div>
                </th>
                <th
                  className="p-4 text-left text-sm font-semibold cursor-pointer select-none hover:bg-[#021f70] transition-colors duration-200"
                  onClick={() => handleSort(1)}
                >
                  <div className="flex items-center gap-1">
                    <User size={16} />
                    Name
                    {currentSortColumn === 1 && (
                      currentSortDirection === "asc" ? <ChevronUp size={16} /> : <ChevronDown size={16} />
                    )}
                  </div>
                </th>
                <th
                  className="p-4 text-left text-sm font-semibold cursor-pointer select-none hover:bg-[#021f70] transition-colors duration-200"
                  onClick={() => handleSort(2)}
                >
                  <div className="flex items-center gap-1">
                    <Phone size={16} />
                    Phone
                    {currentSortColumn === 2 && (
                      currentSortDirection === "asc" ? <ChevronUp size={16} /> : <ChevronDown size={16} />
                    )}
                  </div>
                </th>
                <th
                  className="p-4 text-left text-sm font-semibold cursor-pointer select-none hover:bg-[#021f70] transition-colors duration-200"
                  onClick={() => handleSort(3)}
                >
                  <div className="flex items-center gap-1">
                    <Users size={16} />
                    Beneficiaries
                    {currentSortColumn === 3 && (
                      currentSortDirection === "asc" ? <ChevronUp size={16} /> : <ChevronDown size={16} />
                    )}
                  </div>
                </th>
                <th
                  className="p-4 text-left text-sm font-semibold cursor-pointer select-none rounded-tr-xl hover:bg-[#021f70] transition-colors duration-200"
                  onClick={() => handleSort(4)}
                >
                  <div className="flex items-center gap-1">
                    <Calendar size={16} />
                    End Date
                    {currentSortColumn === 4 && (
                      currentSortDirection === "asc" ? <ChevronUp size={16} /> : <ChevronDown size={16} />
                    )}
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedSponsors.map((sponsor, index) => (
                <tr
                  key={sponsor.id}
                  className={`bg-white transition-colors duration-200 hover:bg-red-50 cursor-pointer ${
                    index % 2 === 0 ? '' : 'bg-gray-50'
                  }`}
                  onClick={() => handleRowClick(sponsor.id, sponsor.name)}
                >
                  <td className="p-4 text-left text-sm align-middle border-b border-gray-200 font-semibold text-[#032990]">
                    {sponsor.sponsorId}
                  </td>
                  <td className="p-4 text-left text-sm align-middle border-b border-gray-200 text-gray-800">
                    {sponsor.name}
                  </td>
                  <td className="p-4 text-left text-sm align-middle border-b border-gray-200 text-gray-600">
                    {sponsor.phone}
                  </td>
                  <td className="p-4 text-left text-sm align-middle border-b border-gray-200">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-[#032990]/10 text-[#032990]">
                      {sponsor.beneficiariesCount} supported
                    </span>
                  </td>
                  <td className="p-4 text-left text-sm align-middle border-b border-gray-200 text-gray-600">
                    {sponsor.endDate}
                  </td>
                </tr>
              ))}
              {sortedSponsors.length === 0 && (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-gray-500">
                    <div className="flex flex-col items-center justify-center py-8">
                      <User size={48} className="text-gray-300 mb-4" />
                      <p className="text-lg font-medium text-gray-400">No inactive sponsors found</p>
                      <p className="text-gray-500">Try adjusting your search criteria</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="flex flex-col sm:flex-row justify-between items-center mt-6 pt-6 border-t border-gray-200 gap-4">
          <p className="text-sm text-gray-600">
            Showing <span className="font-medium">{sortedSponsors.length}</span> of{" "}
            <span className="font-medium">{inactiveSponsors.length}</span> inactive sponsors
          </p>
          <div className="flex items-center gap-2">
            <button className="px-4 py-2 text-sm bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
              Previous
            </button>
            <button className="px-4 py-2 text-sm bg-[#032990]/10 border border-[#032990]/20 rounded-lg text-[#032990] font-medium">
              1
            </button>
            <button className="px-4 py-2 text-sm bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InactiveSponsorList;