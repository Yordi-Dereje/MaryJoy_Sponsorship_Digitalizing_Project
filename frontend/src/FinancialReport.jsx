import React, { useState, useEffect } from "react";
import { useRoleNavigation } from "./hooks/useRoleNavigation";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  X,
  ChevronUp,
  ChevronDown,
  PenSquare,
  Search,
} from "lucide-react";

const initialSponsorData = [
  {
    id: "02-1240",
    name: "Abebe Kebede",
    phone: "+251911223344",
    lastPayment: "December 2025",
    status: "paid",
    paymentHistory: [
      { month: "January", year: 2025, status: "paid" },
      { month: "February", year: 2025, status: "paid" },
      { month: "March", year: 2025, status: "paid" },
      { month: "April", year: 2025, status: "paid" },
      { month: "May", year: 2025, status: "paid" },
      { month: "June", year: 2025, status: "paid" },
    ],
    beneficiaries: 2,
  },
  {
    id: "02-1928",
    name: "Selamawit Tekle",
    phone: "+251922334455",
    lastPayment: "November 2025",
    status: "paid",
    paymentHistory: [
      { month: "January", year: 2025, status: "paid" },
      { month: "February", year: 2025, status: "paid" },
      { month: "March", year: 2025, status: "paid" },
      { month: "April", year: 2025, status: "paid" },
      { month: "May", year: 2025, status: "paid" },
      { month: "June", year: 2025, status: "paid" },
      { month: "July", year: 2025, status: "paid" },
    ],
    beneficiaries: 1,
  },
  {
    id: "02-1875",
    name: "Dawit Haile",
    phone: "+251933445566",
    lastPayment: "May 2025",
    status: "unpaid",
    paymentHistory: [
      { month: "January", year: 2025, status: "paid" },
      { month: "February", year: 2025, status: "paid" },
      { month: "March", year: 2025, status: "paid" },
      { month: "April", year: 2025, status: "paid" },
      { month: "May", year: 2025, status: "paid" },
    ],
    beneficiaries: 3,
  },
  {
    id: "02-1123",
    name: "Meron Abebe",
    phone: "+251944556677",
    lastPayment: "July 2025",
    status: "paid",
    paymentHistory: [
      { month: "January", year: 2025, status: "paid" },
      { month: "February", year: 2025, status: "paid" },
      { month: "March", year: 2025, status: "paid" },
      { month: "April", year: 2025, status: "paid" },
      { month: "May", year: 2025, status: "paid" },
      { month: "June", year: 2025, status: "paid" },
      { month: "July", year: 2025, status: "paid" },
    ],
    beneficiaries: 1,
  },
  {
    id: "02-1654",
    name: "Tewodros Getachew",
    phone: "+251955667788",
    lastPayment: "July 2026",
    status: "paid",
    paymentHistory: [
      { month: "January", year: 2025, status: "paid" },
      { month: "February", year: 2025, status: "paid" },
      { month: "March", year: 2025, status: "paid" },
      { month: "April", year: 2025, status: "paid" },
      { month: "May", year: 2025, status: "paid" },
      { month: "June", year: 2025, status: "paid" },
      { month: "July", year: 2025, status: "paid" },
    ],
    beneficiaries: 2,
  },
  {
    id: "02-1421",
    name: "Yordanos Assefa",
    phone: "+251966778899",
    lastPayment: "March 2025",
    status: "unpaid",
    paymentHistory: [
      { month: "January", year: 2025, status: "paid" },
      { month: "February", year: 2025, status: "paid" },
      { month: "March", year: 2025, status: "paid" },
    ],
    beneficiaries: 1,
  },
  {
    id: "02-1987",
    name: "Ekram Mohammed",
    phone: "+251977889900",
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
    ],
    beneficiaries: 4,
  },
  {
    id: "02-1356",
    name: "Samuel Tadesse",
    phone: "+251988990011",
    lastPayment: "February 2025",
    status: "unpaid",
    paymentHistory: [
      { month: "January", year: 2025, status: "paid" },
      { month: "February", year: 2025, status: "paid" },
    ],
    beneficiaries: 2,
  },
];

