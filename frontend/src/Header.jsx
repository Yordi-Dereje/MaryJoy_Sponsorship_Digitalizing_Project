import React, { useEffect } from "react";
import { Bell, User } from "lucide-react";

const Header = ({
  toggleNotificationSidebar,
  openProfileModal,
  hasUnreadNotifications,
}) => {
  useEffect(() => {
    // No need to call createIcons() with lucide-react
  }, []);

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 p-4 flex justify-between items-center">
      <div className="flex items-center gap-3 flex-1">
        <img
          src="maryjoy.jpeg"
          alt="Mary Joy Logo"
          className="w-8 h-8 rounded-full"
        />
        <span className="text-xl font-bold">Mary Joy Ethiopia</span>
      </div>
      <div className="flex items-center gap-4 relative z-[102] ml-auto">
        <div
          className="relative cursor-pointer p-2 rounded-full hover:bg-gray-100 transition-colors duration-200"
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
    </header>
  );
};

export default Header;
