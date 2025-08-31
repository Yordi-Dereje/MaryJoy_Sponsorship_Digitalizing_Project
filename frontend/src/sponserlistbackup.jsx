import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Search,
  ChevronUp,
  ChevronDown,
  User,
  Users,
  Home,
  Globe,
} from "lucide-react";

const initialSponsorData = [
  {
    id: "01-240",
    name: "John Smith",
    type: "Private",
    residency: "Diaspora",
    phone: "+14155550123",
    beneficiaryCount: { children: 2, elders: 0 },
  },
  {
    id: "02-185",
    name: "Sarah Johnson",
    type: "Private",
    residency: "Local",
    phone: "+251987654321",
    beneficiaryCount: { children: 0, elders: 1 },
  },
  {
    id: "03-567",
    name: "Ethio Telecom",
    type: "Organization",
    residency: "Local",
    phone: "+251911223344",
    beneficiaryCount: { children: 5, elders: 3 },
  },
  {
    id: "04-321",
    name: "Michael Brown",
    type: "Private",
    residency: "Diaspora",
    phone: "+16135550124",
    beneficiaryCount: { children: 1, elders: 0 },
  },
  {
    id: "05-789",
    name: "Green Development Foundation",
    type: "Organization",
    residency: "Local",
    phone: "+251933445566",
    beneficiaryCount: { children: 12, elders: 8 },
  },
  {
    id: "06-111",
    name: "Emily Davis",
    type: "Private",
    residency: "Local",
    phone: "+251944556677",
    beneficiaryCount: { children: 0, elders: 2 },
  },
  {
    id: "07-222",
    name: "Robert Wilson",
    type: "Private",
    residency: "Diaspora",
    phone: "+441234567890",
    beneficiaryCount: { children: 3, elders: 0 },
  },
  {
    id: "08-333",
    name: "Hope for Ethiopia NGO",
    type: "Organization",
    residency: "Local",
    phone: "+251966778899",
    beneficiaryCount: { children: 25, elders: 15 },
  },
  {
    id: "09-444",
    name: "Jennifer Martinez",
    type: "Private",
    residency: "Diaspora",
    phone: "+13125550125",
    beneficiaryCount: { children: 0, elders: 1 },
  },
  {
    id: "10-555",
    name: "David Anderson",
    type: "Private",
    residency: "Local",
    phone: "+251988990011",
    beneficiaryCount: { children: 2, elders: 0 },
  },
  {
    id: "11-666",
    name: "Bright Future Corporation",
    type: "Organization",
    residency: "Local",
    phone: "+251999001122",
    beneficiaryCount: { children: 8, elders: 6 },
  },
  {
    id: "12-777",
    name: "Lisa Taylor",
    type: "Private",
    residency: "Diaspora",
    phone: "+4915123456789",
    beneficiaryCount: { children: 0, elders: 1 },
  },
  {
    id: "13-888",
    name: "Thomas Clark",
    type: "Private",
    residency: "Local",
    phone: "+251911223344",
    beneficiaryCount: { children: 1, elders: 0 },
  },
  {
    id: "14-999",
    name: "Community Care Alliance",
    type: "Organization",
    residency: "Local",
    phone: "+251922334455",
    beneficiaryCount: { children: 15, elders: 10 },
  },
  {
    id: "15-000",
    name: "Maria Garcia",
    type: "Private",
    residency: "Diaspora",
    phone: "+13105550126",
    beneficiaryCount: { children: 0, elders: 2 },
  },
];

