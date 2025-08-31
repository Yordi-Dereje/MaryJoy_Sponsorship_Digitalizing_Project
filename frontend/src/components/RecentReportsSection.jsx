import React, { useEffect } from "react";
import { Plus, FileText } from "lucide-react";

const RecentReportsSection = () => {
  useEffect(() => {
    // No need to call createIcons() with lucide-react
  }, []);

  const reports = [
    { title: "Annual Report 2023", date: "Jan 15, 2024" },
    { title: "Quarterly Update Q1 2024", date: "Apr 5, 2024" },
    { title: "Sponsorship Impact Report", date: "Mar 20, 2024" },
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 relative z-10">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Recent Reports</h2>
        <button className="bg-yellow-600 text-white py-2 px-4 rounded-lg font-medium transition-colors duration-200 hover:bg-yellow-700 flex items-center gap-2">
          <Plus />
          <span>Upload New Report</span>
        </button>
      </div>

      <div className="flex flex-col gap-4">
        {reports.map((report, index) => (
          <div
            key={index}
            className="flex items-center justify-between p-4 bg-gray-50 rounded-lg transition-colors duration-200 hover:bg-gray-100"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-blue-100 rounded-md flex items-center justify-center">
                <FileText className="text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold">{report.title}</h3>
                <p className="text-sm text-gray-700">Uploaded: {report.date}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button className="text-yellow-700 font-medium transition-colors duration-200 hover:text-yellow-800">
                Download
              </button>
              <button className="text-red-600 font-medium transition-colors duration-200 hover:text-red-700">
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentReportsSection;
