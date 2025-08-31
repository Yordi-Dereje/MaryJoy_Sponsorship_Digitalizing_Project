// import React, { useState, useEffect } from "react";
// import { Link, useNavigate } from "react-router-dom";
// import {
//   Menu,
//   User,
//   Bell,
//   X,
//   Plus,
//   BarChart3,
//   ChevronLeft,
//   ChevronRight,
//   UserPlus,
//   UserCog,
//   FileText,
//   MessageSquare,
//   MessageCircle,
//   Users,
//   UserCheck,
//   Building2,
//   Clock,
//   UserX,
//   GraduationCap,
//   CheckCircle,
//   EyeOff,
//   Eye,
// } from "lucide-react";
// import maryjoylogo from "./maryjoylogo.jpg";

// import SponsorModal from "./SponsorModal";
// import BeneficiaryModal from "./BeneficiaryModal";

// const AdminDashboard = () => {
//   const navigate = useNavigate();

//   const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
//   const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
//   const [isNotificationSidebarOpen, setIsNotificationSidebarOpen] = useState(false);
//   const [isProfilePopupOpen, setIsProfilePopupOpen] = useState(false);
//   const [passwordVisible, setPasswordVisible] = useState(false);
//   //const [sponsorModalOpen, setSponsorModalOpen] = useState(false);

// //const AdminDashboard = () => {
//   const [sidebarOpen, setSidebarOpen] = useState(false);
//   const [isSponsorModalOpen, setSponsorModalOpen] = useState(false);
//   const [isBeneficiaryModalOpen, setBeneficiaryModalOpen] = useState(false);
//   const [isProfileOpen, setProfileOpen] = useState(false);

//   const toggleSidebar = () => {
//     setIsSidebarCollapsed(!isSidebarCollapsed);
//   };

//   const toggleMobileMenu = () => {
//     setIsMobileMenuOpen(!isMobileMenuOpen);
//   };

//   const toggleNotificationSidebar = () => {
//     setIsNotificationSidebarOpen(!isNotificationSidebarOpen);
//     if (!isNotificationSidebarOpen) {
//       document.body.style.overflow = "hidden";
//     } else {
//       document.body.style.overflow = "auto";
//     }
//   };

//   const toggleProfilePopup = () => {
//     setIsProfilePopupOpen(!isProfilePopupOpen);
//     if (!isProfilePopupOpen) {
//       document.body.style.overflow = "hidden";
//     } else {
//       document.body.style.overflow = "auto";
//     }
//   };

//   const closeAllPopups = () => {
//     setIsNotificationSidebarOpen(false);
//     setIsMobileMenuOpen(false);
//     setIsProfilePopupOpen(false);
//     document.body.style.overflow = "auto";
//   };

//   const handleCardClick = (cardType) => {
//     switch (cardType) {
//       case "totalEmployees":
//         navigate("/employee_list");
//         break;
//       case "activeChild":
//         navigate("/child_list");
//         break;
//       case "activeElderly":
//         navigate("/elderly_list");
//         break;
//       case "totalSponsors":
//         navigate("/sponsor_list");
//         break;
//       case "waitingList":
//         navigate("/beneficiary_list?view=waiting");
//         break;
//       case "terminatedList":
//         navigate("/beneficiary_list?view=terminated");
//         break;
//       case "graduatedList":
//         navigate("/beneficiary_list?view=graduated");
//         break;
//       case "activateSponsors":
//         navigate("/sponsor_management");
//         break;

//       case "sponser_modal":
//         navigate("/sponser_modal");
//         break;

//       case "sponsorRequest":
//         navigate("/beneficiary_request");
//         break;
//       case "financialReport":
//         navigate("/financial_report");
//         break;
//       case "feedback":
//         navigate("/feedback");
//         break;
//       default:
//         console.log(`Clicked on ${cardType} card`);
//     }
//     closeAllPopups(); // Close any open sidebars/popups on navigation
//   };

//   const handleNavClick = (path) => {
//     navigate(path);
//     closeAllPopups(); // Close any open sidebars/popups on navigation
//   };

//   const markAllRead = () => {
//     // In a real app, this would update notification status in state/backend
//     alert("All notifications marked as read!");
//   };

//   useEffect(() => {
//     const handleEscapeKey = (e) => {
//       if (e.key === "Escape") {
//         closeAllPopups();
//       }
//     };

//     document.addEventListener("keydown", handleEscapeKey);
//     return () => {
//       document.removeEventListener("keydown", handleEscapeKey);
//     };
//   }, []);

