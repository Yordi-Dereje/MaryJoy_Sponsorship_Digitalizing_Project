import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ChevronUp,
  ChevronDown,
  Eye,
} from "lucide-react";

const initialSponsorData = [
  {
    id: 1,
    sponsorId: "15-000",
    name: "Maria Garcia",
    type: "private",
    residency: "diaspora",
    phone: "+1300555076",
    currentBeneficiaries: "2 elders",
    requestedAddition: "1 child",
    status: "pending",
    updatedBy: "Abebe T.",
    updatedAt: "2023-10-22",
  },
  {
    id: 2,
    sponsorId: "14-999",
    name: "Community Care Alliance",
    type: "organization",
    residency: "local",
    phone: "+251922334455",
    currentBeneficiaries: "15 children & 10 elders",
    requestedAddition: "5 children",
    status: "processing",
    updatedBy: "Selam W.",
    updatedAt: "2023-10-21",
  },
  {
    id: 3,
    sponsorId: "13-888",
    name: "Thomas Clark",
    type: "private",
    residency: "local",
    phone: "+251911223344",
    currentBeneficiaries: "1 child",
    requestedAddition: "1 elder",
    status: "approved",
    updatedBy: "Kebede M.",
    updatedAt: "2023-10-20",
  },
  {
    id: 4,
    sponsorId: "12-777",
    name: "Lisa Taylor",
    type: "private",
    residency: "diaspora",
    phone: "+4915123456789",
    currentBeneficiaries: "1 elder",
    requestedAddition: "2 children",
    status: "rejected",
    updatedBy: "Tigist H.",
    updatedAt: "2023-10-19",
  },
  {
    id: 5,
    sponsorId: "11-666",
    name: "Bright Future Corporation",
    type: "organization",
    residency: "local",
    phone: "+251989001122",
    currentBeneficiaries: "8 children & 8 elders",
    requestedAddition: "4 elders",
    status: "pending",
    updatedBy: "Abebe T.",
    updatedAt: "2023-10-22",
  },
  {
    id: 6,
    sponsorId: "10-555",
    name: "David Anderson",
    type: "private",
    residency: "local",
    phone: "+251988990011",
    currentBeneficiaries: "2 children",
    requestedAddition: "1 child",
    status: "processing",
    updatedBy: "Selam W.",
    updatedAt: "2023-10-21",
  },
  {
    id: 7,
    sponsorId: "09-444",
    name: "Jennifer Martinez",
    type: "private",
    residency: "diaspora",
    phone: "+13125550125",
    currentBeneficiaries: "1 elder",
    requestedAddition: "2 elders",
    status: "approved",
    updatedBy: "Kebede M.",
    updatedAt: "2023-10-18",
  },
  {
    id: 8,
    sponsorId: "08-333",
    name: "Hope for Ethiopia NGO",
    type: "organization",
    residency: "local",
    phone: "+251966778899",
    currentBeneficiaries: "25 children & 15 elders",
    requestedAddition: "10 children",
    status: "pending",
    updatedBy: "Tigist H.",
    updatedAt: "2023-10-22",
  },
  {
    id: 9,
    sponsorId: "07-222",
    name: "Robert Wilson",
    type: "private",
    residency: "diaspora",
    phone: "+441234567890",
    currentBeneficiaries: "3 children",
    requestedAddition: "2 elders",
    status: "processing",
    updatedBy: "Abebe T.",
    updatedAt: "2023-10-21",
  },
  {
    id: 10,
    sponsorId: "06-111",
    name: "Emily Davis",
    type: "private",
    residency: "local",
    phone: "+251944556677",
    currentBeneficiaries: "2 elders",
    requestedAddition: "1 child",
    status: "rejected",
    updatedBy: "Selam W.",
    updatedAt: "2023-10-20",
  },
];

