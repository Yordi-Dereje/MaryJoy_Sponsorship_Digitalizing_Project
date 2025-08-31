import React from "react";
import {
  BarChart3,
  UserPlus,
  UserCog,
  FileText,
  MessageSquare,
  MessageCircle,
} from "lucide-react";

const AdminMobileNavDropdown = ({ isOpen, handleNavClick, navItems }) => {
  return (
    <div
      className={`md:hidden absolute top-16 left-0 right-0 bg-blue-700 p-4 flex-col gap-2 shadow-md z-20 ${
        isOpen ? "flex" : "hidden"
      }`}
    >
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
          <span className="font-medium">{item.label}</span>
        </a>
      ))}
    </div>
  );
};

export default AdminMobileNavDropdown;