const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
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
  const [modalPaymentPeriodStartMonth, setModalPaymentPeriodStartMonth] =
    useState(1);
  const [modalPaymentPeriodStartYear, setModalPaymentPeriodStartYear] =
    useState(2025);
  const [modalPaymentPeriodEndMonth, setModalPaymentPeriodEndMonth] =
    useState(12);
  const [modalPaymentPeriodEndYear, setModalPaymentPeriodEndYear] =
    useState(2025);
  const [modalBeneficiaries, setModalBeneficiaries] = useState(1);
  const [modalPaymentStatus, setModalPaymentStatus] = useState("paid");
  const [activeFilter, setActiveFilter] = useState("all");

  const handleBack = () => {
    navigateToDashboard();
  }

  const totalSponsorsCount = sponsors.length;
  const paidSponsorsCount = sponsors.filter(
    (s) => s.status === "paid"
  ).length;
  const unpaidSponsorsCount = sponsors.filter(
    (s) => s.status === "unpaid"
  ).length;

  // Fetch sponsors from backend whenever filters change
  useEffect(() => {
    const controller = new AbortController();
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const params = new URLSearchParams({
          startYear: String(startYear),
          startMonth: String(startMonth),
          endYear: String(endYear),
          endMonth: String(endMonth),
          status: paymentStatusFilter,
          search: searchTerm,
        });
        const res = await fetch(`/api/financial/report?${params.toString()}`, {
          signal: controller.signal,
        });
        const contentType = res.headers.get('content-type') || '';
        let payloadText = '';
        try {
          payloadText = await res.text();
        } catch {}
        if (!res.ok) {
          throw new Error(`Request failed: ${res.status} ${payloadText?.slice(0, 200)}`);
        }
        let data;
        if (contentType.includes('application/json')) {
          try {
            data = JSON.parse(payloadText);
          } catch (e) {
            console.error('Failed to parse JSON:', e, payloadText);
            throw new Error('Invalid JSON response from server');
          }
        } else {
          console.error('Unexpected content-type:', contentType, payloadText);
          throw new Error('Server returned non-JSON response');
        }
        setSponsors(Array.isArray(data.sponsors) ? data.sponsors : []);
      } catch (e) {
        if (e.name !== 'AbortError') {
          setError(e.message || 'Failed to load financial report');
          setSponsors([]);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchData();
    return () => controller.abort();
  }, [paymentStatusFilter, startMonth, startYear, endMonth, endYear, searchTerm]);

  // Sort whenever sponsors or sort settings change
  useEffect(() => {
    const data = [...sponsors];
    const sortedData = data.sort((a, b) => {
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
          // lastPayment could be null
          const [monthA, yearA] = (a.lastPayment || "").split(" ");
          const [monthB, yearB] = (b.lastPayment || "").split(" ");
          aValue = monthA && yearA ? new Date(parseInt(yearA), getMonthIndex(monthA)) : new Date(0);
          bValue = monthB && yearB ? new Date(parseInt(yearB), getMonthIndex(monthB)) : new Date(0);
          break;
        default:
          return 0;
      }
      if (typeof aValue === "object" && aValue instanceof Date) {
        return currentSortDirection === "asc"
          ? aValue.getTime() - bValue.getTime()
          : bValue.getTime() - aValue.getTime();
      } else {
        return currentSortDirection === "asc"
          ? String(aValue || '').localeCompare(String(bValue || ''))
          : String(bValue || '').localeCompare(String(aValue || ''));
      }
    });
    setFilteredSponsors(sortedData);
  }, [sponsors, currentSortColumn, currentSortDirection]);

  const generateYearOptions = (reverse = false) => {
    const base = 2025;
    const years = Array.from({ length: 21 }, (_, i) => base - 10 + i);
    const list = reverse ? [...years].reverse() : years;
    return list.map((year) => (
      <option key={year} value={year}>
        {year}
      </option>
    ));
  };

  const getMonthIndex = (monthName) => monthNames.indexOf(monthName);

  const filterAndSortData = () => {};

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
    setModalMonthsPaid(sponsor.paymentHistory.length);
    const latestPayment =
      sponsor.paymentHistory.length > 0
        ? sponsor.paymentHistory[sponsor.paymentHistory.length - 1]
        : null;
    if (latestPayment) {
      setModalPaymentPeriodStartMonth(getMonthIndex(latestPayment.month) + 1);
      setModalPaymentPeriodStartYear(latestPayment.year);
      setModalPaymentPeriodEndMonth(getMonthIndex(latestPayment.month) + 1);
      setModalPaymentPeriodEndYear(latestPayment.year);
    } else {
      setModalPaymentPeriodStartMonth(1);
      setModalPaymentPeriodStartYear(new Date().getFullYear());
      setModalPaymentPeriodEndMonth(12);
      setModalPaymentPeriodEndYear(new Date().getFullYear());
    }
    setModalBeneficiaries(sponsor.beneficiaries);
    setModalPaymentStatus(sponsor.status);
    setIsOverrideModalOpen(true);
  };

  const closeOverrideModal = () => {
    setIsOverrideModalOpen(false);
    setSelectedSponsor(null);
  };

  const saveOverrideChanges = () => {
    if (!selectedSponsor) return;
    const updatedSponsors = filteredSponsors.map((s) => {
      if (s.id === selectedSponsor.id) {
        const newPaymentHistory = [];
        for (let i = 0; i < modalMonthsPaid; i++) {
          newPaymentHistory.push({ month: "Jan", year: 2025, status: "paid" });
        }
        let newLastPayment = s.lastPayment;
        if (modalMonthsPaid > 0) {
          const lastMonth = monthNames[modalPaymentPeriodEndMonth - 1];
          newLastPayment = `${lastMonth} ${modalPaymentPeriodEndYear}`;
        }
        return {
          ...s,
          paymentHistory: newPaymentHistory,
          lastPayment: newLastPayment,
          beneficiaries: modalBeneficiaries,
          status: modalPaymentStatus,
        };
      }
      return s;
    });
    setFilteredSponsors(updatedSponsors);
    alert("Changes saved successfully!");
    closeOverrideModal();
  };

  const years = [2022, 2023, 2024, 2025];

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
  className={`p-4 rounded-lg flex-1 min-w-[200px] shadow-[0_3px_10px_rgba(0,0,0,0.08)] text-center border-l-4 border-[#032990] bg-gradient-to-br from-[#eff6ff] to-[#dbeafe] transition-all duration-200 ${activeFilter === "all" ? "cursor-pointer" : "hover:shadow-lg cursor-pointer"}`}
  onClick={() => {
    setPaymentStatusFilter("all");
    setActiveFilter("all");
  }}          >
            <div className="text-[0.875rem] font-medium text-[#6b7280] mb-2">
              Total Sponsors
            </div>
            <div className="text-[1.875rem] font-bold text-[#3b82f6]">
              {totalSponsorsCount}
            </div>
          </div>
          
          {/* Paid Sponsors Card */}
          <div 
  className={`p-4 rounded-lg flex-1 min-w-[200px] shadow-[0_3px_10px_rgba(0,0,0,0.08)] text-center border-l-4 border-[#039903] bg-gradient-to-br from-[#efffef] to-[#dbfedb] transition-all duration-200 ${activeFilter === "paid" ? "cursor-pointer" : "hover:shadow-lg cursor-pointer"}`}
  onClick={() => {
    setPaymentStatusFilter("paid");
    setActiveFilter("paid");
  }}          >
            <div className="text-[0.875rem] font-medium text-[#6b7280] mb-2">
              Paid Sponsors
            </div>
            <div className="text-[1.875rem] font-bold text-[#10b981]">
              {paidSponsorsCount}
            </div>
          </div>
          
          {/* Unpaid Sponsors Card */}
          <div 
  className={`p-4 rounded-lg flex-1 min-w-[200px] shadow-[0_3px_10px_rgba(0,0,0,0.08)] text-center border-l-4 border-[#990303] bg-gradient-to-br from-[#ffefef] to-[#fedbdb] transition-all duration-200 ${activeFilter === "unpaid" ? "cursor-pointer" : "hover:shadow-lg cursor-pointer"}`}
  onClick={() => {
    setPaymentStatusFilter("unpaid");
    setActiveFilter("unpaid");
  }}          >
            <div className="text-[0.875rem] font-medium text-[#6b7280] mb-2">
              Unpaid Sponsors
            </div>
            <div className="text-[1.875rem] font-bold text-[#ef4444]">
              {unpaidSponsorsCount}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-6 mb-6 items-end">
          

          <div className="flex flex-col flex-1 min-w-[250px] gap-2">
            <label className="font-medium text-[#374151] text-[0.875rem]">
              Date Range
            </label>
            <div className="flex flex-row gap-[0.8rem]">
              <div className="flex flex-col md:flex-row items-start md:items-center gap-[0.7rem]">
                <span className="text-[#374151] text-[0.875rem] min-w-[50px]">
                  Start:
                </span>
                <select
                  id="startMonth"
                  className="flex-1 p-[0.7rem_1rem] border border-[#d1d5db] rounded-[0.5rem] text-[0.9rem] bg-white shadow-[0_1px_2px_0_rgba(0,0,0,0.05)] focus:outline-none focus:border-[#3b82f6] focus:ring-2 focus:ring-[rgba(59,130,246,0.2)] transition-all duration-200 appearance-none bg-[url('data:image/svg+xml;charset=UTF-8,%3csvg%20xmlns=%22http://www.w3.org/2000/svg%22%20viewBox=%220%200%2024%2024%22%20fill=%22none%22%20stroke=%22currentColor%22%20stroke-width=%222%22%20stroke-linecap=%22round%22%20stroke-linejoin=%22round%22%3e%3cpolyline%20points=%226%209%2012%2015%2018%209%22%3e%3c/polyline%3e%3c/svg%3e')] bg-no-repeat bg-[right_0.7rem_center] bg-[length:1em] pr-[2.5rem]"
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
                  id="startYear"
                  className="flex-1 p-[0.7rem_1rem] border border-[#d1d5db] rounded-[0.5rem] text-[0.9rem] bg-white shadow-[0_1px_2px_0_rgba(0,0,0,0.05)] focus:outline-none focus:border-[#3b82f6] focus:ring-2 focus:ring-[rgba(59,130,246,0.2)] transition-all duration-200 appearance-none bg-[url('data:image/svg+xml;charset=UTF-8,%3csvg%20xmlns=%22http://www.w3.org/2000/svg%22%20viewBox=%220%200%2024%2024%22%20fill=%22none%22%20stroke=%22currentColor%22%20stroke-width=%222%22%20stroke-linecap=%22round%22%20stroke-linejoin=%22round%22%3e%3cpolyline%20points=%226%209%2012%2015%2018%209%22%3e%3c/polyline%3e%3c/svg%3e')] bg-no-repeat bg-[right_0.7rem_center] bg-[length:1em] pr-[2.5rem]"
                  value={startYear}
                  onChange={(e) => setStartYear(parseInt(e.target.value))}
                >
                  {generateYearOptions(true)}
                </select>
              </div>
              <div className="flex flex-col md:flex-row items-start md:items-center gap-[0.7rem]">
                <span className="text-[#374151] text-[0.875rem] min-w-[50px]">
                  End:
                </span>
                <select
                  id="endMonth"
                  className="flex-1 p-[0.7rem_1rem] border border-[#d1d5db] rounded-[0.5rem] text-[0.9rem] bg-white shadow-[0_1px_2px_0_rgba(0,0,0,0.05)] focus:outline-none focus:border-[#3b82f6] focus:ring-2 focus:ring-[rgba(59,130,246,0.2)] transition-all duration-200 appearance-none bg-[url('data:image/svg+xml;charset=UTF-8,%3csvg%20xmlns=%22http://www.w3.org/2000/svg%22%20viewBox=%220%200%2024%2024%22%20fill=%22none%22%20stroke=%22currentColor%22%20stroke-width=%222%22%20stroke-linecap=%22round%22%20stroke-linejoin=%22round%22%3e%3cpolyline%20points=%226%209%2012%2015%2018%209%22%3e%3c/polyline%3e%3c/svg%3e')] bg-no-repeat bg-[right_0.7rem_center] bg-[length:1em] pr-[2.5rem]"
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
                  id="endYear"
                  className="flex-1 p-[0.7rem_1rem] border border-[#d1d5db] rounded-[0.5rem] text-[0.9rem] bg-white shadow-[0_1px_2px_0_rgba(0,0,0,0.05)] focus:outline-none focus:border-[#3b82f6] focus:ring-2 focus:ring-[rgba(59,130,246,0.2)] transition-all duration-200 appearance-none bg-[url('data:image/svg+xml;charset=UTF-8,%3csvg%20xmlns=%22http://www.w3.org/2000/svg%22%20viewBox=%220%200%2024%2024%22%20fill=%22none%22%20stroke=%22currentColor%22%20stroke-width=%222%22%20stroke-linecap=%22round%22%20stroke-linejoin=%22round%22%3e%3cpolyline%20points=%226%209%2012%2015%2018%209%22%3e%3c/polyline%3e%3c/svg%3e')] bg-no-repeat bg-[right_0.7rem_center] bg-[length:1em] pr-[2.5rem]"
                  value={endYear}
                  onChange={(e) => setEndYear(parseInt(e.target.value))}
                >
                  {generateYearOptions()}
                </select>
                <div className="w-[1rem]" />
              </div>
            </div>
          </div>

          <div className="flex flex-col flex-1 min-w-[120px] gap-2">
            <label
              htmlFor="search"
              className="font-medium text-[#374151] text-[0.875rem]"
            >
              Search
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6b7280]" />
              <input
                type="text"
                id="search"
                className="pl-10 p-[0.7rem_1rem] w-full border border-[#d1d5db] rounded-[0.5rem] text-[0.9rem] bg-white shadow-[0_1px_2px_0_rgba(0,0,0,0.05)] focus:outline-none focus:border-[#3b82f6] focus:ring-2 focus:ring-[rgba(59,130,246,0.2)] transition-all duration-200"
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

        <div className="overflow-x-auto max-h-[500px] overflow-y-auto border border-[#e5e7eb] rounded-[0.5rem] shadow-[0_1px_3px_0_rgba(0,0,0,0.1)]">
          <table className="min-w-full border-collapse">
            <thead className="bg-[#f9fafb] sticky top-0">
              <tr>
                {[
                  "Sponsor ID",
                  "Sponsor Name",
                  "Phone Number",
                  "Last Paid Month",
                  "Status",
                  "Override",
                ].map((header) => (
                  <th
                    key={header}
                    className={`px-[1.5rem] py-[0.9rem] text-left text-[0.9rem] font-medium text-[#374151] border-b border-[#e5e7eb] sticky top-0 cursor-pointer select-none hover:bg-[#f3f4f6] transition-colors duration-200 ${
                      currentSortColumn === header.split(" ")[0].toLowerCase()
                        ? currentSortDirection === "asc"
                          ? "sorted-asc"
                          : "sorted-desc"
                        : ""
                    }`}
                    onClick={() =>
                      handleSort(header.split(" ")[0].toLowerCase())
                    }
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
                  <td colSpan="6" className="px-[1.5rem] py-[1.1rem] text-center text-[0.95rem] text-[#374151]">
                    Loading...
                  </td>
                </tr>
              ) : filteredSponsors.length === 0 ? (
                <tr>
                  <td
                    colSpan="6"
                    className="px-[1.5rem] py-[1.1rem] text-center text-[0.95rem] text-[#374151]"
                  >
                    No sponsors found for the selected filters.
                  </td>
                </tr>
              ) : (
                filteredSponsors.map((sponsor) => (
                  <tr
                    key={sponsor.id}
                    className={`transition-colors duration-200 ${
                      sponsor.status === "paid"
                        ? "bg-[#ecfdf5]"
                        : "bg-[#fef2f2]"
                    } hover:bg-[#f3f4f6]`}
                  >
                    <td className="px-[1.5rem] py-[1.1rem] whitespace-nowrap text-[0.9rem] font-semibold text-[#1f2937] border-b border-[#f3f4f6]">
                      {sponsor.id}
                    </td>
                    <td className="px-[1.5rem] py-[1.1rem] whitespace-nowrap text-[0.95rem] font-medium text-[#1e40af] border-b border-[#f3f4f6]">
                      {sponsor.name}
                    </td>
                    <td className="px-[1.5rem] py-[1.1rem] whitespace-nowrap text-[0.95rem] text-[#4b5563] border-b border-[#f3f4f6]">
                      {sponsor.phone}
                    </td>
                    <td className="px-[1.5rem] py-[1.1rem] whitespace-nowrap text-[0.95rem] text-[#374151] border-b border-[#f3f4f6]">
                      <div>{sponsor.lastPayment || '—'}</div>
                      <div className="text-[0.85rem] text-[#6b7280] mt-[0.25rem]">
                        {typeof sponsor.monthsPaid === 'number' ? sponsor.monthsPaid : (sponsor.paymentHistory ? sponsor.paymentHistory.length : 0)} months paid
                      </div>
                    </td>
                    <td className="px-[1.5rem] py-[1.1rem] whitespace-nowrap text-[0.95rem] border-b border-[#f3f4f6]">
                      <span
                        className={`px-[0.9rem] py-[0.35rem] inline-flex text-[0.85rem] font-medium rounded-full ${getStatusClasses(
                          sponsor.status
                        )}`}
                      >
                        {sponsor.status.charAt(0).toUpperCase() +
                          sponsor.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-[1.5rem] py-[1.1rem] whitespace-nowrap text-[0.95rem] border-b border-[#f3f4f6]">
                      <button
                        className="p-[0.5rem] rounded-[0.375rem] text-[#3b82f6] hover:bg-[#eff6ff] transition-colors duration-200"
                        onClick={() => openOverrideModal(sponsor)}
                      >
                        <PenSquare className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {isOverrideModalOpen && selectedSponsor && (
          <div
            className="fixed inset-0 flex items-center justify-center z-[1000] p-4"
            style={{ backgroundColor: "rgba(151, 161, 176, 0.6)" }}
          >
            <div
              className="bg-white rounded-[0.5rem] shadow-[0_20px_25px_-5px_rgba(0,0,0,0.1)] w-full max-w-[600px] max-h-[90vh] overflow-y-auto p-8 transform transition-all duration-300 ease-out"
              style={{
                opacity: isOverrideModalOpen ? 1 : 0,
                transform: isOverrideModalOpen
                  ? "translateY(0)"
                  : "translateY(-20px)",
              }}
            >
              <div className="flex justify-between items-center pb-4 mb-4 border-b border-[#e2e8f0]">
                <h2 className="text-[1.5rem] font-semibold text-[#1e40af]">
                  Payment Details
                </h2>
                <button
                  className="text-[#64748b] hover:text-[#1e293b] hover:bg-[#f1f5f9] p-1 rounded-[0.25rem] transition-colors duration-200"
                  onClick={closeOverrideModal}
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="mb-6">
                <div className="flex flex-col md:flex-row items-start md:items-center mb-4">
                  <div className="font-medium w-full md:w-[150px] text-[#374151] mb-2 md:mb-0">
                    Sponsor ID:
                  </div>
                  <div className="text-[#6b7280]">{selectedSponsor.id}</div>
                </div>
                <div className="flex flex-col md:flex-row items-start md:items-center mb-4">
                  <div className="font-medium w-full md:w-[150px] text-[#374151] mb-2 md:mb-0">
                    Sponsor Name:
                  </div>
                  <div className="text-[#6b7280]">{selectedSponsor.name}</div>
                </div>
                <div className="flex flex-col md:flex-row items-start md:items-center mb-4">
                  <div className="font-medium w-full md:w-[150px] text-[#374151] mb-2 md:mb-0">
                    Phone Number:
                  </div>
                  <div className="text-[#6b7280]">{selectedSponsor.phone}</div>
                </div>
                <div className="flex flex-col md:flex-row items-start md:items-center mb-4">
                  <div className="font-medium w-full md:w-[150px] text-[#374151] mb-2 md:mb-0">
                    Last Payment:
                  </div>
                  <div className="text-[#6b7280]">
                    {selectedSponsor.lastPayment}
                  </div>
                </div>
                <div className="flex flex-col md:flex-row items-start md:items-center mb-4">
                  <div className="font-medium w-full md:w-[150px] text-[#374151] mb-2 md:mb-0">
                    Months Paid:
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      className="w-[80px] p-[0.4rem_0.8rem] border border-[#d1d5db] rounded-[0.375rem] text-[0.9rem] focus:outline-none focus:border-[#3b82f6] focus:ring-2 focus:ring-[rgba(59,130,246,0.2)] transition-colors duration-200"
                      min="0"
                      value={modalMonthsPaid}
                      onChange={(e) =>
                        setModalMonthsPaid(parseInt(e.target.value))
                      }
                    />
                    <span className="text-[#6b7280]">months</span>
                  </div>
                </div>
                <div className="flex flex-col md:flex-row items-start md:items-center mb-4">
                  <div className="font-medium w-full md:w-[150px] text-[#374151] mb-2 md:mb-0">
                    Payment Period:
                  </div>
                  <div className="flex flex-wrap gap-2 items-center">
                    <select
                      className="p-[0.4rem_0.8rem] border border-[#d1d5db] rounded-[0.375rem] text-[0.9rem] focus:outline-none focus:border-[#3b82f6] focus:ring-2 focus:ring-[rgba(59,130,246,0.2)] transition-colors duration-200 appearance-none bg-[url('data:image/svg+xml;charset=UTF-8,%3csvg%20xmlns=%22http://www.w3.org/2000/svg%22%20viewBox=%220%200%2024%2024%22%20fill=%22none%22%20stroke=%22currentColor%22%20stroke-width=%222%22%20stroke-linecap=%22round%22%20stroke-linejoin=%22round%22%3e%3cpolyline%20points=%226%209%2012%2015%2018%209%22%3e%3c/polyline%3e%3c/svg%3e')] bg-no-repeat bg-[right_0.7rem_center] bg-[length:1em] pr-[2.5rem]"
                      value={modalPaymentPeriodStartMonth}
                      onChange={(e) =>
                        setModalPaymentPeriodStartMonth(
                          parseInt(e.target.value)
                        )
                      }
                    >
                      {monthNames.map((month, index) => (
                        <option key={month} value={index + 1}>
                          {month}
                        </option>
                      ))}
                    </select>
                    <select
                      className="p-[0.4rem_0.8rem] border border-[#d1d5db] rounded-[0.375rem] text-[0.9rem] focus:outline-none focus:border-[#3b82f6] focus:ring-2 focus:ring-[rgba(59,130,246,0.2)] transition-colors duration-200 appearance-none bg-[url('data:image/svg+xml;charset=UTF-8,%3csvg%20xmlns=%22http://www.w3.org/2000/svg%22%20viewBox=%220%200%2024%2024%22%20fill=%22none%22%20stroke=%22currentColor%22%20stroke-width=%222%22%20stroke-linecap=%22round%22%20stroke-linejoin=%22round%22%3e%3cpolyline%20points=%226%209%2012%2015%2018%209%22%3e%3c/polyline%3e%3c/svg%3e')] bg-no-repeat bg-[right_0.7rem_center] bg-[length:1em] pr-[2.5rem]"
                      value={modalPaymentPeriodStartYear}
                      onChange={(e) =>
                        setModalPaymentPeriodStartYear(parseInt(e.target.value))
                      }
                    >
                      {years.map((year) => (
                        <option key={year} value={year}>
                          {year}
                        </option>
                      ))}
                    </select>
                    <span className="text-[#6b7280]">to</span>
                    <select
                      className="p-[0.4rem_0.8rem] border border-[#d1d5db] rounded-[0.375rem] text-[0.9rem] focus:outline-none focus:border-[#3b82f6] focus:ring-2 focus:ring-[rgba(59,130,246,0.2)] transition-colors duration-200 appearance-none bg-[url('data:image/svg+xml;charset=UTF-8,%3csvg%20xmlns=%22http://www.w3.org/2000/svg%22%20viewBox=%220%200%2024%2024%22%20fill=%22none%22%20stroke=%22currentColor%22%20stroke-width=%222%22%20stroke-linecap=%22round%22%20stroke-linejoin=%22round%22%3e%3cpolyline%20points=%226%209%2012%2015%2018%209%22%3e%3c/polyline%3e%3c/svg%3e')] bg-no-repeat bg-[right_0.7rem_center] bg-[length:1em] pr-[2.5rem]"
                      value={modalPaymentPeriodEndMonth}
                      onChange={(e) =>
                        setModalPaymentPeriodEndMonth(parseInt(e.target.value))
                      }
                    >
                      {monthNames.map((month, index) => (
                        <option key={month} value={index + 1}>
                          {month}
                        </option>
                      ))}
                    </select>
                    <select
                      className="p-[0.4rem_0.8rem] border border-[#d1d5db] rounded-[0.375rem] text-[0.9rem] focus:outline-none focus:border-[#3b82f6] focus:ring-2 focus:ring-[rgba(59,130,246,0.2)] transition-colors duration-200 appearance-none bg-[url('data:image/svg+xml;charset=UTF-8,%3csvg%20xmlns=%22http://www.w3.org/2000/svg%22%20viewBox=%220%200%2024%2024%22%20fill=%22none%22%20stroke=%22currentColor%22%20stroke-width=%222%22%20stroke-linecap=%22round%22%20stroke-linejoin=%22round%22%3e%3cpolyline%20points=%226%209%2012%2015%2018%209%22%3e%3c/polyline%3e%3c/svg%3e')] bg-no-repeat bg-[right_0.7rem_center] bg-[length:1em] pr-[2.5rem]"
                      value={modalPaymentPeriodEndYear}
                      onChange={(e) =>
                        setModalPaymentPeriodEndYear(parseInt(e.target.value))
                      }
                    >
                      {years.map((year) => (
                        <option key={year} value={year}>
                          {year}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="flex flex-col md:flex-row items-start md:items-center mb-4">
                  <div className="font-medium w-full md:w-[150px] text-[#374151] mb-2 md:mb-0">
                    Number of Beneficiaries:
                  </div>
                  <input
                    type="number"
                    className="w-[80px] p-[0.4rem_0.8rem] border border-[#d1d5db] rounded-[0.375rem] text-[0.9rem] focus:outline-none focus:border-[#3b82f6] focus:ring-2 focus:ring-[rgba(59,130,246,0.2)] transition-colors duration-200"
                    min="1"
                    value={modalBeneficiaries}
                    onChange={(e) =>
                      setModalBeneficiaries(parseInt(e.target.value))
                    }
                  />
                </div>
                <div className="flex flex-col md:flex-row items-start md:items-center mb-4">
                  <div className="font-medium w-full md:w-[150px] text-[#374151] mb-2 md:mb-0">
                    Payment Status:
                  </div>
                  <select
                    className="p-[0.4rem_0.8rem] border border-[#d1d5db] rounded-[0.375rem] text-[0.9rem] focus:outline-none focus:border-[#3b82f6] focus:ring-2 focus:ring-[rgba(59,130,246,0.2)] transition-colors duration-200 appearance-none bg-[url('data:image/svg+xml;charset=UTF-8,%3csvg%20xmlns=%22http://www.w3.org/2000/svg%22%20viewBox=%220%200%2024%2024%22%20fill=%22none%22%20stroke=%22currentColor%22%20stroke-width=%222%22%20stroke-linecap=%22round%22%20stroke-linejoin=%22round%22%3e%3cpolyline%20points=%226%209%2012%2015%2018%209%22%3e%3c/polyline%3e%3c/svg%3e')] bg-no-repeat bg-[right_0.7rem_center] bg-[length:1em] pr-[2.5rem]"
                    value={modalPaymentStatus}
                    onChange={(e) => setModalPaymentStatus(e.target.value)}
                  >
                    <option value="paid">Paid</option>
                    <option value="unpaid">Unpaid</option>
                  </select>
                </div>
              </div>
              <div className="pt-4 border-t border-[#e2e8f0] text-[0.9rem] text-[#6b7280]">
                <p>
                  Confirmed by:{" "}
                  <strong className="text-[#374151]">Database Officer</strong>{" "}
                  on{" "}
                  <span>
                    {new Date().toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                </p>
              </div>
              <div className="flex justify-end gap-4 mt-6">
                <button
                  className="px-[1.2rem] py-[0.6rem] bg-[#f3f4f6] text-[#374151] rounded-[0.375rem] font-medium hover:bg-[#e5e7eb] transition-colors duration-200"
                  onClick={closeOverrideModal}
                >
                  Cancel
                </button>
                <button
                  className="px-[1.2rem] py-[0.6rem] bg-[#10b981] text-white rounded-[0.375rem] font-medium hover:bg-[#059669] transition-colors duration-200"
                  onClick={saveOverrideChanges}
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FinancialReport;