//   return (
//     <div className="flex h-screen bg-gray-50">
//       {/* Sidebar */}
//       <div
//         className={`fixed inset-y-0 left-0 z-50 w-64 bg-indigo-700 text-white transform transition-transform ${
//           sidebarOpen ? "translate-x-0" : "-translate-x-full"
//         } md:translate-x-0`}
//       >
//         <div className="flex items-center px-6 py-4 bg-indigo-800">
//           <Building2 className="h-8 w-8 text-amber-400" />
//           <span className="ml-3 text-lg font-semibold">Mary Joy Ethiopia</span>
//         </div>
//         <nav className="mt-6 space-y-1">
//           <button
//             onClick={() => setBeneficiaryModalOpen(true)}
//             className="flex items-center w-full px-6 py-2 text-sm font-medium hover:bg-indigo-600"
//           >
//             <UserPlus className="mr-3 h-5 w-5 text-amber-400" />
//             Add Beneficiary
//           </button>
//           <button
//             onClick={() => setSponsorModalOpen(true)}
//             className="flex items-center w-full px-6 py-2 text-sm font-medium hover:bg-indigo-600"
//           >
//             <UserCheck className="mr-3 h-5 w-5 text-amber-400" />
//             Add Sponsor
//           </button>
//           <button
//             onClick={() => navigate("/sponsor_management")}
//             className="flex items-center w-full px-6 py-2 text-sm font-medium hover:bg-indigo-600"
//           >
//             <Users className="mr-3 h-5 w-5 text-amber-400" />
//             Manage Sponsor
//           </button>
//           <button
//             onClick={() => navigate("/financial_report")}
//             className="flex items-center w-full px-6 py-2 text-sm font-medium hover:bg-indigo-600"
//           >
//             <FileText className="mr-3 h-5 w-5 text-amber-400" />
//             Financial Report
//           </button>
//           <button
//             onClick={() => navigate("/feedback")}
//             className="flex items-center w-full px-6 py-2 text-sm font-medium hover:bg-indigo-600"
//           >
//             <MessageCircle className="mr-3 h-5 w-5 text-amber-400" />
//             Feedback
//           </button>
//         </nav>
//       </div>

//       {/* Main content */}
//       <div className="flex-1 flex flex-col md:ml-64">
//         {/* Topbar */}
//         <header className="flex items-center justify-between bg-white shadow px-4 py-3">
//           <div className="flex items-center">
//             <button
//               className="md:hidden p-2 text-gray-500 hover:text-gray-700"
//               onClick={() => setSidebarOpen(!sidebarOpen)}
//             >
//               {sidebarOpen ? (
//                 <X className="h-6 w-6" />
//               ) : (
//                 <Menu className="h-6 w-6" />
//               )}
//             </button>
//             <h1 className="ml-2 text-xl font-semibold text-gray-800">
//               Dashboard
//             </h1>
//           </div>
//           <div className="flex items-center space-x-4">
//             <button className="relative text-gray-500 hover:text-gray-700">
//               <Bell className="h-6 w-6" />
//               <span className="absolute -top-1 -right-1 bg-amber-500 text-white text-xs px-1 rounded-full">
//                 3
//               </span>
//             </button>
//             <button
//               onClick={() => setProfileOpen(!isProfileOpen)}
//               className="flex items-center space-x-2"
//             >
//               <User className="h-6 w-6 text-gray-600" />
//               <span className="hidden md:inline text-gray-700 font-medium">
//                 Admin
//               </span>
//             </button>
//           </div>
//         </header>

//         {/* Profile popup */}
//         {isProfileOpen && (
//           <div className="absolute right-6 mt-14 w-48 bg-white border border-gray-200 rounded-lg shadow-lg py-2 z-50">
//             <a
//               href="#profile"
//               className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
//             >
//               Profile
//             </a>
//             <a
//               href="#settings"
//               className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
//             >
//               Settings
//             </a>
//             <a
//               href="#logout"
//               className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
//             >
//               Logout
//             </a>
//           </div>
//         )}

//         {/* Dashboard Content */}
//         <main className="p-6 space-y-6 overflow-y-auto flex-1 relative z-10">
//           {/* Stat Cards */}
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
//             <div
//               className="bg-white border-l-4 border-amber-500 rounded-lg shadow p-4 flex items-center cursor-pointer hover:shadow-lg hover:-translate-y-1 transition"
//               onClick={() => handleCardClick("totalBeneficiaries")}
//             >
//               <Users className="h-8 w-8 text-indigo-600" />
//               <div className="ml-4">
//                 <p className="text-gray-600 text-sm">Total Beneficiaries</p>
//                 <p className="text-xl font-semibold text-gray-800">9337</p>
//               </div>
//             </div>