const SponsorList = () => {
  const navigate = useNavigate();
  const [sponsors, setSponsors] = useState(initialSponsorData);
  const [searchInput, setSearchInput] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [residencyFilter, setResidencyFilter] = useState("all");
  const [beneficiaryTypeFilter, setBeneficiaryTypeFilter] = useState("all");
  const [currentSortColumn, setCurrentSortColumn] = useState(0);
  const [currentSortDirection, setCurrentSortDirection] = useState("asc");
  const [activeCard, setActiveCard] = useState("all");

  const totalActiveSponsors = sponsors.length;
  const privateSponsors = sponsors.filter((s) => s.type === "Private").length;
  const organizationSponsors = sponsors.filter(
    (s) => s.type === "Organization"
  ).length;
  const localSponsors = sponsors.filter((s) => s.residency === "Local").length;
  const diasporaSponsors = sponsors.filter(
    (s) => s.residency === "Diaspora"
  ).length;

  useEffect(() => {
    filterAndSortTable();
  }, [
    searchInput,
    typeFilter,
    residencyFilter,
    beneficiaryTypeFilter,
    currentSortColumn,
    currentSortDirection,
  ]);

  const filterAndSortTable = () => {
    let filteredData = initialSponsorData.filter((sponsor) => {
      const searchTermLower = searchInput.toLowerCase();
      const matchesSearch =
        sponsor.id.toLowerCase().includes(searchTermLower) ||
        sponsor.name.toLowerCase().includes(searchTermLower) ||
        sponsor.phone.toLowerCase().includes(searchTermLower);

      const matchesType = typeFilter === "all" || sponsor.type === typeFilter;
      const matchesResidency =
        residencyFilter === "all" || sponsor.residency === residencyFilter;

      const matchesBeneficiaryType = () => {
        if (beneficiaryTypeFilter === "all") return true;
        if (beneficiaryTypeFilter === "child")
          return (
            sponsor.beneficiaryCount.children > 0 &&
            sponsor.beneficiaryCount.elders === 0
          );
        if (beneficiaryTypeFilter === "elder")
          return (
            sponsor.beneficiaryCount.elders > 0 &&
            sponsor.beneficiaryCount.children === 0
          );
        if (beneficiaryTypeFilter === "both")
          return (
            sponsor.beneficiaryCount.children > 0 &&
            sponsor.beneficiaryCount.elders > 0
          );
        return true; // Should not reach here
      };

      return (
        matchesSearch &&
        matchesType &&
        matchesResidency &&
        matchesBeneficiaryType()
      );
    });

    const sortedData = [...filteredData].sort((a, b) => {
      let aValue, bValue;

      switch (currentSortColumn) {
        case 0: // Sponsor ID
          aValue = a.id;
          bValue = b.id;
          break;
        case 1: // Name
          aValue = a.name;
          bValue = b.name;
          break;
        case 2: // Type
          aValue = a.type;
          bValue = b.type;
          break;
        case 3: // Residency
          aValue = a.residency;
          bValue = b.residency;
          break;
        case 4: // Phone Number
          aValue = a.phone;
          bValue = b.phone;
          break;
        case 5: // Beneficiary Count (sum of children and elders)
          aValue = a.beneficiaryCount.children + a.beneficiaryCount.elders;
          bValue = b.beneficiaryCount.children + b.beneficiaryCount.elders;
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
    return type === "Private"
      ? "bg-mj-type-private-bg text-mj-type-private-text"
      : "bg-mj-type-organization-bg text-mj-type-organization-text";
  };

  const getResidencyClasses = (residency) => {
    return residency === "Local"
      ? "bg-mj-residency-local-bg text-mj-residency-local-text"
      : "bg-mj-residency-diaspora-bg text-mj-residency-diaspora-text";
  };

  const getBeneficiaryCountClasses = (children, elders) => {
    if (children > 0 && elders > 0)
      return "bg-mj-count-both-bg text-mj-count-both-text";
    if (children > 0)
      return "bg-mj-count-children-bg text-mj-count-children-text";
    if (elders > 0) return "bg-mj-count-elders-bg text-mj-count-elders-text";
    return "";
  };

  const handleCardFilterClick = (filterType, value) => {
    setActiveCard(value);
    if (filterType === "type") {
      setTypeFilter(value);
      setResidencyFilter("all");
      setBeneficiaryTypeFilter("all");
    } else if (filterType === "residency") {
      setResidencyFilter(value);
      setTypeFilter("all");
      setBeneficiaryTypeFilter("all");
    }
    setSearchInput("");
    document.getElementById("beneficiaryFilter").value = "all";
  };

  return (
    <div className="min-h-screen bg-mj-gray-bg p-4 sm:p-6 lg:p-8 font-inter text-mj-text-dark">
      <div className="container mx-auto bg-white rounded-xl shadow-lg p-4 sm:p-6 lg:p-8 flex flex-col h-[90vh]">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <h1 className="text-3xl font-bold text-mj-blue">Sponsor List</h1>
          <Link
            to="/admin_dashboard"
            className="flex items-center justify-center w-12 h-12 bg-white text-mj-blue rounded-lg shadow-md hover:bg-mj-blue hover:text-white transition-all duration-300 group border-2 border-mj-light-blue"
          >
            <ArrowLeft className="w-6 h-6 stroke-mj-blue group-hover:stroke-white transition-colors duration-300" />
          </Link>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          <div
            className={`p-4 rounded-lg shadow-sm border-l-4 border-mj-blue bg-mj-light-blue cursor-pointer transition-transform duration-200 hover:scale-[1.02] ${
              activeCard === "all" ? "!bg-mj-blue-100" : ""
            }`}
            onClick={() => handleCardFilterClick("all", "all")}
          >
            <div className="text-3xl font-bold text-mj-blue">
              {totalActiveSponsors}
            </div>
            <div className="text-sm text-mj-text-gray">Active Sponsors</div>
          </div>
          <div
            className={`p-4 rounded-lg shadow-sm border-l-4 border-mj-type-private-text bg-mj-type-private-bg cursor-pointer transition-transform duration-200 hover:scale-[1.02] ${
              activeCard === "Private" ? "!bg-mj-type-private-bg" : ""
            }`}
            onClick={() => handleCardFilterClick("type", "Private")}
          >
            <div className="text-3xl font-bold text-mj-type-private-text">
              {privateSponsors}
            </div>
            <div className="text-sm text-mj-text-gray">Private Sponsors</div>
          </div>
          <div
            className={`p-4 rounded-lg shadow-sm border-l-4 border-mj-type-organization-text bg-mj-type-organization-bg cursor-pointer transition-transform duration-200 hover:scale-[1.02] ${
              activeCard === "Organization" ? "!bg-mj-type-organization-bg" : ""
            }`}
            onClick={() => handleCardFilterClick("type", "Organization")}
          >
            <div className="text-3xl font-bold text-mj-type-organization-text">
              {organizationSponsors}
            </div>
            <div className="text-sm text-mj-text-gray">Organizations</div>
          </div>
          <div
            className={`p-4 rounded-lg shadow-sm border-l-4 border-mj-residency-local-text bg-mj-residency-local-bg cursor-pointer transition-transform duration-200 hover:scale-[1.02] ${
              activeCard === "Local" ? "!bg-mj-residency-local-bg" : ""
            }`}
            onClick={() => handleCardFilterClick("residency", "Local")}
          >
            <div className="text-3xl font-bold text-mj-residency-local-text">
              {localSponsors}
            </div>
            <div className="text-sm text-mj-text-gray">Local</div>
          </div>
          <div
            className={`p-4 rounded-lg shadow-sm border-l-4 border-mj-residency-diaspora-text bg-mj-residency-diaspora-bg cursor-pointer transition-transform duration-200 hover:scale-[1.02] ${
              activeCard === "Diaspora" ? "!bg-mj-residency-diaspora-bg" : ""
            }`}
            onClick={() => handleCardFilterClick("residency", "Diaspora")}
          >
            <div className="text-3xl font-bold text-mj-residency-diaspora-text">
              {diasporaSponsors}
            </div>
            <div className="text-sm text-mj-text-gray">Diaspora</div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-wrap gap-4 mb-6 items-center">
          <div className="relative flex-1 min-w-[300px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-mj-text-gray" />
            <input
              type="text"
              id="searchInput"
              className="pl-10 p-3 w-full border border-mj-border rounded-lg focus:outline-none focus:ring-2 focus:ring-mj-orange focus:border-transparent transition-all duration-200 shadow-sm"
              placeholder="Search by sponsor ID, name, or phone number..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
          </div>
          <div className="relative">
            <select
              id="beneficiaryFilter"
              className="p-3.5 rounded-lg border border-mj-border text-base bg-white transition-all duration-300 shadow-sm min-w-[180px] appearance-none pr-10 focus:outline-none focus:border-mj-orange focus:ring-3 focus:ring-mj-orange/20"
              value={beneficiaryTypeFilter}
              onChange={(e) => setBeneficiaryTypeFilter(e.target.value)}
            >
              <option value="all">All Beneficiaries</option>
              <option value="child">Children Only</option>
              <option value="elder">Elders Only</option>
              <option value="both">Both Children & Elders</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-mj-text-gray pointer-events-none" />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto flex-1 border border-mj-border rounded-lg shadow-sm">
          <table className="min-w-full divide-y divide-mj-border">
            <thead className="bg-mj-light-blue sticky top-0">
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
                    className="px-6 py-3 text-left text-xs font-medium text-mj-blue uppercase tracking-wider cursor-pointer hover:bg-mj-blue-100 transition-colors duration-200"
                    onClick={() => handleSort(index)}
                  >
                    {header}
                    {getSortIndicator(index)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-mj-border">
              {sponsors.map((sponsor) => (
                <tr
                  key={sponsor.id}
                  className="hover:bg-mj-table-hover-bg transition-colors duration-200 cursor-pointer even:bg-mj-table-even-bg"
                  onClick={() => alert(`Showing details for: ${sponsor.name}`)} // Replace with actual navigation to detail page
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-mj-blue">
                    {sponsor.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-mj-text-dark">
                    {sponsor.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span
                      className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getSponsorTypeClasses(
                        sponsor.type
                      )}`}
                    >
                      {sponsor.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span
                      className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getResidencyClasses(
                        sponsor.residency
                      )}`}
                    >
                      {sponsor.residency}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-mj-text-dark-gray">
                    {sponsor.phone}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span
                      className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getBeneficiaryCountClasses(
                        sponsor.beneficiaryCount.children,
                        sponsor.beneficiaryCount.elders
                      )}`}
                    >
                      {sponsor.beneficiaryCount.children > 0 && (
                        <span className="text-mj-count-children-text">
                          {`${sponsor.beneficiaryCount.children} children`}
                        </span>
                      )}
                      {sponsor.beneficiaryCount.children > 0 &&
                        sponsor.beneficiaryCount.elders > 0 &&
                        " & "}
                      {sponsor.beneficiaryCount.elders > 0 && (
                        <span className="text-mj-count-elders-text">
                          {`${sponsor.beneficiaryCount.elders} elders`}
                        </span>
                      )}
                    </span>
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

export default SponsorList;
