import React, { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  ArrowLeft,
  Search,
  ChevronUp,
  ChevronDown,
  Download,
  RefreshCw
} from "lucide-react";

const BeneficiaryList = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [beneficiaries, setBeneficiaries] = useState([]);
  const [filteredBeneficiaries, setFilteredBeneficiaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchInput, setSearchInput] = useState("");
  const [currentSortColumn, setCurrentSortColumn] = useState(0);
  const [currentSortDirection, setCurrentSortDirection] = useState("asc");
  const [currentView, setCurrentView] = useState("all");
  const [refreshing, setRefreshing] = useState(false);

  // Function to parse view parameter from URL
  const getViewFromParams = () => {
    const viewParam = searchParams.get('view');
    switch (viewParam) {
      case 'waiting':
        return 'waiting_list';
      case 'terminated':
        return 'terminated';
      case 'graduated':
        return 'graduated';
      case 'reassign':
        return 'pending_reassignment';
      case 'all':
        return 'all';
      default:
        return 'all';
    }
  };

  // Fetch beneficiaries from backend
  const fetchBeneficiaries = async (view) => {
    try {
      setLoading(true);
      setRefreshing(true);
      
      // Always fetch all beneficiaries to get accurate counts for all cards
      const response = await fetch('http://localhost:5000/api/beneficiaries');

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        if (errorData.error === 'Database query error' && errorData.details?.includes('Sponsor')) {
          throw new Error("Database configuration error. Please contact the administrator.");
        }
        throw new Error(errorData.message || "Failed to fetch data");
      }

      const data = await response.json();
      setBeneficiaries(data.beneficiaries || []);
      
      // Apply initial filtering based on the view
      let filteredData = data.beneficiaries || [];
      if (view && view !== "all") {
        filteredData = filteredData.filter(item => item.status === view);
      }
      
      setFilteredBeneficiaries(filteredData);
    } catch (err) {
      setError(err.message);
      console.error("Error fetching beneficiaries:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Handle URL query parameters on initial load
  useEffect(() => {
    const initialView = getViewFromParams();
    setCurrentView(initialView);
    fetchBeneficiaries(initialView);
  }, []);

  // Handle URL parameter changes after initial load
  useEffect(() => {
    const viewParam = getViewFromParams();
    if (viewParam !== currentView) {
      setCurrentView(viewParam);
      
      // Filter the existing data based on the new view
      let filteredData = [...beneficiaries];
      if (viewParam && viewParam !== "all") {
        filteredData = filteredData.filter(item => item.status === viewParam);
      }
      
      setFilteredBeneficiaries(filteredData);
    }
  }, [searchParams]);

  // Filter and sort based on current criteria
  useEffect(() => {
    if (!beneficiaries.length) return;

    let data = [...beneficiaries];

    // Filter by current view
    if (currentView !== "all") {
      data = data.filter((item) => item.status === currentView);
    }

    // Search filter
    const searchTermLower = searchInput.toLowerCase();
    if (searchTermLower) {
      data = data.filter(
        (item) =>
          item.full_name.toLowerCase().includes(searchTermLower) ||
          (item.guardian_name && item.guardian_name.toLowerCase().includes(searchTermLower)) ||
          (item.phone && item.phone.toLowerCase().includes(searchTermLower))
      );
    }

    // Sort the data
    const sortedData = [...data].sort((a, b) => {
      let aValue, bValue;

      switch (currentSortColumn) {
        case 0:
          aValue = a.full_name;
          bValue = b.full_name;
          break;
        case 1:
          aValue = a.guardian_name || "";
          bValue = b.guardian_name || "";
          break;
        case 2:
          aValue = a.age || 0;
          bValue = b.age || 0;
          break;
        case 3:
          aValue = a.gender || "";
          bValue = b.gender || "";
          break;
        case 4:
          aValue = a.phone || "";
          bValue = b.phone || "";
          break;
        case 5:
          aValue = a.status;
          bValue = b.status;
          break;
        case 6:
          aValue = a.type;
          bValue = b.type;
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
  }, [
    beneficiaries,
    searchInput,
    currentView,
    currentSortColumn,
    currentSortDirection
  ]);

  const handleSort = (columnIndex) => {
    if (columnIndex === currentSortColumn) {
      setCurrentSortDirection(currentSortDirection === "asc" ? "desc" : "asc");
    } else {
      setCurrentSortColumn(columnIndex);
      setCurrentSortDirection("asc");
    }
  };

  // Function to handle row click and navigate to beneficiary details
  const handleRowClick = (beneficiaryId, beneficiaryData) => {
    navigate(`/specific_beneficiary/${beneficiaryId}`, {
      state: { beneficiary: beneficiaryData }
    });
  };

  const getSortIndicator = (columnIndex) =>
    columnIndex === currentSortColumn ? (
      currentSortDirection === "asc" ? (
        <ChevronUp className="w-4 h-4 inline ml-1" />
      ) : (
        <ChevronDown className="w-4 h-4 inline ml-1" />
      )
    ) : null;

  const getGenderClasses = (gender) => {
    if (!gender) return "bg-gray-100 text-gray-800";
    
    return gender.toLowerCase() === "male"
      ? "bg-[#e0f2ff] text-[#0066cc]"
      : "bg-[#ffe6f2] text-[#cc0066]";
  };

  const getStatusClasses = (status) => {
    if (!status) return "bg-gray-100 text-gray-800";
    
    switch (status) {
      case "active":
        return "bg-[#e6f4ea] text-[#137333]";
      case "waiting_list":
        return "bg-[#fef7e0] text-[#b06000]";
      case "pending_reassignment":
        return "bg-[#ffebee] text-[#c5221f]";
      case "terminated":
        return "bg-[#fce8e6] text-[#c5221f]";
      case "graduated":
        return "bg-[#e8f0fe] text-[#0842a0]";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIndicatorClasses = (view) => {
    switch (view) {
      case "waiting_list":
        return "bg-[#fef7e0] text-[#b06000]";
      case "pending_reassignment":
        return "bg-[#ffebee] text-[#c5221f]";
      case "terminated":
        return "bg-[#fce8e6] text-[#c5221f]";
      case "graduated":
        return "bg-[#e8f0fe] text-[#0842a0]";
      case "active":
        return "bg-[#e6f4ea] text-[#137333]";
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
      case "waiting_list":
        return `${baseClasses} border-[#b06000] bg-gradient-to-br from-[#fffbeb] to-[#fef3c7]`;
      case "pending_reassignment":
        return `${baseClasses} border-[#c5221f] bg-gradient-to-br from-[#fef2f2] to-[#fee2e2]`;
      case "terminated":
        return `${baseClasses} border-[#c5221f] bg-gradient-to-br from-[#fef2f2] to-[#fee2e2]`;
      case "graduated":
        return `${baseClasses} border-[#0842a0] bg-gradient-to-br from-[#eff6ff] to-[#dbeafe]`;
      case "elderly":
        return `${baseClasses} border-[#6b46c1] bg-gradient-to-br from-[#faf5ff] to-[#ede9fe]`;
      case "child":
        return `${baseClasses} border-[#0d9488] bg-gradient-to-br from-[#f0fdfa] to-[#ccfbf1]`;
      case "active":
        return `${baseClasses} border-[#137333] bg-gradient-to-br from-[#e6f4ea] to-[#ceead6]`;
      default:
        return `${baseClasses} border-[#032990] bg-gradient-to-br from-[#f8fafc] to-[#ffffff]`;
    }
  };

  // Calculate statistics from all beneficiaries (not just filtered ones)
  const totalBeneficiaries = beneficiaries.length;
  const activeBeneficiaries = beneficiaries.filter(
    (item) => item.status === "active"
  ).length;
  const waitingListBeneficiaries = beneficiaries.filter(
    (item) => item.status === "waiting_list"
  ).length;
  const pendingReassignmentBeneficiaries = beneficiaries.filter(
    (item) => item.status === "pending_reassignment"
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

  const handleExportData = () => {
    alert(`Exporting ${filteredBeneficiaries.length} records`);
  };

  const handleRefresh = () => {
    fetchBeneficiaries(currentView);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f5f7fa] p-8 text-[#1e293b] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#032990] mx-auto"></div>
          <p className="mt-4 text-lg">Loading beneficiaries...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#f5f7fa] p-8 text-[#1e293b] flex items-center justify-center">
        <div className="text-center text-[#0066cc]">
          <p className="text-lg">Error: {error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-6 py-2 bg-[#032990] text-white rounded-lg hover:bg-[#021f70]"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f7fa] p-4 sm:p-6 lg:p-8 font-poppins text-[#032990]">
      <div className="container mx-auto bg-[#ffffff] rounded-xl shadow-[0_5px_15px_rgba(0,0,0,0.08)] p-4 sm:p-6 lg:p-8 flex flex-col h-[90vh]">
        <div className="flex items-center mb-6 gap-4">
          <Link
            to="/admin_dashboard"
            className="flex items-center justify-center w-12 h-12 bg-[#ffffff] text-[#032990] rounded-lg shadow-[0_4px_8px_rgba(0,0,0,0.1)] transition-all duration-300 group border-2 border-[#f0f3ff] hover:bg-[#032990] hover:shadow-[0_6px_12px_rgba(0,0,0,0.15)] hover:-translate-y-0.5"
          >
            <ArrowLeft className="w-6 h-6 stroke-[#032990] group-hover:stroke-[#ffffff] transition-colors duration-300" />
          </Link>

          <h1 className="text-3xl font-bold text-[#032990]">
            Beneficiary Management
            <span
              className={`ml-3 px-3 py-1 inline-flex text-base leading-5 font-semibold rounded-full ${getStatusIndicatorClasses(
                currentView
              )}`}
            >
              {currentView === "all"
                ? "All Beneficiaries"
                : currentView === "active"
                ? "Active"
                : currentView === "waiting_list"
                ? "Waiting List"
                : currentView === "pending_reassignment"
                ? "Needs Reassigning"
                : currentView === "terminated"
                ? "Terminated List"
                : currentView === "graduated"
                ? "Graduated List"
                : "All Beneficiaries"}
            </span>
          </h1>

          <button
            onClick={handleRefresh}
            className={`ml-auto flex items-center gap-2 px-4 py-2 bg-[#f0f3ff] text-[#032990] rounded-lg font-medium hover:bg-[#e0e8ff] transition-colors duration-300 ${
              refreshing ? "opacity-50 cursor-not-allowed" : ""
            }`}
            disabled={refreshing}
          >
            <RefreshCw className={`w-5 h-5 ${refreshing ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-4 mb-6">
          {/* Always show the Total Beneficiaries card */}
          <div
            className={getStatCardClasses("inactive")}
            onClick={() => {
              setCurrentView("all");
              setSearchParams({ view: "all" });
            }}
          >
            <div className="text-3xl font-bold text-[#032990]">
              {totalBeneficiaries}
            </div>
            <div className="text-sm text-[#64748b]">Total Beneficiaries</div>
          </div>
          
          {/* Show all cards when "All" is selected, otherwise only show the relevant card */}
          {currentView === "all" ? (
            <>
              <div
                className={getStatCardClasses("active")}
                onClick={() => {
                  setCurrentView("active");
                  setSearchParams({});
                }}
              >
                <div className="text-3xl font-bold text-[#032990]">
                  {activeBeneficiaries}
                </div>
                <div className="text-sm text-[#64748b]">Active</div>
              </div>
              
              <div
                className={getStatCardClasses("waiting_list")}
                onClick={() => {
                  setCurrentView("waiting_list");
                  setSearchParams({ view: "waiting" });
                }}
              >
                <div className="text-3xl font-bold text-[#032990]">
                  {waitingListBeneficiaries}
                </div>
                <div className="text-sm text-[#64748b]">Waiting List</div>
              </div>
              
              <div
                className={getStatCardClasses("pending_reassignment")}
                onClick={() => {
                  setCurrentView("pending_reassignment");
                  setSearchParams({ view: "reassign" });
                }}
              >
                <div className="text-3xl font-bold text-[#032990]">
                  {pendingReassignmentBeneficiaries}
                </div>
                <div className="text-sm text-[#64748b]">Needs Reassigning</div>
              </div>
              
              <div
                className={getStatCardClasses("terminated")}
                onClick={() => {
                  setCurrentView("terminated");
                  setSearchParams({ view: "terminated" });
                }}
              >
                <div className="text-3xl font-bold text-[#032990]">
                  {terminatedBeneficiaries}
                </div>
                <div className="text-sm text-[#64748b]">Terminated</div>
              </div>
              
              <div
                className={getStatCardClasses("graduated")}
                onClick={() => {
                  setCurrentView("graduated");
                  setSearchParams({ view: "graduated" });
                }}
              >
                <div className="text-3xl font-bold text-[#032990]">
                  {graduatedBeneficiaries}
                </div>
                <div className="text-sm text-[#64748b]">Graduated</div>
              </div>
              
              
            </>
          ) : (
            // Show only the relevant card when a specific status is selected
            <>
              {currentView === "active" && (
                <div
                  className={getStatCardClasses("active")}
                  onClick={() => {
                    setCurrentView("active");
                    setSearchParams({});
                  }}
                >
                  <div className="text-3xl font-bold text-[#032990]">
                    {activeBeneficiaries}
                  </div>
                  <div className="text-sm text-[#64748b]">Active</div>
                </div>
              )}
              
              {currentView === "waiting_list" && (
                <div
                  className={getStatCardClasses("waiting_list")}
                  onClick={() => {
                    setCurrentView("waiting_list");
                    setSearchParams({ view: "waiting" });
                  }}
                >
                  <div className="text-3xl font-bold text-[#032990]">
                    {waitingListBeneficiaries}
                  </div>
                  <div className="text-sm text-[#64748b]">Waiting List</div>
                </div>
              )}
              
              {currentView === "pending_reassignment" && (
                <div
                  className={getStatCardClasses("pending_reassignment")}
                  onClick={() => {
                    setCurrentView("pending_reassignment");
                    setSearchParams({ view: "reassign" });
                  }}
                >
                  <div className="text-3xl font-bold text-[#032990]">
                    {pendingReassignmentBeneficiaries}
                  </div>
                  <div className="text-sm text-[#64748b]">Needs Reassigning</div>
                </div>
              )}
              
              {currentView === "terminated" && (
                <div
                  className={getStatCardClasses("terminated")}
                  onClick={() => {
                    setCurrentView("terminated");
                    setSearchParams({ view: "terminated" });
                  }}
                >
                  <div className="text-3xl font-bold text-[#032990]">
                    {terminatedBeneficiaries}
                  </div>
                  <div className="text-sm text-[#64748b]">Terminated</div>
                </div>
              )}
              
              {currentView === "graduated" && (
                <div
                  className={getStatCardClasses("graduated")}
                  onClick={() => {
                    setCurrentView("graduated");
                    setSearchParams({ view: "graduated" });
                  }}
                >
                  <div className="text-3xl font-bold text-[#032990]">
                    {graduatedBeneficiaries}
                  </div>
                  <div className="text-sm text-[#64748b]">Graduated</div>
                </div>
              )}
            </>
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

          <div className="flex gap-2.5 ml-auto">
            <button
              className="flex items-center gap-1 px-4 py-2.5 bg-[#EAA108] text-[#ffffff] rounded-lg font-medium hover:bg-[#d19107] transition-colors duration-300 shadow-[0_2px_5px_rgba(0,0,0,0.05)]"
              onClick={handleExportData}
            >
              <Download className="w-5 h-5" />
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
                  "Type"
                ].map((header, index) => (
                  <th
                    key={header}
                    className={`px-6 py-4 text-left text-sm font-semibold text-[#032990] uppercase tracking-wider cursor-pointer hover:bg-[#e0e8ff] transition-colors duration-200 ${
                      index === 0
                        ? "rounded-tl-lg"
                        : index === 6
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
              {filteredBeneficiaries.length > 0 ? (
                filteredBeneficiaries.map((beneficiary) => (
                  <tr
                    key={beneficiary.id}
                    className={`hover:bg-[#fff7ea] transition-colors duration-200 even:bg-[#f8fafc] cursor-pointer ${
                      beneficiary.status === "pending_reassignment"
                        ? "bg-[#ffebee] hover:bg-[#ffcdd2]"
                        : ""
                    }`}
                    onClick={() => handleRowClick(beneficiary.id, beneficiary)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-[#1a1a1a]">
                      {beneficiary.full_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#444]">
                      {beneficiary.guardian_name || "-"}
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
                        {beneficiary.gender?.charAt(0)?.toUpperCase() + beneficiary.gender?.slice(1) || "-"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#444]">
                      {beneficiary.phone || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span
                        className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClasses(
                          beneficiary.status
                        )}`}
                      >
                        {beneficiary.status?.charAt(0)?.toUpperCase() + beneficiary.status?.slice(1)?.replace(/_/g, " ") || "-"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span
                        className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          beneficiary.type === "child" 
                            ? "bg-[#e0f2ff] text-[#0066cc]" 
                            : "bg-[#f0f3ff] text-[#64748b]"
                        }`}
                      >
                        {beneficiary.type?.charAt(0)?.toUpperCase() + beneficiary.type?.slice(1) || "-"}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center text-sm text-gray-500">
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

export default BeneficiaryList;