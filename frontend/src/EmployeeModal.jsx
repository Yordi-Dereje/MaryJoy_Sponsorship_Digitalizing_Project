import React from "react";
import { X, User } from "lucide-react";

const EmployeeModal = ({
  isOpen,
  onClose,
  departments = [],
  accessLevels = [],
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex justify-center items-center z-[9999] p-4 backdrop-blur-sm backdrop-brightness-75">
      <div
        className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md max-h-[90vh] overflow-y-auto transform transition-transform duration-300 ease-out scale-95 opacity-0"
        style={{
          opacity: isOpen ? 1 : 0,
          transform: isOpen
            ? "scale(1) translateY(0)"
            : "scale(0.95) translateY(-20px)",
        }}
      >
        <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-blue-700">Register Employee</h2>
          <button
            className="text-gray-500 hover:text-gray-700 transition-colors duration-200"
            onClick={onClose}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="mb-4">
          <label className="block text-blue-700 font-medium mb-2">
            Full Name
          </label>
          <input
            type="text"
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-blue-700"
            placeholder="Enter full name"
          />
        </div> 

        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <div className="flex-1">
            <label className="block text-blue-700 font-medium mb-2">
              Phone Number
            </label>
            <input
              type="tel"
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-blue-700"
              placeholder="Enter phone number"
            />
          </div>
          <div className="flex-1">
            <label className="block text-blue-700 font-medium mb-2">
              Email
            </label>
            <input
              type="email"
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-blue-700"
              placeholder="Enter email address"
            />
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-blue-700 font-medium mb-2">
            Access Level
          </label>
          <select className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-blue-700">
            <option value="">Select access level</option>
            <option value="administrator">Administrator</option>
            <option value="database officer">Database Officer</option>
            <option value="coordinator">Coordinator</option>
          </select>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            className="bg-gray-200 text-gray-800 px-5 py-2 rounded-lg font-medium hover:bg-gray-300 transition-colors duration-200"
            onClick={onClose}
          >
            Cancel
          </button>
          <button className="bg-blue-600 text-white px-5 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200">
            Register Employee
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmployeeModal;
