import React from "react";
import {
  ChevronLeft,
  ChevronRight,
  BarChart3,
  UserPlus,
  UserCog,
  FileText,
  MessageSquare,
  MessageCircle,
} from "lucide-react";

const AdminSidebar = ({
  isCollapsed,
  toggleSidebar,
  handleNavClick,
  navItems,
}) => {
  return (
    <div
      className={`hidden md:flex flex-col h-screen bg-blue-700 shadow-xl transition-all duration-300 ${
        isCollapsed ? "w-20" : "w-64"
      }`}
    >
      <div className="flex items-center justify-between p-4 border-b border-blue-800">
        <div
          className={`flex items-center gap-3 overflow-hidden whitespace-nowrap ${
            isCollapsed ? "opacity-0 w-0" : "opacity-100 w-auto"
          } transition-all duration-300`}
        >
          <span className="text-white font-bold text-lg">
            Mary Joy Ethiopia
          </span>
        </div>
        <button
          onClick={toggleSidebar}
          className="text-white p-2 rounded-md hover:bg-blue-600 transition-colors duration-200"
        >
          {isCollapsed ? (
            <ChevronRight className="w-6 h-6" />
          ) : (
            <ChevronLeft className="w-6 h-6" />
          )}
        </button>
      </div>

      <nav className="flex flex-col flex-1 p-2 space-y-2 mt-4">
        {navItems.map((item) => (
          <a
            key={item.id}
            href="#"
            className={`flex items-center gap-3 p-3 rounded-lg ${
              item.id === "dashboard"
                ? "text-white bg-yellow-600 shadow-md"
                : "text-blue-100 hover:bg-blue-600 hover:text-white"
            } transition-colors duration-200`}
            onClick={() => handleNavClick(item.label)}
          >
            <item.icon className="w-6 h-6 flex-shrink-0" />
            <span
              className={`font-medium ${
                isCollapsed ? "opacity-0 w-0" : "opacity-100 w-auto"
              } transition-all duration-300 overflow-hidden`}
            >
              {item.label}
            </span>
          </a>
        ))}
      </nav>
    </div>
  );
};

export default AdminSidebar;
