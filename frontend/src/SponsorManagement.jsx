import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  Search,
  ChevronUp,
  ChevronDown,
  User,
  Users,
  Home,
  Globe,
} from "lucide-react";

const initialSponsorManagementData = [
  {
    id: 1,
    name: "Maria Garcia",
    age: 42,
    gender: "Female",
    type: "private",
    residency: "diaspora",
    phone: "+13105550126",
    requestedBeneficiaries: "2 elders",
    status: "pending",
    updatedBy: "Abebe T.",
    updatedAt: "2023-10-15",
  },
  {
    id: 2,
    name: "Community Care Alliance",
    age: null,
    gender: "",
    type: "organization",
    residency: "local",
    phone: "+251922334455",
    requestedBeneficiaries: "16 children & 10 elders",
    status: "processing",
    updatedBy: "Selam W.",
    updatedAt: "2023-10-18",
  },
  {
    id: 3,
    name: "Thomas Clark",
    age: 35,
    gender: "Male",
    type: "private",
    residency: "local",
    phone: "+251911223344",
    requestedBeneficiaries: "1 child",
    status: "approved",
    updatedBy: "Kebede M.",
    updatedAt: "2023-10-10",
  },
  {
    id: 4,
    name: "Lisa Taylor",
    age: 29,
    gender: "Female",
    type: "private",
    residency: "diaspora",
    phone: "+4915123456789",
    requestedBeneficiaries: "1 elder",
    status: "rejected",
    updatedBy: "Tigist H.",
    updatedAt: "2023-10-12",
  },
  {
    id: 5,
    name: "David Anderson",
    age: 45,
    gender: "Male",
    type: "private",
    residency: "local",
    phone: "+251988990011",
    requestedBeneficiaries: "2 children",
    status: "completed",
    updatedBy: "Abebe T.",
    updatedAt: "2023-10-05",
  },
  {
    id: 6,
    name: "Bright Future Corporation",
    age: null,
    gender: "",
    type: "organization",
    residency: "local",
    phone: "+251999001122",
    requestedBeneficiaries: "8 children & 6 elders",
    status: "processing",
    updatedBy: "Selam W.",
    updatedAt: "2023-10-19",
  },
  {
    id: 7,
    name: "Jennifer Martinez",
    age: 31,
    gender: "Female",
    type: "private",
    residency: "diaspora",
    phone: "+13125550125",
    requestedBeneficiaries: "1 elder",
    status: "pending",
    updatedBy: "Kebede M.",
    updatedAt: "2023-10-17",
  },
  {
    id: 8,
    name: "Hope for Ethiopia NGO",
    age: null,
    gender: "",
    type: "organization",
    residency: "local",
    phone: "+251966778899",
    requestedBeneficiaries: "25 children & 18 elders",
    status: "approved",
    updatedBy: "Tigist H.",
    updatedAt: "2023-10-08",
  },
  {
    id: 9,
    name: "Robert Wilson",
    age: 50,
    gender: "Male",
    type: "private",
    residency: "diaspora",
    phone: "+441234567890",
    requestedBeneficiaries: "3 children",
    status: "processing",
    updatedBy: "Abebe T.",
    updatedAt: "2023-10-16",
  },
  {
    id: 10,
    name: "Emily Davis",
    age: 38,
    gender: "Female",
    type: "private",
    residency: "local",
    phone: "+251944556677",
    requestedBeneficiaries: "3 elders",
    status: "completed",
    updatedBy: "Selam W.",
    updatedAt: "2023-10-03",
  },
  {
    id: 11,
    name: "Green Development Foundation",
    age: null,
    gender: "",
    type: "organization",
    residency: "local",
    phone: "+251933445566",
    requestedBeneficiaries: "12 children & 8 elders",
    status: "pending",
    updatedBy: "Kebede M.",
    updatedAt: "2023-10-20",
  },
  {
    id: 12,
    name: "Michael Brown",
    age: 41,
    gender: "Male",
    type: "private",
    residency: "diaspora",
    phone: "+16135550124",
    requestedBeneficiaries: "1 child",
    status: "approved",
    updatedBy: "Tigist H.",
    updatedAt: "2023-10-11",
  },
  {
    id: 13,
    name: "Ethio Telecom",
    age: null,
    gender: "",
    type: "organization",
    residency: "local",
    phone: "+251911223344",
    requestedBeneficiaries: "5 children & 3 elders",
    status: "processing",
    updatedBy: "Abebe T.",
    updatedAt: "2023-10-14",
  },
  {
    id: 14,
    name: "Sarah Johnson",
    age: 33,
    gender: "Female",
    type: "private",
    residency: "local",
    phone: "+251987654321",
    requestedBeneficiaries: "1 elder",
    status: "rejected",
    updatedBy: "Selam W.",
    updatedAt: "2023-10-13",
  },
  {
    id: 15,
    name: "John Smith",
    age: 47,
    gender: "Male",
    type: "private",
    residency: "diaspora",
    phone: "+14155550123",
    requestedBeneficiaries: "2 children",
    status: "completed",
    updatedBy: "Kebede M.",
    updatedAt: "2023-10-02",
  },
];