//             <div
//               className="bg-white border-l-4 border-amber-500 rounded-lg shadow p-4 flex items-center cursor-pointer hover:shadow-lg hover:-translate-y-1 transition"
//               onClick={() => handleCardClick("totalEmployees")}
//             >
//               <Users className="h-8 w-8 text-indigo-600" />
//               <div className="ml-4">
//                 <p className="text-gray-600 text-sm">Total Employees</p>
//                 <p className="text-xl font-semibold text-gray-800">20</p>
//               </div>
//             </div>

//             <div
//               className="bg-white border-l-4 border-amber-500 rounded-lg shadow p-4 flex items-center cursor-pointer hover:shadow-lg hover:-translate-y-1 transition"
//               onClick={() => handleCardClick("activeChild")}
//             >
//               <UserCheck className="h-8 w-8 text-indigo-600" />
//               <div className="ml-4">
//                 <p className="text-gray-600 text-sm">
//                   Active Child Beneficiaries
//                 </p>
//                 <p className="text-xl font-semibold text-gray-800">8200</p>
//               </div>
//             </div>

//             <div
//               className="bg-white border-l-4 border-amber-500 rounded-lg shadow p-4 flex items-center cursor-pointer hover:shadow-lg hover:-translate-y-1 transition"
//               onClick={() => handleCardClick("activeElderly")}
//             >
//               <Users className="h-8 w-8 text-indigo-600" />
//               <div className="ml-4">
//                 <p className="text-gray-600 text-sm">
//                   Active Elderly Beneficiaries
//                 </p>
//                 <p className="text-xl font-semibold text-gray-800">1100</p>
//               </div>
//             </div>

//             <div
//               className="bg-white border-l-4 border-amber-500 rounded-lg shadow p-4 flex items-center cursor-pointer hover:shadow-lg hover:-translate-y-1 transition"
//               onClick={() => handleCardClick("totalSponsors")}
//             >
//               <Building2 className="h-8 w-8 text-indigo-600" />
//               <div className="ml-4">
//                 <p className="text-gray-600 text-sm">Sponsors</p>
//                 <p className="text-xl font-semibold text-gray-800">2200</p>
//               </div>
//             </div>

//             <div
//               className="bg-white border-l-4 border-amber-500 rounded-lg shadow p-4 flex items-center cursor-pointer hover:shadow-lg hover:-translate-y-1 transition"
//               onClick={() => handleCardClick("waitingList")}
//             >
//               <Clock className="h-8 w-8 text-indigo-600" />
//               <div className="ml-4">
//                 <p className="text-gray-600 text-sm">Waiting List</p>
//                 <p className="text-xl font-semibold text-gray-800">27</p>
//               </div>
//             </div>

//             <div
//               className="bg-white border-l-4 border-amber-500 rounded-lg shadow p-4 flex items-center cursor-pointer hover:shadow-lg hover:-translate-y-1 transition"
//               onClick={() => handleCardClick("terminatedList")}
//             >
//               <UserX className="h-8 w-8 text-indigo-600" />
//               <div className="ml-4">
//                 <p className="text-gray-600 text-sm">Terminated List</p>
//                 <p className="text-xl font-semibold text-gray-800">5</p>
//               </div>
//             </div>

//             <div
//               className="bg-white border-l-4 border-amber-500 rounded-lg shadow p-4 flex items-center cursor-pointer hover:shadow-lg hover:-translate-y-1 transition"
//               onClick={() => handleCardClick("graduatedList")}
//             >
//               <GraduationCap className="h-8 w-8 text-indigo-600" />
//               <div className="ml-4">
//                 <p className="text-gray-600 text-sm">Graduated List</p>
//                 <p className="text-xl font-semibold text-gray-800">5</p>
//               </div>
//             </div>

//             <div
//               className="bg-white border-l-4 border-amber-500 rounded-lg shadow p-4 flex items-center cursor-pointer hover:shadow-lg hover:-translate-y-1 transition"
//               onClick={() => handleCardClick("activateSponsors")}
//             >
//               <CheckCircle className="h-8 w-8 text-indigo-600" />
//               <div className="ml-4">
//                 <p className="text-gray-600 text-sm">Activate Sponsors</p>
//                 <p className="text-xl font-semibold text-gray-800">2</p>
//               </div>
//             </div>

