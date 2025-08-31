import React, { useEffect } from "react";
import { X } from "lucide-react";

const NotificationSidebar = ({ isOpen, onClose, markAllAsRead }) => {
  useEffect(() => {
    if (isOpen) {
      // No need to call createIcons() with lucide-react
    }
  }, [isOpen]);

  const notifications = [
    {
      id: 1,
      title: "New Beneficiary Added",
      message: "A new child beneficiary has been added to the system.",
      time: "2 hours ago",
      unread: true,
    },
    {
      id: 2,
      title: "Sponsor Payment Received",
      message: "Sponsor ID 01-240 has made a payment of $200.",
      time: "1 day ago",
      unread: true,
    },
    {
      id: 3,
      title: "Report Generated",
      message: "Monthly financial report is ready for review.",
      time: "3 days ago",
      unread: false,
    },
    {
      id: 4,
      title: "System Update",
      message: "The system has been updated to version 2.1.0.",
      time: "1 week ago",
      unread: false,
    },
  ];

  return (
    <div
      className={`fixed top-0 right-0 w-80 h-full bg-white shadow-lg transition-transform duration-300 ease-in-out z-[2000] ${
        isOpen ? "translate-x-0" : "translate-x-full"
      }`}
    >
      <div className="flex flex-col h-full">
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold">Notifications</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors duration-200 p-1 rounded-md hover:bg-gray-100"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`p-4 rounded-lg border-l-4 ${
                notification.unread
                  ? "bg-blue-50 border-blue-600"
                  : "bg-gray-50 border-blue-700"
              } relative z-10`}
            >
              <h3 className="font-semibold mb-1">{notification.title}</h3>
              <p className="text-gray-700 text-sm">{notification.message}</p>
              <span className="text-xs text-gray-600 mt-1 block">
                {notification.time}
              </span>
            </div>
          ))}
        </div>
        <div className="p-4 border-t border-gray-200 text-center relative z-10">
          <button
            onClick={markAllAsRead}
            className="text-blue-600 font-medium hover:text-blue-800 transition-colors duration-200"
          >
            Mark all as read
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationSidebar;
