import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Disclosure } from "@headlessui/react";
import ProfileModal from "./ProfileModal"; 
import maryJoyLogo from "../../matjoylogo.jpg";
import {
  LayoutDashboard,
  ChevronDown,
  Menu,
  User,
  Bell,
  X,
  Plus,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  UserPlus,
  UserMinus,
  UserCog,
  FileText,
  MessageSquare,
  MessageCircle,
  Users,
  UserCheck,
  Building2,
  Clock,
  UserX,
  GraduationCap,
  CheckCircle,
  EyeOff,
  Eye,
  Send,
  Download,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Legend,
} from "recharts";
const COLORS = ["#032990", "#EAA108", "#ffffff"];

const CoordinatorDashboard = () => {
  const navigate = useNavigate();

  const [isNotificationSidebarOpen, setIsNotificationSidebarOpen] =
    useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [userData, setUserData] = useState({}); // Changed from adminProfile to userData
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: "New Beneficiary Added",
      content: "A new beneficiary has been added.",
      time: "2 hours ago",
      unread: true,
    },
    {
      id: 2,
      title: "Monthly Report Ready",
      content: "The monthly financial report is now available.",
      time: "1 day ago",
      unread: true,
    },
    {
      id: 3,
      title: "Sponsor Feedback",
      content: "You have received new feedback from a sponsor.",
      time: "3 days ago",
      unread: false,
    },
  ]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [stats, setStats] = useState({
    totalBeneficiaries: 0,
    totalEmployees: 0,
    activeChildBeneficiaries: 0,
    activeElderlyBeneficiaries: 0,
    totalSponsors: 0,
    waitingList: 0,
    pendingReassignmentList: 0,
    terminatedList: 0,
    graduatedList: 0,
    activateSponsors: 0,
    sponsorRequest: 0,
  });
  const [loadingStats, setLoadingStats] = useState(true);

  // Load user data from localStorage
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    setUserData(user);
  }, []);

  // Format role for display
  const formatRole = (role) => {
    switch (role) {
      case 'admin': return 'Administrator';
      case 'database_officer': return 'Database Officer'; 
      case 'coordinator': return 'Coordinator';
      case 'sponsor': return 'Sponsor';
      default: return role;
    }
  };

  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        setLoadingStats(true);
        const [
          employeesRes,
          childBeneficiariesRes,
          elderlyBeneficiariesRes,
          sponsorsRes,
          waitingRes,
          pendingReassignmentRes,
          terminatedRes,
          graduatedRes,
          pendingSponsorsRes,
          sponsorRequestsRes,
        ] = await Promise.all([
          fetch("http://localhost:5000/api/employees"),
          fetch(
            "http://localhost:5000/api/beneficiaries/children?status=active"
          ),
          fetch(
            "http://localhost:5000/api/beneficiaries/elderly?status=active"
          ),
          fetch("http://localhost:5000/api/sponsors"),
          fetch("http://localhost:5000/api/beneficiaries?status=waiting_list"),
          fetch("http://localhost:5000/api/beneficiaries?status=pending_reassignment"),
          fetch("http://localhost:5000/api/beneficiaries?status=terminated"),
          fetch("http://localhost:5000/api/beneficiaries?status=graduated"),
          fetch("http://localhost:5000/api/sponsors?status=new"),
          fetch("http://localhost:5000/api/sponsor-requests"),
        ]);

        const employeesData = await employeesRes.json();
        const childData = await childBeneficiariesRes.json();
        const elderlyData = await elderlyBeneficiariesRes.json();
        const sponsorsData = await sponsorsRes.json();
        const waitingData = await waitingRes.json();
        const pendingReassignmentData = await pendingReassignmentRes.json();
        const terminatedData = await terminatedRes.json();
        const graduatedData = await graduatedRes.json();
        const pendingSponsorsData = await pendingSponsorsRes.json();
        const sponsorRequestsData = sponsorRequestsRes.ok
          ? await sponsorRequestsRes.json()
          : { count: 0 };

        // Calculate total beneficiaries
        const totalBeneficiaries = 
          (childData.total || childData.beneficiaries?.length || 0) +
          (elderlyData.total || elderlyData.beneficiaries?.length || 0) +
          (waitingData.total || waitingData.beneficiaries?.length || 0) +
          (pendingReassignmentData.total || pendingReassignmentData.beneficiaries?.length || 0) +
          (terminatedData.total || terminatedData.beneficiaries?.length || 0) +
          (graduatedData.total || graduatedData.beneficiaries?.length || 0);

        setStats({
          totalBeneficiaries,
          totalEmployees:
            employeesData.total || employeesData.employees?.length || 0,
          activeChildBeneficiaries:
            childData.total || childData.beneficiaries?.length || 0,
          activeElderlyBeneficiaries:
            elderlyData.total || elderlyData.beneficiaries?.length || 0,
          totalSponsors:
            sponsorsData.total || sponsorsData.sponsors?.length || 0,
          waitingList:
            waitingData.total || waitingData.beneficiaries?.length || 0,
          pendingReassignmentList:
            pendingReassignmentData.total || pendingReassignmentData.beneficiaries?.length || 0,
          terminatedList:
            terminatedData.total || terminatedData.beneficiaries?.length || 0,
          graduatedList:
            graduatedData.total || graduatedData.beneficiaries?.length || 0,
          activateSponsors:
            pendingSponsorsData.total ||
            pendingSponsorsData.sponsors?.length ||
            0,
          sponsorRequest: sponsorRequestsData.count || 0,
        });
      } catch (error) {
        console.error("Error fetching statistics:", error);
      } finally {
        setLoadingStats(false);
      }
    };

    fetchStatistics();
  }, []);

  const toggleNotificationSidebar = () => {
    setIsNotificationSidebarOpen(!isNotificationSidebarOpen);
    if (!isNotificationSidebarOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "auto";
  };

  const handleProfileAction = (action) => {
    switch (action) {
      case "profile":
        setIsProfileModalOpen(true);
        break;
      case "settings":
        console.log("Navigate to settings page");
        break;
      case "logout":
        if (window.confirm("Are you sure you want to logout?")) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          window.location.href = '/login?logout=true';
        }
        break;
    }
    setProfileOpen(false);
  };

  const closeAllPopups = () => {
    setIsNotificationSidebarOpen(false);
    setProfileOpen(false);
    setIsProfileModalOpen(false);
    document.body.style.overflow = "auto";
  };

  const handleCardClick = (cardType) => {
    switch (cardType) {
      case "totalBeneficiaries":
        navigate("/beneficiary_list?view=all");
        break;
      case "totalEmployees":
        navigate("/employee_list");
        break;
      case "activeChild":
        navigate("/child_list");
        break;
      case "activeElderly":
        navigate("/elderly_list");
        break;
      case "totalSponsors":
        navigate("/sponsor_list");
        break;
      case "waitingList":
        navigate("/beneficiary_list?view=waiting");
        break;
      case "pendingReassignmentList":
        navigate("/beneficiary_list?view=reassign");
        break;
      case "terminatedList":
        navigate("/beneficiary_list?view=terminated");
        break;
      case "graduatedList":
        navigate("/beneficiary_list?view=graduated");
        break;
      case "activateSponsors":
        navigate("/sponsor_management");
        break;
      case "financialReport":
        navigate("/financial_report");
        break;
      case "feedback":
        navigate("/feedback");
        break;
    }
    closeAllPopups();
  };

  const handleNavClick = (path) => {
    navigate(path);
    closeAllPopups();
  };

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  };

  // Fixed chart click handlers
  const handlePieChartClick = (data) => {
    if (data && data.name) {
      if (data.name === "Children") {
        navigate("/child_list");
      } else if (data.name === "Elderly") {
        navigate("/elderly_list");
      }
    }
  };

  const handleBarChartClick = (data) => {
    if (data && data.name) {
      switch (data.name) {
        case "Waiting":
          navigate("/beneficiary_list?view=waiting");
          break;
        case "Needs Reassigning":
          navigate("/beneficiary_list?view=reassign");
          break;
        case "Terminated":
          navigate("/beneficiary_list?view=terminated");
          break;
        case "Graduated":
          navigate("/beneficiary_list?view=graduated");
          break;
        default:
          break;
      }
    }
  };

  useEffect(() => {
    const handleEscapeKey = (e) => e.key === "Escape" && closeAllPopups();
    const handleClickOutside = (e) =>
      profileOpen &&
      !e.target.closest(".profile-dropdown") &&
      setProfileOpen(false);
    document.addEventListener("keydown", handleEscapeKey);
    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("keydown", handleEscapeKey);
      document.removeEventListener("click", handleClickOutside);
    };
  }, [profileOpen]);

  const beneficiaryData = [
    { name: "Children", value: stats.activeChildBeneficiaries || 0 },
    { name: "Elderly", value: stats.activeElderlyBeneficiaries || 0 },
  ];

  const statusData = [
    { name: "Waiting", value: stats.waitingList || 0 },
    { name: "Needs Reassigning", value: stats.pendingReassignmentList || 0 },
    { name: "Terminated", value: stats.terminatedList || 0 },
    { name: "Graduated", value: stats.graduatedList || 0 },
  ];

  return (
    <div className="flex h-screen bg-[#F5ECE1]">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 z-50 w-64 bg-white text-[#032990] flex flex-col shadow-lg">
        {/* Sidebar Header */}
        <div className="flex items-center justify-between px-4 py-5 border-b border-[#032990]/20 bg-white text-blue">
          <div className="flex items-center space-x-2">
            <img src={maryJoyLogo} alt="MaryJoy Logo" className="h-14 w-14" />
            <span className="text-lg font-bold">Mary Joy Ethiopia</span>
          </div>
        </div>

        {/* Sidebar Nav */}
        <nav className="flex-1 overflow-y-auto px-2 py-4 space-y-1">
          
          {/* Beneficiary Dropdown */}
          <Disclosure>
            {({ open }) => (
              <>
                <Disclosure.Button className="flex items-center w-full p-2 rounded hover:bg-[#EAA108]/20">
                  <Users className="h-5 w-5 mr-3 text-[#032990]" />
                  Beneficiary
                  <ChevronDown
                    className={`ml-auto h-4 w-4 transform ${
                      open ? "rotate-180 text-[#EAA108]" : "text-[#EAA108]"
                    }`}
                  />
                </Disclosure.Button>
                <Disclosure.Panel className="pl-11 space-y-1">
                  <Link
                    to="/child_list"
                    className="flex items-center p-2 rounded hover:text-[#EAA108]"
                  >
                    <Users className="h-4 w-4 mr-2" />
                    Active Child Beneficiaries
                  </Link>
                  <Link
                    to="/elderly_list"
                    className="flex items-center p-2 rounded hover:text-[#EAA108]"
                  >
                    <Users className="h-4 w-4 mr-2" />
                    Active Elderly Beneficiaries
                  </Link>
                </Disclosure.Panel>
              </>
            )}
          </Disclosure>

          {/* Sponsor Dropdown */}
          <Disclosure>
            {({ open }) => (
              <>
                <Disclosure.Button className="flex items-center w-full p-2 rounded hover:bg-[#EAA108]/20">
                  <UserCheck className="h-5 w-5 mr-3 text-[#032990]" />
                  Sponsor
                  <ChevronDown
                    className={`ml-auto h-4 w-4 transform ${
                      open ? "rotate-180 text-[#EAA108]" : "text-[#EAA108]"
                    }`}
                  />
                </Disclosure.Button>
                <Disclosure.Panel className="pl-11 space-y-1">
                  <Link
                    to="/sponsor_list"
                    className="flex items-center p-2 rounded hover:text-[#EAA108]"
                  >
                    <Users className="h-4 w-4 mr-2" />
                    Active Sponsors
                  </Link>
                  <Link
                    to="/inactive_sponsors"
                    className="flex items-center p-2 rounded hover:text-[#EAA108]"
                  >
                    <UserMinus className="h-4 w-4 mr-2" />
                    Inactive Sponsors
                  </Link>
                  <Link
                    to="/sponsor_management"
                    className="flex items-center p-2 rounded hover:text-[#EAA108]"
                  >
                    <UserCheck className="h-4 w-4 mr-2" />
                    Pending Sponsors
                  </Link>
                  <Link
                    to="/beneficiary_request"
                    className="flex items-center p-2 rounded hover:text-[#EAA108]"
                  >
                    <Clock className="h-4 w-4 mr-2" />
                    More Requests
                  </Link>
                </Disclosure.Panel>
              </>
            )}
          </Disclosure>

          {/* Inactive Beneficiary Dropdown */}
          <Disclosure>
            {({ open }) => (
              <>
                <Disclosure.Button className="flex items-center w-full p-2 rounded hover:bg-[#EAA108]/20">
                  <UserMinus className="h-5 w-5 mr-3 text-[#032990]" />
                  Inactive Beneficiary
                  <ChevronDown
                    className={`ml-auto h-4 w-4 transform ${
                      open ? "rotate-180 text-[#EAA108]" : "text-[#EAA108]"
                    }`}
                  />
                </Disclosure.Button>
                <Disclosure.Panel className="pl-11 space-y-1">
                  <Link
                    to="/beneficiary_list?view=reassign"
                    className="block p-2 rounded hover:text-[#EAA108]"
                  >
                    Reassigned List
                  </Link>
                  <Link
                    to="/beneficiary_list?view=waiting"
                    className="block p-2 rounded hover:text-[#EAA108]"
                  >
                    Waiting List
                  </Link>
                  <Link
                    to="/beneficiary_list?view=terminated"
                    className="block p-2 rounded hover:text-[#EAA108]"
                  >
                    Terminated List
                  </Link>
                  <Link
                    to="/beneficiary_list?view=graduated"
                    className="block p-2 rounded hover:text-[#EAA108]"
                  >
                    Graduated List
                  </Link>
                </Disclosure.Panel>
              </>
            )}
          </Disclosure>

          {/* Other Links */}
          <Link
            to="/financial_report"
            className="flex items-center p-2 rounded hover:bg-[#EAA108]/20"
          >
            <FileText className="h-5 w-5 mr-3 text-[#032990]" />
            Financial Report
          </Link>
          <Link
            to="/feedback"
            className="flex items-center p-2 rounded hover:bg-[#EAA108]/20"
          >
            <MessageCircle className="h-5 w-5 mr-3 text-[#032990]" />
            Feedback
          </Link>
        </nav>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col md:ml-64 ">
        {/* Topbar */}
        <header className="flex items-center justify-between bg-[#032990] shadow px-4 py-3 h-24 text-white">
          <div className="flex items-center ">
            <button
              className="md:hidden p-2 text-gray-500 hover:text-gray-700"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              {sidebarOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
            <h1 className="ml-2 text-xl font-semibold text-white">
              Welcome back, {userData?.fullName || 'Coordinator'}
            </h1>
          </div>
          <div className="flex items-center space-x-4">
            <button
              className="relative text-gray-500 hover:text-gray-700"
              onClick={toggleNotificationSidebar}
            >
              <Bell className="h-6 w-6" />
              {notifications.filter((n) => n.unread).length > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#eaa108] text-white text-xs px-1 rounded-full">
                  {notifications.filter((n) => n.unread).length}
                </span>
              )}
            </button>
            <div className="relative profile-dropdown">
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
              >
                <div className="w-8 h-8 bg-[#eaa108] rounded-full flex items-center justify-center">
                  <User className="h-5 w-5 text-white" />
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-medium text-gray-300">
                    {userData?.fullName || 'User'}
                  </p>
                  <p className="text-xs text-gray-500">
                    {userData?.role ? formatRole(userData.role) : 'Coordinator'}
                  </p>
                </div>
              </button>
              
              {/* Profile popup */}
              {profileOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-xl py-2 z-50 profile-dropdown">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-[#eaa108] rounded-full flex items-center justify-center">
                        <User className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {userData?.fullName || 'User'}
                        </p>
                        <p className="text-xs text-gray-500">
                          {userData?.email || 'No email'}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="py-1">
                    <button
                      onClick={() => handleProfileAction("profile")}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-150"
                    >
                      <User className="mr-3 h-4 w-4 text-gray-400" />
                      View Profile
                    </button>
                    <button
                      onClick={() => handleProfileAction("settings")}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-150"
                    >
                      <UserCog className="mr-3 h-4 w-4 text-gray-400" />
                      Settings
                    </button>
                    <div className="border-t border-gray-100 my-1"></div>
                    <button
                      onClick={() => handleProfileAction("logout")}
                      className="flex items-center w-full px-4 py-2 text-sm text-[#F28C82] hover:bg-[#F5ECE1] transition-colors duration-150"
                    >
                      <X className="mr-3 h-4 w-4 text-[#eaa108]" />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Notification Sidebar */}
        {isNotificationSidebarOpen && (
          <div className="fixed top-0 right-0 w-80 h-full bg-white shadow-lg z-[1000] flex flex-col transition-transform duration-300 ease-in-out">
            <div className="flex justify-between items-center p-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800">
                Notifications
              </h2>
              <button
                className="text-gray-500 hover:text-gray-700 transition-colors duration-200"
                onClick={toggleNotificationSidebar}
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              {notifications.length === 0 ? (
                <div className="text-gray-500 text-center mt-8">
                  No notifications
                </div>
              ) : (
                notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-3 rounded-lg mb-3 border-l-4 ${
                      notification.unread
                        ? "bg-[#F5ECE1] border-[#F28C82]"
                        : "bg-gray-50 border-gray-200"
                    }`}
                  >
                    <h3 className="font-semibold text-gray-800">
                      {notification.title}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {notification.content}
                    </p>
                    <span className="text-xs text-gray-400">
                      {notification.time}
                    </span>
                  </div>
                ))
              )}
            </div>
            <div className="p-4 border-t border-gray-200 text-center">
              <button
                className="bg-[#F28C82] text-white px-4 py-2 rounded hover:bg-[#D97066] transition"
                onClick={markAllRead}
                disabled={notifications.filter((n) => n.unread).length === 0}
              >
                Mark all as read
              </button>
            </div>
          </div>
        )}

        {/* Dashboard Content */}
        <main className="p-6 space-y-6 overflow-y-auto flex-1 relative z-10 bg-[#e6ecf8]">
          {/* Stat Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Total Beneficiaries */}
            <div
              className="bg-white border-l-4 border-[#032990] rounded-lg shadow p-4 flex items-center cursor-pointer hover:shadow-lg transition"
              onClick={() => handleCardClick("totalBeneficiaries")}
            >
              <UserCheck className="h-8 w-8 text-[#eaa108]" />
              <div className="ml-4">
                <p className="text-gray-600 text-sm">Total Beneficiaries</p>
                <p className="text-xl font-semibold text-gray-800">
                  {loadingStats ? "..." : stats.totalBeneficiaries}
                </p>
              </div>
            </div>

            {/* Total Employees */}
            <div
              className="bg-white border-l-4 border-[#032990] rounded-lg shadow p-4 flex items-center cursor-pointer hover:shadow-lg transition"
              onClick={() => handleCardClick("totalEmployees")}
            >
              <Users className="h-8 w-8 text-[#eaa108]" />
              <div className="ml-4">
                <p className="text-gray-600 text-sm">Total Employees</p>
                <p className="text-xl font-semibold text-gray-800">
                  {loadingStats ? "..." : stats.totalEmployees}
                </p>
              </div>
            </div>

            {/* Sponsors */}
            <div
              className="bg-white border-l-4 border-[#032990] rounded-lg shadow p-4 flex items-center cursor-pointer hover:shadow-lg transition"
              onClick={() => handleCardClick("totalSponsors")}
            >
              <Building2 className="h-8 w-8 text-[#eaa108]" />
              <div className="ml-4">
                <p className="text-gray-600 text-sm">Active Sponsors</p>
                <p className="text-xl font-semibold text-gray-800">
                  {loadingStats ? "..." : stats.totalSponsors}
                </p>
              </div>
            </div>
          </div>

          {/* Charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Pie Chart for Beneficiaries */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Active Beneficiaries
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={beneficiaryData}
                  dataKey="value"
                  nameKey="name"
                  outerRadius={80}
                  onClick={handlePieChartClick}
                >
                  {beneficiaryData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend
                  formatter={(value, entry, index) => {
                    // Find matching item from data
                    const item = beneficiaryData.find(
                      (d) => d.name === value
                    );
                    return `${value}: ${item?.value ?? 0}`;
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
                      </div>

          {/* Bar Chart for Status */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Beneficiary Status
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={statusData}>
                <XAxis dataKey="name" stroke="#032990" />
                <YAxis stroke="#032990" />
                <Tooltip />
                <Bar 
                  dataKey="value" 
                  fill="#EAA108" 
                  onClick={(data, index) => {
                    const clickedData = statusData[index];
                    handleBarChartClick(clickedData);
                  }}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
         {/* Recent Reports Section */}
          <div className="bg-white rounded-lg shadow p-6 relative z-10">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-800">
                Recent Reports
              </h2>
            </div>

            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-indigo-100 rounded-md flex items-center justify-center">
                    <FileText className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">
                      Annual Report 2023
                    </h3>
                    <p className="text-sm text-gray-500">
                      Uploaded: Jan 15, 2024
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Download className="text-amber-600 font-medium hover:text-amber-700" />
                    
                  
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-indigo-100 rounded-md flex items-center justify-center">
                    <FileText className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">
                      Quarterly Update Q1 2024
                    </h3>
                    <p className="text-sm text-gray-500">
                      Uploaded: Apr 5, 2024
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Download className="text-amber-600 font-medium hover:text-amber-700" />                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-indigo-100 rounded-md flex items-center justify-center">
                    <FileText className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">
                      Sponsorship Impact Report
                    </h3>
                    <p className="text-sm text-gray-500">
                Uploaded: Mar 20, 2024
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Download className="text-amber-600 font-medium hover:text-amber-700" />            </div>
          </div>
        </div>
      </div>
    </main>
  </div>

  {/* Use the ProfileModal component */}
  <ProfileModal 
    isOpen={isProfileModalOpen} 
    onClose={() => setIsProfileModalOpen(false)} 
  />
</div>

);
};

export default CoordinatorDashboard;