//             <div
//               className="bg-white border-l-4 border-amber-500 rounded-lg shadow p-4 flex items-center cursor-pointer hover:shadow-lg hover:-translate-y-1 transition"
//               onClick={() => handleCardClick("sponsorRequest")}
//             >
//               <UserPlus className="h-8 w-8 text-indigo-600" />
//               <div className="ml-4">
//                 <p className="text-gray-600 text-sm">Sponsor Request</p>
//                 <p className="text-xl font-semibold text-gray-800">27</p>
//               </div>
//             </div>
//           </div>

//           {/* Recent Reports Section */}
//           <div className="bg-white rounded-lg shadow border p-6 relative z-10">
//             <div className="flex justify-between items-center mb-6">
//               <h2 className="text-xl font-bold text-gray-800">
//                 Recent Reports
//               </h2>
//               <button className="bg-amber-500 text-white px-4 py-2 rounded-lg font-medium transition hover:bg-amber-600 flex items-center gap-2">
//                 <Plus className="w-5 h-5" />
//                 <span>Upload New Report</span>
//               </button>
//             </div>

//             <div className="flex flex-col gap-4">
//               <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
//                 <div className="flex items-center gap-4">
//                   <div className="w-10 h-10 bg-indigo-100 rounded-md flex items-center justify-center">
//                     <FileText className="w-5 h-5 text-indigo-600" />
//                   </div>
//                   <div>
//                     <h3 className="font-semibold text-gray-800">
//                       Annual Report 2023
//                     </h3>
//                     <p className="text-sm text-gray-500">
//                       Uploaded: Jan 15, 2024
//                     </p>
//                   </div>
//                 </div>
//                 <div className="flex items-center gap-4">
//                   <button className="text-amber-600 font-medium hover:text-amber-700">
//                     Download
//                   </button>
//                   <button className="text-red-500 font-medium hover:text-red-600">
//                     Delete
//                   </button>
//                 </div>
//               </div>

//               <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
//                 <div className="flex items-center gap-4">
//                   <div className="w-10 h-10 bg-indigo-100 rounded-md flex items-center justify-center">
//                     <FileText className="w-5 h-5 text-indigo-600" />
//                   </div>
//                   <div>
//                     <h3 className="font-semibold text-gray-800">
//                       Quarterly Update Q1 2024
//                     </h3>
//                     <p className="text-sm text-gray-500">
//                       Uploaded: Apr 5, 2024
//                     </p>
//                   </div>
//                 </div>
//                 <div className="flex items-center gap-4">
//                   <button className="text-amber-600 font-medium hover:text-amber-700">
//                     Download
//                   </button>
//                   <button className="text-red-500 font-medium hover:text-red-600">
//                     Delete
//                   </button>
//                 </div>
//               </div>

//               <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
//                 <div className="flex items-center gap-4">
//                   <div className="w-10 h-10 bg-indigo-100 rounded-md flex items-center justify-center">
//                     <FileText className="w-5 h-5 text-indigo-600" />
//                   </div>
//                   <div>
//                     <h3 className="font-semibold text-gray-800">
//                       Sponsorship Impact Report
//                     </h3>
//                     <p className="text-sm text-gray-500">
//                       Uploaded: Mar 20, 2024
//                     </p>
//                   </div>
//                 </div>
//                 <div className="flex items-center gap-4">
//                   <button className="text-amber-600 font-medium hover:text-amber-700">
//                     Download
//                   </button>
//                   <button className="text-red-500 font-medium hover:text-red-600">
//                     Delete
//                   </button>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </main>

//         {/* Dashboard Content */}
//        {/* <main className="p-6 space-y-6">*/}
//           {/* Stat Cards */}
//          {/*<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//             <div className="bg-white border-l-4 border-amber-500 rounded-lg shadow p-4 flex items-center">
//               <User className="h-8 w-8 text-indigo-600" />
//               <div className="ml-4">
//                 <p className="text-gray-600 text-sm">Total Beneficiaries</p>
//                 <p className="text-xl font-semibold text-gray-800">1,245</p>
//               </div>
//             </div>

//             <div className="bg-white border-l-4 border-amber-500 rounded-lg shadow p-4 flex items-center">
//               <Clock className="h-8 w-8 text-indigo-600" />
//               <div className="ml-4">
//                 <p className="text-gray-600 text-sm">Waiting List</p>
//                 <p className="text-xl font-semibold text-gray-800">56</p>
//               </div>
//             </div>

//             <div className="bg-white border-l-4 border-amber-500 rounded-lg shadow p-4 flex items-center">
//               <GraduationCap className="h-8 w-8 text-indigo-600" />
//               <div className="ml-4">
//                 <p className="text-gray-600 text-sm">Graduated</p>
//                 <p className="text-xl font-semibold text-gray-800">312</p>
//               </div>
//             </div>

