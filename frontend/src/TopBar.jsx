import React, { useEffect } from "react";
import { Menu, Bell, User, BarChart3 } from "lucide-react";

const TopBar = ({
  toggleMobileMenu,
  toggleNotificationSidebar,
  openProfileModal,
  hasUnreadNotifications,
}) => {
  useEffect(() => {
    // No need to call createIcons() with lucide-react
  }, []);

  return (
    <div className="md:hidden flex items-center justify-between bg-blue-700 text-white p-4 sticky top-0 z-[101]">
      <button
        onClick={toggleMobileMenu}
        className="text-white p-2 rounded-md hover:bg-blue-600 transition-colors duration-200"
      >
        <Menu className="w-6 h-6" />
      </button>
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
          <BarChart3 className="text-blue-700" />
        </div>
        <div className="font-bold text-lg">Mary Joy Ethiopia</div>
      </div>
      <div className="flex items-center gap-4 relative z-[102]">
        <div
          className="relative cursor-pointer p-2 rounded-full hover:bg-blue-600 transition-colors duration-200"
          onClick={toggleNotificationSidebar}
        >
          <Bell />
          {hasUnreadNotifications && (
            <div className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></div>
          )}
        </div>
        <div
          className="w-10 h-10 bg-yellow-600 rounded-full flex items-center justify-center text-white font-semibold cursor-pointer hover:bg-yellow-700 transition-colors duration-200"
          onClick={openProfileModal}
        >
          <User />
        </div>
      </div>
    </div>
  );
};

export default TopBar;
