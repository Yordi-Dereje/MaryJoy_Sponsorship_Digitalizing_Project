import React, { useEffect } from "react";
import {
  Users,
  UserCheck,
  Building2,
  Clock,
  UserX,
  GraduationCap,
  CheckCircle,
  UserPlus,
} from "lucide-react";

const StatisticsGrid = ({ handleCardClick }) => {
  useEffect(() => {
    // No need to call createIcons() with lucide-react
  }, []);

  const stats = [
    {
      id: "totalBeneficiaries",
      icon: Users,
      title: "Total Beneficiaries",
      value: "9337",
    },
    {
      id: "activeChild",
      icon: UserCheck,
      title: "Active Child Beneficiaries",
      value: "8200",
    },
    {
      id: "activeElderly",
      icon: Users,
      title: "Active Elderly Beneficiaries",
      value: "1100",
    },
    {
      id: "totalSponsors",
      icon: Building2,
      title: "Total Sponsors",
      value: "2200",
    },
    { id: "waitingList", icon: Clock, title: "Waiting List", value: "27" },
    { id: "terminatedList", icon: UserX, title: "Terminated List", value: "5" },
    {
      id: "graduatedList",
      icon: GraduationCap,
      title: "Graduated List",
      value: "5",
    },
    {
      id: "activateSponsors",
      icon: CheckCircle,
      title: "Activate Sponsors",
      value: "2",
    },
    {
      id: "sponsorRequest",
      icon: UserPlus,
      title: "Sponsor Request",
      value: "27",
    },
  ];

  return (
    <div className="grid grid-cols-fill-220 gap-6">
      {stats.map((stat) => (
        <div
          key={stat.id}
          className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 transition-all duration-200 cursor-pointer border-l-4 border-blue-700 hover:shadow-md hover:-translate-y-1"
          onClick={() => handleCardClick(stat.id)}
        >
          <div className="flex items-center justify-between mb-4">
            <stat.icon className="w-8 h-8 text-blue-600" />
          </div>
          <div className="flex flex-col gap-2">
            <h3 className="text-sm font-semibold text-gray-600">
              {stat.title}
            </h3>
            <p className="text-2xl font-bold text-yellow-600">{stat.value}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatisticsGrid;