//             <div className="bg-white border-l-4 border-amber-500 rounded-lg shadow p-4 flex items-center">
//               <UserCheck className="h-8 w-8 text-indigo-600" />
//               <div className="ml-4">
//                 <p className="text-gray-600 text-sm">Sponsors</p>
//                 <p className="text-xl font-semibold text-gray-800">78</p>
//               </div>
//             </div>

//             <div className="bg-white border-l-4 border-amber-500 rounded-lg shadow p-4 flex items-center">
//               <Users className="h-8 w-8 text-indigo-600" />
//               <div className="ml-4">
//                 <p className="text-gray-600 text-sm">Volunteers</p>
//                 <p className="text-xl font-semibold text-gray-800">24</p>
//               </div>
//             </div>

//             <div className="bg-white border-l-4 border-amber-500 rounded-lg shadow p-4 flex items-center">
//               <UserX className="h-8 w-8 text-indigo-600" />
//               <div className="ml-4">
//                 <p className="text-gray-600 text-sm">Staff</p>
//                 <p className="text-xl font-semibold text-gray-800">12</p>
//               </div>
//             </div>
//           </div>
//         </main>
//         */}
//       </div>

//       {/* Modals */}
//       <SponsorModal
//         isOpen={isSponsorModalOpen}
//         onClose={() => setSponsorModalOpen(false)}
//       />
//       <BeneficiaryModal
//         isOpen={isBeneficiaryModalOpen}
//         onClose={() => setBeneficiaryModalOpen(false)}
//       />
//     </div>
//   );
// };

// export default AdminDashboard;
// import React, { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import {
//   Menu as MenuIcon,
//   Notifications as BellIcon,
//   AccountCircle as UserIcon,
//   Add as PlusIcon,
//   People as UsersIcon,
//   Group as UserCheckIcon,
//   Business as Building2Icon,
//   AccessTime as ClockIcon,
//   School as GraduationCapIcon,
//   Cancel as UserXIcon,
//   CheckCircle as CheckCircleIcon,
//   Description as FileTextIcon,
//   Close as CloseIcon,
// } from "@mui/icons-material";

// import {
//   Drawer,
//   AppBar,
//   Toolbar,
//   IconButton,
//   Typography,
//   Box,
//   List,
//   ListItemButton,
//   ListItemIcon,
//   ListItemText,
//   Button,
//   Card,
//   CardContent,
//   Grid,
//   Badge,
//   Popover,
//   Avatar,
//   Modal,
//   TextField,
//   Select,
//   MenuItem,
//   FormControl,
//   InputLabel,
// } from "@mui/material";

// import SponsorModal from "./SponsorModal";
// import BeneficiaryModal from "./BeneficiaryModal";

// const AdminDashboard = () => {
//   const navigate = useNavigate();

//   const [sidebarOpen, setSidebarOpen] = useState(false);
//   const [isSponsorModalOpen, setSponsorModalOpen] = useState(false);
//   const [isBeneficiaryModalOpen, setBeneficiaryModalOpen] = useState(false);
//   const [anchorProfile, setAnchorProfile] = useState(null);
//   const [isUploadReportOpen, setIsUploadReportOpen] = useState(false);
//   const [reportTitle, setReportTitle] = useState("");
//   const [reportType, setReportType] = useState("annual");
//   const [reportDate, setReportDate] = useState("");
//   const [reportFile, setReportFile] = useState(null);
//   const [reportDescription, setReportDescription] = useState("");

//   const handleCardClick = (cardType) => {
//     switch (cardType) {
//       case "totalEmployees":
//         navigate("/employee_list");
//         break;
//       case "activeChild":
//         navigate("/child_list");
//         break;
//       case "activeElderly":
//         navigate("/elderly_list");
//         break;
//       case "totalSponsors":
//         navigate("/sponsor_list");
//         break;
//       case "waitingList":
//         navigate("/beneficiary_list?view=waiting");
//         break;
//       case "terminatedList":
//         navigate("/beneficiary_list?view=terminated");
//         break;
//       case "graduatedList":
//         navigate("/beneficiary_list?view=graduated");
//         break;
//       case "activateSponsors":
//         navigate("/sponsor_management");
//         break;
//       case "sponsorRequest":
//         navigate("/beneficiary_request");
//         break;
//       case "financialReport":
//         navigate("/financial_report");
//         break;
//       case "feedback":
//         navigate("/feedback");
//         break;
//       default:
//         console.log(`Clicked on ${cardType} card`);
//     }
//   };

//   const toggleProfile = (event) => {
//     setAnchorProfile(anchorProfile ? null : event.currentTarget);
//   };

