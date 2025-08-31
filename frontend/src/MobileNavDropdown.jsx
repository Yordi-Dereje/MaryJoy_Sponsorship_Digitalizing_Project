import React, { useEffect } from "react";
import {
  BarChart3,
  UserPlus,
  Building2,
  UserCog,
  FileText,
  MessageSquare,
  MessageCircle,
} from "lucide-react";

const MobileNavDropdown = ({
  isOpen,
  openBeneficiaryModal,
  openSponsorModal,
  handleNavClick,
  navItems, // Add navItems prop
}) => {
  useEffect(() => {
    if (isOpen) {
      // No need to call createIcons() with lucide-react
    }
  }, [isOpen]);

  return (
    <div
      className={`md:hidden absolute top-full left-0 right-0 bg-blue-700 p-4 flex-col gap-2 shadow-md z-[100] ${
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
          onClick={() => {
            if (item.id === "addBeneficiaries") {
              openBeneficiaryModal();
            } else if (item.id === "addSponsor") {
              openSponsorModal();
            } else {
              handleNavClick(item.label);
            }
          }}
        >
          <item.icon className="w-6 h-6" />
          <span className="font-medium">{item.label}</span>
        </a>
      ))}
    </div>
  );
};

export default MobileNavDropdown;
