import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Menu,
  User,
  Bell,
  X,
  Plus,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  UserPlus,
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
} from "lucide-react";

import SponsorModal from "./SponsorModal";
import ChildBeneficiaryModal from "./ChildBeneficiaryModal";
import ElderlyBeneficiaryModal from "./ElderlyBeneficiaryModal";
import GuardianModal from "./GuardianModal";
import EmployeeModal from "./EmployeeModal";

const AdminDashboard = () => {
  const navigate = useNavigate();

  const [isNotificationSidebarOpen, setIsNotificationSidebarOpen] = useState(false);
  const [isChildBeneficiaryModalOpen, setChildBeneficiaryModalOpen] = useState(false);
  const [isElderlyBeneficiaryModalOpen, setElderlyBeneficiaryModalOpen] = useState(false);
  const [isGuardianModalOpen, setGuardianModalOpen] = useState(false);
  const [isEmployeeModalOpen, setEmployeeModalOpen] = useState(false);
  const [isSponsorModalOpen, setSponsorModalOpen] = useState(false);
  const [isSmsModalOpen, setSmsModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
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
  const [adminProfile] = useState({
    name: "Admin User",
    email: "admin@maryjoyethiopia.org",
    role: "Administrator",
    avatar: null,
  });
  const [notifications, setNotifications] = useState([
    { id: 1, title: "New Beneficiary Added", content: "A new beneficiary has been added.", time: "2 hours ago", unread: true },
    { id: 2, title: "Monthly Report Ready", content: "The monthly financial report is now available.", time: "1 day ago", unread: true },
    { id: 3, title: "Sponsor Feedback", content: "You have received new feedback from a sponsor.", time: "3 days ago", unread: false },
  ]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [stats, setStats] = useState({
    totalEmployees: 0,
    activeChildBeneficiaries: 0,
    activeElderlyBeneficiaries: 0,
    totalSponsors: 0,
    waitingList: 0,
    terminatedList: 0,
    graduatedList: 0,
    activateSponsors: 0,
    sponsorRequest: 0
  });
  const [loadingStats, setLoadingStats] = useState(true);

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
          terminatedRes,
          graduatedRes,
          pendingSponsorsRes,
          sponsorRequestsRes
        ] = await Promise.all([
          fetch('http://localhost:5000/api/employees'),
          fetch('http://localhost:5000/api/beneficiaries/children?status=active'),
          fetch('http://localhost:5000/api/beneficiaries/elderly?status=active'),
          fetch('http://localhost:5000/api/sponsors'),
          fetch('http://localhost:5000/api/beneficiaries?status=pending'),
          fetch('http://localhost:5000/api/beneficiaries?status=terminated'),
          fetch('http://localhost:5000/api/beneficiaries?status=graduated'),
          fetch('http://localhost:5000/api/sponsors?status=pending_review'),
          fetch('http://localhost:5000/api/sponsor-requests')
        ]);

        const employeesData = await employeesRes.json();
        const childData = await childBeneficiariesRes.json();
        const elderlyData = await elderlyBeneficiariesRes.json();
        const sponsorsData = await sponsorsRes.json();
        const waitingData = await waitingRes.json();
        const terminatedData = await terminatedRes.json();
        const graduatedData = await graduatedRes.json();
        const pendingSponsorsData = await pendingSponsorsRes.json();
        const sponsorRequestsData = sponsorRequestsRes.ok ? await sponsorRequestsRes.json() : { count: 0 };

        setStats({
          totalEmployees: employeesData.total || employeesData.employees?.length || 0,
          activeChildBeneficiaries: childData.total || childData.beneficiaries?.length || 0,
          activeElderlyBeneficiaries: elderlyData.total || elderlyData.beneficiaries?.length || 0,
          totalSponsors: sponsorsData.total || sponsorsData.sponsors?.length || 0,
          waitingList: waitingData.total || waitingData.beneficiaries?.length || 0,
          terminatedList: terminatedData.total || terminatedData.beneficiaries?.length || 0,
          graduatedList: graduatedData.total || graduatedData.beneficiaries?.length || 0,
          activateSponsors: pendingSponsorsData.total || pendingSponsorsData.sponsors?.length || 0,
          sponsorRequest: sponsorRequestsData.count || 0
        });
      } catch (error) {
        console.error('Error fetching statistics:', error);
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
      case "profile": setIsProfileModalOpen(true); break;
      case "settings": console.log("Navigate to settings page"); break;
      case "logout":
        if (window.confirm("Are you sure you want to logout?")) {
          localStorage.removeItem("authToken");
          localStorage.removeItem("userData");
          navigate("/login");
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
    setGuardians([{ id: 1, name: "Sample Guardian", phone: "123456789" }].filter(
      (g) => g.name.toLowerCase().includes(e.target.value.toLowerCase()) || g.phone.includes(e.target.value)
    ));
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
      case "totalEmployees": navigate("/employee_list"); break;
      case "activeChild": navigate("/child_list"); break;
      case "activeElderly": navigate("/elderly_list"); break;
      case "totalSponsors": navigate("/sponsor_list"); break;
      case "waitingList": navigate("/beneficiary_list?view=waiting"); break;
      case "terminatedList": navigate("/beneficiary_list?view=terminated"); break;
      case "graduatedList": navigate("/beneficiary_list?view=graduated"); break;
      case "activateSponsors": navigate("/sponsor_management"); break;
      case "sponser_modal": navigate("/sponser_modal"); break;
      case "sponsorRequest": navigate("/beneficiary_request"); break;
      case "financialReport": navigate("/financial_report"); break;
      case "feedback": navigate("/feedback"); break;
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

  useEffect(() => {
    const handleEscapeKey = (e) => e.key === "Escape" && closeAllPopups();
    const handleClickOutside = (e) => isProfileModalOpen && !e.target.closest(".profile-dropdown") && setProfileOpen(false);
    document.addEventListener("keydown", handleEscapeKey);
    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("keydown", handleEscapeKey);
      document.removeEventListener("click", handleClickOutside);
    };
  }, [isProfileModalOpen]);

  return (
    <div className="flex h-screen bg-[#F5ECE1]">
      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#F28C82] text-white transform transition-transform ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}
      >
        <div className="flex items-center px-6 py-4 bg-[#D97066]">
          <Building2 className="h-8 w-8 text-[#A8D5BA]" />
          <span className="ml-3 text-lg font-semibold">Mary Joy Ethiopia</span>
        </div>
        <nav className="mt-6 space-y-1">
          <button
            onClick={() => setChildBeneficiaryModalOpen(true)}
            className="flex items-center w-full px-6 py-2 text-sm font-medium hover:bg-[#D97066]"
          >
            <UserPlus className="mr-3 h-5 w-5 text-[#A8D5BA]" />
            Add Child Beneficiary
          </button>
          <button
            onClick={() => setElderlyBeneficiaryModalOpen(true)}
            className="flex items-center w-full px-6 py-2 text-sm font-medium hover:bg-[#D97066]"
          >
            <UserPlus className="mr-3 h-5 w-5 text-[#A8D5BA]" />
            Add Elder Beneficiary
          </button>
          <button
            onClick={() => setSponsorModalOpen(true)}
            className="flex items-center w-full px-6 py-2 text-sm font-medium hover:bg-[#D97066]"
          >
            <UserCheck className="mr-3 h-5 w-5 text-[#A8D5BA]" />
            Add Sponsor
          </button>
          <button
            onClick={() => setEmployeeModalOpen(true)}
            className="flex items-center w-full px-6 py-2 text-sm font-medium hover:bg-[#D97066]"
          >
            <UserPlus className="mr-3 h-5 w-5 text-[#A8D5BA]" />
            Add Employee
          </button>
          <button
            onClick={() => handleNavClick("/sponsor_management")}
            className="flex items-center w-full px-6 py-2 text-sm font-medium hover:bg-[#D97066]"
          >
            <Users className="mr-3 h-5 w-5 text-[#A8D5BA]" />
            Manage Sponsor
          </button>
          <button
            onClick={() => handleNavClick("/financial_report")}
            className="flex items-center w-full px-6 py-2 text-sm font-medium hover:bg-[#D97066]"
          >
            <FileText className="mr-3 h-5 w-5 text-[#A8D5BA]" />
            Financial Report
          </button>
          <button
            onClick={() => setSmsModalOpen(true)}
            className="flex items-center w-full px-6 py-2 text-sm font-medium hover:bg-[#D97066]"
          >
            <Send className="mr-3 h-5 w-5 text-[#A8D5BA]" />
            SMS Message
          </button>
          <button
            onClick={() => handleNavClick("/feedback")}
            className="flex items-center w-full px-6 py-2 text-sm font-medium hover:bg-[#D97066]"
          >
            <MessageCircle className="mr-3 h-5 w-5 text-[#A8D5BA]" />
            Feedback
          </button>
        </nav>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col md:ml-64">
        {/* Topbar */}
        <header className="flex items-center justify-between bg-white shadow px-4 py-3">
          <div className="flex items-center">
            <button
              className="md:hidden p-2 text-gray-500 hover:text-gray-700"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
            <h1 className="ml-2 text-xl font-semibold text-gray-800">Admin Dashboard</h1>
          </div>
          <div className="flex items-center space-x-4">
            <button
              className="relative text-gray-500 hover:text-gray-700"
              onClick={toggleNotificationSidebar}
            >
              <Bell className="h-6 w-6" />
              {notifications.filter((n) => n.unread).length > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#F28C82] text-white text-xs px-1 rounded-full">
                  {notifications.filter((n) => n.unread).length}
                </span>
              )}
            </button>
            <div className="relative profile-dropdown">
              <button
                onClick={() => setProfileOpen(!isProfileModalOpen)}
                className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
              >
                <div className="w-8 h-8 bg-[#F28C82] rounded-full flex items-center justify-center">
                  <User className="h-5 w-5 text-white" />
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-medium text-gray-700">{adminProfile.name}</p>
                  <p className="text-xs text-gray-500">{adminProfile.role}</p>
                </div>
              </button>
            </div>
          </div>
        </header>

        {/* Notification Sidebar */}
        {isNotificationSidebarOpen && (
          <div className="fixed top-0 right-0 w-80 h-full bg-white shadow-lg z-[1000] flex flex-col transition-transform duration-300 ease-in-out">
            <div className="flex justify-between items-center p-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800">Notifications</h2>
              <button className="text-gray-500 hover:text-gray-700 transition-colors duration-200" onClick={toggleNotificationSidebar}>
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              {notifications.length === 0 ? (
                <div className="text-gray-500 text-center mt-8">No notifications</div>
              ) : (
                notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-3 rounded-lg mb-3 border-l-4 ${notification.unread ? "bg-[#F5ECE1] border-[#F28C82]" : "bg-gray-50 border-gray-200"}`}
                  >
                    <h3 className="font-semibold text-gray-800">{notification.title}</h3>
                    <p className="text-sm text-gray-600">{notification.content}</p>
                    <span className="text-xs text-gray-400">{notification.time}</span>
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

        {/* Profile popup */}
        {isProfileModalOpen && (
          <div className="absolute right-4 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-xl py-2 z-50 profile-dropdown">
            <div className="px-4 py-3 border-b border-gray-100">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-[#F28C82] rounded-full flex items-center justify-center">
                  <User className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{adminProfile.name}</p>
                  <p className="text-xs text-gray-500">{adminProfile.email}</p>
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
                <X className="mr-3 h-4 w-4 text-[#F28C82]" />
                Sign Out
              </button>
            </div>
          </div>
        )}

        {/* Dashboard Content */}
        <main className="p-6 space-y-6 overflow-y-auto flex-1 relative z-10">
          {/* Stat Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
            <div
              className="bg-white border-l-4 border-[#F28C82] rounded-lg shadow p-4 flex items-center cursor-pointer hover:shadow-lg hover:-translate-y-1 transition"
              onClick={() => handleCardClick("totalBeneficiaries")}
            >
              <UserCheck className="h-8 w-8 text-[#F28C82]" />
              <div className="ml-4">
                <p className="text-gray-600 text-sm">Total Beneficiaries</p>
                <p className="text-xl font-semibold text-gray-800">9337</p>
              </div>
            </div>
            <div
              className="bg-white border-l-4 border-[#F28C82] rounded-lg shadow p-4 flex items-center cursor-pointer hover:shadow-lg hover:-translate-y-1 transition"
              onClick={() => handleCardClick("totalEmployees")}
            >
              <Users className="h-8 w-8 text-[#F28C82]" />
              <div className="ml-4">
                <p className="text-gray-600 text-sm">Total Employees</p>
                <p className="text-xl font-semibold text-gray-800">{loadingStats ? '...' : stats.totalEmployees}</p>
              </div>
            </div>
            <div
              className="bg-white border-l-4 border-[#F28C82] rounded-lg shadow p-4 flex items-center cursor-pointer hover:shadow-lg hover:-translate-y-1 transition"
              onClick={() => handleCardClick("activeChild")}
            >
              <Users className="h-8 w-8 text-[#F28C82]" />
              <div className="ml-4">
                <p className="text-gray-600 text-sm">Active Child Beneficiaries</p>
                <p className="text-xl font-semibold text-gray-800">{loadingStats ? '...' : stats.activeChildBeneficiaries}</p>
              </div>
            </div>
            <div
              className="bg-white border-l-4 border-[#F28C82] rounded-lg shadow p-4 flex items-center cursor-pointer hover:shadow-lg hover:-translate-y-1 transition"
              onClick={() => handleCardClick("activeElderly")}
            >
              <Users className="h-8 w-8 text-[#F28C82]" />
              <div className="ml-4">
                <p className="text-gray-600 text-sm">Active Elderly Beneficiaries</p>
                <p className="text-xl font-semibold text-gray-800">{loadingStats ? '...' : stats.activeElderlyBeneficiaries}</p>
              </div>
            </div>
            <div
              className="bg-white border-l-4 border-[#F28C82] rounded-lg shadow p-4 flex items-center cursor-pointer hover:shadow-lg hover:-translate-y-1 transition"
              onClick={() => handleCardClick("totalSponsors")}
            >
              <Building2 className="h-8 w-8 text-[#F28C82]" />
              <div className="ml-4">
                <p className="text-gray-600 text-sm">Sponsors</p>
                <p className="text-xl font-semibold text-gray-800">{loadingStats ? '...' : stats.totalSponsors}</p>
              </div>
            </div>
            <div
              className="bg-white border-l-4 border-[#F28C82] rounded-lg shadow p-4 flex items-center cursor-pointer hover:shadow-lg hover:-translate-y-1 transition"
              onClick={() => handleCardClick("waitingList")}
            >
              <Clock className="h-8 w-8 text-[#F28C82]" />
              <div className="ml-4">
                <p className="text-gray-600 text-sm">Waiting List</p>
                <p className="text-xl font-semibold text-gray-800">{loadingStats ? '...' : stats.waitingList}</p>
              </div>
            </div>
            <div
              className="bg-white border-l-4 border-[#F28C82] rounded-lg shadow p-4 flex items-center cursor-pointer hover:shadow-lg hover:-translate-y-1 transition"
              onClick={() => handleCardClick("terminatedList")}
            >
              <UserX className="h-8 w-8 text-[#F28C82]" />
              <div className="ml-4">
                <p className="text-gray-600 text-sm">Terminated List</p>
                <p className="text-xl font-semibold text-gray-800">{loadingStats ? '...' : stats.terminatedList}</p>
              </div>
            </div>
            <div
              className="bg-white border-l-4 border-[#F28C82] rounded-lg shadow p-4 flex items-center cursor-pointer hover:shadow-lg hover:-translate-y-1 transition"
              onClick={() => handleCardClick("graduatedList")}
            >
              <GraduationCap className="h-8 w-8 text-[#F28C82]" />
              <div className="ml-4">
                <p className="text-gray-600 text-sm">Graduated List</p>
                <p className="text-xl font-semibold text-gray-800">{loadingStats ? '...' : stats.graduatedList}</p>
              </div>
            </div>
            <div
              className="bg-white border-l-4 border-[#F28C82] rounded-lg shadow p-4 flex items-center cursor-pointer hover:shadow-lg hover:-translate-y-1 transition"
              onClick={() => handleCardClick("activateSponsors")}
            >
              <CheckCircle className="h-8 w-8 text-[#F28C82]" />
              <div className="ml-4">
                <p className="text-gray-600 text-sm">Activate Sponsors</p>
                <p className="text-xl font-semibold text-gray-800">{loadingStats ? '...' : stats.activateSponsors}</p>
              </div>
            </div>
            <div
              className="bg-white border-l-4 border-[#F28C82] rounded-lg shadow p-4 flex items-center cursor-pointer hover:shadow-lg hover:-translate-y-1 transition"
              onClick={() => handleCardClick("sponsorRequest")}
            >
              <UserPlus className="h-8 w-8 text-[#F28C82]" />
              <div className="ml-4">
                <p className="text-gray-600 text-sm">Sponsor Request</p>
                <p className="text-xl font-semibold text-gray-800">{loadingStats ? '...' : stats.sponsorRequest}</p>
              </div>
            </div>
          </div>

          {/* Recent Reports Section */}
          <div className="bg-white rounded-lg shadow border p-6 relative z-10">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-800">Recent Reports</h2>
              <button className="bg-[#F28C82] text-white px-4 py-2 rounded-lg font-medium transition hover:bg-[#D97066] flex items-center gap-2">
                <Plus className="w-5 h-5" />
                <span>Upload New Report</span>
              </button>
            </div>
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between p-4 bg-[#F5ECE1] rounded-lg hover:bg-[#EDE2D9] transition">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-[#F28C82] rounded-md flex items-center justify-center">
                    <FileText className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">Annual Report 2023</h3>
                    <p className="text-sm text-gray-500">Uploaded: Jan 15, 2024</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <button className="text-[#F28C82] font-medium hover:text-[#D97066]">Download</button>
                  <button className="text-red-500 font-medium hover:text-red-600">Delete</button>
                </div>
              </div>
              <div className="flex items-center justify-between p-4 bg-[#F5ECE1] rounded-lg hover:bg-[#EDE2D9] transition">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-[#F28C82] rounded-md flex items-center justify-center">
                    <FileText className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">Quarterly Update Q1 2024</h3>
                    <p className="text-sm text-gray-500">Uploaded: Apr 5, 2024</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <button className="text-[#F28C82] font-medium hover:text-[#D97066]">Download</button>
                  <button className="text-red-500 font-medium hover:text-red-600">Delete</button>
                </div>
              </div>
              <div className="flex items-center justify-between p-4 bg-[#F5ECE1] rounded-lg hover:bg-[#EDE2D9] transition">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-[#F28C82] rounded-md flex items-center justify-center">
                    <FileText className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">Sponsorship Impact Report</h3>
                    <p className="text-sm text-gray-500">Uploaded: Mar 20, 2024</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <button className="text-[#F28C82] font-medium hover:text-[#D97066]">Download</button>
                  <button className="text-red-500 font-medium hover:text-red-600">Delete</button>
                </div>
              </div>
            </div>
          </div>
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
      <EmployeeModal
        isOpen={isEmployeeModalOpen}
        onClose={() => setEmployeeModalOpen(false)}
        setupFileUpload={setupFileUpload}
        departments={departments}
        accessLevels={accessLevels}
      />

      {/* SMS Modal */}
      {isSmsModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-[9999] backdrop-blur-sm backdrop-brightness-75">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800">Send SMS Message</h2>
              <button onClick={() => setSmsModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Send to: <span className="text-red-500">*</span></label>
                  <select
                    value={smsData.recipients}
                    onChange={(e) => handleSmsInputChange("recipients", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#F28C82] focus:border-[#F28C82]"
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">Message Type: <span className="text-red-500">*</span></label>
                  <select
                    value={smsData.messageType}
                    onChange={(e) => handleSmsInputChange("messageType", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#F28C82] focus:border-[#F28C82]"
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">Message: <span className="text-red-500">*</span></label>
                  <textarea
                    value={smsData.message}
                    onChange={(e) => handleSmsInputChange("message", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#F28C82] focus:border-[#F28C82]"
                    rows="4"
                    placeholder="Enter your message here..."
                    maxLength="160"
                  ></textarea>
                  <p className="text-xs text-gray-500 mt-1">Characters: {smsData.message.length}/160</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Send Options:</label>
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
                      <label className="block text-sm font-medium text-gray-700 mb-1">Date: <span className="text-red-500">*</span></label>
                      <input
                        type="date"
                        value={smsData.scheduledDate}
                        onChange={(e) => handleSmsInputChange("scheduledDate", e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#F28C82] focus:border-[#F28C82]"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Time: <span className="text-red-500">*</span></label>
                      <input
                        type="time"
                        value={smsData.scheduledTime}
                        onChange={(e) => handleSmsInputChange("scheduledTime", e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#F28C82] focus:border-[#F28C82]"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
              <button
                onClick={() => setSmsModalOpen(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSendSms}
                className="px-4 py-2 bg-[#F28C82] text-white rounded-md hover:bg-[#D97066] transition-colors flex items-center"
              >
                <Send className="h-4 w-4 mr-2" />
                Send SMS
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Profile Modal */}
      {isProfileModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-[9999] backdrop-blur-sm backdrop-brightness-75">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800">Admin Profile</h2>
              <button
                onClick={() => setIsProfileModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="p-6">
              <div className="space-y-6">
                <div className="flex items-center space-x-6">
                  <div className="w-24 h-24 bg-[#F28C82] rounded-full flex items-center justify-center">
                    <User className="h-12 w-12 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-800">{adminProfile.name}</h3>
                    <p className="text-gray-600">{adminProfile.role}</p>
                    <p className="text-sm text-gray-500">{adminProfile.email}</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">Personal Information</h4>
                    <div className="space-y-3">
                      <div><label className="block text-sm font-medium text-gray-700">Full Name</label><p className="text-gray-900">{adminProfile.name}</p></div>
                      <div><label className="block text-sm font-medium text-gray-700">Email Address</label><p className="text-gray-900">{adminProfile.email}</p></div>
                      <div><label className="block text-sm font-medium text-gray-700">Role</label><p className="text-gray-900">{adminProfile.role}</p></div>
                      <div><label className="block text-sm font-medium text-gray-700">Employee ID</label><p className="text-gray-900">ADM-001</p></div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">Contact Information</h4>
                    <div className="space-y-3">
                      <div><label className="block text-sm font-medium text-gray-700">Phone Number</label><p className="text-gray-900">+251 911 123 456</p></div>
                      <div><label className="block text-sm font-medium text-gray-700">Address</label><p className="text-gray-900">Addis Ababa, Ethiopia</p></div>
                      <div><label className="block text-sm font-medium text-gray-700">Department</label><p className="text-gray-900">Administration</p></div>
                      <div><label className="block text-sm font-medium text-gray-700">Join Date</label><p className="text-gray-900">January 15, 2023</p></div>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">System Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-[#F5ECE1] p-4 rounded-lg"><h5 className="font-medium text-gray-800">Last Login</h5><p className="text-sm text-gray-600">Today, 08:08 AM EDT</p></div>
                    <div className="bg-[#F5ECE1] p-4 rounded-lg"><h5 className="font-medium text-gray-800">Account Status</h5><span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#A8D5BA] text-green-800">Active</span></div>
                    <div className="bg-[#F5ECE1] p-4 rounded-lg"><h5 className="font-medium text-gray-800">Permissions</h5><p className="text-sm text-gray-600">Full Access</p></div>
                  </div>
                </div>
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">Recent Activity</h4>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3 p-3 bg-[#F5ECE1] rounded-lg"><div className="w-2 h-2 bg-green-500 rounded-full"></div><div className="flex-1"><p className="text-sm text-gray-800">Added new beneficiary - John Doe</p><p className="text-xs text-gray-500">2 hours ago</p></div></div>
                    <div className="flex items-center space-x-3 p-3 bg-[#F5ECE1] rounded-lg"><div className="w-2 h-2 bg-blue-500 rounded-full"></div><div className="flex-1"><p className="text-sm text-gray-800">Updated sponsor information</p><p className="text-xs text-gray-500">1 day ago</p></div></div>
                    <div className="flex items-center space-x-3 p-3 bg-[#F5ECE1] rounded-lg"><div className="w-2 h-2 bg-yellow-500 rounded-full"></div><div className="flex-1"><p className="text-sm text-gray-800">Generated monthly report</p><p className="text-xs text-gray-500">3 days ago</p></div></div>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
              <button
                onClick={() => setIsProfileModalOpen(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => console.log("Edit profile clicked")}
                className="px-4 py-2 bg-[#F28C82] text-white rounded-md hover:bg-[#D97066] transition-colors flex items-center"
              >
                <UserCog className="h-4 w-4 mr-2" />
                Edit Profile
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