//   const openProfile = Boolean(anchorProfile);

//   const statCards = [
//     {
//       title: "Total Beneficiaries",
//       value: 9337,
//       icon: <UsersIcon color="primary" />,
//       key: "totalBeneficiaries",
//     },
//     {
//       title: "Total Employees",
//       value: 20,
//       icon: <UsersIcon color="primary" />,
//       key: "totalEmployees",
//     },
//     {
//       title: "Active Child Beneficiaries",
//       value: 8200,
//       icon: <UserCheckIcon color="primary" />,
//       key: "activeChild",
//     },
//     {
//       title: "Active Elderly Beneficiaries",
//       value: 1100,
//       icon: <UsersIcon color="primary" />,
//       key: "activeElderly",
//     },
//     {
//       title: "Sponsors",
//       value: 2200,
//       icon: <Building2Icon color="primary" />,
//       key: "totalSponsors",
//     },
//     {
//       title: "Waiting List",
//       value: 27,
//       icon: <ClockIcon color="primary" />,
//       key: "waitingList",
//     },
//     {
//       title: "Terminated List",
//       value: 5,
//       icon: <UserXIcon color="primary" />,
//       key: "terminatedList",
//     },
//     {
//       title: "Graduated List",
//       value: 5,
//       icon: <GraduationCapIcon color="primary" />,
//       key: "graduatedList",
//     },
//     {
//       title: "Activate Sponsors",
//       value: 2,
//       icon: <CheckCircleIcon color="primary" />,
//       key: "activateSponsors",
//     },
//     {
//       title: "Sponsor Request",
//       value: 27,
//       icon: <UserCheckIcon color="primary" />,
//       key: "sponsorRequest",
//     },
//   ];

//   const reports = [
//     { title: "Annual Report 2023", date: "Jan 15, 2024" },
//     { title: "Quarterly Update Q1 2024", date: "Apr 5, 2024" },
//     { title: "Sponsorship Impact Report", date: "Mar 20, 2024" },
//   ];

//   const user = {
//     name: "Sebrina Abdulrezak",
//     email: "sebu@gmail.com",
//     photo: "https://via.placeholder.com/40",
//   };

//   const handleUploadReport = () => {
//     if (!reportTitle || !reportDate || !reportFile) {
//       alert("Please fill all required fields and choose a file.");
//       return;
//     }
//     alert(`Report "${reportTitle}" uploaded successfully!`);
//     setIsUploadReportOpen(false);
//     setReportTitle("");
//     setReportType("annual");
//     setReportDate("");
//     setReportFile(null);
//     setReportDescription("");
//   };

//   const handleFileChange = (event) => {
//     setReportFile(event.target.files[0]);
//   };

//   return (
//     <Box sx={{ display: "flex" }}>
//       {/* Sidebar */}
//       <Drawer
//         variant="persistent"
//         open={sidebarOpen}
//         sx={{
//           width: 240,
//           flexShrink: 0,
//           "& .MuiDrawer-paper": {
//             width: 240,
//             boxSizing: "border-box",
//             bgcolor: "#1A237E",
//             color: "white",
//             display: "flex",
//             flexDirection: "column",
//           },
//         }}
//       >
//         <Toolbar>
//           <Box
//             sx={{
//               display: "flex",
//               justifyContent: "space-between",
//               alignItems: "center",
//               width: "100%",
//             }}
//           >
//             <IconButton
//               onClick={() => setSidebarOpen(false)}
//               sx={{ color: "white" }}
//             >
//               <CloseIcon />
//             </IconButton>
//             <Typography variant="h6" noWrap component="div" sx={{ ml: 1 }}>
//               Mary Joy Ethiopia
//             </Typography>
//             <IconButton
//               onClick={() => setSidebarOpen(true)}
//               sx={{ color: "white", display: sidebarOpen ? "none" : "block" }}
//             >
//               <MenuIcon />
//             </IconButton>
//           </Box>
//         </Toolbar>
//         <List sx={{ flexGrow: 1 }}>
//           <ListItemButton onClick={() => setBeneficiaryModalOpen(true)}>
//             <ListItemIcon>
//               <UserCheckIcon sx={{ color: "#FFC107" }} />
//             </ListItemIcon>
//             <ListItemText primary="Add Beneficiary" />
//           </ListItemButton>
//           <ListItemButton onClick={() => setSponsorModalOpen(true)}>
//             <ListItemIcon>
//               <UserCheckIcon sx={{ color: "#FFC107" }} />
//             </ListItemIcon>
//             <ListItemText primary="Add Sponsor" />
//           </ListItemButton>
//           <ListItemButton onClick={() => navigate("/sponsor_management")}>
//             <ListItemIcon>
//               <UsersIcon sx={{ color: "#FFC107" }} />
//             </ListItemIcon>
//             <ListItemText primary="Manage Sponsor" />
//           </ListItemButton>
//           <ListItemButton onClick={() => navigate("/financial_report")}>
//             <ListItemIcon>
//               <FileTextIcon sx={{ color: "#FFC107" }} />
//             </ListItemIcon>
//             <ListItemText primary="Financial Report" />
//           </ListItemButton>
//           <ListItemButton onClick={() => navigate("/feedback")}>
//             <ListItemIcon>
//               <UsersIcon sx={{ color: "#FFC107" }} />
//             </ListItemIcon>
//             <ListItemText primary="Feedback" />
//           </ListItemButton>
//         </List>
//         <List>
//           <ListItemButton onClick={() => navigate("/logout")}>
//             <ListItemIcon>
//               <UserIcon sx={{ color: "#FFC107" }} />
//             </ListItemIcon>
//             <ListItemText primary="Logout" />
//           </ListItemButton>
//         </List>
//       </Drawer>

