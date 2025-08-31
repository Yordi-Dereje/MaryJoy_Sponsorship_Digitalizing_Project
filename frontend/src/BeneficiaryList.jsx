import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Search,
  ChevronUp,
  ChevronDown,
  FileText,
  Download,
  Plus,
} from "lucide-react";

const initialBeneficiaryData = [
  {
    id: 1,
    name: "Abel Tesfaye",
    guardian: "Tesfaye Alemayehu",
    age: 8,
    gender: "male",
    phone: "+251912345678",
    status: "active",
    type: "child",
    reason: "",
    document: "",
  },
  {
    id: 2,
    name: "Michael Aman",
    guardian: "Tesfaye Alemayehu",
    age: 9,
    gender: "male",
    phone: "+251900123456",
    status: "active",
    type: "child",
    reason: "",
    document: "",
  },
  {
    id: 3,
    name: "Sara Mulu",
    guardian: "Mulu Worku",
    age: 7,
    gender: "female",
    phone: "+251987654321",
    status: "active",
    type: "child",
    reason: "",
    document: "",
  },
  {
    id: 4,
    name: "Lily Kebede",
    guardian: "Kebede Solomon",
    age: 10,
    gender: "female",
    phone: "+251911223344",
    status: "unassigned",
    type: "child",
    reason: "New application",
    document: "",
  },
  {
    id: 5,
    name: "Dawit Hanna",
    guardian: "Hanna Girma",
    age: 11,
    gender: "male",
    phone: "+251922334455",
    status: "unassigned",
    type: "child",
    reason: "Recently registered",
    document: "",
  },
  {
    id: 6,
    name: "Eyerus Hanna",
    guardian: "Hanna Girma",
    age: 9,
    gender: "female",
    phone: "+251922334455",
    status: "needs-reassigning",
    type: "child",
    reason: "Sponsor discontinued support",
    document: "termination_letter_6.pdf",
  },
  {
    id: 7,
    name: "Bereket Tadesse",
    guardian: "Tadesse Bekele",
    age: 8,
    gender: "male",
    phone: "+251933445566",
    status: "unassigned",
    type: "child",
    reason: "New application",
    document: "",
  },
  {
    id: 8,
    name: "Meskel Tadesse",
    guardian: "Tadesse Bekele",
    age: 10,
    gender: "male",
    phone: "+251933445566",
    status: "terminated",
    type: "child",
    reason: "Family relocation",
    document: "relocation_docs_8.pdf",
  },
  {
    id: 9,
    name: "Selam Tadesse",
    guardian: "Tadesse Bekele",
    age: 18,
    gender: "female",
    phone: "+251933445566",
    status: "graduated",
    type: "child",
    reason: "Aged out of program",
    document: "graduation_cert_9.pdf",
  },
  {
    id: 10,
    name: "Tigist Abebe",
    guardian: "Abebe Fikadu",
    age: 19,
    gender: "female",
    phone: "+251944556677",
    status: "graduated",
    type: "child",
    reason: "Economic stability achieved",
    document: "completion_docs_10.pdf",
  },
  {
    id: 11,
    name: "Yonas Zewdu",
    guardian: "Zewdu Alemayehu",
    age: 9,
    gender: "male",
    phone: "+251955667788",
    status: "active",
    type: "child",
    reason: "",
    document: "",
  },
  {
    id: 12,
    name: "Marta Zewdu",
    guardian: "Zewdu Alemayehu",
    age: 7,
    gender: "female",
    phone: "+251955667788",
    status: "active",
    type: "child",
    reason: "",
    document: "",
  },
  {
    id: 13,
    name: "Samuel Zewdu",
    guardian: "Zewdu Alemayehu",
    age: 11,
    gender: "male",
    phone: "+251955667788",
    status: "active",
    type: "child",
    reason: "",
    document: "",
  },
  {
    id: 14,
    name: "Helen Meskel",
    guardian: "Meskel Hailu",
    age: 10,
    gender: "female",
    phone: "+251966778899",
    status: "terminated",
    type: "child",
    reason: "Legal and ethical issues",
    document: "transfer_docs_14.pdf",
  },
  {
    id: 15,
    name: "Solomon Meskel",
    guardian: "Meskel Hailu",
    age: 8,
    gender: "male",
    phone: "+251966778899",
    status: "active",
    type: "child",
    reason: "",
    document: "",
  },
  {
    id: 16,
    name: "Biruk Selamawit",
    guardian: "Selamawit Teshome",
    age: 9,
    gender: "male",
    phone: "+251977889900",
    status: "active",
    type: "child",
    reason: "",
    document: "",
  },
  {
    id: 17,
    name: "Rahel Girma",
    guardian: "Girma Lemma",
    age: 18,
    gender: "female",
    phone: "+251988990011",
    status: "graduated",
    type: "child",
    reason: "Completed education support",
    document: "graduation_docs_17.pdf",
  },
  {
    id: 18,
    name: "Tewodros Girma",
    guardian: "Girma Lemma",
    age: 11,
    gender: "male",
    phone: "+251988990011",
    status: "active",
    type: "child",
    reason: "",
    document: "",
  },
  {
    id: 19,
    name: "Kaleb Girma",
    guardian: "Girma Lemma",
    age: 9,
    gender: "male",
    phone: "+251988990011",
    status: "active",
    type: "child",
    reason: "",
    document: "",
  },
  {
    id: 20,
    name: "Mihret Girma",
    guardian: "Girma Lemma",
    age: 7,
    gender: "female",
    phone: "+251988990011",
    status: "active",
    type: "child",
    reason: "",
    document: "",
  },
  {
    id: 21,
    name: "Alemayehu Kebede",
    guardian: "",
    age: 72,
    gender: "male",
    phone: "+251911999888",
    status: "active",
    type: "elderly",
    reason: "",
    document: "",
  },
  {
    id: 22,
    name: "Worknesh Demisse",
    guardian: "",
    age: 68,
    gender: "female",
    phone: "+251922888777",
    status: "active",
    type: "elderly",
    reason: "",
    document: "",
  },
  {
    id: 23,
    name: "Getachew Wolde",
    guardian: "",
    age: 75,
    gender: "male",
    phone: "+251933777666",
    status: "terminated",
    type: "elderly",
    reason: "Deceased",
    document: "death_certificate_23.pdf",
  },
  {
    id: 24,
    name: "Yeshi Mekonnen",
    guardian: "",
    age: 70,
    gender: "female",
    phone: "+251944666555",
    status: "unassigned",
    type: "elderly",
    reason: "Awaiting sponsor",
    document: "",
  },
  {
    id: 25,
    name: "Mulugeta Assefa",
    guardian: "Assefa Teshome",
    age: 17,
    gender: "male",
    phone: "+251955555555",
    status: "graduated",
    type: "child",
    reason: "Requested graduation",
    document: "request_docs_25.pdf",
  },
  {
    id: 26,
    name: "Tsehay Abebe",
    guardian: "",
    age: 71,
    gender: "female",
    phone: "+251966666666",
    status: "terminated",
    type: "elderly",
    reason: "Deceased",
    document: "death_certificate_26.pdf",
  },
  {
    id: 27,
    name: "Daniel Hailu",
    guardian: "Hailu Girma",
    age: 16,
    gender: "male",
    phone: "+251977777777",
    status: "needs-reassigning",
    type: "child",
    reason: "Sponsor financial issues",
    document: "financial_docs_27.pdf",
  },
  {
    id: 28,
    name: "Eden Solomon",
    guardian: "Solomon Tekle",
    age: 18,
    gender: "female",
    phone: "+251988888888",
    status: "graduated",
    type: "child",
    reason: "Successfully employed",
    document: "employment_docs_28.pdf",
  },
];

