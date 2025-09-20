import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Search, ChevronUp, ChevronDown } from "lucide-react";

const EmployeeList = () => {
  const navigate = useNavigate();
  const [allEmployees, setAllEmployees] = useState([]);
  const [displayedEmployees, setDisplayedEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchInput, setSearchInput] = useState("");
  const [currentSortColumn, setCurrentSortColumn] = useState(0);
  const [currentSortDirection, setCurrentSortDirection] = useState("asc");
  const [openDropdown, setOpenDropdown] = useState(null);

  // Fetch ALL data from backend (without search initially)
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `http://localhost:5000/api/employees`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch data");
        }

        const data = await response.json();
        setAllEmployees(data.employees || []);
        setDisplayedEmployees(data.employees || []);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching employees:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchEmployees();
  }, []);

  // Filter and sort based on current criteria
  useEffect(() => {
    if (!allEmployees.length) return;

    let filteredData = allEmployees.filter((employee) => {
      return searchInput === "" ||
        (employee.employeeName && employee.employeeName.toLowerCase().includes(searchInput.toLowerCase())) ||
        (employee.phone && employee.phone.toLowerCase().includes(searchInput.toLowerCase())) ||
        (employee.email && employee.email.toLowerCase().includes(searchInput.toLowerCase())) ||
        (employee.access_level && employee.access_level.toLowerCase().includes(searchInput.toLowerCase()));
    });

    // Sort the filtered data
    const sortedData = [...filteredData].sort((a, b) => {
      let aValue, bValue;

      switch (currentSortColumn) {
        case 0:
          aValue = a.employeeName || "";
          bValue = b.employeeName || "";
          break;
        case 1:
          aValue = a.phone || "";
          bValue = b.phone || "";
          break;
        case 2:
          aValue = a.email || "";
          bValue = b.email || "";
          break;
        case 3:
          aValue = a.access_level || "";
          bValue = b.access_level || "";
          break;
        default:
          aValue = a.employeeName || "";
          bValue = b.employeeName || "";
      }

      return currentSortDirection === "asc"
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    });

    setDisplayedEmployees(sortedData);
  }, [allEmployees, searchInput, currentSortColumn, currentSortDirection]);

  // Calculate statistics based on ALL employees
  const totalEmployees = allEmployees.length;
  const totalDatabaseOfficers = allEmployees.filter(
    (emp) => emp.access_level === "database_officer"
  ).length;
  const totalAdministrators = allEmployees.filter(
    (emp) => emp.access_level === "admin"
  ).length;
  const totalCoordinators = allEmployees.filter(
    (emp) => emp.access_level === "coordinator"
  ).length;

  const handleSort = (columnIndex) => {
    if (columnIndex === currentSortColumn) {
      setCurrentSortDirection(currentSortDirection === "asc" ? "desc" : "asc");
    } else {
      setCurrentSortColumn(columnIndex);
      setCurrentSortDirection("asc");
    }
    setOpenDropdown(null);
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

  const getAccessClasses = (access) => {
    switch (access) {
      case "Administrator":
        return "bg-[#e8eaf6] text-[#283593]";
      case "Coordinator":
        return "bg-[#e8eaf6] text-[#283593]";
      case "Database Officer":
        return "bg-[#e8eaf6] text-[#283593]";
      default:
        return "bg-[#f8fafc] text-[#1e293b]";
    }
  };

  const handleAccessChange = async (employeeId, newAccess) => {
    try {
      const response = await fetch(`http://localhost:5000/api/employees/${employeeId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ access_level: newAccess }),
      });

      if (!response.ok) {
        throw new Error('Failed to update access level');
      }

      // Update both local states
      setAllEmployees(prevEmployees =>
        prevEmployees.map(emp =>
          emp.id === employeeId ? { ...emp, access: newAccess } : emp
        )
      );
      setDisplayedEmployees(prevEmployees =>
        prevEmployees.map(emp =>
          emp.id === employeeId ? { ...emp, access: newAccess } : emp
        )
      );
    } catch (error) {
      console.error('Error updating access level:', error);
      alert('Failed to update access level');
    }
    setOpenDropdown(null);
  };

  const handleBack = () => {
    navigate("/admin_dashboard");
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (openDropdown && !event.target.closest(".dropdown-container")) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [openDropdown]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f5f7fa] p-8 text-[#1e293b] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#032990] mx-auto"></div>
          <p className="mt-4 text-lg">Loading employees...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#f5f7fa] p-8 text-[#1e293b] flex items-center justify-center">
        <div className="text-center text-red-600">
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
    <div className="min-h-screen bg-[#f5f7fa] p-4 sm:p-6 lg:p-8 font-inter text-[#1e293b]">
      <div className="container mx-auto bg-[#ffffff] rounded-xl shadow-[0_5px_15px_rgba(0,0,0,0.08)] p-4 sm:p-6 lg:p-8 flex flex-col h-[90vh]">
        <div className="flex items-center mb-6 gap-4">
          <button
            onClick={handleBack}
            className="flex items-center justify-center w-12 h-12 bg-[#ffffff] text-[#032990] rounded-lg shadow-[0_4px_8px_rgba(0,0,0,0.1)] transition-all duration-300 border-2 border-[#f0f3ff] hover:bg-[#032990] hover:text-white group"
          >
            <ArrowLeft className="w-6 h-6 stroke-[#032990] transition-colors duration-300 group-hover:stroke-white" />
          </button>
          <h1 className="text-[#032990] font-bold text-3xl m-0">
            Employees
          </h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="p-4 rounded-lg flex-1 min-w-[200px] shadow-sm border-l-4 border-[#032990] bg-gradient-to-br from-[#f0f3ff] to-[#e6eeff] text-center">
            <div className="text-3xl font-bold text-[#032990]">
              {totalEmployees}
            </div>
            <div className="text-sm text-[#64748b]">Total Employees</div>
          </div>
          <div className="p-4 rounded-lg flex-1 min-w-[200px] shadow-sm border-l-4 border-[#032990] bg-gradient-to-br from-[#f极f3ff] to-[#e6eeff] text-center">
            <div className="text-3xl font-bold text-[#032990]">
              {totalDatabaseOfficers}
            </div>
            <div className="text-sm text-[#64748b]">Database Officers</div>
          </div>
          <div className="p-4 rounded-lg flex-1 min-w-[200px] shadow-sm border-l-4 border-[#032990] bg-gradient-to-br from-[#f0f3ff] to-[#e6eeff] text-center">
            <div className="text-3xl font-bold text-[#032990]">
              {totalAdministrators}
            </div>
            <div className="text-sm text-[#64748b]">Administrators</div>
          </div>
          <div className="p-4 rounded-lg flex极1 min-w-[200px] shadow-sm border-l-4 border-[#032990] bg-gradient-to-br from-[#f0f3ff] to-[#e6eeff] text-center">
            <div className="text-3xl font-bold text-[#032990]">
              {totalCoordinators}
            </div>
            <div className="text-sm text-[#64748b]">Coordinators</div>
          </div>
        </div>

        <div className="flex flex-wrap gap-4 mb-6 items-center">
          <div className="relative flex-1 min-w-[300px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#64748b]" />
            <input
              type="text"
              id="searchInput"
              className="pl-10 p-3.5 w-full border border-[#cfd8dc] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#EAA108] focus:border-transparent transition-all duration-200 shadow-sm"
              placeholder="Search by name, phone number, or access..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto flex-1 border border-[#e2e8f0] rounded-lg shadow-sm">
          <table className="min-w-full border-separate border-spacing-0">
            <thead className="bg-[#f0f3ff] sticky top-0">
              <tr>
                {[
                  "Employee Name",
                  "Phone Number",
                  "Email",
                  "Access Given",
                ].map((header, index) => (
                  <th
                    key={header}
                    className="px-4 py-3 text-left text-sm font-semib极l text-[#032990] uppercase tracking-wider cursor-pointer hover:bg-[#e0e8ff] transition-colors duration-200"
                    onClick={() => handleSort(index)}
                  >
                    {header}
                    {getSortIndicator(index)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-[#ffffff]">
              {displayedEmployees.map((employee) => (
                <tr
                  key={employee.id}
                  className="hover:bg-[#fff7ea] transition-colors duration-200 even:bg-[#f8fafc]"
                >
                  <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-[#1a1a1a] border-b border-[#e2e8f0]">
                    {employee.employeeName}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-[#1e293b] border-b border-[#e2e8f0]">
                    {employee.phone || 'N/A'}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-[#1e293b] border-b border-[#e2e8f0]">
                    {employee.email || 'N/A'}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-[#1e293b] border-b border-[#e2e8f0]">
                    <div className="relative inline-block text-left dropdown-container">
                      <span
                        className={`px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full cursor-pointer ${getAccessClasses(
                          employee.access
                        )}`}
                        onClick={() =>
                          setOpenDropdown(
                            openDropdown === `access-${employee.id}`
                              ? null
                              : `access-${employee.id}`
                          )
                        }
                      >
                        {employee.access_level || 'N/A'}
                      </span>
                      {openDropdown === `access-${employee.id}` && (
                        <div className="origin-top-right absolute left-0 mt-2 w-40 rounded-md shadow-lg bg-[#ffffff] ring-1 ring-black ring-opacity-5 focus:outline-none z-20">
                          <div
                            className="py-1"
                            role="menu"
                            aria-orientation="vertical"
                            aria-labelledby="options-menu"
                          >
                            {[
                              "admin",
                              "coordinator",
                              "database_officer",
                            ].map((accessLevel) => (
                              <button
                                key={accessLevel}
                                className="block w-full text-left px-4 py-2 text-sm text-[#1e293b] hover:bg-[#f8fafc] hover:text-[#1a1a1a]"
                                role="menuitem"
                                onClick={() =>
                                  handleAccessChange(employee.id, accessLevel)
                                }
                              >
                                {accessLevel}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {displayedEmployees.length === 0 && (
                <tr>
                  <td colSpan="4" className="px-4 py-8 text-center text-gray-500">
                    No employees found matching your criteria.
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

export default EmployeeList;