//      <Box component="main" sx={{ flexGrow: 1, p: 3, ml: sidebarOpen ? 240 : 0 }}>
//   {/* AppBar */}
//   <AppBar position="fixed" sx={{ ml: sidebarOpen ? 240 : 0, bgcolor: "#1A237E" }}>
//     <Toolbar>
//       <Box sx={{ display: "flex", alignItems: "center", flexGrow: 1 }}>
//         <IconButton
//           color="inherit"
//           edge="start"
//           onClick={() => setSidebarOpen(!sidebarOpen)}
//           sx={{ mr: 2 }}
//         >
//           <MenuIcon />
//         </IconButton>
//         <Avatar src={user.photo} alt={user.name} onClick={toggleProfile} sx={{ cursor: "pointer", mr: 1 }} />
//         <Box>
//           <Typography variant="body1" color="white">{user.name}</Typography>
//           <Typography variant="body2" color="white">{user.email}</Typography>
//         </Box>
//       </Box>
//       <Box sx={{ display: "flex", alignItems: "center" }}>
//         <Typography variant="h6" color="white" sx={{ mr: 2 }}>
//           Mary Joy
//         </Typography>
//         <IconButton color="inherit" sx={{ mr: 2 }}>
//           <Badge badgeContent={3} color="warning">
//             <BellIcon />
//           </Badge>
//         </IconButton>
//         <IconButton color="inherit" onClick={toggleProfile}>
//           <UserIcon />
//         </IconButton>
//       </Box>
//       <Popover
//         open={openProfile}
//         anchorEl={anchorProfile}
//         onClose={() => setAnchorProfile(null)}
//         anchorOrigin={{
//           vertical: "bottom",
//           horizontal: "right",
//         }}
//       >
//         <List>
//           <ListItemButton>Profile</ListItemButton>
//           <ListItemButton>Settings</ListItemButton>
//           <ListItemButton>Logout</ListItemButton>
//         </List>
//       </Popover>
//     </Toolbar>
//   </AppBar>

//   <Toolbar />

//   {/* Stat Cards */}
//   <Grid container spacing={3}>
//     <Grid item xs={12} sm={6} md={4} lg={3}>
//       <Card
//         sx={{ cursor: "pointer", borderLeft: "4px solid #FFC107", boxShadow: 3, borderRadius: 2, height: "100%" }}
//         onClick={() => handleCardClick("totalBeneficiaries")}
//       >
//         <CardContent sx={{ display: "flex", flexDirection: "column", alignItems: "center", p: 2 }}>
//           {statCards.find(card => card.key === "totalBeneficiaries").icon}
//           <Typography variant="body2" color="text.secondary" align="center">
//             {statCards.find(card => card.key === "totalBeneficiaries").title}
//           </Typography>
//           <Typography variant="h6" align="center">
//             {statCards.find(card => card.key === "totalBeneficiaries").value}
//           </Typography>
//         </CardContent>
//       </Card>
//     </Grid>
//     {statCards
//       .filter(card => card.key !== "totalBeneficiaries")
//       .map((card) => (
//         <Grid item xs={12} sm={6} md={4} lg={3} key={card.key}>
//           <Card
//             sx={{ cursor: "pointer", borderLeft: "4px solid #FFC107", boxShadow: 3, borderRadius: 2, height: "100%" }}
//             onClick={() => handleCardClick(card.key)}
//           >
//             <CardContent sx={{ display: "flex", flexDirection: "column", alignItems: "center", p: 2 }}>
//               {card.icon}
//               <Typography variant="body2" color="text.secondary" align="center">
//                 {card.title}
//               </Typography>
//               <Typography variant="h6" align="center">
//                 {card.value}
//               </Typography>
//             </CardContent>
//           </Card>
//         </Grid>
//       ))}
//   </Grid>