const BeneficiaryRequest = () => {
  const navigate = useNavigate();
  const [sponsorData, setSponsorData] = useState(initialSponsorData);
  const [currentSortColumn, setCurrentSortColumn] = useState(0);
  const [currentSortDirection, setCurrentSortDirection] = useState("asc");
  const [currentFilter, setCurrentFilter] = useState("all");
  const [searchInput, setSearchInput] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    filterAndSortTable();
  }, [
    currentFilter,
    searchInput,
    statusFilter,
    currentSortColumn,
    currentSortDirection,
  ]);

  const filterByCard = (filterType) => {
    setCurrentFilter(filterType);
    setStatusFilter("all");
    setSearchInput("");
  };

  const filterAndSortTable = () => {
    let filtered = initialSponsorData.filter((sponsor) => {
      let cardMatch = true;
      if (currentFilter !== "all") {
        if (currentFilter === "local" && sponsor.residency !== "local")
          cardMatch = false;
        if (currentFilter === "diaspora" && sponsor.residency !== "diaspora")
          cardMatch = false;
        if (currentFilter === "private" && sponsor.type !== "private")
          cardMatch = false;
        if (currentFilter === "organization" && sponsor.type !== "organization")
          cardMatch = false;
        if (currentFilter === "pending" && sponsor.status !== "pending")
          cardMatch = false;
        if (currentFilter === "processing" && sponsor.status !== "processing")
          cardMatch = false;
      }

      const textMatch =
        searchInput === "" ||
        sponsor.sponsorId.toLowerCase().includes(searchInput.toLowerCase()) ||
        sponsor.name.toLowerCase().includes(searchInput.toLowerCase()) ||
        sponsor.phone.toLowerCase().includes(searchInput.toLowerCase());

      const statusFilterMatch =
        statusFilter === "all" || sponsor.status === statusFilter;

      return cardMatch && textMatch && statusFilterMatch;
    });

    const sortedData = [...filtered].sort((a, b) => {
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
          aValue = a.type;
          bValue = b.type;
          break;
        case 3:
          aValue = a.residency;
          bValue = b.residency;
          break;
        case 4:
          aValue = a.phone;
          bValue = b.phone;
          break;
        case 5:
          aValue = parseInt(a.currentBeneficiaries.match(/\d+/)?.[0] || 0);
          bValue = parseInt(b.currentBeneficiaries.match(/\d+/)?.[0] || 0);
          break;
        case 6:
          aValue = parseInt(a.requestedAddition.match(/\d+/)?.[0] || 0);
          bValue = parseInt(b.requestedAddition.match(/\d+/)?.[0] || 0);
          break;
        case 7:
          aValue = a.status;
          bValue = b.status;
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
        return currentSortDirection === "asc"
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
    });

    setSponsorData(sortedData);
  };

  const handleSort = (columnIndex) => {
    if (columnIndex === currentSortColumn) {
      setCurrentSortDirection(currentSortDirection === "asc" ? "desc" : "asc");
    } else {
      setCurrentSortColumn(columnIndex);
      setCurrentSortDirection("asc");
    }
  };

  const updateStatus = (sponsorId, newStatus) => {
    setSponsorData((prevData) =>
      prevData.map((sponsor) =>
        sponsor.id === sponsorId ? { ...sponsor, status: newStatus } : sponsor
      )
    );
    alert(`Status updated for sponsor ID ${sponsorId} to ${newStatus}`);
  };

  const viewDetails = (sponsorId) => {
    alert(`Viewing details for sponsor ID: ${sponsorId}`);
  };

  const getStatusClasses = (status) => {
    switch (status) {
      case "pending":
        return "bg-[#e6f7ff] text-[#08979c]";
      case "processing":
        return "bg-[#bae7ff] text-[#096dd9]";
      case "approved":
        return "bg-[#f6ffed] text-[#389e0d]";
      case "rejected":
        return "bg-[#fff1f0] text-[#cf1322]";
      default:
        return "";
    }
  };

  const getTypeClasses = (type) => {
    return type === "private"
      ? "bg-[#e0f2ff] text-[#0066cc]"
      : "bg-[#e6f7ff] text-[#08979c]";
  };

  const getResidencyClasses = (residency) => {
    return residency === "local"
      ? "bg-[#f6ffed] text-[#389e0d]"
      : "bg-[#f9f0ff] text-[#722ed1]";
  };

  const getBeneficiaryCountClasses = (countText) => {
    if (countText.includes("children") && countText.includes("elders")) {
      return "bg-gradient-to-r from-[#f6ffed] to-[#fff2e8] text-[#389e0d]";
    } else if (countText.includes("children")) {
      return countText === "1 child"
        ? "bg-[#f6ffed] text-[#389e0d]"
        : "bg-[#f6ffed] text-[#389e0d]";
    } else if (countText.includes("elders")) {
      return countText === "1 elder"
        ? "bg-[#fff2e8] text-[#d46b08]"
        : "bg-[#fff2e8] text-[#d46b08]";
    }
    return "";
  };

  return (
    <div className="font-inter bg-[#f5f7fa] p-6 text-[#1e293b] min-h-screen">
      <div className="max-w-7xl mx-auto bg-[#ffffff] p-8 rounded-xl shadow-[0_5px_15px_rgba(0,0,0,0.08)] flex flex-col min-h-[90vh]">
        <div className="flex items-center mb-6 gap-4">
          <Link
            to="/admin_dashboard"
            className="flex items-center justify-center w-12 h-12 bg-[#ffffff] text-[#032990] rounded-lg shadow-[0_4px_8px_rgba(0,0,0,0.1)] hover:bg-[#032990] hover:text-white transition-all duration-300 border-2 border-[#f0f3ff] hover:shadow-[0_6px_12px_rgba(0,0,0,0.15)] hover:-translate-y-0.5"
          >
            <ArrowLeft className="w-6 h-6 stroke-[#032990] hover:stroke-[#ffffff] transition-colors duration-300" />
          </Link>
          <h1 className="text-[#032990] font-bold text-3xl m-0">
            Sponsor Management - Beneficiary Requests
          </h1>
          
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-7 gap-4 mb-6">
          <div
            className={`p-4 rounded-lg shadow-[0_3px_8px_rgba(0,0,0,0.05)] cursor-pointer transition-transform duration-200 border-l-4 border-[#032990] bg-gradient-to-br from-[#f0f3ff] to-[#e6eeff] hover:scale-[1.02] hover:shadow-[0_5px_15px_rgba(0,0,0,0.1)] ${currentFilter === "all" ? "bg-gradient-to-br from-[#e6f4ff] to-[#d4e8ff] shadow-[0_4px_10px_rgba(3,41,144,0.15)]" : ""}`}
            id="allSponsorsCard"
            onClick={() => filterByCard("all")}
          >
            <div className="text-2xl font-bold text-[#032990]">2,200</div>
            <div className="text-sm text-[#64748b]">Active Sponsors</div>
          </div>
          <div
            className={`p-4 rounded-lg shadow-[0_3px_8px_rgba(0,0,0,0.05)] cursor-pointer transition-transform duration-200 border-l-4 border-[#08979c] bg-gradient-to-br from-[#e6f7ff] to-[#d1f0ff] hover:scale-[1.02] hover:shadow-[0_5px_15px_rgba(0,0,0,0.1)] ${currentFilter === "pending" ? "bg-gradient-to-br from-[#e6f4ff] to-[#d4e8ff] shadow-[0_4px_10px_rgba(3,41,144,0.15)]" : ""}`}
            id="pendingCard"
            onClick={() => filterByCard("pending")}
          >
            <div className="text-2xl font-bold text-[#032990]">142</div>
            <div className="text-sm text-[#64748b]">Pending Review</div>
          </div>
          <div
            className={`p-4 rounded-lg shadow-[0_3px_8px_rgba(0,0,0,0.05)] cursor-pointer transition-transform duration-200 border-l-4 border-[#096dd9] bg-gradient-to-br from-[#bae7ff] to-[#91d5ff] hover:scale-[1.02] hover:shadow-[0_5px_15px_rgba(0,0,0,0.1)] ${currentFilter === "processing" ? "bg-gradient-to-br from-[#e6f4ff] to-[#d4e8ff] shadow-[0_4px_10px_rgba(3,41,144,0.15)]" : ""}`}
            id="reviewCard"
            onClick={() => filterByCard("processing")}
          >
            <div className="text-2xl font-bold text-[#032990]">89</div>
            <div className="text-sm text-[#64748b]">Under Review</div>
          </div>
          <div
            className={`p-4 rounded-lg shadow-[0_3px_8px_rgba(0,0,0,0.05)] cursor-pointer transition-transform duration-200 border-l-4 border-[#389e0d] bg-gradient-to-br from-[#f6ffed] to-[#edf9e3] hover:scale-[1.02] hover:shadow-[0_5px_15px_rgba(0,0,0,0.1)] ${currentFilter === "local" ? "bg-gradient-to-br from-[#e6f4ff] to-[#d4e8ff] shadow-[0_4px_10px_rgba(3,41,144,0.15)]" : ""}`}
            id="localCard"
            onClick={() => filterByCard("local")}
          >
            <div className="text-2xl font-bold text-[#032990]">1,800</div>
            <div className="text-sm text-[#64748b]">Local</div>
          </div>
          <div
            className={`p-4 rounded-lg shadow-[0_3px_8px_rgba(0,0,0,0.05)] cursor-pointer transition-transform duration-200 border-l-4 border-[#722ed1] bg-gradient-to-br from-[#f9f0ff] to-[#efdbff] hover:scale-[1.02] hover:shadow-[0_5px_15px_rgba(0,0,0,0.1)] ${currentFilter === "diaspora" ? "bg-gradient-to-br from-[#e6f4ff] to-[#d4e8ff] shadow-[0_4px_10px_rgba(3,41,144,0.15)]" : ""}`}
            id="diasporaCard"
            onClick={() => filterByCard("diaspora")}
          >
            <div className="text-2xl font-bold text-[#032990]">400</div>
            <div className="text-sm text-[#64748b]">Diaspora</div>
          </div>
          <div
            className={`p-4 rounded-lg shadow-[0_3px_8px_rgba(0,0,0,0.05)] cursor-pointer transition-transform duration-200 border-l-4 border-[#0066cc] bg-gradient-to-br from-[#e0f2ff] to-[#cce5ff] hover:scale-[1.02] hover:shadow-[0_5px_15px_rgba(0,0,0,0.1)] ${currentFilter === "private" ? "bg-gradient-to-br from-[#e6f4ff] to-[#d4e8ff] shadow-[0_4px_10px_rgba(3,41,144,0.15)]" : ""}`}
            id="privateCard"
            onClick={() => filterByCard("private")}
          >
            <div className="text-2xl font-bold text-[#032990]">1,650</div>
            <div className="text-sm text-[#64748b]">Private</div>
          </div>
          <div
            className={`p-4 rounded-lg shadow-[0_3px_8px_rgba(0,0,0,0.05)] cursor-pointer transition-transform duration-200 border-l-4 border-[#08979c] bg-gradient-to-br from-[#e6f7ff] to-[#d1f0ff] hover:scale-[1.02] hover:shadow-[0_5px_15px_rgba(0,0,0,0.1)] ${currentFilter === "organization" ? "bg-gradient-to-br from-[#e6f4ff] to-[#d4e8ff] shadow-[0_4px_10px_rgba(3,41,144,0.15)]" : ""}`}
            id="organizationCard"
            onClick={() => filterByCard("organization")}
          >
            <div className="text-2xl font-bold text-[#032990]">550</div>
            <div className="text-sm text-[#64748b]">Organization</div>
          </div>
        </div>

        <div className="flex flex-wrap gap-4 mb-6 items-center">
          <input
            type="text"
            id="searchInput"
            className="flex-1 min-w-[300px] p-3.5 rounded-lg border border-[#cfd8dc] text-base bg-[#ffffff] transition-all duration-300 shadow-[0_2px_5px_rgba(0,0,0,0.05)] focus:outline-none focus:border-[#EAA108] focus:ring-3 focus:ring-[rgba(234,161,8,0.2)]"
            placeholder="Search by sponsor ID, name, or phone number..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
          <div className="relative">
            <select
              id="statusFilter"
              className="p-3.5 rounded-lg border border-[#cfd8dc] text-base bg-[#ffffff] transition-all duration-300 shadow-[0_2px_5px_rgba(0,0,0,0.05)] min-w-[150px] appearance-none pr-10 focus:outline-none focus:border-[#EAA108] focus:ring-3 focus:ring-[rgba(234,161,8,0.2)]"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending Review</option>
              <option value="processing">Under Review</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748b] pointer-events-none" />
          </div>
        </div>

        <div className="overflow-y-auto flex-1 rounded-lg border border-[#e2e8f0]">
          <table className="w-full border-separate border-spacing-0">
            <thead>
              <tr>
                {[
                  "Sponsor ID",
                  "Name",
                  "Type",
                  "Residency",
                  "Phone Number",
                  "Current Beneficiaries",
                  "Requested Addition",
                  "Status",
                  "Actions",
                ].map((header, index) => (
                  <th
                    key={header}
                    className={`bg-[#f0f3ff] text-[#032990] font-semibold p-4 text-left text-sm sticky top-0 cursor-pointer select-none transition-colors duration-200 hover:bg-[#e0e8ff] ${
                      index === 0
                        ? "rounded-tl-lg"
                        : index === 8
                        ? "rounded-tr-lg"
                        : ""
                    } ${currentSortColumn === index ? (currentSortDirection === "asc" ? "sort-asc" : "sort-desc") : ""}`}
                    onClick={() => handleSort(index)}
                  >
                    {header}{" "}
                    {currentSortColumn === index &&
                      (currentSortDirection === "asc" ? (
                        <ChevronUp className="inline w-3 h-3 ml-1" />
                      ) : (
                        <ChevronDown className="inline w-3 h-3 ml-1" />
                      ))}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sponsorData.map((sponsor) => (
                <tr
                  key={sponsor.id}
                  className="bg-[#ffffff] transition-colors duration-200 even:bg-[#f8fafc] hover:bg-[#fff7ea]"
                >
                  <td className="p-4 text-left text-sm align-middle border-b border-[#e2e8f0] font-semibold text-[#032990]">
                    {sponsor.sponsorId}
                  </td>
                  <td className="p-4 text-left text-sm align-middle border-b border-[#e2e8f0] font-semibold text-[#1a1a1a]">
                    {sponsor.name}
                  </td>
                  <td className="p-4 text-left text-sm align-middle border-b border-[#e2e8f0]">
                    <span
                      className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${getTypeClasses(
                        sponsor.type
                      )}`}
                    >
                      {sponsor.type === "private" ? "Private" : "Organization"}
                    </span>
                  </td>
                  <td className="p-4 text-left text-sm align-middle border-b border-[#e2e8f0]">
                    <span
                      className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${getResidencyClasses(
                        sponsor.residency
                      )}`}
                    >
                      {sponsor.residency === "local" ? "Local" : "Diaspora"}
                    </span>
                  </td>
                  <td className="p-4 text-left text-sm align-middle border-b border-[#e2e8f0] text-[#1e293b]">
                    {sponsor.phone}
                  </td>
                  <td className="p-4 text-left text-sm align-middle border-b border-[#e2e8f0]">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium gap-1 ${getBeneficiaryCountClasses(
                        sponsor.currentBeneficiaries
                      )}`}
                    >
                      {sponsor.currentBeneficiaries.includes("children") &&
                      sponsor.currentBeneficiaries.includes("elders") ? (
                        <>
                          {sponsor.currentBeneficiaries.split("&")[0].trim()}
                          <span className="text-[#d46b08]">&</span>
                          {sponsor.currentBeneficiaries.split("&")[1].trim()}
                        </>
                      ) : (
                        sponsor.currentBeneficiaries
                      )}
                    </span>
                  </td>
                  <td className="p-4 text-left text-sm align-middle border-b border-[#e2e8f0]">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium gap-1 ${getBeneficiaryCountClasses(
                        sponsor.requestedAddition
                      )}`}
                    >
                      {sponsor.requestedAddition.includes("children") &&
                      sponsor.requestedAddition.includes("elders") ? (
                        <>
                          {sponsor.requestedAddition.split("&")[0].trim()}
                          <span className="text-[#d46b08]">&</span>
                          {sponsor.requestedAddition.split("&")[1].trim()}
                        </>
                      ) : (
                        sponsor.requestedAddition
                      )}
                    </span>
                  </td>
                  <td className="p-4 text-left text-sm align-middle border-b border-[#e2e8f0]">
                    <select
                      className={`px-2.5 py-1.5 rounded-md border border-[#cfd8dc] text-sm bg-[#ffffff] ${getStatusClasses(
                        sponsor.status
                      )}`}
                      value={sponsor.status}
                      onChange={(e) => updateStatus(sponsor.id, e.target.value)}
                    >
                      <option value="pending">Pending Review</option>
                      <option value="processing">Under Review</option>
                      <option value="approved">Approved</option>
                      <option value="rejected">Rejected</option>
                    </select>
                    <div className="text-xs text-[#94a3b8] mt-1">
                      Updated by {sponsor.updatedBy} on {sponsor.updatedAt}
                    </div>
                  </td>
                  <td className="p-4 text-left text-sm align-middle border-b border-[#e2e8f0]">
                    <button
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-md border-none font-medium cursor-pointer transition-all duration-300 text-sm bg-[#f0f3ff] text-[#032990] hover:bg-[#e0e8ff]"
                      onClick={() => viewDetails(sponsor.id)}
                    >
                      <Eye className="w-4 h-4" />
                      View
                    </button>
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

export default BeneficiaryRequest;
