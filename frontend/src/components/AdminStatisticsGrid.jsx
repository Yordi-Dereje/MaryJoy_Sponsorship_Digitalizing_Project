import React from "react";
import {
  Users,
  UserCheck,
  Building2,
  Clock,
  UserX,
  GraduationCap,
  CheckCircle,
  Plus,
} from "lucide-react";

const AdminStatisticsGrid = ({ stats, handleCardClick }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-5 mb-8">
      {stats.map((stat) => (
        <div
          key={stat.id}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 cursor-pointer hover:shadow-md transition-shadow duration-200 border-l-4 border-blue-700"
          onClick={() => handleCardClick(stat.id)}
        >
          <div className="flex justify-between items-start mb-3">
            <h3 className="text-sm font-medium text-gray-600">{stat.title}</h3>
            <stat.icon size={20} className="text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
        </div>
      ))}
    </div>
  );
};

export default AdminStatisticsGrid;
