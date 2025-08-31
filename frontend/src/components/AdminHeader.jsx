import React from "react";
import { Bell, User, BarChart3, Menu } from "lucide-react";

const AdminHeader = ({
  toggleNotificationSidebar,
  toggleProfilePopup,
  hasUnreadNotifications,
}) => {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200 p-4 flex justify-between items-center">
      <div className="flex items-center gap-3 flex-1">
        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
          <BarChart3 className="text-blue-600" />
        </div>
        <h1 className="text-xl font-bold">Admin Dashboard</h1>
      </div>
      <div className="flex items-center gap-4 relative ml-auto">
        <div
          className="relative cursor-pointer p-2 rounded-full hover:bg-gray-100 transition-colors duration-200"
          onClick={toggleNotificationSidebar}
        >
          <Bell className="w-6 h-6" />
          {hasUnreadNotifications && (
            <div className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></div>
          )}
        </div>
        <div
          className="w-10 h-10 bg-yellow-600 rounded-full flex items-center justify-center text-white font-semibold cursor-pointer hover:bg-yellow-700 transition-colors duration-200"
          onClick={toggleProfilePopup}
        >
          <User className="w-6 h-6" />
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
