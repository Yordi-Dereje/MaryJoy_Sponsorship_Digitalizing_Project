Main Color Code



import React, { useState } from "react";
import {
  Menu,
  X,
  Bell,
  User,
  Users,
  UserCheck,
  UserPlus,
  UserX,
  GraduationCap,
  FileText,
  MessageSquare,
  MessageCircle,
  Building2,
  Clock,
} from "lucide-react";

import SponsorModal from "./SponsorModal";
import BeneficiaryModal from "./BeneficiaryModal";

const AdminDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isSponsorModalOpen, setSponsorModalOpen] = useState(false);
  const [isBeneficiaryModalOpen, setBeneficiaryModalOpen] = useState(false);
  const [isProfileOpen, setProfileOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-indigo-700 text-white transform transition-transform ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0`}
      >
        <div className="flex items-center px-6 py-4 bg-indigo-800">
          <Building2 className="h-8 w-8 text-amber-400" />
          <span className="ml-3 text-lg font-semibold">Mary Joy Ethiopia</span>
        </div>
        <nav className="mt-6 space-y-1">
          <button
            onClick={() => setBeneficiaryModalOpen(true)}
            className="flex items-center w-full px-6 py-2 text-sm font-medium hover:bg-indigo-600"
          >
            <UserPlus className="mr-3 h-5 w-5 text-amber-400" />
            Add Beneficiary
          </button>
          <button
            onClick={() => setSponsorModalOpen(true)}
            className="flex items-center w-full px-6 py-2 text-sm font-medium hover:bg-indigo-600"
          >
            <UserCheck className="mr-3 h-5 w-5 text-amber-400" />
            Add Sponsor
          </button>
          <a
            href="#manage-sponsor"
            className="flex items-center px-6 py-2 text-sm font-medium hover:bg-indigo-600"
          >
            <Users className="mr-3 h-5 w-5 text-amber-400" />
            Manage Sponsor
          </a>
          <a
            href="#financial-report"
            className="flex items-center px-6 py-2 text-sm font-medium hover:bg-indigo-600"
          >
            <FileText className="mr-3 h-5 w-5 text-amber-400" />
            Financial Report
          </a>
          <a
            href="#send-sms"
            className="flex items-center px-6 py-2 text-sm font-medium hover:bg-indigo-600"
          >
            <MessageSquare className="mr-3 h-5 w-5 text-amber-400" />
            Send SMS
          </a>
          <a
            href="#feedback"
            className="flex items-center px-6 py-2 text-sm font-medium hover:bg-indigo-600"
          >
            <MessageCircle className="mr-3 h-5 w-5 text-amber-400" />
            Feedback
          </a>
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
              {sidebarOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
            <h1 className="ml-2 text-xl font-semibold text-gray-800">
              Dashboard
            </h1>
          </div>
          <div className="flex items-center space-x-4">
            <button className="relative text-gray-500 hover:text-gray-700">
              <Bell className="h-6 w-6" />
              <span className="absolute -top-1 -right-1 bg-amber-500 text-white text-xs px-1 rounded-full">
                3
              </span>
            </button>
            <button
              onClick={() => setProfileOpen(!isProfileOpen)}
              className="flex items-center space-x-2"
            >
              <User className="h-6 w-6 text-gray-600" />
              <span className="hidden md:inline text-gray-700 font-medium">
                Admin
              </span>
            </button>
          </div>
        </header>

        {/* Profile popup */}
        {isProfileOpen && (
          <div className="absolute right-6 mt-14 w-48 bg-white border border-gray-200 rounded-lg shadow-lg py-2 z-50">
            <a
              href="#profile"
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              Profile
            </a>
            <a
              href="#settings"
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              Settings
            </a>
            <a
              href="#logout"
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              Logout
            </a>
          </div>
        )}

        {/* Dashboard Content */}
        <main className="p-6 space-y-6">
          {/* Stat Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white border-l-4 border-amber-500 rounded-lg shadow p-4 flex items-center">
              <User className="h-8 w-8 text-indigo-600" />
              <div className="ml-4">
                <p className="text-gray-600 text-sm">Total Beneficiaries</p>
                <p className="text-xl font-semibold text-gray-800">1,245</p>
              </div>
            </div>

            <div className="bg-white border-l-4 border-amber-500 rounded-lg shadow p-4 flex items-center">
              <Clock className="h-8 w-8 text-indigo-600" />
              <div className="ml-4">
                <p className="text-gray-600 text-sm">Waiting List</p>
                <p className="text-xl font-semibold text-gray-800">56</p>
              </div>
            </div>

            <div
              className="bg-white border-l-4 border-amber-500 rounded-lg shadow p-4 flex items-center cursor-pointer hover:shadow-lg hover:-translate-y-1 transition"
              onClick={() => handleCardClick("graduatedList")}
            >
              <GraduationCap className="h-8 w-8 text-indigo-600" />
              <div className="ml-4">
                <p className="text-gray-600 text-sm">Graduated List</p>
                <p className="text-xl font-semibold text-gray-800">5</p>
              </div>
            </div>



            <div className="bg-white border-l-4 border-amber-500 rounded-lg shadow p-4 flex items-center">
              <GraduationCap className="h-8 w-8 text-indigo-600" />
              <div className="ml-4">
                <p className="text-gray-600 text-sm">Graduated</p>
                <p className="text-xl font-semibold text-gray-800">312</p>
              </div>
            </div>

            <div className="bg-white border-l-4 border-amber-500 rounded-lg shadow p-4 flex items-center">
              <UserCheck className="h-8 w-8 text-indigo-600" />
              <div className="ml-4">
                <p className="text-gray-600 text-sm">Sponsors</p>
                <p className="text-xl font-semibold text-gray-800">78</p>
              </div>
            </div>

            <div className="bg-white border-l-4 border-amber-500 rounded-lg shadow p-4 flex items-center">
              <Users className="h-8 w-8 text-indigo-600" />
              <div className="ml-4">
                <p className="text-gray-600 text-sm">Volunteers</p>
                <p className="text-xl font-semibold text-gray-800">24</p>
              </div>
            </div>

            <div className="bg-white border-l-4 border-amber-500 rounded-lg shadow p-4 flex items-center">
              <UserX className="h-8 w-8 text-indigo-600" />
              <div className="ml-4">
                <p className="text-gray-600 text-sm">Staff</p>
                <p className="text-xl font-semibold text-gray-800">12</p>
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
      <BeneficiaryModal
        isOpen={isBeneficiaryModalOpen}
        onClose={() => setBeneficiaryModalOpen(false)}
      />
    </div>
  );
};

export default AdminDashboard;
