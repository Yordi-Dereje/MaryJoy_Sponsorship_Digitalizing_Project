Main Colorless Code


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
} from "lucide-react";
import maryjoylogo from "./maryjoylogo.jpg";

const AdminDashboard = () => {
  const navigate = useNavigate();

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNotificationSidebarOpen, setIsNotificationSidebarOpen] = useState(false);
  const [isProfilePopupOpen, setIsProfilePopupOpen] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [sponsorModalOpen, setSponsorModalOpen] = useState(false);


  
  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const toggleNotificationSidebar = () => {
    setIsNotificationSidebarOpen(!isNotificationSidebarOpen);
    if (!isNotificationSidebarOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
  };

  const toggleProfilePopup = () => {
    setIsProfilePopupOpen(!isProfilePopupOpen);
    if (!isProfilePopupOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
  };

  const closeAllPopups = () => {
    setIsNotificationSidebarOpen(false);
    setIsMobileMenuOpen(false);
    setIsProfilePopupOpen(false);
    document.body.style.overflow = "auto";
  };

  const handleCardClick = (cardType) => {
    switch (cardType) {
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
      default:
        console.log(`Clicked on ${cardType} card`);
    }
    closeAllPopups(); // Close any open sidebars/popups on navigation
  };

  const handleNavClick = (path) => {
    navigate(path);
    closeAllPopups(); // Close any open sidebars/popups on navigation
  };

  const markAllRead = () => {
    // In a real app, this would update notification status in state/backend
    alert("All notifications marked as read!");
  };

  useEffect(() => {
    const handleEscapeKey = (e) => {
      if (e.key === "Escape") {
        closeAllPopups();
      }
    };

    document.addEventListener("keydown", handleEscapeKey);
    return () => {
      document.removeEventListener("keydown", handleEscapeKey);
    };
  }, []);

  return (
    <div className="font-inter bg-mj-gray-bg text-mj-text-dark min-h-screen flex flex-col">
      {/* Overlay */}
      {(isNotificationSidebarOpen ||
        isMobileMenuOpen ||
        isProfilePopupOpen) && (
        <div
          className="fixed inset-0 bg-gray-500 bg-opacity-10 z-[999] transition-opacity duration-300 opacity-100 visible"
          onClick={closeAllPopups}
        ></div>
      )}

      {/* Notification Sidebar */}
      <div
        className={`fixed top-0 w-80 h-screen bg-white shadow-lg z-[1000] transition-all duration-300 flex flex-col ${
          isNotificationSidebarOpen ? "right-0" : "-right-80"
        }`}
      >
        <div className="p-6 border-b border-mj-border flex justify-between items-center">
          <h2 className="text-xl font-semibold">Notifications</h2>
          <button
            className="bg-transparent border-none cursor-pointer text-mj-text-gray p-1 rounded-md hover:text-gray-900 hover:bg-mj-gray-hover"
            onClick={toggleNotificationSidebar}
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
          <div className="p-4 rounded-lg bg-mj-light-blue border-l-4 border-mj-blue relative z-10">
            <h3 className="font-semibold mb-1">New Beneficiary Added</h3>
            <p>A new child beneficiary has been added to the system.</p>
            <span className="text-xs text-mj-text-medium-gray">
              2 hours ago
            </span>
          </div>
          <div className="p-4 rounded-lg bg-mj-light-blue border-l-4 border-mj-blue relative z-10">
            <h3 className="font-semibold mb-1">Sponsor Payment Received</h3>
            <p>Sponsor ID 01-240 has made a payment of $200.</p>
            <span className="text-xs text-mj-text-medium-gray">1 day ago</span>
          </div>
          <div className="p-4 rounded-lg bg-mj-gray-bg border-l-4 border-mj-blue relative z-10">
            <h3 className="font-semibold mb-1">Report Generated</h3>
            <p>Monthly financial report is ready for review.</p>
            <span className="text-xs text-mj-text-medium-gray">3 days ago</span>
          </div>
          <div className="p-4 rounded-lg bg-mj-gray-bg border-l-4 border-mj-blue relative z-10">
            <h3 className="font-semibold mb-1">System Update</h3>
            <p>The system has been updated to version 2.1.0.</p>
            <span className="text-xs text-mj-text-medium-gray">1 week ago</span>
          </div>
        </div>
        <div className="p-4 border-t border-mj-border text-center relative z-10">
          <button
            className="text-mj-blue font-medium hover:text-mj-blue bg-transparent border-none cursor-pointer"
            onClick={markAllRead}
          >
            Mark all as read
          </button>
        </div>
      </div>

      {/* Profile Popup */}
      <div
        className={`absolute right-0 w-80 bg-white rounded-lg shadow-xl z-[1000] p-6 transition-all duration-300 ${
          isProfilePopupOpen
            ? "top-16 opacity-100 visible"
            : "top-10 opacity-0 invisible"
        }`}
      >
        <div className="flex justify-between items-center mb-4 pb-4 border-b border-mj-border">
          <h2 className="text-lg font-semibold text-mj-blue">Edit Profile</h2>
          <button
            className="bg-transparent border-none cursor-pointer text-mj-text-gray p-1 rounded-md hover:text-gray-900 hover:bg-mj-gray-hover"
            onClick={toggleProfilePopup}
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="mb-4">
          <label className="block text-mj-blue font-medium mb-1">
            Full Name
          </label>
          <input
            type="text"
            className="w-full p-2.5 border border-mj-border rounded-md text-mj-blue focus:outline-none focus:border-mj-blue focus:ring-2 focus:ring-mj-light-blue"
            value="Admin User"
          />
        </div>
        <div className="mb-4">
          <label className="block text-mj-blue font-medium mb-1">
            Department
          </label>
          <input
            type="text"
            className="w-full p-2.5 border border-mj-border rounded-md text-mj-blue focus:outline-none focus:border-mj-blue focus:ring-2 focus:ring-mj-light-blue"
            value="Administration"
          />
        </div>
        <div className="mb-4">
          <label className="block text-mj-blue font-medium mb-1">
            Phone Number
          </label>
          <input
            type="tel"
            className="w-full p-2.5 border border-mj-border rounded-md text-mj-blue focus:outline-none focus:border-mj-blue focus:ring-2 focus:ring-mj-light-blue"
            value="+251912345678"
          />
        </div>
        <div className="mb-4">
          <label className="block text-mj-blue font-medium mb-1">Email</label>
          <input
            type="email"
            className="w-full p-2.5 border border-mj-border rounded-md text-mj-blue focus:outline-none focus:border-mj-blue focus:ring-2 focus:ring-mj-light-blue"
            value="admin@maryjoyethiopia.org"
          />
        </div>
        <div className="mb-4 relative">
          <label className="block text-mj-blue font-medium mb-1">
            Password
          </label>
          <input
            type={passwordVisible ? "text" : "password"}
            className="w-full p-2.5 border border-mj-border rounded-md text-mj-blue pr-10 focus:outline-none focus:border-mj-blue focus:ring-2 focus:ring-mj-light-blue"
            value="password123"
          />
          <button
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-transparent border-none cursor-pointer text-mj-text-gray"
            onClick={() => setPasswordVisible(!passwordVisible)}
          >
            {passwordVisible ? (
              <EyeOff className="w-5 h-5" />
            ) : (
              <Eye className="w-5 h-5" />
            )}
          </button>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <button
            className="px-4 py-2 rounded-md font-medium cursor-pointer transition-all duration-200 bg-mj-gray-hover text-mj-text-dark hover:bg-mj-border"
            onClick={toggleProfilePopup}
          >
            Cancel
          </button>
          <button className="px-4 py-2 rounded-md font-medium cursor-pointer transition-all duration-200 bg-mj-orange text-white hover:bg-mj-dark-orange">
            Save Changes
          </button>
        </div>
      </div>

      {/* Mobile Top Bar */}
      <div className="md:hidden bg-mj-blue text-white p-4 flex justify-between items-center sticky top-0 z-[101]">
        <button
          className="bg-transparent border-none text-white cursor-pointer flex items-center justify-center"
          onClick={toggleMobileMenu}
        >
          <Menu className="w-6 h-6" />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center flex-shrink-0">
            <BarChart3 style={{ color: "#1e40af" }} className="w-5 h-5" />
          </div>
          <div className="font-bold text-lg">Mary Joy Ethiopia</div>
        </div>
        <div className="flex items-center gap-4 relative z-[102] ml-auto">
          <div
            className="relative cursor-pointer p-2 rounded-full transition-colors duration-200 hover:bg-mj-blue"
            onClick={toggleNotificationSidebar}
          >
            <Bell className="w-5 h-5" />
            <div className="absolute top-1 right-1 w-2 h-2 bg-mj-red rounded-full border-2 border-white"></div>
          </div>
          <div
            className="w-10 h-10 bg-mj-orange rounded-full flex items-center justify-center text-white font-semibold cursor-pointer transition-colors duration-200 hover:bg-mj-dark-orange"
            onClick={toggleProfilePopup}
          >
            <User className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Mobile Navigation Dropdown */}
      <div
        className={`md:hidden absolute top-full left-0 right-0 bg-mj-blue z-[100] p-4 flex-col gap-2 shadow-md ${
          isMobileMenuOpen ? "flex" : "hidden"
        }`}
      >
        <Link
          to="/admin_dashboard"
          className="flex items-center gap-3 p-3 rounded-lg transition-all duration-200 text-white bg-mj-orange shadow-md"
          onClick={() => handleNavClick("/admin_dashboard")}
        >
          <BarChart3 className="flex-shrink-0 w-6 h-6" />
          <span className="font-medium overflow-hidden">Dashboard</span>
        </Link>
        <Link
          to="/add_beneficiary"
          className="flex items-center gap-3 p-3 rounded-lg transition-all duration-200 text-mj-light-blue hover:bg-mj-blue hover:text-white"
          onClick={() => handleNavClick("/add_beneficiary")}
        >
          <UserPlus className="flex-shrink-0 w-6 h-6" />
          <span className="font-medium overflow-hidden">Add Beneficiaries</span>
        </Link>
       <button
  onClick={() => setSponsorModalOpen(true)}
  className="flex items-center gap-3 p-3 rounded-lg transition-all duration-200 text-mj-light-blue hover:bg-mj-blue hover:text-white w-full text-left"
>
  <Building2 className="flex-shrink-0 w-6 h-6" />
  <span
    className={`font-medium overflow-hidden transition-opacity duration-300 ${
      isSidebarCollapsed ? "opacity-0" : ""
    }`}
  >
    Add Sponsor
  </span>
</button>

        <Link
          to="/sponsor_management"
          className="flex items-center gap-3 p-3 rounded-lg transition-all duration-200 text-mj-light-blue hover:bg-mj-blue hover:text-white"
          onClick={() => handleNavClick("/sponsor_management")}
        >
          <UserCog className="flex-shrink-0 w-6 h-6" />
          <span className="font-medium overflow-hidden">Manage Sponsor</span>
        </Link>
        <Link
          to="/financial_report"
          className="flex items-center gap-3 p-3 rounded-lg transition-all duration-200 text-mj-light-blue hover:bg-mj-blue hover:text-white"
          onClick={() => handleNavClick("/financial_report")}
        >
          <FileText className="flex-shrink-0 w-6 h-6" />
          <span className="font-medium overflow-hidden">Financial Report</span>
        </Link>
        <button className="flex items-center gap-3 p-3 rounded-lg transition-all duration-200 text-mj-light-blue hover:bg-mj-blue hover:text-white">
          <MessageSquare className="flex-shrink-0 w-6 h-6" />
          <span className="font-medium overflow-hidden">Send SMS</span>
        </button>
        <Link
          to="/feedback"
          className="flex items-center gap-3 p-3 rounded-lg transition-all duration-200 text-mj-light-blue hover:bg-mj-blue hover:text-white"
          onClick={() => handleNavClick("/feedback")}
        >
          <MessageCircle className="flex-shrink-0 w-6 h-6" />
          <span className="font-medium overflow-hidden">Feedback</span>
        </Link>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div
          className={`bg-mj-blue shadow-lg flex-col transition-all duration-300 z-[100] ${
            isSidebarCollapsed ? "w-[70px]" : "w-[250px]"
          } hidden md:flex`}
        >
          <div className="p-6 border-b border-mj-blue flex items-center justify-between">
            <div className="flex items-center gap-3 overflow-hidden whitespace-nowrap">
              {/* <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center flex-shrink-0">
                <BarChart3 style={{ color: "#1e40af" }} className="w-5 h-5" />
              </div> */}
              <h1
                className={`text-white font-bold transition-opacity duration-300 ${
                  isSidebarCollapsed ? "opacity-0" : ""
                }`}
              >
                Mary Joy Ethiopia
              </h1>
            </div>
            <button
              className={`bg-transparent border-none text-white cursor-pointer flex items-center justify-center transition-transform duration-300 ${
                isSidebarCollapsed ? "rotate-180" : ""
              }`}
              onClick={toggleSidebar}
            >
              {isSidebarCollapsed ? (
                <ChevronRight className="w-5 h-5" />
              ) : (
                <ChevronLeft className="w-5 h-5" />
              )}
            </button>
          </div>

          <div className="p-2 flex flex-col gap-2 flex-1">
            <Link
              to="/admin_dashboard"
              className="flex items-center gap-3 p-3 rounded-lg transition-all duration-200 text-white bg-mj-orange shadow-md"
              onClick={() => handleNavClick("/admin_dashboard")}
            >
              <BarChart3 className="flex-shrink-0 w-6 h-6" />
              <span
                className={`font-medium overflow-hidden transition-opacity duration-300 ${
                  isSidebarCollapsed ? "opacity-0" : ""
                }`}
              >
                Dashboard
              </span>
            </Link>
            <Link
              to="/add_beneficiary"
              className="flex items-center gap-3 p-3 rounded-lg transition-all duration-200 text-mj-light-blue hover:bg-mj-blue hover:text-white"
              onClick={() => handleNavClick("/add_beneficiary")}
            >
              <UserPlus className="flex-shrink-0 w-6 h-6" />
              <span
                className={`font-medium overflow-hidden transition-opacity duration-300 ${
                  isSidebarCollapsed ? "opacity-0" : ""
                }`}
              >
                Add Beneficiaries
              </span>
            </Link>
            <Link
             // to="/add_sponsor"
             to  = "/sponsor_modal"
              className="flex items-center gap-3 p-3 rounded-lg transition-all duration-200 text-mj-light-blue hover:bg-mj-blue hover:text-white"
              onClick={() => handleNavClick("/sponsor_modal")}
            >
              <Building2 className="flex-shrink-0 w-6 h-6" />
              <span
                className={`font-medium overflow-hidden transition-opacity duration-300 ${
                  isSidebarCollapsed ? "opacity-0" : ""
                }`}
              >
                Add Sponsor
              </span>
            </Link>
            <Link
              to="/sponsor_management"
              className="flex items-center gap-3 p-3 rounded-lg transition-all duration-200 text-mj-light-blue hover:bg-mj-blue hover:text-white"
              onClick={() => handleNavClick("/sponsor_management")}
            >
              <UserCog className="flex-shrink-0 w-6 h-6" />
              <span
                className={`font-medium overflow-hidden transition-opacity duration-300 ${
                  isSidebarCollapsed ? "opacity-0" : ""
                }`}
              >
                Manage Sponsor
              </span>
            </Link>
            <Link
              to="/financial_report"
              className="flex items-center gap-3 p-3 rounded-lg transition-all duration-200 text-mj-light-blue hover:bg-mj-blue hover:text-white"
              onClick={() => handleNavClick("/financial_report")}
            >
              <FileText className="flex-shrink-0 w-6 h-6" />
              <span
                className={`font-medium overflow-hidden transition-opacity duration-300 ${
                  isSidebarCollapsed ? "opacity-0" : ""
                }`}
              >
                Financial Report
              </span>
            </Link>
            <button className="flex items-center gap-3 p-3 rounded-lg transition-all duration-200 text-mj-light-blue hover:bg-mj-blue hover:text-white">
              <MessageSquare className="flex-shrink-0 w-6 h-6" />
              <span
                className={`font-medium overflow-hidden transition-opacity duration-300 ${
                  isSidebarCollapsed ? "opacity-0" : ""
                }`}
              >
                Send SMS
              </span>
            </button>
            <Link
              to="/feedback"
              className="flex items-center gap-3 p-3 rounded-lg transition-all duration-200 text-mj-light-blue hover:bg-mj-blue hover:text-white"
              onClick={() => handleNavClick("/feedback")}
            >
              <MessageCircle className="flex-shrink-0 w-6 h-6" />
              <span
                className={`font-medium overflow-hidden transition-opacity duration-300 ${
                  isSidebarCollapsed ? "opacity-0" : ""
                }`}
              >
                Feedback
              </span>
            </Link>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-auto flex flex-col">
          {/* Header */}
          <header className="bg-white shadow-sm border-b border-mj-border p-4 flex justify-between items-center">
            <div className="hidden md:flex items-center gap-3 flex-1">
              <div className="w-8 h-8 rounded-full overflow-hidden">
                {/* Assuming you have a maryjoy.jpeg in your public folder or accessible path */}
                <img
                  src={maryjoylogo}
                  alt="Mary Joy Logo"
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="text-xl font-bold">Mary Joy Ethiopia</span>
            </div>
            <div className="flex items-center gap-4 relative z-10 ml-auto">
              <div
                className="relative cursor-pointer p-2 rounded-full transition-colors duration-200 hover:bg-mj-gray-hover"
                onClick={toggleNotificationSidebar}
              >
                <Bell className="w-5 h-5" />
                <div className="absolute top-1 right-1 w-2 h-2 bg-mj-red rounded-full border-2 border-white"></div>
              </div>
              <div
                className="w-10 h-10 bg-mj-orange rounded-full flex items-center justify-center text-white font-semibold cursor-pointer transition-colors duration-200 hover:bg-mj-dark-orange"
                onClick={toggleProfilePopup}
              >
                <User className="w-5 h-5" />
              </div>
            </div>
          </header>

          {/* Dashboard Content */}
          <main className="p-6 flex flex-col gap-8 overflow-y-auto flex-1 relative z-10">
            {/* Statistics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
              <div
                className="bg-white rounded-xl shadow-sm border border-mj-gray-hover p-6 transition-all duration-200 border-l-4 border-mj-blue relative z-10 cursor-pointer hover:shadow-lg hover:-translate-y-1"
                onClick={() => handleCardClick("totalBeneficiaries")}
              >
                <div className="flex items-center justify-between mb-4">
                  <Users className="w-8 h-8 text-mj-blue" />
                </div>
                <div className="flex flex-col gap-2">
                  <h3 className="text-sm font-semibold text-mj-text-dark-gray">
                    Total Beneficiaries
                  </h3>
                  <p className="text-2xl font-bold text-mj-orange">9337</p>
                </div>
              </div>

              <div
                className="bg-white rounded-xl shadow-sm border border-mj-gray-hover p-6 transition-all duration-200 border-l-4 border-mj-blue relative z-10 cursor-pointer hover:shadow-lg hover:-translate-y-1"
                onClick={() => handleCardClick("totalEmployees")}
              >
                <div className="flex items-center justify-between mb-4">
                  <Users className="w-8 h-8 text-mj-blue" />
                </div>
                <div className="flex flex-col gap-2">
                  <h3 className="text-sm font-semibold text-mj-text-dark-gray">
                    Total Employees
                  </h3>
                  <p className="text-2xl font-bold text-mj-orange">20</p>
                </div>
              </div>

              <div
                className="bg-white rounded-xl shadow-sm border border-mj-gray-hover p-6 transition-all duration-200 border-l-4 border-mj-blue relative z-10 cursor-pointer hover:shadow-lg hover:-translate-y-1"
                onClick={() => handleCardClick("activeChild")}
              >
                <div className="flex items-center justify-between mb-4">
                  <UserCheck className="w-8 h-8 text-mj-blue" />
                </div>
                <div className="flex flex-col gap-2">
                  <h3 className="text-sm font-semibold text-mj-text-dark-gray">
                    Active Child Beneficiaries
                  </h3>
                  <p className="text-2xl font-bold text-mj-orange">8200</p>
                </div>
              </div>

              <div
                className="bg-white rounded-xl shadow-sm border border-mj-gray-hover p-6 transition-all duration-200 border-l-4 border-mj-blue relative z-10 cursor-pointer hover:shadow-lg hover:-translate-y-1"
                onClick={() => handleCardClick("activeElderly")}
              >
                <div className="flex items-center justify-between mb-4">
                  <Users className="w-8 h-8 text-mj-blue" />
                </div>
                <div className="flex flex-col gap-2">
                  <h3 className="text-sm font-semibold text-mj-text-dark-gray">
                    Active Elderly Beneficiaries
                  </h3>
                  <p className="text-2xl font-bold text-mj-orange">1100</p>
                </div>
              </div>

              <div
                className="bg-white rounded-xl shadow-sm border border-mj-gray-hover p-6 transition-all duration-200 border-l-4 border-mj-blue relative z-10 cursor-pointer hover:shadow-lg hover:-translate-y-1"
                onClick={() => handleCardClick("totalSponsors")}
              >
                <div className="flex items-center justify-between mb-4">
                  <Building2 className="w-8 h-8 text-mj-blue" />
                </div>
                <div className="flex flex-col gap-2">
                  <h3 className="text-sm font-semibold text-mj-text-dark-gray">
                    Sponsors
                  </h3>
                  <p className="text-2xl font-bold text-mj-orange">2200</p>
                </div>
              </div>

              <div
                className="bg-white rounded-xl shadow-sm border border-mj-gray-hover p-6 transition-all duration-200 border-l-4 border-mj-blue relative z-10 cursor-pointer hover:shadow-lg hover:-translate-y-1"
                onClick={() => handleCardClick("waitingList")}
              >
                <div className="flex items-center justify-between mb-4">
                  <Clock className="w-8 h-8 text-mj-blue" />
                </div>
                <div className="flex flex-col gap-2">
                  <h3 className="text-sm font-semibold text-mj-text-dark-gray">
                    Waiting List
                  </h3>
                  <p className="text-2xl font-bold text-mj-orange">27</p>
                </div>
              </div>

              <div
                className="bg-white rounded-xl shadow-sm border border-mj-gray-hover p-6 transition-all duration-200 border-l-4 border-mj-blue relative z-10 cursor-pointer hover:shadow-lg hover:-translate-y-1"
                onClick={() => handleCardClick("terminatedList")}
              >
                <div className="flex items-center justify-between mb-4">
                  <UserX className="w-8 h-8 text-mj-blue" />
                </div>
                <div className="flex flex-col gap-2">
                  <h3 className="text-sm font-semibold text-mj-text-dark-gray">
                    Terminated List
                  </h3>
                  <p className="text-2xl font-bold text-mj-orange">5</p>
                </div>
              </div>

              <div
                className="bg-white rounded-xl shadow-sm border border-mj-gray-hover p-6 transition-all duration-200 border-l-4 border-mj-blue relative z-10 cursor-pointer hover:shadow-lg hover:-translate-y-1"
                onClick={() => handleCardClick("graduatedList")}
              >
                <div className="flex items-center justify-between mb-4">
                  <GraduationCap className="w-8 h-8 text-mj-blue" />
                </div>
                <div className="flex flex-col gap-2">
                  <h3 className="text-sm font-semibold text-mj-text-dark-gray">
                    Graduated List
                  </h3>
                  <p className="text-2xl font-bold text-mj-orange">5</p>
                </div>
              </div>

              <div
                className="bg-white rounded-xl shadow-sm border border-mj-gray-hover p-6 transition-all duration-200 border-l-4 border-mj-blue relative z-10 cursor-pointer hover:shadow-lg hover:-translate-y-1"
                onClick={() => handleCardClick("activateSponsors")}
              >
                <div className="flex items-center justify-between mb-4">
                  <CheckCircle className="w-8 h-8 text-mj-blue" />
                </div>
                <div className="flex flex-col gap-2">
                  <h3 className="text-sm font-semibold text-mj-text-dark-gray">
                    Activate Sponsors
                  </h3>
                  <p className="text-2xl font-bold text-mj-orange">2</p>
                </div>
              </div>

              <div
                className="bg-white rounded-xl shadow-sm border border-mj-gray-hover p-6 transition-all duration-200 border-l-4 border-mj-blue relative z-10 cursor-pointer hover:shadow-lg hover:-translate-y-1"
                onClick={() => handleCardClick("sponsorRequest")}
              >
                <div className="flex items-center justify-between mb-4">
                  <UserPlus className="w-8 h-8 text-mj-blue" />
                </div>
                <div className="flex flex-col gap-2">
                  <h3 className="text-sm font-semibold text-mj-text-dark-gray">
                    Sponsor Request
                  </h3>
                  <p className="text-2xl font-bold text-mj-orange">27</p>
                </div>
              </div>
            </div>

            {/* Recent Reports Section */}
            <div className="bg-white rounded-xl shadow-sm border border-mj-border p-6 relative z-10">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">Recent Reports</h2>
                <button className="bg-mj-orange text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 border-none cursor-pointer flex items-center gap-2 hover:bg-mj-dark-orange">
                  <Plus className="w-5 h-5" />
                  <span>Upload New Report</span>
                </button>
              </div>

              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between p-4 bg-mj-gray-bg rounded-lg transition-colors duration-200 hover:bg-mj-gray-hover">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-mj-light-blue rounded-md flex items-center justify-center">
                      <FileText
                        style={{ color: "#2563eb" }}
                        className="w-5 h-5"
                      />
                    </div>
                    <div>
                      <h3 className="font-semibold">Annual Report 2023</h3>
                      <p className="text-sm text-mj-text-medium-gray">
                        Uploaded: Jan 15, 2024
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <button className="text-mj-dark-orange font-medium transition-colors duration-200 cursor-pointer bg-transparent border-none hover:text-mj-dark-orange">
                      Download
                    </button>
                    <button className="text-mj-red font-medium transition-colors duration-200 cursor-pointer bg-transparent border-none hover:text-mj-red">
                      Delete
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-mj-gray-bg rounded-lg transition-colors duration-200 hover:bg-mj-gray-hover">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-mj-light-blue rounded-md flex items-center justify-center">
                      <FileText
                        style={{ color: "#2563eb" }}
                        className="w-5 h-5"
                      />
                    </div>
                    <div>
                      <h3 className="font-semibold">
                        Quarterly Update Q1 2024
                      </h3>
                      <p className="text-sm text-mj-text-medium-gray">
                        Uploaded: Apr 5, 2024
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <button className="text-mj-dark-orange font-medium transition-colors duration-200 cursor-pointer bg-transparent border-none hover:text-mj-dark-orange">
                      Download
                    </button>
                    <button className="text-mj-red font-medium transition-colors duration-200 cursor-pointer bg-transparent border-none hover:text-mj-red">
                      Delete
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-mj-gray-bg rounded-lg transition-colors duration-200 hover:bg-mj-gray-hover">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-mj-light-blue rounded-md flex items-center justify-center">
                      <FileText
                        style={{ color: "#2563eb" }}
                        className="w-5 h-5"
                      />
                    </div>
                    <div>
                      <h3 className="font-semibold">
                        Sponsorship Impact Report
                      </h3>
                      <p className="text-sm text-mj-text-medium-gray">
                        Uploaded: Mar 20, 2024
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <button className="text-mj-dark-orange font-medium transition-colors duration-200 cursor-pointer bg-transparent border-none hover:text-mj-dark-orange">
                      Download
                    </button>
                    <button className="text-mj-red font-medium transition-colors duration-200 cursor-pointer bg-transparent border-none hover:text-mj-red">
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
