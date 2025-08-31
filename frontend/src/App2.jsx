// import React from "react";
// import ErrorBoundary from "./ErrorBoundary";
// import {
//   BrowserRouter as Router,
//   Routes,
//   Route,
//   Link,
//   Navigate,
// } from "react-router-dom";
// import AdminDashboard from "./AdminDashboard";
// import BeneficiaryList from "./BeneficiaryList";
// import BeneficiaryRequest from "./BeneficiaryRequest";
// import ChildList from "./ChildList";
// import CoordinatorDashboard from "./CoordinatorDashboard";
// import DODashboard from "./DODashboard";
// import ElderlyList from "./ElderlyList";
// import EmployeeList from "./EmployeeList";
// import Feedback from "./Feedback";
// import FinancialReport from "./FinancialReport";
// import SponsorDashboard from "./SponsorDashboard";
// import SponsorList from "./SponsorList";
// import SponsorManagement from "./SponsorManagement";
// import SponsorModal from "./SponsorModal";

// function App() {
//   return (
//     <ErrorBoundary>
//       <Router>
//         <Routes>
//           <Route path="/" element={<Navigate to="/admin_dashboard" />} />
//           <Route path="/admin_dashboard" element={<AdminDashboard />} />
//           <Route path="/beneficiary_list" element={<BeneficiaryList />} />
//           <Route path="/beneficiary_request" element={<BeneficiaryRequest />} />
//           <Route path="/child_list" element={<ChildList />} />
//           <Route
//             path="/coordinator_dashboard"
//             element={<CoordinatorDashboard />}
//           />
//           <Route path="/d_o_dashboard" element={<DODashboard />} />
//           <Route path="/elderly_list" element={<ElderlyList />} />
//           <Route path="/employee_list" element={<EmployeeList />} />
//           <Route path="/feedback" element={<Feedback />} />
//           <Route path="/financial_report" element={<FinancialReport />} />
//           <Route path="/sponsor_dashboard" element={<SponsorDashboard />} />
//           <Route path="/sponsor_list" element={<SponsorList />} />
//           <Route path="/sponsor_management" element={<SponsorManagement />} />
//           <Route path="/sponsor_modal" element={<SponsorModal/>} />
//           <Route path="*" element={<Navigate to="/" />} />
//         </Routes>
//       </Router>
//     </ErrorBoundary>
//   );
// }

// export default App;

import { useState, useEffect } from "react";
import {
  HeartHandshake,
  Bell,
  User,
  X,
  Users,
  DollarSign,
  Calendar,
  BarChart3,
  MessageSquare,
  Edit,
  UserPlus,
  Heart,
  FileText,
  Download,
  Eye,
  EyeOff,
} from "lucide-react";

