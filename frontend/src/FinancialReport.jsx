import React, { useState, useEffect } from "react";
import { useRoleNavigation } from "./hooks/useRoleNavigation";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  X,
  ChevronUp,
  ChevronDown,
  PenSquare,
  Search,
  Calendar,
  User,
  Phone,
  CreditCard,
  Users,
  FileText,
  LinkIcon
} from "lucide-react";

const monthNames = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const FinancialReport = () => {
  const { navigateToDashboard } = useRoleNavigation();
  const navigate = useNavigate();
  const [sponsors, setSponsors] = useState([]);
  const [filteredSponsors, setFilteredSponsors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [paymentStatusFilter, setPaymentStatusFilter] = useState("all");
  const now = new Date();
  const [startMonth, setStartMonth] = useState(1);
  const [startYear, setStartYear] = useState(2025);
  const [endMonth, setEndMonth] = useState(now.getMonth() + 1);
  const [endYear, setEndYear] = useState(now.getFullYear());
  const [searchTerm, setSearchTerm] = useState("");
  const [currentSortColumn, setCurrentSortColumn] = useState("id");
  const [currentSortDirection, setCurrentSortDirection] = useState("asc");
  const [isOverrideModalOpen, setIsOverrideModalOpen] = useState(false);
  const [selectedSponsor, setSelectedSponsor] = useState(null);
  const [modalMonthsPaid, setModalMonthsPaid] = useState(0);
  const [modalPaymentPeriodStartMonth, setModalPaymentPeriodStartMonth] = useState(1);
  const [modalPaymentPeriodStartYear, setModalPaymentPeriodStartYear] = useState(2025);
  const [modalPaymentPeriodEndMonth, setModalPaymentPeriodEndMonth] = useState(12);
  const [modalPaymentPeriodEndYear, setModalPaymentPeriodEndYear] = useState(2025);
  const [modalBeneficiaries, setModalBeneficiaries] = useState(1);
  const [modalPaymentStatus, setModalPaymentStatus] = useState("paid");
  const [modalMonthlyAmount, setModalMonthlyAmount] = useState(0);
  const [modalReferenceNumber, setModalReferenceNumber] = useState("");
  const [modalBankReceiptUrl, setModalBankReceiptUrl] = useState("");
  const [modalCompanyReceiptUrl, setModalCompanyReceiptUrl] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");

  const handleBack = () => {
    navigateToDashboard();
  }

  // Mock data - Replace this with your actual API call
  const mockSponsors = [
    {
      id: "02-1000",
      name: "John Smith",
      phone: "+13105551234",
      lastPayment: "March 2025",
      status: "unpaid",
      paymentHistory: [
        { month: "January", year: 2025, status: "paid" },
        { month: "February", year: 2025, status: "paid" },
        { month: "March", year: 2025, status: "paid" }
      ],
      beneficiaries: 1,
      agreed_monthly_payment: 500.00
    },
    {
      id: "02-1001",
      name: "Emily Johnson",
      phone: "+13105552345",
      lastPayment: "June 2025",
      status: "unpaid",
      paymentHistory: [
        { month: "January", year: 2025, status: "paid" },
        { month: "February", year: 2025, status: "paid" },
        { month: "March", year: 2025, status: "paid" },
        { month: "April", year: 2025, status: "paid" },
        { month: "May", year: 2025, status: "paid" },
        { month: "June", year: 2025, status: "paid" }
      ],
      beneficiaries: 2,
      agreed_monthly_payment: 750.00
    },
    {
      id: "02-1002",
      name: "Hope Foundation",
      phone: "+2519000200",
      lastPayment: "September 2025",
      status: "paid",
      paymentHistory: [
        { month: "January", year: 2025, status: "paid" },
        { month: "February", year: 2025, status: "paid" },
        { month: "March", year: 2025, status: "paid" },
        { month: "April", year: 2025, status: "paid" },
        { month: "May", year: 2025, status: "paid" },
        { month: "June", year: 2025, status: "paid" },
        { month: "July", year: 2025, status: "paid" },
        { month: "August", year: 2025, status: "paid" },
        { month: "September", year: 2025, status: "paid" }
      ],
      beneficiaries: 4,
      agreed_monthly_payment: 2000.00
    },
    {
      id: "02-1003",
      name: "Robert Wilson",
      phone: "+13105554567",
      lastPayment: "January 2026",
      status: "paid",
      paymentHistory: [
        { month: "January", year: 2025, status: "paid" },
        { month: "February", year: 2025, status: "paid" },
        { month: "March", year: 2025, status: "paid" },
        { month: "April", year: 2025, status: "paid" },
        { month: "May", year: 2025, status: "paid" },
        { month: "June", year: 2025, status: "paid" },
        { month: "July", year: 2025, status: "paid" },
        { month: "August", year: 2025, status: "paid" },
        { month: "September", year: 2025, status: "paid" },
        { month: "October", year: 2025, status: "paid" },
        { month: "November", year: 2025, status: "paid" },
        { month: "December", year: 2025, status: "paid" },
        { month: "January", year: 2026, status: "paid" }
      ],
      beneficiaries: 1,
      agreed_monthly_payment: 600.00
    },
    {
      id: "02-1004",
      name: "Maria Garcia",
      phone: "+13105555678",
      lastPayment: "May 2025",
      status: "unpaid",
      paymentHistory: [
        { month: "January", year: 2025, status: "paid" },
        { month: "February", year: 2025, status: "paid" },
        { month: "March", year: 2025, status: "paid" },
        { month: "April", year: 2025, status: "paid" },
        { month: "May", year: 2025, status: "paid" }
      ],
      beneficiaries: 1,
      agreed_monthly_payment: 850.00
    },
    {
      id: "02-2001",
      name: "Ethio Charity Foundation",
      phone: "+251114567890",
      lastPayment: "August 2025",
      status: "paid",
      paymentHistory: [
        { month: "January", year: 2025, status: "paid" },
        { month: "February", year: 2025, status: "paid" },
        { month: "March", year: 2025, status: "paid" },
        { month: "April", year: 2025, status: "paid" },
        { month: "May", year: 2025, status: "paid" },
        { month: "June", year: 2025, status: "paid" },
        { month: "July", year: 2025, status: "paid" },
        { month: "August", year: 2025, status: "paid" }
      ],
      beneficiaries: 6,
      agreed_monthly_payment: 3000.00
    },
    {
      id: "02-2002",
      name: "Addis Helping Hands",
      phone: "+251115678901",
      lastPayment: "July 2025",
      status: "unpaid",
      paymentHistory: [
        { month: "January", year: 2025, status: "paid" },
        { month: "February", year: 2025, status: "paid" },
        { month: "March", year: 2025, status: "paid" },
        { month: "April", year: 2025, status: "paid" },
        { month: "May", year: 2025, status: "paid" },
        { month: "June", year: 2025, status: "paid" },
        { month: "July", year: 2025, status: "paid" }
      ],
      beneficiaries: 5,
      agreed_monthly_payment: 2500.00
    }
  ];

  const totalSponsorsCount = sponsors.length;
  const paidSponsorsCount = sponsors.filter((s) => s.status === "paid").length;
  const unpaidSponsorsCount = sponsors.filter((s) => s.status === "unpaid").length;

  // Simple data fetch - replace with your API call
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Use mock data for now - replace with actual API response
        setSponsors(mockSponsors);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter and sort whenever sponsors or settings change
  useEffect(() => {
    let temp = [...sponsors];
    
    // Apply status filter
    if (paymentStatusFilter !== "all") {
      temp = temp.filter((s) => s.status === paymentStatusFilter);
    }

    // Apply search filter
    if (searchTerm) {
      temp = temp.filter(
        (item) =>
          item.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.phone.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply sorting
    const sortedData = [...temp].sort((a, b) => {
      let aValue, bValue;
      switch (currentSortColumn) {
        case "id":
          aValue = a.id;
          bValue = b.id;
          break;
        case "name":
          aValue = a.name;
          bValue = b.name;
          break;
        case "payment":
          // Use the lastPayment field directly
          aValue = a.lastPayment || "";
          bValue = b.lastPayment || "";
          break;
        default:
          return 0;
      }
      
      if (currentSortDirection === "asc") {
        return String(aValue).localeCompare(String(bValue));
      } else {
        return String(bValue).localeCompare(String(aValue));
      }
    });

    setFilteredSponsors(sortedData);
  }, [sponsors, paymentStatusFilter, searchTerm, currentSortColumn, currentSortDirection]);

  // Calculate months paid in modal when period changes
  useEffect(() => {
    const startDate = new Date(modalPaymentPeriodStartYear, modalPaymentPeriodStartMonth - 1, 1);
    const endDate = new Date(modalPaymentPeriodEndYear, modalPaymentPeriodEndMonth - 1, 1);
    if (startDate > endDate) {
      setModalMonthsPaid(0);
      return;
    }
    const months = ((endDate.getFullYear() - startDate.getFullYear()) * 12 + (endDate.getMonth() - startDate.getMonth())) + 1;
    setModalMonthsPaid(months);
  }, [modalPaymentPeriodStartMonth, modalPaymentPeriodStartYear, modalPaymentPeriodEndMonth, modalPaymentPeriodEndYear]);

  const generateYearOptions = () => {
    const years = [2023, 2024, 2025, 2026, 2027];
    return years.map((year) => (
      <option key={year} value={year}>
        {year}
      </option>
    ));
  };

  const getMonthIndex = (monthName) => monthNames.indexOf(monthName);

  const handleSort = (column) => {
    if (column === currentSortColumn) {
      setCurrentSortDirection(currentSortDirection === "asc" ? "desc" : "asc");
    } else {
      setCurrentSortColumn(column);
      setCurrentSortDirection("asc");
    }
  };

  const getStatusClasses = (status) => {
    return status === "paid"
      ? "bg-[#d1fae5] text-[#065f46]"
      : "bg-[#fee2e2] text-[#991b1b]";
  };

  const openOverrideModal = (sponsor) => {
    setSelectedSponsor(sponsor);
    
    // Calculate months paid from payment history
    const paidMonths = sponsor.paymentHistory ? sponsor.paymentHistory.filter(p => p.status === "paid").length : 0;
    setModalMonthsPaid(paidMonths);
    
    // Set initial values based on sponsor data
    setModalBeneficiaries(sponsor.beneficiaries || 1);
    setModalPaymentStatus(sponsor.status || "unpaid");
    setModalMonthlyAmount(sponsor.agreed_monthly_payment || 0);
    
    // Set payment period based on last payment
    if (sponsor.lastPayment && sponsor.lastPayment !== "No payments") {
      const [lastMonth, lastYear] = sponsor.lastPayment.split(" ");
      setModalPaymentPeriodEndMonth(getMonthIndex(lastMonth) + 1);
      setModalPaymentPeriodEndYear(parseInt(lastYear));
      
      // Set start period to January of the same year for simplicity
      setModalPaymentPeriodStartMonth(1);
      setModalPaymentPeriodStartYear(parseInt(lastYear));
    } else {
      // Default to current year
      const currentDate = new Date();
      setModalPaymentPeriodStartMonth(1);
      setModalPaymentPeriodStartYear(currentDate.getFullYear());
      setModalPaymentPeriodEndMonth(currentDate.getMonth() + 1);
      setModalPaymentPeriodEndYear(currentDate.getFullYear());
    }
    
    setModalReferenceNumber("");
    setModalBankReceiptUrl("");
    setModalCompanyReceiptUrl("");
    setIsOverrideModalOpen(true);
  };

  const closeOverrideModal = () => {
    setIsOverrideModalOpen(false);
    setSelectedSponsor(null);
  };

  const saveOverrideChanges = async () => {
    if (!selectedSponsor) return;

    try {
      // Update local state
      const updatedSponsors = sponsors.map((s) =>
        s.id === selectedSponsor.id
          ? {
              ...s,
              lastPayment: modalPaymentStatus === "paid" 
                ? `${monthNames[modalPaymentPeriodEndMonth - 1]} ${modalPaymentPeriodEndYear}`
                : "No payments",
              beneficiaries: modalBeneficiaries,
              status: modalPaymentStatus,
            }
          : s
      );
      
      setSponsors(updatedSponsors);
      
      // Here you would make your API call to save to database
      // await fetch("/api/financial/payment", { ... })
      
      alert("Changes saved successfully!");
      closeOverrideModal();
    } catch (error) {
      console.error("Error saving changes:", error);
      alert("Failed to save changes.");
    }
  };

  return (
    <div className="min-h-screen bg-[#f3f4f6] p-4 font-inter text-[#111827]">
      <div className="max-w-[1200px] mx-auto bg-white rounded-lg shadow-[0_1px_3px_0_rgba(0,0,0,0.1)] p-6 mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
          <div className="flex items-center mb-6 gap-4">
            <button
              onClick={handleBack}
              className="flex items-center justify-center w-12 h-12 bg-[#ffffff] text-[#032990] rounded-lg shadow-[0_4px_8px_rgba(0,0,0,0.1)] transition-all duration-300 border-2 border-[#f0f3ff] hover:bg-[#032990] hover:text-white group"
            >
              <ArrowLeft className="w-6 h-6 stroke-[#032990] transition-colors duration-300 group-hover:stroke-white" />
            </button>
            <h1 className="text-[#032990] font-bold text-3xl m-0">
              Financial Report
            </h1>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Total Sponsors Card */}
          <div 
            className={`p-4 rounded-lg flex-1 min-w-[200px] shadow-[0_3px_10px_rgba(0,0,0,0.08)] text-center border-l-4 border-[#032990] bg-gradient-to-br from-[#eff6ff] to-[#dbeafe] transition-all duration-200 ${activeFilter === "all" ? "ring-2 ring-[#032990]" : "hover:shadow-lg"} cursor-pointer`}
            onClick={() => {
              setPaymentStatusFilter("all");
              setActiveFilter("all");
            }}
          >
            <div className="text-[0.875rem] font-medium text-[#6b7280] mb-2">
              Total Sponsors
            </div>
            <div className="text-[1.875rem] font-bold text-[#3b82f6]">
              {totalSponsorsCount}
            </div>
          </div>
          
          {/* Paid Sponsors Card */}
          <div 
            className={`p-4 rounded-lg flex-1 min-w-[200px] shadow-[0_3px_10px_rgba(0,0,0,0.08)] text-center border-l-4 border-[#039903] bg-gradient-to-br from-[#efffef] to-[#dbfedb] transition-all duration-200 ${activeFilter === "paid" ? "ring-2 ring-[#039903]" : "hover:shadow-lg"} cursor-pointer`}
            onClick={() => {
              setPaymentStatusFilter("paid");
              setActiveFilter("paid");
            }}
          >
            <div className="text-[0.875rem] font-medium text-[#6b7280] mb-2">
              Paid Sponsors
            </div>
            <div className="text-[1.875rem] font-bold text-[#10b981]">
              {paidSponsorsCount}
            </div>
          </div>
          
          {/* Unpaid Sponsors Card */}
          <div 
            className={`p-4 rounded-lg flex-1 min-w-[200px] shadow-[0_3px_10px_rgba(0,0,0,0.08)] text-center border-l-4 border-[#990303] bg-gradient-to-br from-[#ffefef] to-[#fedbdb] transition-all duration-200 ${activeFilter === "unpaid" ? "ring-2 ring-[#990303]" : "hover:shadow-lg"} cursor-pointer`}
            onClick={() => {
              setPaymentStatusFilter("unpaid");
              setActiveFilter("unpaid");
            }}
          >
            <div className="text-[0.875rem] font-medium text-[#6b7280] mb-2">
              Unpaid Sponsors
            </div>
            <div className="text-[1.875rem] font-bold text-[#ef4444]">
              {unpaidSponsorsCount}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-6 mb-6 items-end">
          <div className="flex flex-col flex-1 min-w-[300px] gap-2">
            <label className="font-medium text-[#374151] text-[0.875rem]">
              Date Range
            </label>
            <div className="flex flex-row gap-4">
              <div className="flex flex-col md:flex-row items-start md:items-center gap-3">
                <span className="text-[#374151] text-[0.875rem] min-w-[60px]">
                  Start:
                </span>
                <select
                  className="flex-1 p-3 border border-[#d1d5db] rounded-lg text-[0.9rem] bg-white shadow-sm focus:outline-none focus:border-[#3b82f6] focus:ring-2 focus:ring-[rgba(59,130,246,0.2)]"
                  value={startMonth}
                  onChange={(e) => setStartMonth(parseInt(e.target.value))}
                >
                  {monthNames.map((month, index) => (
                    <option key={month} value={index + 1}>
                      {month}
                    </option>
                  ))}
                </select>
                <select
                  className="flex-1 p-3 border border-[#d1d5db] rounded-lg text-[0.9rem] bg-white shadow-sm focus:outline-none focus:border-[#3b82f6] focus:ring-2 focus:ring-[rgba(59,130,246,0.2)]"
                  value={startYear}
                  onChange={(e) => setStartYear(parseInt(e.target.value))}
                >
                  {generateYearOptions()}
                </select>
              </div>
              <div className="flex flex-col md:flex-row items-start md:items-center gap-3">
                <span className="text-[#374151] text-[0.875rem] min-w-[60px]">
                  End:
                </span>
                <select
                  className="flex-1 p-3 border border-[#d1d5db] rounded-lg text-[0.9rem] bg-white shadow-sm focus:outline-none focus:border-[#3b82f6] focus:ring-2 focus:ring-[rgba(59,130,246,0.2)]"
                  value={endMonth}
                  onChange={(e) => setEndMonth(parseInt(e.target.value))}
                >
                  {monthNames.map((month, index) => (
                    <option key={month} value={index + 1}>
                      {month}
                    </option>
                  ))}
                </select>
                <select
                  className="flex-1 p-3 border border-[#d1d5db] rounded-lg text-[0.9rem] bg-white shadow-sm focus:outline-none focus:border-[#3b82f6] focus:ring-2 focus:ring-[rgba(59,130,246,0.2)]"
                  value={endYear}
                  onChange={(e) => setEndYear(parseInt(e.target.value))}
                >
                  {generateYearOptions()}
                </select>
              </div>
            </div>
          </div>

          <div className="flex flex-col flex-1 min-w-[200px] gap-2 ml-4">
            <label className="font-medium text-[#374151] text-[0.875rem]">
              Search
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6b7280]" />
              <input
                type="text"
                className="pl-10 p-3 w-full border border-[#d1d5db] rounded-lg text-[0.9rem] bg-white shadow-sm focus:outline-none focus:border-[#3b82f6] focus:ring-2 focus:ring-[rgba(59,130,246,0.2)]"
                placeholder="Search by ID, name, or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 text-[#991b1b] bg-[#fee2e2] border border-[#fecaca] rounded">
            {error}
          </div>
        )}

        <div className="overflow-x-auto max-h-[500px] overflow-y-auto border border-[#e5e7eb] rounded-lg shadow-sm">
          <table className="min-w-full border-collapse">
            <thead className="bg-[#f9fafb] sticky top-0">
              <tr>
                {["Sponsor ID", "Sponsor Name", "Phone Number", "Last Paid Month", "Status", "Override"].map((header) => (
                  <th
                    key={header}
                    className="px-6 py-4 text-left text-[0.9rem] font-medium text-[#374151] border-b border-[#e5e7eb] sticky top-0 cursor-pointer select-none hover:bg-[#f3f4f6]"
                    onClick={() => handleSort(header.split(" ")[0].toLowerCase())}
                  >
                    {header}
                    {currentSortColumn === header.split(" ")[0].toLowerCase() &&
                      (currentSortDirection === "asc" ? (
                        <ChevronUp className="w-3 h-3 inline ml-1" />
                      ) : (
                        <ChevronDown className="w-3 h-3 inline ml-1" />
                      ))}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center text-[#374151]">
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#032990]"></div>
                      <span className="ml-2">Loading sponsors...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredSponsors.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center text-[#374151]">
                    No sponsors found for the selected filters.
                  </td>
                </tr>
              ) : (
                filteredSponsors.map((sponsor) => (
                  <tr key={sponsor.id} className="border-b border-[#f3f4f6] hover:bg-[#f9fafb]">
                    <td className="px-6 py-4 whitespace-nowrap text-[0.9rem] font-semibold text-[#1f2937]">
                      {sponsor.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-[0.95rem] font-medium text-[#1e40af] min-w-[200px]">
                      <div className="flex items-center">
                        <User className="w-4 h-4 mr-2 text-[#6b7280]" />
                        {sponsor.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-[0.95rem] text-[#4b5563]">
                      <div className="flex items-center">
                        <Phone className="w-4 h-4 mr-2 text-[#6b7280]" />
                        {sponsor.phone}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-[0.95rem] text-[#374151]">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-2 text-[#6b7280]" />
                        {sponsor.lastPayment || "No payments"}
                      </div>
                      <div className="text-[0.85rem] text-[#6b7280] mt-1">
                        {sponsor.paymentHistory ? sponsor.paymentHistory.filter(p => p.status === "paid").length : 0} months paid
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 inline-flex items-center text-[0.85rem] font-medium rounded-full ${getStatusClasses(sponsor.status)}`}>
                        <CreditCard className="w-3 h-3 mr-1" />
                        {sponsor.status.charAt(0).toUpperCase() + sponsor.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        className="p-2 rounded-lg text-[#3b82f6] hover:bg-[#eff6ff] transition-colors duration-200 flex items-center"
                        onClick={() => openOverrideModal(sponsor)}
                      >
                        <PenSquare className="w-5 h-5" />
                        <span className="ml-1 text-sm">Edit</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {isOverrideModalOpen && selectedSponsor && (
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4 bg-black bg-opacity-50">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <div className="bg-gradient-to-r from-[#1e40af] to-[#3b82f6] text-white p-6 rounded-t-xl">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-2xl font-bold flex items-center">
                      <CreditCard className="w-6 h-6 mr-2" />
                      Payment Management
                    </h2>
                    <p className="text-blue-100 mt-1">Update sponsor payment information</p>
                  </div>
                  <button
                    className="text-white hover:text-blue-200 p-2 rounded-full transition-colors duration-200"
                    onClick={closeOverrideModal}
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              <div className="p-6">
                {/* Sponsor Information Card */}
                <div className="bg-gradient-to-br from-[#f8fafc] to-[#f1f5f9] rounded-lg p-4 mb-6 border border-[#e2e8f0]">
                  <h3 className="font-semibold text-[#1e40af] mb-3 flex items-center">
                    <User className="w-4 h-4 mr-2" />
                    Sponsor Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center">
                      <span className="font-medium text-[#374151] w-32">Sponsor ID:</span>
                      <span className="text-[#6b7280] font-mono">{selectedSponsor.id}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="font-medium text-[#374151] w-32">Full Name:</span>
                      <span className="text-[#6b7280]">{selectedSponsor.name}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="font-medium text-[#374151] w-32">Phone Number:</span>
                      <span className="text-[#6b7280]">{selectedSponsor.phone}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="font-medium text-[#374151] w-32">Last Payment:</span>
                      <span className="text-[#6b7280] font-medium">{selectedSponsor.lastPayment || "No payments"}</span>
                    </div>
                  </div>
                </div>

                {/* Payment Details */}
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Payment Period */}
                    <div className="space-y-3">
                      <label className="font-medium text-[#374151] flex items-center">
                        <Calendar className="w-4 h-4 mr-2" />
                        Payment Period
                      </label>
                      <div className="flex flex-wrap gap-2 items-center">
                        <select
                          className="flex-1 p-2 border border-[#d1d5db] rounded-lg text-[0.9rem] focus:outline-none focus:border-[#3b82f6] focus:ring-2 focus:ring-[rgba(59,130,246,0.2)]"
                          value={modalPaymentPeriodStartMonth}
                          onChange={(e) => setModalPaymentPeriodStartMonth(parseInt(e.target.value))}
                        >
                          {monthNames.map((month, index) => (
                            <option key={month} value={index + 1}>{month}</option>
                          ))}
                        </select>
                        <select
                          className="flex-1 p-2 border border-[#d1d5db] rounded-lg text-[0.9rem] focus:outline-none focus:border-[#3b82f6] focus:ring-2 focus:ring-[rgba(59,130,246,0.2)]"
                          value={modalPaymentPeriodStartYear}
                          onChange={(e) => setModalPaymentPeriodStartYear(parseInt(e.target.value))}
                        >
                          {generateYearOptions()}
                        </select>
                        <span className="text-[#6b7280] mx-2">to</span>
                        <select
                          className="flex-1 p-2 border border-[#d1d5db] rounded-lg text-[0.9rem] focus:outline-none focus:border-[#3b82f6] focus:ring-2 focus:ring-[rgba(59,130,246,0.2)]"
                          value={modalPaymentPeriodEndMonth}
                          onChange={(e) => setModalPaymentPeriodEndMonth(parseInt(e.target.value))}
                        >
                          {monthNames.map((month, index) => (
                            <option key={month} value={index + 1}>{month}</option>
                          ))}
                        </select>
                        <select
                          className="flex-1 p-2 border border-[#d1d5db] rounded-lg text-[0.9rem] focus:outline-none focus:border-[#3b82f6] focus:ring-2 focus:ring-[rgba(59,130,246,0.2)]"
                          value={modalPaymentPeriodEndYear}
                          onChange={(e) => setModalPaymentPeriodEndYear(parseInt(e.target.value))}
                        >
                          {generateYearOptions()}
                        </select>
                      </div>
                      <div className="text-sm text-[#6b7280]">
                        Total months covered: <span className="font-semibold">{modalMonthsPaid}</span>
                      </div>
                    </div>

                    {/* Beneficiaries and Amount */}
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="font-medium text-[#374151] flex items-center">
                            <Users className="w-4 h-4 mr-2" />
                            Beneficiaries
                          </label>
                          <input
                            type="number"
                            className="w-full p-2 border border-[#d1d5db] rounded-lg text-[0.9rem] focus:outline-none focus:border-[#3b82f6] focus:ring-2 focus:ring-[rgba(59,130,246,0.2)]"
                            min="1"
                            value={modalBeneficiaries}
                            onChange={(e) => setModalBeneficiaries(parseInt(e.target.value))}
                          />
                        </div>
                        <div>
                          <label className="font-medium text-[#374151] flex items-center">
                            <CreditCard className="w-4 h-4 mr-2" />
                            Monthly Amount
                          </label>
                          <input
                            type="number"
                            className="w-full p-2 border border-[#d1d5db] rounded-lg text-[0.9rem] focus:outline-none focus:border-[#3b82f6] focus:ring-2 focus:ring-[rgba(59,130,246,0.2)]"
                            min="0"
                            step="0.01"
                            value={modalMonthlyAmount}
                            onChange={(e) => setModalMonthlyAmount(parseFloat(e.target.value))}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Payment Status */}
                  <div>
                    <label className="font-medium text-[#374151] flex items-center">
                      <CreditCard className="w-4 h-4 mr-2" />
                      Payment Status
                    </label>
                    <select
                      className="w-full p-2 border border-[#d1d5db] rounded-lg text-[0.9rem] focus:outline-none focus:border-[#3b82f6] focus:ring-2 focus:ring-[rgba(59,130,246,0.2)]"
                      value={modalPaymentStatus}
                      onChange={(e) => setModalPaymentStatus(e.target.value)}
                    >
                      <option value="paid" className="text-green-600">Paid</option>
                      <option value="unpaid" className="text-red-600">Unpaid</option>
                    </select>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-3 mt-6">
                  <button
                    className="px-6 py-2 bg-[#f3f4f6] text-[#374151] rounded-lg font-medium hover:bg-[#e5e7eb] transition-colors duration-200 flex items-center"
                    onClick={closeOverrideModal}
                  >
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </button>
                  <button
                    className="px-6 py-2 bg-[#10b981] text-white rounded-lg font-medium hover:bg-[#059669] transition-colors duration-200 flex items-center"
                    onClick={saveOverrideChanges}
                  >
                    <PenSquare className="w-4 h-4 mr-2" />
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FinancialReport;
