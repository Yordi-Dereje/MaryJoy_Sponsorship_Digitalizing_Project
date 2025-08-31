import React from "react";
import { X, Eye, EyeOff } from "lucide-react";

const AdminProfilePopup = ({
  isOpen,
  onClose,
  passwordVisible,
  togglePasswordVisibility,
}) => {
  const handleSaveChanges = () => {
    // Here you would typically save the profile changes
    alert("Profile changes saved successfully!");
    onClose();
  };

  return (
    <div
      className={`absolute top-16 right-4 w-80 bg-white rounded-lg shadow-xl p-6 z-[1000] transition-all duration-300 ${
        isOpen
          ? "opacity-100 visible translate-y-0"
          : "opacity-0 invisible -translate-y-2"
      }`}
    >
      <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold">Edit Profile</h2>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700 p-1 rounded-md hover:bg-gray-100 transition-colors duration-200"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
      <div className="space-y-4">
        <div className="form-group">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Full Name
          </label>
          <input
            type="text"
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value="Admin User"
          />
        </div>
        <div className="form-group">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Department
          </label>
          <input
            type="text"
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value="Administration"
          />
        </div>
        <div className="form-group">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Phone Number
          </label>
          <input
            type="tel"
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value="+251912345678"
          />
        </div>
        <div className="form-group">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            type="email"
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value="admin@maryjoyethiopia.org"
          />
        </div>
        <div className="form-group">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Password
          </label>
          <div className="relative">
            <input
              type={passwordVisible ? "text" : "password"}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value="password123"
            />
            <button
              type="button"
              onClick={togglePasswordVisibility}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              {passwordVisible ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>
      </div>
      <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
        <button
          onClick={onClose}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors duration-200"
        >
          Cancel
        </button>
        <button
          onClick={handleSaveChanges}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200"
        >
          Save Changes
        </button>
      </div>
    </div>
  );
};

export default AdminProfilePopup;