const terminatedReasons = [
  "Deceased",
  "Family relocation",
  "Legal and ethical issues",
];
const graduatedReasons = [
  "Aged out of program",
  "Economic stability achieved",
  "Completed education support",
  "Requested graduation",
  "Successfully employed",
];
const reassigningReasons = [
  "Sponsor discontinued support",
  "Sponsor financial issues",
];
const unassignedReasons = [
  "New application",
  "Recently registered",
  "Awaiting sponsor",
];

const sponsorData = [
  {
    id: 1,
    name: "John Smith",
    company: "ABC Corporation",
    email: "john@example.com",
  },
  {
    id: 2,
    name: "Sarah Johnson",
    company: "XYZ Foundation",
    email: "sarah@example.com",
  },
  {
    id: 3,
    name: "Michael Brown",
    company: "Helping Hands",
    email: "michael@example.com",
  },
  {
    id: 4,
    name: "Emily Davis",
    company: "Care Foundation",
    email: "emily@example.com",
  },
  {
    id: 5,
    name: "Robert Wilson",
    company: "Hope International",
    email: "robert@example.com",
  },
];

const BeneficiaryList = () => {
  const navigate = useNavigate();
  const [beneficiaries, setBeneficiaries] = useState(initialBeneficiaryData);
  const [filteredBeneficiaries, setFilteredBeneficiaries] = useState([]);
  const [searchInput, setSearchInput] = useState("");
  const [reasonFilter, setReasonFilter] = useState("all");
  const [currentSortColumn, setCurrentSortColumn] = useState(0);
  const [currentSortDirection, setCurrentSortDirection] = useState("asc");
  const [currentView, setCurrentView] = useState("all");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAddReasonModalOpen, setIsAddReasonModalOpen] = useState(false);
  const [selectedSponsor, setSelectedSponsor] = useState(null);
  const [beneficiaryForm, setBeneficiaryForm] = useState({
    name: "",
    guardian: "",
    age: "",
    gender: "",
    phone: "",
    type: "",
    status: "active",
    reason: "",
    document: null,
  });
  const [newReasonInput, setNewReasonInput] = useState("");

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const view = urlParams.get("view");
    if (view) {
      setCurrentView(view);
    }
    filterAndSortTable();
  }, [
    searchInput,
    reasonFilter,
    currentView,
    currentSortColumn,
    currentSortDirection,
    beneficiaries,
  ]);

  const filterAndSortTable = () => {
    let data = [...beneficiaries];

    if (currentView !== "all") {
      if (currentView === "waiting") {
        data = data.filter(
          (item) =>
            item.status === "unassigned" || item.status === "needs-reassigning"
        );
      } else {
        data = data.filter((item) => item.status === currentView);
      }
    }

    const searchTermLower = searchInput.toLowerCase();
    data = data.filter(
      (item) =>
        item.name.toLowerCase().includes(searchTermLower) ||
        (item.guardian &&
          item.guardian.toLowerCase().includes(searchTermLower)) ||
        item.phone.toLowerCase().includes(searchTermLower)
    );

    if (currentView !== "all" && reasonFilter !== "all") {
      data = data.filter((item) => item.reason === reasonFilter);
    }

    const sortedData = [...data].sort((a, b) => {
      let aValue, bValue;

      switch (currentSortColumn) {
        case 0:
          aValue = a.name;
          bValue = b.name;
          break;
        case 1:
          aValue = a.guardian || "";
          bValue = b.guardian || "";
          break;
        case 2:
          aValue = a.age;
          bValue = b.age;
          break;
        case 5:
          aValue = a.status;
          bValue = b.status;
          break;
        case 6:
          aValue = a.reason || "";
          bValue = b.reason || "";
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

    setFilteredBeneficiaries(sortedData);
  };

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

  const getGenderClasses = (gender) =>
    gender === "male"
      ? "bg-[#e0f2ff] text-[#0066cc]"
      : "bg-[#ffe6f2] text-[#cc0066]";

  const getStatusClasses = (status) => {
    switch (status) {
      case "active":
        return "bg-[#e6f4ea] text-[#137333]";
      case "unassigned":
        return "bg-[#fef7e0] text-[#b06000]";
      case "needs-reassigning":
        return "bg-[#ffebee] text-[#c5221f]";
      case "terminated":
        return "bg-[#fce8e6] text-[#c5221f]";
      case "graduated":
        return "bg-[#e8f0fe] text-[#0842a0]";
      default:
        return "";
    }
  };

  const getStatusIndicatorClasses = (view) => {
    switch (view) {
      case "waiting":
        return "bg-[#fef7e0] text-[#b06000]";
      case "terminated":
        return "bg-[#fce8e6] text-[#c5221f]";
      case "graduated":
        return "bg-[#e8f0fe] text-[#0842a0]";
      default:
        return "bg-[#f0f3ff] text-[#032990]";
    }
  };

  const getStatCardClasses = (cardType) => {
    let baseClasses =
      "p-4 rounded-lg shadow-[0_3px_10px_rgba(0,0,0,0.08)] border-l-4 cursor-pointer transition-transform duration-200 hover:scale-[1.02]";
    switch (cardType) {
      case "inactive":
        return `${baseClasses} border-[#64748b] bg-gradient-to-br from-[#f8fafc] to-[#f1f5f9]`;
      case "unassigned":
        return `${baseClasses} border-[#b06000] bg-gradient-to-br from-[#fffbeb] to-[#fef3c7]`;
      case "needs-reassigning":
        return `${baseClasses} border-[#c5221f] bg-gradient-to-br from-[#fef2f2] to-[#fee2e2]`;
      case "terminated":
        return `${baseClasses} border-[#c5221f] bg-gradient-to-br from-[#fef2f2] to-[#fee2e2]`;
      case "graduated":
        return `${baseClasses} border-[#0842a0] bg-gradient-to-br from-[#eff6ff] to-[#dbeafe]`;
      case "elderly":
        return `${baseClasses} border-[#6b46c1] bg-gradient-to-br from-[#faf5ff] to-[#ede9fe]`;
      case "child":
        return `${baseClasses} border-[#0d9488] bg-gradient-to-br from-[#f0fdfa] to-[#ccfbf1]`;
      default:
        return `${baseClasses} border-[#032990] bg-gradient-to-br from-[#f8fafc] to-[#ffffff]`;
    }
  };

  const updateReasonOptions = (status) => {
    let reasons = [];
    switch (status) {
      case "terminated":
        reasons = terminatedReasons;
        break;
      case "graduated":
        reasons = graduatedReasons;
        break;
      case "needs-reassigning":
        reasons = reassigningReasons;
        break;
      case "unassigned":
        reasons = unassignedReasons;
        break;
      default:
        reasons = [];
    }
    return ["", ...reasons];
  };

  const getReasonFilterOptions = () => {
    let allReasons = [];
    if (currentView === "waiting") {
      allReasons = allReasons.concat(unassignedReasons, reassigningReasons);
    } else if (currentView === "terminated") {
      allReasons = allReasons.concat(terminatedReasons);
    } else if (currentView === "graduated") {
      allReasons = allReasons.concat(graduatedReasons);
    }
    return ["all", ...new Set(allReasons)];
  };

  const totalInactiveBeneficiaries = beneficiaries.filter(
    (item) => item.status !== "active"
  ).length;
  const unassignedBeneficiaries = beneficiaries.filter(
    (item) => item.status === "unassigned"
  ).length;
  const needsReassigningBeneficiaries = beneficiaries.filter(
    (item) => item.status === "needs-reassigning"
  ).length;
  const terminatedBeneficiaries = beneficiaries.filter(
    (item) => item.status === "terminated"
  ).length;
  const graduatedBeneficiaries = beneficiaries.filter(
    (item) => item.status === "graduated"
  ).length;
  const elderlyBeneficiaries = beneficiaries.filter(
    (item) => item.type === "elderly"
  ).length;
  const childBeneficiaries = beneficiaries.filter(
    (item) => item.type === "child"
  ).length;

  const handleViewDocument = (id) => {
    const beneficiary = beneficiaries.find((item) => item.id === id);
    alert(
      `Viewing document for: ${beneficiary.name}\nDocument: ${beneficiary.document}`
    );
  };

  const handleExportData = () => {
    alert(`Exporting ${filteredBeneficiaries.length} records`);
  };

  const openAddModal = () => setIsAddModalOpen(true);
  const closeAddModal = () => {
    setIsAddModalOpen(false);
    setBeneficiaryForm({
      name: "",
      guardian: "",
      age: "",
      gender: "",
      phone: "",
      type: "",
      status: "active",
      reason: "",
      document: null,
    });
    setSelectedSponsor(null);
  };

  const openAddReasonModal = () => setIsAddReasonModalOpen(true);
  const closeAddReasonModal = () => {
    setIsAddReasonModalOpen(false);
    setNewReasonInput("");
  };

  const handleBeneficiaryFormChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "document") {
      setBeneficiaryForm({ ...beneficiaryForm, [name]: files[0] });
    } else {
      setBeneficiaryForm({ ...beneficiaryForm, [name]: value });
    }
  };

  const handleAddBeneficiary = (e) => {
    e.preventDefault();
    const newId =
      beneficiaries.length > 0
        ? Math.max(...beneficiaries.map((b) => b.id)) + 1
        : 1;
    const newBeneficiary = {
      id: newId,
      ...beneficiaryForm,
      age: parseInt(beneficiaryForm.age),
      document: beneficiaryForm.document ? beneficiaryForm.document.name : "",
    };
    setBeneficiaries([...beneficiaries, newBeneficiary]);
    closeAddModal();
    alert(`Beneficiary ${newBeneficiary.name} added successfully!`);
  };

  const handleAddReason = (e) => {
    e.preventDefault();
    if (newReasonInput.trim() === "") return;

    switch (currentView) {
      case "terminated":
        terminatedReasons.push(newReasonInput);
        break;
      case "graduated":
        graduatedReasons.push(newReasonInput);
        break;
      case "waiting":
        unassignedReasons.push(newReasonInput);
        break;
      default:
        break;
    }
    closeAddReasonModal();
    alert(`Reason "${newReasonInput}" added successfully!`);
  };

  const handleSponsorSearch = (e) => {
    const term = e.target.value.toLowerCase();
    const results = sponsorData.filter(
      (s) =>
        s.name.toLowerCase().includes(term) ||
        s.email.toLowerCase().includes(term)
    );
    if (results.length > 0) {
      setSelectedSponsor(results[0]);
    } else {
      setSelectedSponsor(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f7fa] p-4 sm:p-6 lg:p-8 font-poppins text-[#032990]">
      <div className="container mx-auto bg-[#ffffff] rounded-xl shadow-[0_5px_15px_rgba(0,0,0,0.08)] p-4 sm:p-6 lg:p-8 flex flex-col h-[90vh]">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <h1 className="text-3xl font-bold text-[#032990]">
            Beneficiary Management
            <span
              className={`ml-3 px-3 py-1 inline-flex text-base leading-5 font-semibold rounded-full ${getStatusIndicatorClasses(
                currentView
              )}`}
            >
              {currentView === "all"
                ? "All Beneficiaries"
                : currentView === "waiting"
                ? "Waiting List"
                : currentView === "terminated"
                ? "Terminated List"
                : "Graduated List"}
            </span>
          </h1>
          <Link
            to="/admin_dashboard"
            className="flex items-center justify-center w-12 h-12 bg-[#ffffff] text-[#032990] rounded-lg shadow-[0_4px_8px_rgba(0,0,0,0.1)] transition-all duration-300 group border-2 border-[#f0f3ff] hover:bg-[#032990] hover:shadow-[0_6px_12px_rgba(0,0,0,0.15)] hover:-translate-y-0.5"
          >
            <ArrowLeft className="w-6 h-6 stroke-[#032990] group-hover:stroke-[#ffffff] transition-colors duration-300" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-4 mb-6">
          <div
            className={getStatCardClasses("inactive")}
            onClick={() => setCurrentView("all")}
          >
            <div className="text-3xl font-bold text-[#032990]">
              {totalInactiveBeneficiaries}
            </div>
            <div className="text-sm text-[#64748b]">Inactive Beneficiaries</div>
          </div>
          {(currentView === "all" || currentView === "waiting") && (
            <div
              className={getStatCardClasses("unassigned")}
              onClick={() => setCurrentView("waiting")}
            >
              <div className="text-3xl font-bold text-[#032990]">
                {unassignedBeneficiaries}
              </div>
              <div className="text-sm text-[#64748b]">Unassigned</div>
            </div>
          )}
          {(currentView === "all" || currentView === "waiting") && (
            <div
              className={getStatCardClasses("needs-reassigning")}
              onClick={() => setCurrentView("waiting")}
            >
              <div className="text-3xl font-bold text-[#032990]">
                {needsReassigningBeneficiaries}
              </div>
              <div className="text-sm text-[#64748b]">Needs Reassigning</div>
            </div>
          )}
          {(currentView === "all" || currentView === "terminated") && (
            <div
              className={getStatCardClasses("terminated")}
              onClick={() => setCurrentView("terminated")}
            >
              <div className="text-3xl font-bold text-[#032990]">
                {terminatedBeneficiaries}
              </div>
              <div className="text-sm text-[#64748b]">Terminated</div>
            </div>
          )}
          {(currentView === "all" || currentView === "graduated") && (
            <div
              className={getStatCardClasses("graduated")}
              onClick={() => setCurrentView("graduated")}
            >
              <div className="text-3xl font-bold text-[#032990]">
                {graduatedBeneficiaries}
              </div>
              <div className="text-sm text-[#64748b]">Graduated</div>
            </div>
          )}
          {currentView === "all" && (
            <div className={getStatCardClasses("elderly")} onClick={() => {}}>
              <div className="text-3xl font-bold text-[#032990]">
                {elderlyBeneficiaries}
              </div>
              <div className="text-sm text-[#64748b]">Elderly</div>
            </div>
          )}
          {currentView === "all" && (
            <div className={getStatCardClasses("child")} onClick={() => {}}>
              <div className="text-3xl font-bold text-[#032990]">
                {childBeneficiaries}
              </div>
              <div className="text-sm text-[#64748b]">Children</div>
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-5 mb-6 items-center">
          <div className="relative flex-1 min-w-[300px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#64748b]" />
            <input
              type="text"
              id="searchInput"
              className="pl-10 p-3.5 w-full border border-[#cfd8dc] rounded-lg focus:outline-none focus:ring-2 focus:ring-[rgba(234,161,8,0.2)] focus:border-[#EAA108] transition-all duration-300 shadow-[0_2px_5px_rgba(0,0,0,0.05)] bg-[#ffffff]"
              placeholder="Search by beneficiary name, guardian name, or phone number..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
          </div>

          {(currentView === "waiting" ||
            currentView === "terminated" ||
            currentView === "graduated") && (
            <div className="flex items-center gap-2.5 bg-[#f0f3ff] p-2.5 rounded-lg">
              <span className="font-medium text-sm text-[#032990]">
                Reason:
              </span>
              <select
                id="reasonFilter"
                className="p-2 rounded-md border border-[#cfd8dc] bg-[#ffffff] text-sm min-w-[120px] focus:outline-none focus:ring-2 focus:ring-[#032990] focus:border-[#032990]"
                value={reasonFilter}
                onChange={(e) => setReasonFilter(e.target.value)}
              >
                {getReasonFilterOptions().map((reason) => (
                  <option key={reason} value={reason}>
                    {reason === "all" ? "All Reasons" : reason}
                  </option>
                ))}
              </select>
              <button
                className="flex items-center gap-1 px-3 py-1.5 bg-[#f0f3ff] text-[#032990] rounded-md text-xs font-medium hover:bg-[#e0e8ff] transition-colors duration-300"
                onClick={openAddReasonModal}
              >
                <Plus className="w-4 h-4" /> Add
              </button>
            </div>
          )}

          <div className="flex gap-2.5 ml-auto">
            <button
              className="flex items-center gap-1 px-4 py-2.5 bg-[#EAA108] text-[#ffffff] rounded-lg font-medium hover:bg-[#d19107] transition-colors duration-300 shadow-[0_2px_5px_rgba(0,0,0,0.05)]"
              onClick={handleExportData}
            >
              <Download className="w-5 h-5" />
              Export
            </button>
            
          </div>
        </div>

        <div className="overflow-x-auto flex-1 border border-[#e2e8f0] rounded-lg shadow-[0_2px_5px_rgba(0,0,0,0.05)]">
          <table className="min-w-full divide-y divide-[#e2e8f0]">
            <thead className="bg-[#f0f3ff] sticky top-0">
              <tr>
                {[
                  "Beneficiary Name",
                  "Guardian Name",
                  "Age",
                  "Gender",
                  "Phone",
                  "Status",
                  (currentView === "waiting" ||
                    currentView === "terminated" ||
                    currentView === "graduated") &&
                    "Reason",
                  (currentView === "terminated" ||
                    currentView === "graduated") &&
                    "Document",
                ]
                  .filter(Boolean)
                  .map((header, index) => (
                    <th
                      key={header}
                      className={`px-6 py-4 text-left text-sm font-semibold text-[#032990] uppercase tracking-wider cursor-pointer hover:bg-[#e0e8ff] transition-colors duration-200 ${
                        index === 0
                          ? "rounded-tl-lg"
                          : index ===
                            (currentView === "terminated" ||
                            currentView === "graduated"
                              ? 7
                              : currentView === "waiting"
                              ? 6
                              : 5)
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
              {filteredBeneficiaries.map((beneficiary) => (
                <tr
                  key={beneficiary.id}
                  className={`hover:bg-[#fff7ea] transition-colors duration-200 even:bg-[#f8fafc] ${
                    beneficiary.status === "needs-reassigning"
                      ? "bg-[#ffebee] hover:bg-[#ffcdd2]"
                      : ""
                  }`}
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-[#1a1a1a]">
                    {beneficiary.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-[#444]">
                    {beneficiary.guardian || "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-[#444]">
                    {beneficiary.age}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span
                      className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getGenderClasses(
                        beneficiary.gender
                      )}`}
                    >
                      {beneficiary.gender.charAt(0).toUpperCase() +
                        beneficiary.gender.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-[#444]">
                    {beneficiary.phone}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span
                      className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClasses(
                        beneficiary.status
                      )}`}
                    >
                      {beneficiary.status.charAt(0).toUpperCase() +
                        beneficiary.status.slice(1).replace(/-/g, " ")}
                    </span>
                  </td>
                  {(currentView === "waiting" ||
                    currentView === "terminated" ||
                    currentView === "graduated") && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#444]">
                      {beneficiary.reason || "-"}
                    </td>
                  )}
                  {(currentView === "terminated" ||
                    currentView === "graduated") && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {beneficiary.document ? (
                        <button
                          onClick={() => handleViewDocument(beneficiary.id)}
                          className="text-[#032990] hover:underline flex items-center gap-1"
                        >
                          <FileText className="w-4 h-4" /> View
                        </button>
                      ) : (
                        "-"
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {isAddModalOpen && (
          <div className="fixed inset-0 flex items-center justify-center z-[9999] p-4">
            <div className="bg-[#ffffff] rounded-xl shadow-[0_5px_20px_rgba(0,0,0,0.2)] p-6 w-full max-w-[700px] max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-5">
                <h2 className="text-2xl font-semibold text-[#032990]">
                  Add New Beneficiary
                </h2>
                <button
                  onClick={closeAddModal}
                  className="text-[#64748b] hover:text-[#032990] text-3xl leading-none"
                >
                  &times;
                </button>
              </div>
              <form onSubmit={handleAddBeneficiary}>
                <div className="mb-5">
                  <label
                    htmlFor="sponsorSearch"
                    className="block text-[#032990] font-medium mb-2"
                  >
                    Search Sponsor
                  </label>
                  <input
                    type="text"
                    id="sponsorSearch"
                    className="w-full p-3 border border-[#cfd8dc] rounded-lg focus:outline-none focus:border-[#032990]"
                    placeholder="Search by sponsor ID, name, etc."
                    onChange={handleSponsorSearch}
                  />
                  {selectedSponsor && (
                    <div className="mt-2.5 p-2.5 border border-[#e2e8f0] rounded-lg bg-[#f0f3ff] text-sm">
                      <strong>{selectedSponsor.name}</strong> (
                      {selectedSponsor.company})<br />
                      <span className="text-[#64748b]">
                        {selectedSponsor.email}
                      </span>
                    </div>
                  )}
                </div>

                <div className="mb-5">
                  <label
                    htmlFor="beneficiaryName"
                    className="block text-[#032990] font-medium mb-2"
                  >
                    Beneficiary Name
                  </label>
                  <input
                    type="text"
                    id="beneficiaryName"
                    name="name"
                    value={beneficiaryForm.name}
                    onChange={handleBeneficiaryFormChange}
                    className="w-full p-3 border border-[#cfd8dc] rounded-lg focus:outline-none focus:border-[#032990]"
                    required
                  />
                </div>

                <div className="mb-5">
                  <label
                    htmlFor="guardianName"
                    className="block text-[#032990] font-medium mb-2"
                  >
                    Guardian Name
                  </label>
                  <input
                    type="text"
                    id="guardianName"
                    name="guardian"
                    value={beneficiaryForm.guardian}
                    onChange={handleBeneficiaryFormChange}
                    className="w-full p-3 border border-[#cfd8dc] rounded-lg focus:outline-none focus:border-[#032990]"
                  />
                </div>

                <div className="mb-5">
                  <label
                    htmlFor="beneficiaryAge"
                    className="block text-[#032990] font-medium mb-2"
                  >
                    Age
                  </label>
                  <input
                    type="number"
                    id="beneficiaryAge"
                    name="age"
                    value={beneficiaryForm.age}
                    onChange={handleBeneficiaryFormChange}
                    className="w-full p-3 border border-[#cfd8dc] rounded-lg focus:outline-none focus:border-[#032990]"
                    required
                    min="0"
                  />
                </div>

                <div className="mb-5">
                  <label
                    htmlFor="beneficiaryGender"
                    className="block text-[#032990] font-medium mb-2"
                  >
                    Gender
                  </label>
                  <select
                    id="beneficiaryGender"
                    name="gender"
                    value={beneficiaryForm.gender}
                    onChange={handleBeneficiaryFormChange}
                    className="w-full p-3 border border-[#cfd8dc] rounded-lg focus:outline-none focus:border-[#032990] bg-[#ffffff]"
                    required
                  >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>

                <div className="mb-5">
                  <label
                    htmlFor="beneficiaryPhone"
                    className="block text-[#032990] font-medium mb-2"
                  >
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="beneficiaryPhone"
                    name="phone"
                    value={beneficiaryForm.phone}
                    onChange={handleBeneficiaryFormChange}
                    className="w-full p-3 border border-[#cfd8dc] rounded-lg focus:outline-none focus:border-[#032990]"
                  />
                </div>

                <div className="mb-5">
                  <label
                    htmlFor="beneficiaryType"
                    className="block text-[#032990] font-medium mb-2"
                  >
                    Type
                  </label>
                  <select
                    id="beneficiaryType"
                    name="type"
                    value={beneficiaryForm.type}
                    onChange={handleBeneficiaryFormChange}
                    className="w-full p-3 border border-[#cfd8dc] rounded-lg focus:outline-none focus:border-[#032990] bg-[#ffffff]"
                    required
                  >
                    <option value="">Select Type</option>
                    <option value="child">Child</option>
                    <option value="elderly">Elderly</option>
                  </select>
                </div>

                <div className="mb-5">
                  <label
                    htmlFor="beneficiaryStatus"
                    className="block text-[#032990] font-medium mb-2"
                  >
                    Status
                  </label>
                  <select
                    id="beneficiaryStatus"
                    name="status"
                    value={beneficiaryForm.status}
                    onChange={handleBeneficiaryFormChange}
                    className="w-full p-3 border border-[#cfd8dc] rounded-lg focus:outline-none focus:border-[#032990] bg-[#ffffff]"
                    required
                  >
                    <option value="active">Active</option>
                    <option value="unassigned">Unassigned</option>
                    <option value="needs-reassigning">Needs Reassigning</option>
                    <option value="terminated">Terminated</option>
                    <option value="graduated">Graduated</option>
                  </select>
                </div>

                {(beneficiaryForm.status === "terminated" ||
                  beneficiaryForm.status === "graduated" ||
                  beneficiaryForm.status === "needs-reassigning" ||
                  beneficiaryForm.status === "unassigned") && (
                  <div className="mb-5">
                    <label
                      htmlFor="beneficiaryReason"
                      className="block text-[#032990] font-medium mb-2"
                    >
                      Reason
                    </label>
                    <select
                      id="beneficiaryReason"
                      name="reason"
                      value={beneficiaryForm.reason}
                      onChange={handleBeneficiaryFormChange}
                      className="w-full p-3 border border-[#cfd8dc] rounded-lg focus:outline-none focus:border-[#032990] bg-[#ffffff]"
                    >
                      {updateReasonOptions(beneficiaryForm.status).map(
                        (reason, index) => (
                          <option key={index} value={reason}>
                            {reason}
                          </option>
                        )
                      )}
                    </select>
                  </div>
                )}

                {(beneficiaryForm.status === "terminated" ||
                  beneficiaryForm.status === "graduated") && (
                  <div className="mb-5">
                    <label
                      htmlFor="beneficiaryDocument"
                      className="block text-[#032990] font-medium mb-2"
                    >
                      Document
                    </label>
                    <input
                      type="file"
                      id="beneficiaryDocument"
                      name="document"
                      onChange={handleBeneficiaryFormChange}
                      className="w-full p-3 border border-[#cfd8dc] rounded-lg focus:outline-none focus:border-[#032990] file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-[#032990] file:text-[#ffffff] hover:file:bg-[#021f69]"
                    />
                  </div>
                )}

                <div className="flex justify-end gap-2.5 mt-5">
                  <button
                    type="button"
                    onClick={closeAddModal}
                    className="px-5 py-2.5 bg-[#f0f3ff] text-[#032990] rounded-lg font-medium hover:bg-[#e0e8ff] transition-colors duration-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-[#032990] text-[#ffffff] rounded-lg font-medium hover:bg-[#021f69] transition-colors duration-300"
                  >
                    Add Beneficiary
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {isAddReasonModalOpen && (
          <div className="fixed inset-0 flex items-center justify-center z-[9999] p-4">
            <div className="bg-[#ffffff] rounded-xl shadow-[0_5px_20px_rgba(0,0,0,0.2)] p-6 w-full max-w-[700px] max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-5">
                <h2 className="text-2xl font-semibold text-[#032990]">
                  {currentView === "terminated"
                    ? "Add New Termination Reason"
                    : currentView === "graduated"
                    ? "Add New Graduation Reason"
                    : "Add New Waiting Reason"}
                </h2>
                <button
                  onClick={closeAddReasonModal}
                  className="text-[#64748b] hover:text-[#032990] text-3xl leading-none"
                >
                  &times;
                </button>
              </div>
              <form onSubmit={handleAddReason}>
                <div className="mb-5">
                  <label
                    htmlFor="newReason"
                    className="block text-[#032990] font-medium mb-2"
                  >
                    Reason
                  </label>
                  <input
                    type="text"
                    id="newReason"
                    name="newReasonInput"
                    value={newReasonInput}
                    onChange={(e) => setNewReasonInput(e.target.value)}
                    className="w-full p-3 border border-[#cfd8dc] rounded-lg focus:outline-none focus:border-[#032990]"
                    required
                  />
                </div>
                <div className="flex justify-end gap-2.5 mt-5">
                  <button
                    type="button"
                    onClick={closeAddReasonModal}
                    className="px-5 py-2.5 bg-[#f0f3ff] text-[#032990] rounded-lg font-medium hover:bg-[#e0e8ff] transition-colors duration-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-[#032990] text-[#ffffff] rounded-lg font-medium hover:bg-[#021f69] transition-colors duration-300"
                  >
                    Add Reason
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BeneficiaryList;
