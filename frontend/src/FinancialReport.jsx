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
  LinkIcon,
  RefreshCw
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
  const [activeFilter, setActiveFilter] = useState("all");

  const handleBack = () => {
    navigateToDashboard();
  }

  const handleRefresh = () => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/financial/report?status=all');
        if (response.ok) {
          const data = await response.json();
          setSponsors(data.sponsors || []);
        } else {
          throw new Error('Failed to fetch financial report');
        }
      } catch (err) {
        setError(err.message);
        console.error("Error fetching financial report:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  };

  const totalSponsorsCount = sponsors.length;
  const paidSponsorsCount = sponsors.filter((s) => s.status === "paid").length;
  const unpaidSponsorsCount = sponsors.filter((s) => s.status === "unpaid").length;

  // Simple data fetch - replace with your API call
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch real financial report data
        const response = await fetch('/api/financial/report?status=all');
        if (response.ok) {
          const data = await response.json();
          setSponsors(data.sponsors || []);
        } else {
          throw new Error('Failed to fetch financial report');
        }
      } catch (err) {
        setError(err.message);
        console.error("Error fetching financial report:", err);
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

  const generateYearOptions = () => {
    const years = [2023, 2024, 2025, 2026, 2027];
    return years.map((year) => (
      <option key={year} value={year}>
        {year}
      </option>
    ));
  };

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
                {["Sponsor ID", "Sponsor Name", "Phone Number", "Last Paid Month", "Status"].map((header) => (
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
                  <td colSpan="5" className="px-6 py-4 text-center text-[#374151]">
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#032990]"></div>
                      <span className="ml-2">Loading sponsors...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredSponsors.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-4 text-center text-[#374151]">
                    No sponsors found for the selected filters.
                  </td>
                </tr>
              ) : (
                filteredSponsors.map((sponsor) => (
                  <tr 
                    key={sponsor.id} 
                    className="border-b border-[#f3f4f6] hover:bg-[#f9fafb] cursor-pointer"
                    onClick={() => navigate(`/sponsors/${sponsor.cluster_id}/${sponsor.specific_id}`)}
                  >
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
                        {/* Show total contribution and months supported */}
                        {sponsor.totalContribution ? `${sponsor.totalContribution.toFixed(2)} birr` : '0.00 birr'} • {sponsor.monthsSupported || 0} months total
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 inline-flex items-center text-[0.85rem] font-medium rounded-full ${getStatusClasses(sponsor.status)}`}>
                        <CreditCard className="w-3 h-3 mr-1" />
                        {sponsor.status.charAt(0).toUpperCase() + sponsor.status.slice(1)}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
};

export default FinancialReport;