const SponsorManagement = () => {
  const navigate = useNavigate();
  const [sponsors, setSponsors] = useState(initialSponsorManagementData);
  const [searchInput, setSearchInput] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [residencyFilter, setResidencyFilter] = useState("all");
  const [beneficiaryTypeFilter, setBeneficiaryTypeFilter] = useState("all");
  const [currentSortColumn, setCurrentSortColumn] = useState(0);
  const [currentSortDirection, setCurrentSortDirection] = useState("asc");

  const totalInactiveSponsors = sponsors.length;
  const pendingSponsors = sponsors.filter((s) => s.status === "pending").length;
  const processingSponsors = sponsors.filter(
    (s) => s.status === "processing"
  ).length;
  const privateSponsors = sponsors.filter((s) => s.type === "private").length;
  const organizationSponsors = sponsors.filter(
    (s) => s.type === "organization"
  ).length;
  const localSponsors = sponsors.filter((s) => s.residency === "local").length;
  const diasporaSponsors = sponsors.filter(
    (s) => s.residency === "diaspora"
  ).length;

  useEffect(() => {
    filterAndSortTable();
  }, [
    searchInput,
    statusFilter,
    typeFilter,
    residencyFilter,
    beneficiaryTypeFilter,
    currentSortColumn,
    currentSortDirection,
  ]);

  const filterAndSortTable = () => {
    let filteredData = initialSponsorManagementData.filter((sponsor) => {
      const searchTermLower = searchInput.toLowerCase();
      const matchesSearch =
        sponsor.name.toLowerCase().includes(searchTermLower) ||
        sponsor.phone.toLowerCase().includes(searchTermLower);

      const matchesStatus =
        statusFilter === "all" || sponsor.status === statusFilter;
      const matchesType = typeFilter === "all" || sponsor.type === typeFilter;
      const matchesResidency =
        residencyFilter === "all" || sponsor.residency === residencyFilter;

      const matchesBeneficiaryType = () => {
        if (beneficiaryTypeFilter === "all") return true;
        if (beneficiaryTypeFilter === "children")
          return sponsor.requestedBeneficiaries.includes("children");
        if (beneficiaryTypeFilter === "elders")
          return sponsor.requestedBeneficiaries.includes("elders");
        if (beneficiaryTypeFilter === "both")
          return (
            sponsor.requestedBeneficiaries.includes("children") &&
            sponsor.requestedBeneficiaries.includes("elders")
          );
        return true;
      };

      return (
        matchesSearch &&
        matchesStatus &&
        matchesType &&
        matchesResidency &&
        matchesBeneficiaryType()
      );
    });

    const sortedData = [...filteredData].sort((a, b) => {
      let aValue, bValue;

      switch (currentSortColumn) {
        case 0:
          aValue = a.name;
          bValue = b.name;
          break;
        case 1:
          aValue = a.age || 0;
          bValue = b.age || 0;
          break;
        case 2:
          aValue = a.gender;
          bValue = b.gender;
          break;
        case 3:
          aValue = a.type;
          bValue = b.type;
          break;
        case 4:
          aValue = a.residency;
          bValue = b.residency;
          break;
        case 6:
          const extractNum = (text) => parseInt(text.match(/\d+/)?.[0] || 0);
          aValue = extractNum(a.requestedBeneficiaries);
          bValue = extractNum(b.requestedBeneficiaries);
          break;
        case 7:
          aValue = a.status;
          bValue = b.status;
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

    setSponsors(sortedData);
  };

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

  const getBeneficiaryCountDisplay = (requestedBeneficiaries) => {
    const childrenMatch = requestedBeneficiaries.match(/(\d+)\s*children/);
    const eldersMatch = requestedBeneficiaries.match(/(\d+)\s*elders/);
    const childrenCount = childrenMatch ? parseInt(childrenMatch[1]) : 0;
    const eldersCount = eldersMatch ? parseInt(eldersMatch[1]) : 0;

    if (childrenCount > 0 && eldersCount > 0) {
      return (
        <span className="inline-flex items-center px-3 py-1 text-xs leading-5 font-semibold rounded-full bg-gradient-to-r from-[#ffebee] to-[#fff2e8] text-[#c62828]">
          {childrenCount} children{" "}
          <span className="text-[#d46b08]">& {eldersCount} elders</span>
        </span>
      );
    } else if (childrenCount > 0) {
      return (
        <span className="inline-flex items-center px-3 py-1 text-xs leading-5 font-semibold rounded-full bg-[#ffebee] text-[#c62828]">
          {childrenCount} children
        </span>
      );
    } else if (eldersCount > 0) {
      return (
        <span className="inline-flex items-center px-3 py-1 text-xs leading-5 font-semibold rounded-full bg-[#fff2e8] text-[#d46b08]">
          {eldersCount} elders
        </span>
      );
    }
    return null;
  };

  const getStatusClasses = (status) => {
    switch (status) {
      case "pending":
        return "bg-[#e6f4ff] text-[#0b6bcb]";
      case "processing":
        return "bg-[#e6f7ff] text-[#08979c]";
      case "approved":
        return "bg-[#f6ffed] text-[#389e0d]";
      case "rejected":
        return "bg-[#fff1f0] text-[#cf1322]";
      case "completed":
        return "bg-[#f9f0ff] text-[#722ed1]";
      default:
        return "";
    }
  };

  const handleStatusChange = (sponsorId, newStatus) => {
    setSponsors((prevSponsors) =>
      prevSponsors.map((sponsor) =>
        sponsor.id === sponsorId ? { ...sponsor, status: newStatus } : sponsor
      )
    );
    alert(`Status updated for sponsor ID ${sponsorId} to ${newStatus}`);
  };

  const handleCardFilterClick = (filterType, value) => {
    setStatusFilter("all");
    setTypeFilter("all");
    setResidencyFilter("all");
    setBeneficiaryTypeFilter("all");
    setSearchInput("");

    if (filterType === "status") {
      setStatusFilter(value);
    } else if (filterType === "type") {
      setTypeFilter(value);
    } else if (filterType === "residency") {
      setResidencyFilter(value);
    }
  };

  const handleNavClick = (path) => {
    navigate(path);
  };

  return (
    <div className="min-h-screen bg-[#f5f7fa] p-6 font-inter text-[#1e293b]">
      <div className="container mx-auto bg-[#ffffff] rounded-xl shadow-[0_5px_15px_rgba(0,0,0,0.08)] p-6 flex flex-col h-[90vh]">
        <div className="flex items-center mb-6 gap-4">
          <Link
            to="/admin_dashboard"
            className="flex items-center justify-center w-12 h-12 bg-[#ffffff] text-[#032990] rounded-lg shadow-[0_4px_8px_rgba(0,0,0,0.1)] transition-all duration-300 border-2 border-[#f0f3ff] hover:bg-[#032990] hover:shadow-[0_6px_12px_rgba(0,0,0,0.15)] hover:-translate-y-0.5"
            onClick={() => handleNavClick("/admin_dashboard")}
          >
            <ChevronLeft className="w-6 h-6 stroke-[#032990] group-hover:stroke-[#ffffff] transition-colors duration-300" />
          </Link>

          <h1 className="text-3xl font-bold text-[#032990]">
            Sponsor Management
          </h1>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <div
            className={`p-4 rounded-lg shadow-[0_3px_8px_rgba(0,0,0,0.05)] border-l-4 border-[#032990] bg-gradient-to-br from-[#f0f3ff] to-[#e6eeff] cursor-pointer transition-transform duration-200 hover:scale-[1.02] ${
              statusFilter === "all" ? "bg-[#e0e8ff]" : ""
            }`}
            onClick={() => handleCardFilterClick("status", "all")}
          >
            <div className="text-3xl font-bold text-[#032990]">
              {totalInactiveSponsors}
            </div>
            <div className="text-sm text-[#64748b]">All Sponsors</div>
          </div>
          <div
            className={`p-4 rounded-lg shadow-[0_3px_8px_rgba(0,0,0,0.05)] border-l-4 border-[#0b6bcb] bg-gradient-to-br from-[#e6f4ff] to-[#cce5ff] cursor-pointer transition-transform duration-200 hover:scale-[1.02] ${
              statusFilter === "pending" ? "bg-[#e0e8ff]" : ""
            }`}
            onClick={() => handleCardFilterClick("status", "pending")}
          >
            <div className="text-3xl font-bold text-[#032990]">
              {pendingSponsors}
            </div>
            <div className="text-sm text-[#64748b]">Pending Review</div>
          </div>
          <div
            className={`p-4 rounded-lg shadow-[0_3px_8px_rgba(0,0,0,0.05)] border-l-4 border-[#08979c] bg-gradient-to-br from-[#e6f7ff] to-[#d1f0ff] cursor-pointer transition-transform duration-200 hover:scale-[1.02] ${
              statusFilter === "processing" ? "bg-[#e0e8ff]" : ""
            }`}
            onClick={() => handleCardFilterClick("status", "processing")}
          >
            <div className="text-3xl font-bold text-[#032990]">
              {processingSponsors}
            </div>
            <div className="text-sm text-[#64748b]">Under Review</div>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div
            className={`p-4 rounded-lg shadow-[0_3px_8px_rgba(0,0,0,0.05)] border-l-4 border-[#0066cc] bg-gradient-to-br from-[#e0f2ff] to-[#cce5ff] cursor-pointer transition-transform duration-200 hover:scale-[1.02] ${
              typeFilter === "private" ? "bg-[#e0e8ff]" : ""
            }`}
            onClick={() => handleCardFilterClick("type", "private")}
          >
            <div className="text-3xl font-bold text-[#032990]">
              {privateSponsors}
            </div>
            <div className="text-sm text-[#64748b]">Private Sponsors</div>
          </div>
          <div
            className={`p-4 rounded-lg shadow-[0_3px_8px_rgba(0,0,0,0.05)] border-l-4 border-[#08979c] bg-gradient-to-br from-[#e6f7ff] to-[#d1f0ff] cursor-pointer transition-transform duration-200 hover:scale-[1.02] ${
              typeFilter === "organization" ? "bg-[#e0e8ff]" : ""
            }`}
            onClick={() => handleCardFilterClick("type", "organization")}
          >
            <div className="text-3xl font-bold text-[#032990]">
              {organizationSponsors}
            </div>
            <div className="text-sm text-[#64748b]">Organizations</div>
          </div>
          <div
            className={`p-4 rounded-lg shadow-[0_3px_8px_rgba(0,0,0,0.05)] border-l-4 border-[#0b6bcb] bg-gradient-to-br from-[#e6f4ff] to-[#cce5ff] cursor-pointer transition-transform duration-200 hover:scale-[1.02] ${
              residencyFilter === "local" ? "bg-[#e0e8ff]" : ""
            }`}
            onClick={() => handleCardFilterClick("residency", "local")}
          >
            <div className="text-3xl font-bold text-[#032990]">
              {localSponsors}
            </div>
            <div className="text-sm text-[#64748b]">Local</div>
          </div>
          <div
            className={`p-4 rounded-lg shadow-[0_3px_8px_rgba(0,0,0,0.05)] border-l-4 border-[#00838f] bg-gradient-to-br from-[#e0f7fa] to-[#b2ebf2] cursor-pointer transition-transform duration-200 hover:scale-[1.02] ${
              residencyFilter === "diaspora" ? "bg-[#e0e8ff]" : ""
            }`}
            onClick={() => handleCardFilterClick("residency", "diaspora")}
          >
            <div className="text-3xl font-bold text-[#032990]">
              {diasporaSponsors}
            </div>
            <div className="text-sm text-[#64748b]">Diaspora</div>
          </div>
        </div>

        <div className="flex flex-wrap gap-4 mb-6 items-center">
          <div className="relative flex-1 min-w-[300px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#64748b]" />
            <input
              type="text"
              id="searchInput"
              className="pl-10 p-3.5 w-full border border-[#cfd8dc] rounded-lg bg-[#ffffff] text-base shadow-[0_2px_5px_rgba(0,0,0,0.05)] focus:outline-none focus:ring-3 focus:ring-[rgba(234,161,8,0.2)] focus:border-[#EAA108] transition-all duration-300"
              placeholder="Search by name or phone number..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
          </div>
          <div className="relative">
            <select
              id="beneficiaryTypeFilter"
              className="p-3.5 rounded-lg border border-[#cfd8dc] bg-[#ffffff] text-base shadow-[0_2px_5px_rgba(0,0,0,0.05)] min-w-[150px] pr-10 appearance-none focus:outline-none focus:border-[#EAA108] focus:ring-3 focus:ring-[rgba(234,161,8,0.2)] transition-all duration-300"
              value={beneficiaryTypeFilter}
              onChange={(e) => setBeneficiaryTypeFilter(e.target.value)}
            >
              <option value="all">All Beneficiary Types</option>
              <option value="children">Children</option>
              <option value="elders">Elders</option>
              <option value="both">Both</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748b] pointer-events-none" />
          </div>
        </div>

        <div className="overflow-x-auto flex-1 border border-[#e2e8f0] rounded-lg shadow-[0_2px_5px_rgba(0,0,0,0.05)]">
          <table className="min-w-full divide-y divide-[#e2e8f0]">
            <thead className="bg-[#f0f3ff] sticky top-0">
              <tr>
                {[
                  "Name",
                  "Age",
                  "Gender",
                  "Type",
                  "Residency",
                  "Phone Number",
                  "Requested Beneficiaries",
                  "Status",
                ].map((header, index) => (
                  <th
                    key={header}
                    className={`px-6 py-4 text-left text-sm font-semibold text-[#032990] uppercase tracking-wider cursor-pointer hover:bg-[#e0e8ff] transition-colors duration-200 ${
                      index === 0
                        ? "rounded-tl-lg"
                        : index === 7
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
              {sponsors.map((sponsor) => (
                <tr
                  key={sponsor.id}
                  className="hover:bg-[#fff7ea] transition-colors duration-200 even:bg-[#f8fafc]"
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-[#1a1a1a]">
                    {sponsor.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-[#1e293b]">
                    {sponsor.age || "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-[#1e293b]">
                    {sponsor.gender || "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span
                      className={`px-2 py-1 inline-block text-xs font-medium rounded-full ${getSponsorTypeClasses(
                        sponsor.type
                      )}`}
                    >
                      {sponsor.type.charAt(0).toUpperCase() +
                        sponsor.type.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span
                      className={`px-2 py-1 inline-block text-xs font-medium rounded-full ${getResidencyClasses(
                        sponsor.residency
                      )}`}
                    >
                      {sponsor.residency.charAt(0).toUpperCase() +
                        sponsor.residency.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-[#1e293b]">
                    {sponsor.phone}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {getBeneficiaryCountDisplay(sponsor.requestedBeneficiaries)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <select
                      className={`p-1.5 rounded-md border border-[#cfd8dc] text-sm bg-[#ffffff] ${getStatusClasses(
                        sponsor.status
                      )} focus:outline-none`}
                      value={sponsor.status}
                      onChange={(e) =>
                        handleStatusChange(sponsor.id, e.target.value)
                      }
                    >
                      <option value="pending">Pending Review</option>
                      <option value="processing">Under Review</option>
                      <option value="approved">Approved</option>
                      <option value="rejected">Rejected</option>
                      <option value="completed">Completed</option>
                    </select>
                    <div className="text-xs text-[#94a3b8] mt-1">
                      Updated by {sponsor.updatedBy} on {sponsor.updatedAt}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SponsorManagement;
