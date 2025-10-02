import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Disclosure } from "@headlessui/react";
import { useRoleNavigation } from "./hooks/useRoleNavigation";
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
  Delete,
  Download,
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
  LogOut,
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

const COLORS = ["#1e40af", "#93c5fd", "#374151"]; // Updated to blue theme

import SponsorModal from "./SponsorModal";
import ChildBeneficiaryModal from "./ChildBeneficiaryModal";
import ElderlyBeneficiaryModal from "./ElderlyBeneficiaryModal";
import GuardianModal from "./GuardianModal";

const DODashboard = () => {
  const navigate = useNavigate();
  const { navigateToDashboard } = useRoleNavigation();

  const handleBack = () => {
    navigateToDashboard();
  };

  const [isNotificationSidebarOpen, setIsNotificationSidebarOpen] = useState(false);
  const [isChildBeneficiaryModalOpen, setChildBeneficiaryModalOpen] = useState(false);
  const [isElderlyBeneficiaryModalOpen, setElderlyBeneficiaryModalOpen] = useState(false);
  const [isGuardianModalOpen, setGuardianModalOpen] = useState(false);
  const [isSponsorModalOpen, setSponsorModalOpen] = useState(false);
  const [isSmsModalOpen, setSmsModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [smsData, setSmsData] = useState({
    recipients: "",
    messageType: "",
    message: "",
    sendOption: "now",
    scheduledDate: "",
    scheduledTime: "",
  });
  const [guardians, setGuardians] = useState([]);
  const [guardianSearchTerm, setGuardianSearchTerm] = useState("");
  const [userData, setUserData] = useState({});
  
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    setUserData(user);
  }, []);

  const formatRole = (role) => {
    switch (role) {
      case 'admin': return 'Administrator';
      case 'database_officer': return 'Database Officer'; 
      case 'coordinator': return 'Coordinator';
      case 'sponsor': return 'Sponsor';
      default: return role;
    }
  };

  // Function to get first name from full name
  const getFirstName = (fullName) => {
    if (!fullName) return 'Database Officer';
    return fullName.split(' ')[0];
  };

  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: "New Beneficiary Added",
      content: "A new beneficiary has been added to the system.",
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
    activeChildBeneficiaries: 0,
    activeElderlyBeneficiaries: 0,
    totalSponsors: 0,
    inactiveSponsors: 0,
    waitingList: 0,
    pendingReassignmentList: 0,
    terminatedList: 0,
    graduatedList: 0,
    activateSponsors: 0,
    sponsorRequest: 0,
  });
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        setLoadingStats(true);
        const [
          totalBeneficiariesRes, 
          childBeneficiariesRes,
          elderlyBeneficiariesRes,
          sponsorsRes,
          inactiveSponsorsRes,
          waitingRes,
          pendingReassignmentRes,
          terminatedRes,
          graduatedRes,
          pendingSponsorsRes,
          sponsorRequestsRes,
        ] = await Promise.all([
          fetch("http://localhost:5000/api/beneficiaries"),
          fetch("http://localhost:5000/api/beneficiaries/children?status=active"),
          fetch("http://localhost:5000/api/beneficiaries/elderly?status=active"),
          fetch("http://localhost:5000/api/sponsors?status=active"),
          fetch("http://localhost:5000/api/sponsors?status=inactive"),
          fetch("http://localhost:5000/api/beneficiaries?status=waiting_list"),
          fetch("http://localhost:5000/api/beneficiaries?status=pending_reassignment"),
          fetch("http://localhost:5000/api/beneficiaries?status=terminated"),
          fetch("http://localhost:5000/api/beneficiaries?status=graduated"),
          fetch("http://localhost:5000/api/sponsors?status=pending_review"),
          fetch("http://localhost:5000/api/sponsor-requests"),
        ]);

        const childData = await childBeneficiariesRes.json();
        const elderlyData = await elderlyBeneficiariesRes.json();
        const sponsorsData = await sponsorsRes.json();
        const inactiveSponsorsData = await inactiveSponsorsRes.json();
        const waitingData = await waitingRes.json();
        const pendingReassignmentData = await pendingReassignmentRes.json();
        const terminatedData = await terminatedRes.json();
        const graduatedData = await graduatedRes.json();
        const pendingSponsorsData = await pendingSponsorsRes.json();
        const sponsorRequestsData = sponsorRequestsRes.ok
          ? await sponsorRequestsRes.json()
          : [];

        const totalBeneficiaries = 
          (childData.total || childData.beneficiaries?.length || 0) +
          (elderlyData.total || elderlyData.beneficiaries?.length || 0) +
          (waitingData.total || waitingData.beneficiaries?.length || 0) +
          (pendingReassignmentData.total || pendingReassignmentData.beneficiaries?.length || 0) +
          (terminatedData.total || terminatedData.beneficiaries?.length || 0) +
          (graduatedData.total || graduatedData.beneficiaries?.length || 0);

        setStats({
          totalBeneficiaries,
          activeChildBeneficiaries: childData.total || childData.beneficiaries?.length || 0,
          activeElderlyBeneficiaries: elderlyData.total || elderlyData.beneficiaries?.length || 0,
          totalSponsors: sponsorsData.total || sponsorsData.sponsors?.length || 0,
          inactiveSponsors: inactiveSponsorsData.total || inactiveSponsorsData.sponsors?.length || 0,
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

  const departments = [
    { id: 1, name: "Human Resources" },
    { id: 2, name: "Finance" },
    { id: 3, name: "IT" },
    { id: 4, name: "Operations" },
  ];

  const accessLevels = [
    { id: 1, name: "Administrator" },
    { id: 2, name: "Manager" },
    { id: 3, name: "Staff" },
    { id: 4, name: "View Only" },
  ];

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
    setSmsModalOpen(false);
    setIsProfileModalOpen(false);
    document.body.style.overflow = "auto";
  };

  const handleSmsInputChange = (field, value) => {
    setSmsData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSendSms = () => {
    if (!smsData.recipients || !smsData.messageType || !smsData.message.trim()) {
      alert("Please fill in all required fields");
      return;
    }
    if (smsData.message.length > 160) {
      alert("Message cannot exceed 160 characters");
      return;
    }
    if (smsData.sendOption === "schedule" && (!smsData.scheduledDate || !smsData.scheduledTime)) {
      alert("Please select date and time for scheduled message");
      return;
    }
    console.log("Sending SMS:", smsData);
    alert("SMS message sent successfully!");
    setSmsData({
      recipients: "",
      messageType: "",
      message: "",
      sendOption: "now",
      scheduledDate: "",
      scheduledTime: "",
    });
    setSmsModalOpen(false);
  };

  const setupFileUpload = (previewId, file) => {
    const reader = new FileReader();
    reader.onload = function (e) {
      const preview = document.getElementById(previewId);
      if (preview) {
        if (file.type.startsWith("image/")) {
          preview.innerHTML = `<img src='${e.target.result}' alt='preview' class='w-20 h-20 object-cover rounded-full mx-auto' />`;
        } else {
          preview.innerHTML = `<span class='text-gray-700'>${file.name}</span>`;
        }
      }
    };
    reader.readAsDataURL(file);
  };

  const handleGuardianSearch = (e) => {
    setGuardianSearchTerm(e.target.value);
    setGuardians(
      [{ id: 1, name: "Sample Guardian", phone: "123456789" }].filter(
        (g) =>
          g.name.toLowerCase().includes(e.target.value.toLowerCase()) ||
          g.phone.includes(e.target.value)
      )
    );
  };

  const selectGuardian = (guardian) => {
    setGuardianSearchTerm(guardian.name);
    setGuardians([]);
  };

  const openGuardianModal = () => {
    setGuardianModalOpen(true);
  };

  const handleCardClick = (cardType) => {
    switch (cardType) {
      case "totalBeneficiaries":
        navigate("/beneficiary_list?view=all");
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
      case "inactiveSponsors":
        navigate("/inactive_sponsors");
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
      case "sponser_modal":
        navigate("/sponser_modal");
        break;
      case "sponsorRequest":
        navigate("/beneficiary_request");
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

      {/* Sidebar - Made stationary with sticky positioning */}
      <div className={`fixed inset-y-0 left-0 z-40 w-80 bg-white flex flex-col shadow-lg transform transition-transform duration-300 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } md:translate-x-0 md:static md:sticky md:top-0 md:self-start md:h-screen`}>
        {/* Sidebar Header */}
        <div className="flex items-center justify-between px-6 py-3 border-b border-gray-200 bg-white">
          <div className="flex items-center space-x-3">
            <img src={maryJoyLogo} alt="MaryJoy Logo" className="h-10 w-10" />
            <div>
              <span className="text-xl font-bold text-blue-800">Database Officer</span>
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
                    to="#"
                    onClick={(e) => {
                      e.preventDefault();
                      setChildBeneficiaryModalOpen(true);
                    }}
                    className="flex items-center p-2 rounded-lg hover:text-blue-600 hover:bg-blue-50 transition-colors duration-200"
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    Add Child Beneficiaries
                  </Link>
                  <Link
                    to="#"
                    onClick={(e) => {
                      e.preventDefault();
                      setElderlyBeneficiaryModalOpen(true);
                    }}
                    className="flex items-center p-2 rounded-lg hover:text-blue-600 hover:bg-blue-50 transition-colors duration-200"
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    Add Elderly Beneficiaries
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
                    to="#"
                    onClick={(e) => {
                      e.preventDefault();
                      setSponsorModalOpen(true);
                    }}
                    className="flex items-center p-2 rounded-lg hover:text-blue-600 hover:bg-blue-50 transition-colors duration-200"
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    Add Sponsor
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
            to="#"
            onClick={(e) => {
              e.preventDefault();
              setSmsModalOpen(true);
            }}
            className="flex items-center p-3 rounded-lg hover:bg-blue-50 transition-colors duration-200"
          >
            <MessageSquare className="h-5 w-5 mr-3 text-blue-700" />
            <span className="font-medium">SMS</span>
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
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
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
                          {userData?.fullName || 'Database Officer'}
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
          {/* Welcome Section - Updated to show only first name */}
          <section className="bg-gradient-to-r from-blue-800 to-blue-600 rounded-2xl shadow-lg p-8 mb-8 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-12 -translate-x-12"></div>
            
            <div className="relative z-10">
              <h1 className="text-3xl font-bold mb-2">Welcome back, {getFirstName(userData?.fullName)}!</h1>
              <p className="text-blue-100 text-lg">
                "Not all of us can do great things. But we can all do small things with great love." MOTHER TERESA
              </p>
            </div>
          </section>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4 gap-6 mb-8">
            {/* Total Beneficiaries */}
            <div
              className="bg-white rounded-2xl shadow-md p-6 border-l-4 border-blue-600 hover:-translate-y-1 transition-transform duration-300 cursor-pointer group relative overflow-hidden"
              onClick={() => handleCardClick("totalBeneficiaries")}
            >
              <div className="absolute top-0 right-0 w-16 h-16 bg-blue-100 rounded-bl-full opacity-50 group-hover:opacity-70 transition-opacity"></div>
              <div className="flex justify-between items-center mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-700 group-hover:bg-blue-200 transition-colors shadow-sm">
                  <Users size={24} />
                </div>
              </div>
              <div className="space-y-2 relative z-10">
                <h3 className="text-sm font-medium text-gray-600">Total Beneficiaries</h3>
                <p className="text-3xl font-bold text-blue-800">
                  {loadingStats ? "..." : stats.totalBeneficiaries}
                </p>
              </div>
            </div>

            {/* Active Child Beneficiaries */}
            <div
              className="bg-white rounded-2xl shadow-md p-6 border-l-4 border-blue-600 hover:-translate-y-1 transition-transform duration-300 cursor-pointer group relative overflow-hidden"
              onClick={() => handleCardClick("activeChild")}
            >
              <div className="absolute top-0 right-0 w-16 h-16 bg-blue-100 rounded-bl-full opacity-50 group-hover:opacity-70 transition-opacity"></div>
              <div className="flex justify-between items-center mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-700 group-hover:bg-blue-200 transition-colors shadow-sm">
                  <UserCheck size={24} />
                </div>
              </div>
              <div className="space-y-2 relative z-10">
                <h3 className="text-sm font-medium text-gray-600">Active Child Beneficiaries</h3>
                <p className="text-3xl font-bold text-blue-800">
                  {loadingStats ? "..." : stats.activeChildBeneficiaries}
                </p>
              </div>
            </div>

            {/* Active Elderly Beneficiaries */}
            <div
              className="bg-white rounded-2xl shadow-md p-6 border-l-4 border-blue-600 hover:-translate-y-1 transition-transform duration-300 cursor-pointer group relative overflow-hidden"
              onClick={() => handleCardClick("activeElderly")}
            >
              <div className="absolute top-0 right-0 w-16 h-16 bg-blue-100 rounded-bl-full opacity-50 group-hover:opacity-70 transition-opacity"></div>
              <div className="flex justify-between items-center mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-700 group-hover:bg-blue-200 transition-colors shadow-sm">
                  <UserCheck size={24} />
                </div>
              </div>
              <div className="space-y-2 relative z-10">
                <h3 className="text-sm font-medium text-gray-600">Active Elderly Beneficiaries</h3>
                <p className="text-3xl font-bold text-blue-800">
                  {loadingStats ? "..." : stats.activeElderlyBeneficiaries}
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

            {/* Reassigned List */}
            <div
              className="bg-white rounded-2xl shadow-md p-6 border-l-4 border-blue-600 hover:-translate-y-1 transition-transform duration-300 cursor-pointer group relative overflow-hidden"
              onClick={() => handleCardClick("pendingReassignmentList")}
            >
              <div className="absolute top-0 right-0 w-16 h-16 bg-blue-100 rounded-bl-full opacity-50 group-hover:opacity-70 transition-opacity"></div>
              <div className="flex justify-between items-center mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-700 group-hover:bg-blue-200 transition-colors shadow-sm">
                  <Clock size={24} />
                </div>
              </div>
              <div className="space-y-2 relative z-10">
                <h3 className="text-sm font-medium text-gray-600">Reassigned List</h3>
                <p className="text-3xl font-bold text-blue-800">
                  {loadingStats ? "..." : stats.pendingReassignmentList}
                </p>
              </div>
            </div>

            {/* Waiting List */}
            <div
              className="bg-white rounded-2xl shadow-md p-6 border-l-4 border-blue-600 hover:-translate-y-1 transition-transform duration-300 cursor-pointer group relative overflow-hidden"
              onClick={() => handleCardClick("waitingList")}
            >
              <div className="absolute top-0 right-0 w-16 h-16 bg-blue-100 rounded-bl-full opacity-50 group-hover:opacity-70 transition-opacity"></div>
              <div className="flex justify-between items-center mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-700 group-hover:bg-blue-200 transition-colors shadow-sm">
                  <Clock size={24} />
                </div>
              </div>
              <div className="space-y-2 relative z-10">
                <h3 className="text-sm font-medium text-gray-600">Waiting List</h3>
                <p className="text-3xl font-bold text-blue-800">
                  {loadingStats ? "..." : stats.waitingList}
                </p>
              </div>
            </div>

            {/* Terminated List */}
            <div
              className="bg-white rounded-2xl shadow-md p-6 border-l-4 border-blue-600 hover:-translate-y-1 transition-transform duration-300 cursor-pointer group relative overflow-hidden"
              onClick={() => handleCardClick("terminatedList")}
            >
              <div className="absolute top-0 right-0 w-16 h-16 bg-blue-100 rounded-bl-full opacity-50 group-hover:opacity-70 transition-opacity"></div>
              <div className="flex justify-between items-center mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-700 group-hover:bg-blue-200 transition-colors shadow-sm">
                  <UserX size={24} />
                </div>
              </div>
              <div className="space-y-2 relative z-10">
                <h3 className="text-sm font-medium text-gray-600">Terminated List</h3>
                <p className="text-3xl font-bold text-blue-800">
                  {loadingStats ? "..." : stats.terminatedList}
                </p>
              </div>
            </div>

            {/* Graduated List */}
            <div
              className="bg-white rounded-2xl shadow-md p-6 border-l-4 border-blue-600 hover:-translate-y-1 transition-transform duration-300 cursor-pointer group relative overflow-hidden"
              onClick={() => handleCardClick("graduatedList")}
            >
              <div className="absolute top-0 right-0 w-16 h-16 bg-blue-100 rounded-bl-full opacity-50 group-hover:opacity-70 transition-opacity"></div>
              <div className="flex justify-between items-center mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-700 group-hover:bg-blue-200 transition-colors shadow-sm">
                  <GraduationCap size={24} />
                </div>
              </div>
              <div className="space-y-2 relative z-10">
                <h3 className="text-sm font-medium text-gray-600">Graduated List</h3>
                <p className="text-3xl font-bold text-blue-800">
                  {loadingStats ? "..." : stats.graduatedList}
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

            {/* Sponsor Request */}
            <div
              className="bg-white rounded-2xl shadow-md p-6 border-l-4 border-blue-600 hover:-translate-y-1 transition-transform duration-300 cursor-pointer group relative overflow-hidden"
              onClick={() => handleCardClick("sponsorRequest")}
            >
              <div className="absolute top-0 right-0 w-16 h-16 bg-blue-100 rounded-bl-full opacity-50 group-hover:opacity-70 transition-opacity"></div>
              <div className="flex justify-between items-center mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-700 group-hover:bg-blue-200 transition-colors shadow-sm">
                  <UserPlus size={24} />
                </div>
              </div>
              <div className="space-y-2 relative z-10">
                <h3 className="text-sm font-medium text-gray-600">Sponsor Request</h3>
                <p className="text-3xl font-bold text-blue-800">
                  {loadingStats ? "..." : stats.sponsorRequest}
                </p>
              </div>
            </div>

            {/* Inactive Sponsors */}
            <div
              className="bg-white rounded-2xl shadow-md p-6 border-l-4 border-blue-600 hover:-translate-y-1 transition-transform duration-300 cursor-pointer group relative overflow-hidden"
              onClick={() => handleCardClick("inactiveSponsors")}
            >
              <div className="absolute top-0 right-0 w-16 h-16 bg-blue-100 rounded-bl-full opacity-50 group-hover:opacity-70 transition-opacity"></div>
              <div className="flex justify-between items-center mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-700 group-hover:bg-blue-200 transition-colors shadow-sm">
                  <Building2 size={24} />
                </div>
              </div>
              <div className="space-y-2 relative z-10">
                <h3 className="text-sm font-medium text-gray-600">Inactive Sponsors</h3>
                <p className="text-3xl font-bold text-blue-800">
                  {loadingStats ? "..." : stats.inactiveSponsors}
                </p>
              </div>
            </div>

          </div>

          {/* Reports Section */}
          <ReportsSection 
            userRole="database_officer" 
            userId={userData?.id || userData?.employee_id} 
          />
        </main>
      </div>

      {/* Modals */}
      <SponsorModal
        isOpen={isSponsorModalOpen}
        onClose={() => setSponsorModalOpen(false)}
      />
      <ChildBeneficiaryModal
        isOpen={isChildBeneficiaryModalOpen}
        onClose={() => setChildBeneficiaryModalOpen(false)}
        setupFileUpload={setupFileUpload}
        guardians={guardians}
        guardianSearchTerm={guardianSearchTerm}
        handleGuardianSearch={handleGuardianSearch}
        selectGuardian={selectGuardian}
        openGuardianModal={openGuardianModal}
      />
      <ElderlyBeneficiaryModal
        isOpen={isElderlyBeneficiaryModalOpen}
        onClose={() => setElderlyBeneficiaryModalOpen(false)}
        setupFileUpload={setupFileUpload}
      />
      <GuardianModal
        isOpen={isGuardianModalOpen}
        onClose={() => setGuardianModalOpen(false)}
        setupFileUpload={setupFileUpload}
      />

      {/* SMS Modal */}
      {isSmsModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-[9999] backdrop-blur-sm backdrop-brightness-75">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800">Send SMS Message</h2>
              <button
                onClick={() => setSmsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-gray-100"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Send to: <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={smsData.recipients}
                    onChange={(e) => handleSmsInputChange("recipients", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  >
                    <option value="">Select recipients</option>
                    <option value="all">All Beneficiaries</option>
                    <option value="sponsors">All Sponsors</option>
                    <option value="staff">All Staff</option>
                    <option value="volunteers">All Volunteers</option>
                    <option value="custom">Custom List</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Message Type: <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={smsData.messageType}
                    onChange={(e) => handleSmsInputChange("messageType", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  >
                    <option value="">Select message type</option>
                    <option value="notification">Notification</option>
                    <option value="reminder">Reminder</option>
                    <option value="announcement">Announcement</option>
                    <option value="emergency">Emergency</option>
                    <option value="custom">Custom Message</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Message: <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={smsData.message}
                    onChange={(e) => handleSmsInputChange("message", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    rows="4"
                    placeholder="Enter your message here..."
                    maxLength="160"
                  ></textarea>
                  <p className="text-xs text-gray-500 mt-1">
                    Characters: {smsData.message.length}/160
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Send Options:
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="sendOption"
                        value="now"
                        checked={smsData.sendOption === "now"}
                        onChange={(e) => handleSmsInputChange("sendOption", e.target.value)}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-700">Send Now</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="sendOption"
                        value="schedule"
                        checked={smsData.sendOption === "schedule"}
                        onChange={(e) => handleSmsInputChange("sendOption", e.target.value)}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-700">Schedule for Later</span>
                    </label>
                  </div>
                </div>
                {smsData.sendOption === "schedule" && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Date: <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        value={smsData.scheduledDate}
                        onChange={(e) => handleSmsInputChange("scheduledDate", e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Time: <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="time"
                        value={smsData.scheduledTime}
                        onChange={(e) => handleSmsInputChange("scheduledTime", e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
              <button
                onClick={() => setSmsModalOpen(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSendSms}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
              >
                <Send className="h-4 w-4 mr-2" />
                Send SMS
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Profile Modal */}
      <ProfileModal 
        isOpen={isProfileModalOpen} 
        onClose={() => setIsProfileModalOpen(false)} 
      />
    </div>
  );
};

export default DODashboard;