const SponsorDashboard = () => {
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [requestModalOpen, setRequestModalOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: "New Impact Report Available",
      message: "Your 2024 Impact Report is now ready to download.",
      time: "2 hours ago",
      unread: true,
    },
    {
      id: 2,
      title: "Payment Received",
      message: "Thank you for your monthly contribution of $200.",
      time: "1 day ago",
      unread: true,
    },
    {
      id: 3,
      title: "Beneficiary Update",
      message: "Maria has sent you a new letter and updated photos.",
      time: "3 days ago",
      unread: false,
    },
    {
      id: 4,
      title: "Annual Report",
      message: "The 2023 Annual Report is now available for download.",
      time: "1 week ago",
      unread: false,
    },
    {
      id: 5,
      title: "Thank You Message",
      message:
        "Your sponsored beneficiary's family sent you a thank you message.",
      time: "2 weeks ago",
      unread: false,
    },
  ]);

  const reports = [
    {
      id: 1,
      year: "2024",
      title: "Annual Report",
      published: "April 15, 2024",
      format: "PDF, 2.4MB",
    },
    {
      id: 2,
      year: "2023",
      title: "Annual Report",
      published: "March 28, 2023",
      format: "PDF, 2.1MB",
    },
    {
      id: 3,
      year: "2022",
      title: "Annual Report",
      published: "April 5, 2022",
      format: "PDF, 1.9MB",
    },
    {
      id: 4,
      year: "2021",
      title: "Annual Report - Amheric",
      published: "May 12, 2021",
      format: "PDF, 2.7MB",
    },
    {
      id: 5,
      year: "2020",
      title: "Annual Report",
      published: "April 20, 2020",
      format: "PDF, 2.3MB",
    },
    {
      id: 6,
      year: "2019",
      title: "Annual Report - Amheric",
      published: "June 3, 2019",
      format: "PDF, 2.5MB",
    },
  ];

  const markAllAsRead = () => {
    setNotifications(
      notifications.map((notif) => ({ ...notif, unread: false }))
    );
  };

  const handleCardClick = (cardType) => {
    switch (cardType) {
      case "totalBeneficiaries":
        window.location.href = "specific_beneficiaries.html";
        break;
      case "paymentDetails":
        window.location.href = "payment_history.html";
        break;
      default:
        console.log(`Clicked on ${cardType} card`);
    }
  };

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") {
        setNotificationsOpen(false);
        setFeedbackModalOpen(false);
        setProfileModalOpen(false);
        setRequestModalOpen(false);
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, []);

  const Overlay = ({ isActive, onClick }) => (
    <div
      className={`fixed inset-0 bg-black transition-opacity duration-300 z-40 ${
        isActive ? "opacity-50 visible" : "opacity-0 invisible"
      }`}
      onClick={onClick}
    />
  );

  const Modal = ({ isOpen, onClose, title, children }) => (
    <>
      <Overlay isActive={isOpen} onClick={onClose} />
      <div
        className={`fixed inset-0 flex items-center justify-center z-50 transition-opacity duration-300 ${
          isOpen ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
      >
        <div
          className={`bg-white rounded-2xl w-full max-w-md mx-4 p-6 shadow-xl transition-transform duration-300 ${
            isOpen ? "translate-y-0" : "-translate-y-5"
          }`}
        >
          <div className="flex justify-between items-center pb-4 mb-4 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 p-1 rounded-md hover:bg-gray-100"
            >
              <X size={20} />
            </button>
          </div>
          {children}
        </div>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-inter">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-30 py-4 px-8 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-800 rounded-full flex items-center justify-center text-white">
            <HeartHandshake size={20} />
          </div>
          <div className="text-2xl font-bold text-blue-800">
            Mary Joy Ethiopia
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div
            className="relative p-2 rounded-full hover:bg-gray-100 cursor-pointer transition-colors"
            onClick={() => setNotificationsOpen(true)}
          >
            <Bell size={20} />
            {notifications.some((n) => n.unread) && (
              <div className="absolute top-1 right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></div>
            )}
          </div>
          <div
            className="w-10 h-10 bg-amber-500 rounded-full flex items-center justify-center text-white cursor-pointer hover:bg-amber-600 transition-colors"
            onClick={() => setProfileModalOpen(true)}
          >
            <User size={20} />
          </div>
        </div>
      </header>

      {/* Notification Sidebar */}
      <Overlay
        isActive={notificationsOpen}
        onClick={() => setNotificationsOpen(false)}
      />
      <div
        className={`fixed top-0 right-0 w-full sm:w-96 h-full bg-white shadow-xl z-50 transition-transform duration-300 ${
          notificationsOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-semibold">Notifications</h2>
          <button
            onClick={() => setNotificationsOpen(false)}
            className="text-gray-500 hover:text-gray-700 p-1 rounded-md hover:bg-gray-100"
          >
            <X size={20} />
          </button>
        </div>
        <div className="h-full overflow-y-auto p-4">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`p-4 rounded-lg mb-3 border-l-4 ${
                notification.unread
                  ? "bg-blue-50 border-blue-500"
                  : "bg-gray-50 border-blue-800"
              }`}
            >
              <h3 className="font-semibold mb-1">{notification.title}</h3>
              <p className="text-sm mb-2">{notification.message}</p>
              <span className="text-xs text-gray-500">{notification.time}</span>
            </div>
          ))}
        </div>
        <div className="p-4 border-t border-gray-200 text-center">
          <button
            onClick={markAllAsRead}
            className="text-blue-500 font-medium hover:text-blue-700"
          >
            Mark all as read
          </button>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6">
        {/* Welcome Section */}
        <section className="bg-white rounded-2xl shadow-sm p-8 mb-10">
          <h1 className="text-3xl font-bold mb-2">Welcome, Sponsor Name!</h1>
          <p className="text-gray-600 text-lg">
            Thank you for making a difference
          </p>
        </section>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {/* Total Beneficiaries */}
          <div
            className="bg-white rounded-2xl shadow-sm p-6 border-l-4 border-blue-800 hover:-translate-y-1 transition-transform cursor-pointer"
            onClick={() => handleCardClick("totalBeneficiaries")}
          >
            <div className="flex justify-between items-center mb-4">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-800">
                <Users size={20} />
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-gray-600">
                Total Beneficiaries Supported
              </h3>
              <p className="text-3xl font-bold text-blue-800">12</p>
            </div>
          </div>

          {/* Total Contributions */}
          <div className="bg-white rounded-2xl shadow-sm p-6 border-l-4 border-blue-800 hover:-translate-y-1 transition-transform">
            <div className="flex justify-between items-center mb-4">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-800">
                <DollarSign size={20} />
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-gray-600">
                Total Contributions
              </h3>
              <p className="text-3xl font-bold text-blue-800">
                <span className="text-2xl text-green-500">$</span>5,200
              </p>
            </div>
          </div>

          {/* Upcoming Payment */}
          <div className="bg-white rounded-2xl shadow-sm p-6 border-l-4 border-blue-800 hover:-translate-y-1 transition-transform">
            <div className="flex justify-between items-center mb-4">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-800">
                <Calendar size={20} />
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-gray-600">
                Upcoming Payment Date
              </h3>
              <p className="text-sm text-gray-600">August 15, 2025</p>
            </div>
            <div className="pt-4 mt-4 border-t border-gray-200">
              <button
                className="flex items-center gap-2 text-blue-500 text-sm font-medium hover:text-blue-700"
                onClick={() => handleCardClick("paymentDetails")}
              >
                <Eye size={16} />
                View Payment Details
              </button>
            </div>
          </div>

          {/* Impact Summary */}
          <div className="bg-white rounded-2xl shadow-sm p-6 border-l-4 border-blue-800 hover:-translate-y-1 transition-transform">
            <div className="flex justify-between items-center mb-4">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-800">
                <BarChart3 size={20} />
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-gray-600">
                Years of Support
              </h3>
              <p className="text-3xl font-bold text-blue-800">3</p>
            </div>
            <div className="pt-4 mt-4 border-t border-gray-200">
              <button className="flex items-center gap-2 text-blue-500 text-sm font-medium hover:text-blue-700">
                <Download size={16} />
                Download Impact Report
              </button>
            </div>
          </div>
        </div>

        {/* Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          {/* Give Feedback */}
          <div className="bg-white rounded-2xl shadow-sm p-6 border-t-4 border-amber-500 hover:-translate-y-1 transition-transform text-center">
            <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center text-amber-500 mx-auto mb-4">
              <MessageSquare size={24} />
            </div>
            <h3 className="text-lg font-semibold mb-2">Give Feedback</h3>
            <p className="text-gray-600 text-sm mb-6">
              Share your experience and suggestions to help us improve our
              program
            </p>
            <button
              className="bg-amber-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-amber-600 transition-colors flex items-center justify-center gap-2 mx-auto"
              onClick={() => setFeedbackModalOpen(true)}
            >
              <Edit size={16} />
              Provide Feedback
            </button>
          </div>

          {/* Request Additional Beneficiary */}
          <div className="bg-white rounded-2xl shadow-sm p-6 border-t-4 border-amber-500 hover:-translate-y-1 transition-transform text-center">
            <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center text-amber-500 mx-auto mb-4">
              <UserPlus size={24} />
            </div>
            <h3 className="text-lg font-semibold mb-2">
              Support Another Beneficiary
            </h3>
            <p className="text-gray-600 text-sm mb-6">
              Extend your impact by sponsoring an additional beneficiary in need
            </p>
            <button
              className="bg-amber-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-amber-600 transition-colors flex items-center justify-center gap-2 mx-auto"
              onClick={() => setRequestModalOpen(true)}
            >
              <Heart size={16} />
              Request Additional Beneficiary
            </button>
          </div>
        </div>

        {/* Reports Section */}
        <section className="bg-white rounded-2xl shadow-sm p-6 mb-8">
          <div className="flex justify-between items-center pb-4 mb-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold">Our Annual Reports</h2>
          </div>

          <div className="space-y-4">
            {reports.map((report) => (
              <div
                key={report.id}
                className="flex items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-800 mr-4">
                  <FileText size={20} />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium">
                    {report.year} - {report.title}
                  </h3>
                  <p className="text-sm text-gray-600">
                    Published: {report.published} • {report.format}
                  </p>
                </div>
                <button className="text-blue-500 font-medium hover:text-blue-700 flex items-center gap-2">
                  <Download size={16} />
                  Download
                </button>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Feedback Modal */}
      <Modal
        isOpen={feedbackModalOpen}
        onClose={() => setFeedbackModalOpen(false)}
        title="Give Feedback"
      >
        <div className="mb-6">
          <label className="block text-gray-700 font-medium mb-2">
            Your Feedback
          </label>
          <textarea
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Write your feedback here..."
            rows={5}
          />
        </div>
        <div className="flex justify-end gap-3">
          <button
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
            onClick={() => setFeedbackModalOpen(false)}
          >
            Cancel
          </button>
          <button className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600">
            Submit
          </button>
        </div>
      </Modal>

      {/* Profile Modal */}
      <Modal
        isOpen={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
        title="My Profile"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Full Name
            </label>
            <input
              type="text"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter full name"
              defaultValue="Sponsor Name"
            />
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Email
            </label>
            <input
              type="email"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter email address"
              defaultValue="sponsor@example.com"
            />
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Phone Number
            </label>
            <input
              type="tel"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter phone number"
              defaultValue="+1234567890"
            />
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-10"
                placeholder="Enter password"
                defaultValue="password123"
              />
              <button
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <button
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
            onClick={() => setProfileModalOpen(false)}
          >
            Cancel
          </button>
          <button className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600">
            Save Changes
          </button>
        </div>
      </Modal>

      {/* Request Beneficiary Modal */}
      <Modal
        isOpen={requestModalOpen}
        onClose={() => setRequestModalOpen(false)}
        title="Request Additional Beneficiary"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Beneficiary Type
            </label>
            <select className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
              <option>Any</option>
              <option>Child</option>
              <option>Elderly</option>
            </select>
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Number of Beneficiaries
            </label>
            <input
              type="number"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter number"
            />
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Reason for Request
            </label>
            <textarea
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Explain your reason..."
              rows={4}
            />
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <button
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
            onClick={() => setRequestModalOpen(false)}
          >
            Cancel
          </button>
          <button className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600">
            Submit
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default SponsorDashboard;
