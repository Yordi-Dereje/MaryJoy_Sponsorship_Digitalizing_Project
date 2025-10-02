import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Disclosure } from "@headlessui/react";
import ProfileModal from "./ProfileModal"; 
import ReportsSection from "./ReportsSection";
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
  DollarSign,
  Calendar,
  MessageSquareText,
  Heart
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

const COLORS = ["#1e40af", "#93c5fd", "#374151"]; // Changed orange to light blue

const CoordinatorDashboard = () => {
  const navigate = useNavigate();

  const [isNotificationSidebarOpen, setIsNotificationSidebarOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [userData, setUserData] = useState({});
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: "New Beneficiary Added",
      content: "A new beneficiary has been added.",
      time: "2 hours ago",
      unread: true,
      icon: <UserPlus size={16} />
    },
    {
      id: 2,
      title: "Monthly Report Ready",
      content: "The monthly financial report is now available.",
      time: "1 day ago",
      unread: true,
      icon: <FileText size={16} />
    },
    {
      id: 3,
      title: "Sponsor Feedback",
      content: "You have received new feedback from a sponsor.",
      time: "3 days ago",
      unread: false,
      icon: <MessageSquare size={16} />
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
          fetch("http://localhost:5000/api/beneficiaries/children?status=active"),
          fetch("http://localhost:5000/api/beneficiaries/elderly?status=active"),
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
          : [];

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
          totalEmployees: employeesData.total || employeesData.employees?.length || 0,
          activeChildBeneficiaries: childData.total || childData.beneficiaries?.length || 0,
          activeElderlyBeneficiaries: elderlyData.total || elderlyData.beneficiaries?.length || 0,
          totalSponsors: sponsorsData.total || sponsorsData.sponsors?.length || 0,
          waitingList: waitingData.total || waitingData.beneficiaries?.length || 0,
          pendingReassignmentList: pendingReassignmentData.total || pendingReassignmentData.beneficiaries?.length || 0,
          terminatedList: terminatedData.total || terminatedData.beneficiaries?.length || 0,
          graduatedList: graduatedData.total || graduatedData.beneficiaries?.length || 0,
          activateSponsors: pendingSponsorsData.total || pendingSponsorsData.sponsors?.length || 0,
          sponsorRequest: sponsorRequestsData.length || 0,
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
      case "sponsorRequest":
        navigate("/beneficiary_request");
        break;
    }
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

  // Overlay Component
  const Overlay = ({ isActive, onClick }) => (
    <div
      className={`fixed inset-0 bg-black transition-opacity duration-300 z-40 ${
        isActive ? "opacity-50 visible" : "opacity-0 invisible"
      }`}
      onClick={onClick}
    />
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-amber-50 text-gray-800 font-inter flex">
      {/* Mobile Sidebar Overlay */}
      <Overlay 
        isActive={sidebarOpen} 
        onClick={() => setSidebarOpen(false)} 
      />

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-40 w-80 bg-white flex flex-col shadow-lg transform transition-transform duration-300 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } md:translate-x-0 md:static`}>
        {/* Sidebar Header - Removed logo */}
        <div className="flex items-center justify-between px-6 py-3 border-b border-gray-200 bg-white">
          <div className="flex items-center space-x-3">
            
            <div>
              <span className="text-xl font-bold text-blue-800">Coordinator Panel</span>
              <p className="text-sm text-gray-600">Mary Joy Ethiopia</p>
            </div>
          </div>
        </div>

        {/* Sidebar Nav */}
        <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-2">
          {/* Beneficiary Dropdown */}
          <Disclosure>
            {({ open }) => (
              <>
                <Disclosure.Button className="flex items-center w-full p-3 rounded-lg hover:bg-blue-50 transition-colors duration-200">
                  <Users className="h-5 w-5 mr-3 text-blue-700" />
                  <span className="font-medium">Beneficiary</span>
                  <ChevronDown
                    className={`ml-auto h-4 w-4 transform transition-transform ${
                      open ? "rotate-180 text-blue-600" : "text-gray-400"
                    }`}
                  />
                </Disclosure.Button>
                <Disclosure.Panel className="pl-11 space-y-2 mt-2">
                  <Link
                    to="/child_list"
                    className="flex items-center p-2 rounded-lg hover:text-blue-600 hover:bg-blue-50 transition-colors duration-200"
                  >
                    <Users className="h-4 w-4 mr-2" />
                    Active Child Beneficiaries
                  </Link>
                  <Link
                    to="/elderly_list"
                    className="flex items-center p-2 rounded-lg hover:text-blue-600 hover:bg-blue-50 transition-colors duration-200"
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
                <Disclosure.Button className="flex items-center w-full p-3 rounded-lg hover:bg-blue-50 transition-colors duration-200">
                  <UserCheck className="h-5 w-5 mr-3 text-blue-700" />
                  <span className="font-medium">Sponsor</span>
                  <ChevronDown
                    className={`ml-auto h-4 w-4 transform transition-transform ${
                      open ? "rotate-180 text-blue-600" : "text-gray-400"
                    }`}
                  />
                </Disclosure.Button>
                <Disclosure.Panel className="pl-11 space-y-2 mt-2">
                  <Link
                    to="/sponsor_list"
                    className="flex items-center p-2 rounded-lg hover:text-blue-600 hover:bg-blue-50 transition-colors duration-200"
                  >
                    <Users className="h-4 w-4 mr-2" />
                    Active Sponsors
                  </Link>
                  <Link
                    to="/inactive_sponsors"
                    className="flex items-center p-2 rounded-lg hover:text-blue-600 hover:bg-blue-50 transition-colors duration-200"
                  >
                    <UserMinus className="h-4 w-4 mr-2" />
                    Inactive Sponsors
                  </Link>
                  <Link
                    to="/sponsor_management"
                    className="flex items-center p-2 rounded-lg hover:text-blue-600 hover:bg-blue-50 transition-colors duration-200"
                  >
                    <UserCheck className="h-4 w-4 mr-2" />
                    Pending Sponsors
                  </Link>
                  <Link
                    to="/beneficiary_request"
                    className="flex items-center p-2 rounded-lg hover:text-blue-600 hover:bg-blue-50 transition-colors duration-200"
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
                <Disclosure.Button className="flex items-center w-full p-3 rounded-lg hover:bg-blue-50 transition-colors duration-200">
                  <UserMinus className="h-5 w-5 mr-3 text-blue-700" />
                  <span className="font-medium">Inactive Beneficiary</span>
                  <ChevronDown
                    className={`ml-auto h-4 w-4 transform transition-transform ${
                      open ? "rotate-180 text-blue-600" : "text-gray-400"
                    }`}
                  />
                </Disclosure.Button>
                <Disclosure.Panel className="pl-11 space-y-2 mt-2">
                  <Link
                    to="/beneficiary_list?view=reassign"
                    className="block p-2 rounded-lg hover:text-blue-600 hover:bg-blue-50 transition-colors duration-200"
                  >
                    Reassigned List
                  </Link>
                  <Link
                    to="/beneficiary_list?view=waiting"
                    className="block p-2 rounded-lg hover:text-blue-600 hover:bg-blue-50 transition-colors duration-200"
                  >
                    Waiting List
                  </Link>
                  <Link
                    to="/beneficiary_list?view=terminated"
                    className="block p-2 rounded-lg hover:text-blue-600 hover:bg-blue-50 transition-colors duration-200"
                  >
                    Terminated List
                  </Link>
                  <Link
                    to="/beneficiary_list?view=graduated"
                    className="block p-2 rounded-lg hover:text-blue-600 hover:bg-blue-50 transition-colors duration-200"
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
            className="flex items-center p-3 rounded-lg hover:bg-blue-50 transition-colors duration-200"
          >
            <FileText className="h-5 w-5 mr-3 text-blue-700" />
            <span className="font-medium">Financial Report</span>
          </Link>
          <Link
            to="/feedback"
            className="flex items-center p-3 rounded-lg hover:bg-blue-50 transition-colors duration-200"
          >
            <MessageCircle className="h-5 w-5 mr-3 text-blue-700" />
            <span className="font-medium">Feedback</span>
          </Link>
        </nav>

        {/* Mobile Close Button */}
        <div className="p-4 border-t border-gray-200 md:hidden">
          <button
            onClick={() => setSidebarOpen(false)}
            className="w-full flex items-center justify-center p-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <X className="h-5 w-5 mr-2" />
            Close Menu
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-30 py-4 px-6 flex justify-between items-center border-b border-gray-200/50">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors md:hidden"
            >
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <img src={maryJoyLogo} alt="MaryJoy Logo" className="h-10 w-10" />
            <div className="text-xl font-bold bg-gradient-to-r from-blue-800 to-blue-600 bg-clip-text text-transparent">
              Mary Joy Ethiopia
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div
              className="relative p-2 rounded-full hover:bg-blue-50 cursor-pointer transition-colors duration-200"
              onClick={toggleNotificationSidebar}
            >
              <Bell size={20} className="text-blue-700" />
              {notifications.some((n) => n.unread) && (
                <div className="absolute top-1 right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></div>
              )}
            </div>
            <div className="relative profile-dropdown">
              <div
                className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-full flex items-center justify-center text-white cursor-pointer hover:shadow-md transition-all duration-200 shadow-sm"
                onClick={() => setProfileOpen(!profileOpen)}
              >
                <User size={20} />
              </div>
              
              {/* Profile popup */}
              {profileOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-xl py-2 z-50 profile-dropdown">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-full flex items-center justify-center">
                        <User className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {userData?.fullName || 'Coordinator'}
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
                      className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors duration-150"
                    >
                      <X className="mr-3 h-4 w-4 text-red-500" />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Notification Sidebar */}
        <Overlay
          isActive={isNotificationSidebarOpen}
          onClick={toggleNotificationSidebar}
        />
        <div
          className={`fixed top-0 right-0 w-full sm:w-96 h-full bg-white shadow-xl z-50 transition-transform duration-300 ${
            isNotificationSidebarOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="p-6 border-b border-gray-200 flex justify-between items-center bg-gradient-to-r from-blue-800 to-blue-600 text-white">
            <h2 className="text-xl font-semibold">Notifications</h2>
            <button
              onClick={toggleNotificationSidebar}
              className="text-white/80 hover:text-white p-1 rounded-md hover:bg-white/10 transition-colors"
            >
              <X size={20} />
            </button>
          </div>
          <div className="h-full overflow-y-auto">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-4 border-b border-gray-100 flex items-start gap-3 ${
                  notification.unread ? "bg-blue-50" : "bg-white"
                } hover:bg-gray-50 transition-colors duration-150`}
              >
                <div className="mt-1 p-2 bg-blue-100 rounded-lg text-blue-700">
                  {notification.icon}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold mb-1 text-gray-800">{notification.title}</h3>
                  <p className="text-sm text-gray-600 mb-1">{notification.content}</p>
                  <span className="text-xs text-gray-500 flex items-center gap-1">
                    <Clock size={12} />
                    {notification.time}
                  </span>
                </div>
                {notification.unread && (
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                )}
              </div>
            ))}
          </div>
          <div className="p-4 border-t border-gray-200 text-center bg-gray-50">
            <button
              onClick={markAllRead}
              className="text-blue-600 font-medium hover:text-blue-800 transition-colors flex items-center justify-center gap-2 mx-auto"
            >
              Mark all as read
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {/* Welcome Section */}
          <section className="bg-gradient-to-r from-blue-800 to-blue-600 rounded-2xl shadow-lg p-8 mb-8 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-12 -translate-x-12"></div>
            
            <div className="relative z-10">
              <h1 className="text-3xl font-bold mb-2">Welcome back, {userData?.fullName || 'Coordinator'}!</h1>
              <p className="text-blue-100 text-lg">
                "Not all of us can do great things. But we can all do small things with great love." MOTHER TERESA
              </p>
            </div>
          </section>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
            {/* Total Beneficiaries */}
            <div
              className="bg-white rounded-2xl shadow-md p-6 border-l-4 border-blue-600 hover:-translate-y-1 transition-transform duration-300 cursor-pointer group relative overflow-hidden"
              onClick={() => handleCardClick("totalBeneficiaries")}
            >
              <div className="absolute top-0 right-0 w-16 h-16 bg-blue-100 rounded-bl-full opacity-50 group-hover:opacity-70 transition-opacity"></div>
              <div className="flex justify-between items-center mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-700 group-hover:bg-blue-200 transition-colors shadow-sm">
                  <UserCheck size={24} />
                </div>
              </div>
              <div className="space-y-2 relative z-10">
                <h3 className="text-sm font-medium text-gray-600">Total Beneficiaries</h3>
                <p className="text-3xl font-bold text-blue-800">
                  {loadingStats ? "..." : stats.totalBeneficiaries}
                </p>
                
              </div>
            </div>

            {/* Total Employees */}
            <div
              className="bg-white rounded-2xl shadow-md p-6 border-l-4 border-blue-600 hover:-translate-y-1 transition-transform duration-300 cursor-pointer group relative overflow-hidden"
              onClick={() => handleCardClick("totalEmployees")}
            >
              <div className="absolute top-0 right-0 w-16 h-16 bg-blue-100 rounded-bl-full opacity-50 group-hover:opacity-70 transition-opacity"></div>
              <div className="flex justify-between items-center mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-700 group-hover:bg-blue-200 transition-colors shadow-sm">
                  <Users size={24} />
                </div>
              </div>
              <div className="space-y-2 relative z-10">
                <h3 className="text-sm font-medium text-gray-600">Total Employees</h3>
                <p className="text-3xl font-bold text-blue-800">
                  {loadingStats ? "..." : stats.totalEmployees}
                </p>
                
              </div>
            </div>

            {/* Active Sponsors */}
            <div
              className="bg-white rounded-2xl shadow-md p-6 border-l-4 border-blue-600 hover:-translate-y-1 transition-transform duration-300 cursor-pointer group relative overflow-hidden"
              onClick={() => handleCardClick("totalSponsors")}
            >
              <div className="absolute top-0 right-0 w-16 h-16 bg-blue-100 rounded-bl-full opacity-50 group-hover:opacity-70 transition-opacity"></div>
              <div className="flex justify-between items-center mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-700 group-hover:bg-blue-200 transition-colors shadow-sm">
                  <Building2 size={24} />
                </div>
              </div>
              <div className="space-y-2 relative z-10">
                <h3 className="text-sm font-medium text-gray-600">Active Sponsors</h3>
                <p className="text-3xl font-bold text-blue-800">
                  {loadingStats ? "..." : stats.totalSponsors}
                </p>
                
              </div>
            </div>

            {/* Pending Sponsors */}
            <div
              className="bg-white rounded-2xl shadow-md p-6 border-l-4 border-blue-600 hover:-translate-y-1 transition-transform duration-300 cursor-pointer group relative overflow-hidden"
              onClick={() => handleCardClick("activateSponsors")}
            >
              <div className="absolute top-0 right-0 w-16 h-16 bg-blue-100 rounded-bl-full opacity-50 group-hover:opacity-70 transition-opacity"></div>
              <div className="flex justify-between items-center mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-700 group-hover:bg-blue-200 transition-colors shadow-sm">
                  <CheckCircle size={24} />
                </div>
              </div>
              <div className="space-y-2 relative z-10">
                <h3 className="text-sm font-medium text-gray-600">Pending Sponsors</h3>
                <p className="text-3xl font-bold text-blue-800">
                  {loadingStats ? "..." : stats.activateSponsors}
                </p>
              </div>
            </div>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Pie Chart for Beneficiaries */}
            <div className="bg-white rounded-2xl shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Active Beneficiaries</h3>
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
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Bar Chart for Status */}
            <div className="bg-white rounded-2xl shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Beneficiary Status</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={statusData}>
                  <XAxis dataKey="name" stroke="#374151" />
                  <YAxis stroke="#374151" />
                  <Tooltip />
                  <Bar 
                    dataKey="value" 
                    fill="#93c5fd" // Changed to light blue
                    onClick={(data, index) => {
                      const clickedData = statusData[index];
                      handleBarChartClick(clickedData);
                    }}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Reports Section */}
          <ReportsSection 
            userRole="coordinator" 
            userId={userData?.id || userData?.employee_id} 
          />
        </main>
      </div>

      {/* Profile Modal */}
      <ProfileModal 
        isOpen={isProfileModalOpen} 
        onClose={() => setIsProfileModalOpen(false)} 
      />
    </div>
  );
};

export default CoordinatorDashboard;
