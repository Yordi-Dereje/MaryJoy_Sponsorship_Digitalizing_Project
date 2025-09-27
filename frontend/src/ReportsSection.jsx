import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Plus, 
  Download, 
  Edit, 
  Trash2, 
  Eye, 
  Calendar, 
  User,
  AlertCircle,
  CheckCircle,
  Search
} from 'lucide-react';
import ReportModal from './ReportModal';

const ReportsSection = ({ userRole, userId }) => {
  const [reports, setReports] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingReport, setEditingReport] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [notification, setNotification] = useState(null);

  // Check if user can add/edit/delete reports
  const canManageReports = userRole === 'admin' || userRole === 'database_officer';

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/reports', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setReports(data.reports || []);
      } else {
        showNotification('Failed to fetch reports', 'error');
      }
    } catch (error) {
      console.error('Error fetching reports:', error);
      showNotification('Error fetching reports', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  const handleCreateReport = async (formData) => {
    try {
      setIsSubmitting(true);
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/reports', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        setReports(prev => [data.report, ...prev]);
        setIsModalOpen(false);
        showNotification('Report created successfully');
      } else {
        const errorData = await response.json();
        showNotification(errorData.error || 'Failed to create report', 'error');
      }
    } catch (error) {
      console.error('Error creating report:', error);
      showNotification('Error creating report', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateReport = async (formData) => {
    try {
      setIsSubmitting(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/reports/${editingReport.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        setReports(prev => prev.map(report => 
          report.id === editingReport.id ? data.report : report
        ));
        setIsModalOpen(false);
        setEditingReport(null);
        showNotification('Report updated successfully');
      } else {
        const errorData = await response.json();
        showNotification(errorData.error || 'Failed to update report', 'error');
      }
    } catch (error) {
      console.error('Error updating report:', error);
      showNotification('Error updating report', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteReport = async (reportId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/reports/${reportId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setReports(prev => prev.filter(report => report.id !== reportId));
        setDeleteConfirm(null);
        showNotification('Report deleted successfully');
      } else {
        const errorData = await response.json();
        showNotification(errorData.error || 'Failed to delete report', 'error');
      }
    } catch (error) {
      console.error('Error deleting report:', error);
      showNotification('Error deleting report', 'error');
    }
  };

  const handleDownloadReport = async (reportId, fileName) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/reports/${reportId}/download`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        showNotification('Report downloaded successfully');
      } else {
        showNotification('Failed to download report', 'error');
      }
    } catch (error) {
      console.error('Error downloading report:', error);
      showNotification('Error downloading report', 'error');
    }
  };

  const handleEditReport = (report) => {
    setEditingReport(report);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingReport(null);
  };

  const handleModalSubmit = (formData) => {
    if (editingReport) {
      handleUpdateReport(formData);
    } else {
      handleCreateReport(formData);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredReports = reports.filter(report =>
    report.file_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (report.creator && userRole !== 'sponsor' && 
     report.creator.full_name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Loading reports...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <FileText className="w-6 h-6 text-blue-600 mr-3" />
            <h2 className="text-xl font-semibold text-gray-900">Reports</h2>
          </div>
          {canManageReports && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Report
            </button>
          )}
        </div>

        {/* Search Bar */}
        <div className="mt-4 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search reports by name or creator..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Notification */}
      {notification && (
        <div className={`mx-6 mt-4 p-4 rounded-md flex items-center ${
          notification.type === 'error' 
            ? 'bg-red-50 text-red-800 border border-red-200' 
            : 'bg-green-50 text-green-800 border border-green-200'
        }`}>
          {notification.type === 'error' ? (
            <AlertCircle className="w-5 h-5 mr-2" />
          ) : (
            <CheckCircle className="w-5 h-5 mr-2" />
          )}
          {notification.message}
        </div>
      )}

      {/* Reports List */}
      <div className="p-6">
        {filteredReports.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm ? 'No reports found' : 'No reports available'}
            </h3>
            <p className="text-gray-500 mb-4">
              {searchTerm 
                ? 'Try adjusting your search terms' 
                : canManageReports 
                  ? 'Get started by adding your first report' 
                  : 'Reports will appear here once they are added'
              }
            </p>
            {canManageReports && !searchTerm && (
              <button
                onClick={() => setIsModalOpen(true)}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add First Report
              </button>
            )}
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredReports.map((report) => (
              <div key={report.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      {report.file_name}
                    </h3>
                    <div className="flex items-center text-sm text-gray-500 space-x-4">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        {formatDate(report.created_at)}
                      </div>
                      {/* Hide creator info for sponsors */}
                      {report.creator && userRole !== 'sponsor' && (
                        <div className="flex items-center">
                          <User className="w-4 h-4 mr-1" />
                          {report.creator.full_name}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {/* Download Button */}
                    <button
                      onClick={() => handleDownloadReport(report.id, report.file_name)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                      title="Download Report"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    
                    {/* Edit Button - Only for admin and database_officer */}
                    {canManageReports && (
                      <button
                        onClick={() => handleEditReport(report)}
                        className="p-2 text-gray-600 hover:bg-gray-50 rounded-md transition-colors"
                        title="Edit Report"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                    )}
                    
                    {/* Delete Button - Only for admin and database_officer */}
                    {canManageReports && (
                      <button
                        onClick={() => setDeleteConfirm(report)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                        title="Delete Report"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Report Modal */}
      <ReportModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleModalSubmit}
        editingReport={editingReport}
        isLoading={isSubmitting}
      />

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 backdrop-blur-sm bg-white/30 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <AlertCircle className="w-6 h-6 text-red-600 mr-3" />
                <h3 className="text-lg font-semibold text-gray-900">Delete Report</h3>
              </div>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete "{deleteConfirm.file_name}"? This action cannot be undone.
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDeleteReport(deleteConfirm.id)}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportsSection;