//   {/* Recent Reports */}
//   <Box sx={{ mt: 4 }}>
//     <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
//       <Typography variant="h6">Recent Reports</Typography>
//       <Button variant="contained" color="warning" startIcon={<PlusIcon />} onClick={() => setIsUploadReportOpen(true)}>
//         Upload New Report
//       </Button>
//     </Box>
//     <Grid container spacing={2} direction="column">
//       {reports.map((report, idx) => (
//         <Grid item xs={12} key={idx}>
//           <Card sx={{ display: "flex", justifyContent: "space-between", p: 2, boxShadow: 3, borderRadius: 2 }}>
//             <Box sx={{ display: "flex", alignItems: "center" }}>
//               <FileTextIcon sx={{ mr: 2, color: "primary.main" }} />
//               <Box>
//                 <Typography fontWeight="bold">{report.title}</Typography>
//                 <Typography variant="body2" color="text.secondary">
//                   Uploaded: {report.date}
//                 </Typography>
//               </Box>
//             </Box>
//             <Box>
//               <Button color="warning">Download</Button>
//               <Button color="error">Delete</Button>
//             </Box>
//           </Card>
//         </Grid>
//       ))}
//     </Grid>
//   </Box>

// {/* Upload Report Modal */}
//   <Modal open={isUploadReportOpen} onClose={() => setIsUploadReportOpen(false)}>
//     <Box
//       sx={{
//         position: "absolute",
//         top: "50%",
//         left: "50%",
//         transform: "translate(-50%, -50%)",
//         width: 400,
//         bgcolor: "background.paper",
//         boxShadow: 24,
//         p: 4,
//         borderRadius: 2,
//       }}
//     >
//       <Typography variant="h6" mb={2}>Upload New Report</Typography>
//       <TextField
//         fullWidth
//         label="Report Title"
//         value={reportTitle}
//         onChange={(e) => setReportTitle(e.target.value)}
//         margin="normal"
//       />
//       <FormControl fullWidth margin="normal">
//         <InputLabel>Report Type</InputLabel>
//         <Select
//           value={reportType}
//           onChange={(e) => setReportType(e.target.value)}
//         >
//           <MenuItem value="annual">Annual Report</MenuItem>
//           <MenuItem value="quarterly">Quarterly Report</MenuItem>
//           <MenuItem value="monthly">Monthly Report</MenuItem>
//           <MenuItem value="impact">Impact Report</MenuItem>
//           <MenuItem value="other">Other</MenuItem>
//         </Select>
//       </FormControl>
//       <TextField
//         fullWidth
//         label="Report Date"
//         type="date"
//         value={reportDate}
//         onChange={(e) => setReportDate(e.target.value)}
//         margin="normal"
//         InputLabelProps={{ shrink: true }}
//       />
//       <Box sx={{ mt: 2 }}>
//         <Button
//           variant="contained"
//           component="label"
//           sx={{ mr: 2 }}
//         >
//           Choose File
//           <input
//             type="file"
//             hidden
//             accept=".pdf,.doc,.docx,.xls,.xlsx"
//             onChange={handleFileChange}
//           />
//         </Button>
//         <Typography>{reportFile ? reportFile.name : "No file chosen"}</Typography>
//       </Box>
//       <TextField
//         fullWidth
//         label="Description (Optional)"
//         value={reportDescription}
//         onChange={(e) => setReportDescription(e.target.value)}
//         margin="normal"
//         multiline
//         rows={3}
//       />
//       <Box sx={{ mt: 3, display: "flex", justifyContent: "flex-end", gap: 1 }}>
//         <Button variant="contained" color="primary" onClick={handleUploadReport}>
//           Upload Report
//         </Button>
//         <Button variant="outlined" onClick={() => setIsUploadReportOpen(false)}>
//           Cancel
//         </Button>
//       </Box>
//     </Box>
//         </Modal>
//       </Box>

//       {/* Modals */}
//       <SponsorModal
//         isOpen={isSponsorModalOpen}
//         onClose={() => setSponsorModalOpen(false)}
//       />
//       <BeneficiaryModal
//         isOpen={isBeneficiaryModalOpen}
//         onClose={() => setBeneficiaryModalOpen(false)}
//       />
//     </Box>
//   );
// };

// export default AdminDashboard;
