import React from "react";
import { X } from "lucide-react"; // Import Lucide icons

const ProfileModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex justify-center items-center z-[9999] p-4">
      <div
        className="bg-white p-6 rounded-lg shadow-lg w-full max-w-sm max-h-[90vh] overflow-y-auto transform transition-transform duration-300 ease-out scale-95 opacity-0"
        style={{
          opacity: isOpen ? 1 : 0,
          transform: isOpen
            ? "scale(1) translateY(0)"
            : "scale(0.95) translateY(-20px)",
        }}
      >
        <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-blue-700">Profile</h2>
          <button
            className="text-gray-500 hover:text-gray-700 transition-colors duration-200"
            onClick={onClose}
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        <p className="mb-2 text-gray-700">
          <strong className="text-blue-700">Name:</strong> Database Officer
        </p>
        <p className="mb-4 text-gray-700">
          <strong className="text-blue-700">Email:</strong> officer@maryjoy.org
        </p>
        <div className="flex justify-end">
          <button
            className="bg-gray-200 text-gray-800 px-5 py-2 rounded-lg font-medium hover:bg-gray-300 transition-colors duration-200"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileModal;
