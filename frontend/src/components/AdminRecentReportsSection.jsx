import React from "react";
import { Plus, FileText, Download, Trash2 } from "lucide-react";

const AdminRecentReportsSection = ({ reports }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h2 className="text-xl font-semibold text-gray-800">Recent Reports</h2>
        <button className="bg-yellow-600 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 hover:bg-yellow-700 transition-colors">
          <Plus size={16} />
          <span>Upload New Report</span>
        </button>
      </div>

      <div className="space-y-4">
        {reports.map((report) => (
          <div
            key={report.id}
            className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 bg-gray-50 rounded-lg border border-gray-200"
          >
            <div className="flex items-start gap-4 mb-3 sm:mb-0">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <FileText size={20} className="text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">{report.title}</h3>
                <p className="text-sm text-gray-600">{report.date}</p>
              </div>
            </div>
            <div className="flex items-center gap-4 self-end sm:self-auto">
              <button className="text-blue-600 font-medium hover:text-blue-800 flex items-center gap-1 transition-colors">
                <Download size={16} />
                <span>Download</span>
              </button>
              <button className="text-red-600 font-medium hover:text-red-800 flex items-center gap-1 transition-colors">
                <Trash2 size={16} />
                <span>Delete</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminRecentReportsSection;
