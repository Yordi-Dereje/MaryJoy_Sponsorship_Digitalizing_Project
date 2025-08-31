import React from "react";
import { Menu, Bell, User } from "lucide-react";

const AdminMobileTopBar = ({
  toggleMobileMenu,
  toggleNotificationSidebar,
  toggleProfilePopup,
  hasUnreadNotifications,
}) => {
  return (
    <div className="md:hidden flex items-center justify-between bg-blue-700 text-white p-4 sticky top-0 z-30">
      <button
        onClick={toggleMobileMenu}
        className="text-white p-2 rounded-md hover:bg-blue-600 transition-colors duration-200"
      >
        <Menu className="w-6 h-6" />
      </button>
      <div className="flex items-center gap-2">
        <span className="font-bold text-lg">Mary Joy Ethiopia</span>
      </div>
      <div className="flex items-center gap-4">
        <div
          className="relative cursor-pointer p-2 rounded-full hover:bg-blue-600 transition-colors duration-200"
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
    </div>
  );
};

export default AdminMobileTopBar;
