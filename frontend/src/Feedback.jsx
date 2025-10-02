import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useRoleNavigation } from "./hooks/useRoleNavigation";
import { useAuth } from "./contexts/AuthContext";
import {
  ArrowLeft,
  Search,
  ChevronUp,
  ChevronDown,
  Send,
  X,
  User,
  Phone,
  MessageSquare,
  Clock,
  CheckCircle,
} from "lucide-react";

const Feedback = () => {
  const { navigateToDashboard } = useRoleNavigation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [feedbacks, setFeedbacks] = useState([]);
  const [displayedFeedbacks, setDisplayedFeedbacks] = useState([]);
  const [searchInput, setSearchInput] = useState("");
  const [currentSortColumn, setCurrentSortColumn] = useState(0);
  const [currentSortDirection, setCurrentSortDirection] = useState("asc");
  const [isResponsePopupOpen, setIsResponsePopupOpen] = useState(false);
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [responseText, setResponseText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");

  const handleBack = () => {
    navigateToDashboard();
  };

  // Calculate statistics
  const totalFeedbacks = feedbacks.length;
  const pendingResponses = feedbacks.filter((f) => f.status === "pending").length;
  const respondedFeedbacks = feedbacks.filter((f) => f.status === "responded").length;
  const featureRequests = feedbacks.filter((f) => 
    f.feedback.toLowerCase().includes('feature') || 
    f.feedback.toLowerCase().includes('request') ||
    f.feedback.toLowerCase().includes('suggestion') ||
    f.feedback.toLowerCase().includes('improvement')
  ).length;

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  useEffect(() => {
    filterAndSortTable();
  }, [searchInput, currentSortColumn, currentSortDirection, statusFilter, feedbacks]);

  const fetchFeedbacks = async () => {
  setLoading(true);
  setError(null);
  try {
    // Use the full endpoint (has proper sponsor name and phone via JOINs)
    const res = await fetch('http://localhost:5000/api/feedbacks');
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    const data = await res.json();
    processData(data);
  } catch (e) {
    console.error('Failed to fetch feedbacks', e);
    setError(e.message);
    setFeedbacks([]);
  } finally {
    setLoading(false);
  }
};

const processData = (data) => {
  if (data.success) {
    const mapped = data.feedbacks.map(f => ({
      id: f.id,
      // Prefer backend-provided sponsor_name/phone; add safe fallbacks
      name: f.sponsor_name || f.sponsor || f.sponsor_id || 'Unknown Sponsor',
      sponsorId: f.sponsor_id,
      phone: f.phone || '',
      feedback: f.feedback,
      status: f.status, // expected to be 'pending' or 'responded'
      response: f.response || '',
      respondedBy: f.responded_by || '',
      responseDate: f.updated_at ? new Date(f.updated_at).toLocaleDateString('en-US', { 
        day: 'numeric', 
        month: 'short', 
        year: 'numeric' 
      }) : '',
      createdAt: f.created_at
    }));
    setFeedbacks(mapped);
  } else {
    throw new Error(data.message || 'Failed to fetch feedbacks');
  }
};
  const filterAndSortTable = () => {
    let filteredData = feedbacks.filter((item) => {
      // Status filter
      if (statusFilter !== "all") {
        const statusMatch = statusFilter === "pending" ? "pending" : "responded";
        if (item.status !== statusMatch) return false;
      }
      
      // Search filter
      const searchTerm = searchInput.toLowerCase();
      if (searchTerm) {
        return (
          (item.name || '').toLowerCase().includes(searchTerm) ||
          (item.sponsorId || '').toLowerCase().includes(searchTerm) ||
          (item.feedback || '').toLowerCase().includes(searchTerm)
        );
      }
      return true;
    });

    // Apply sorting
    const sortedData = [...filteredData].sort((a, b) => {
      let aValue, bValue;

      switch (currentSortColumn) {
        case 0: // Sponsor ID
          aValue = a.sponsorId;
          bValue = b.sponsorId;
          break;
        case 1: // Sponsor Name
          aValue = a.name;
          bValue = b.name;
          break;
        case 3: // Feedback
          aValue = a.feedback;
          bValue = b.feedback;
          break;
        case 4: // Status
          aValue = a.status;
          bValue = b.status;
          break;
        default:
          aValue = a.id;
          bValue = b.id;
      }

      return currentSortDirection === "asc"
        ? String(aValue || '').localeCompare(String(bValue || ''))
        : String(bValue || '').localeCompare(String(aValue || ''));
    });

    setDisplayedFeedbacks(sortedData);
  };

  const handleSort = (columnIndex) => {
    if (columnIndex === currentSortColumn) {
      setCurrentSortDirection(currentSortDirection === "asc" ? "desc" : "asc");
    } else {
      setCurrentSortColumn(columnIndex);
      setCurrentSortDirection("asc");
    }
  };

  const getSortIndicator = (columnIndex) => {
    if (columnIndex === currentSortColumn) {
      return currentSortDirection === "asc" ? (
        <ChevronUp className="w-4 h-4 inline ml-1" />
      ) : (
        <ChevronDown className="w-4 h-4 inline ml-1" />
      );
    }
    return null;
  };

  const getStatusClasses = (status) => {
    return status === "pending"
      ? "bg-amber-100 text-amber-800 border-amber-200"
      : "bg-emerald-100 text-emerald-800 border-emerald-200";
  };

  const getStatusIcon = (status) => {
    return status === "pending" ? <Clock className="w-3 h-3 mr-1" /> : <CheckCircle className="w-3 h-3 mr-1" />;
  };

  const openResponsePopup = (feedback) => {
    setSelectedFeedback(feedback);
    setResponseText(feedback.response || "");
    setIsResponsePopupOpen(true);
  };

  const closeResponsePopup = () => {
    setIsResponsePopupOpen(false);
    setSelectedFeedback(null);
    setResponseText("");
  };

  const sendResponse = async () => {
    if (!responseText.trim()) {
      alert("Please enter a response before sending.");
      return;
    }
    
    if (!selectedFeedback) {
      alert("No feedback selected.");
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/feedbacks/${selectedFeedback.id}/respond`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          response: responseText, 
          responded_by: user?.userId || 'Database Officer' 
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success) {
        await fetchFeedbacks();
        alert("Response sent successfully!");
        closeResponsePopup();
      } else {
        throw new Error(result.message || 'Failed to send response');
      }
    } catch (e) {
      console.error('Failed to send response', e);
      alert('Failed to send response: ' + e.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 font-inter text-gray-900">
      <div className="max-w-7xl mx-auto bg-white rounded-xl shadow-lg p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={handleBack}
              className="flex items-center justify-center w-12 h-12 bg-white text-blue-900 rounded-lg shadow-md transition-all duration-300 border-2 border-blue-100 hover:bg-blue-900 hover:text-white group"
            >
              <ArrowLeft className="w-6 h-6 stroke-blue-900 transition-colors duration-300 group-hover:stroke-white" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-blue-900">Feedback Management</h1>
              <p className="text-gray-600 mt-1">Manage and respond to sponsor feedback</p>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
            <strong>Error:</strong> {error}
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-600 text-sm font-medium">Total Feedback</p>
                <p className="text-3xl font-bold text-blue-900 mt-2">{totalFeedbacks}</p>
              </div>
              <MessageSquare className="w-8 h-8 text-blue-500" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-amber-50 to-amber-100 p-6 rounded-xl border border-amber-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-amber-600 text-sm font-medium">Pending Response</p>
                <p className="text-3xl font-bold text-amber-900 mt-2">{pendingResponses}</p>
              </div>
              <Clock className="w-8 h-8 text-amber-500" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 p-6 rounded-xl border border-emerald-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-emerald-600 text-sm font-medium">Responded</p>
                <p className="text-3xl font-bold text-emerald-900 mt-2">{respondedFeedbacks}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-emerald-500" />
            </div>
          </div>

          
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col lg:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              placeholder="Search by sponsor name, ID, or feedback content..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
          </div>
          
          
        </div>

        {/* Table */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  {["Sponsor ID", "Sponsor Name", "Phone", "Feedback", "Status", "Actions"].map((header, index) => (
                    <th
                      key={header}
                      className="px-6 py-4 text-left text-xs font-medium text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors duration-200"
                      onClick={() => handleSort(index)}
                    >
                      <div className="flex items-center">
                        {header}
                        {getSortIndicator(index)}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-8 text-center">
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                        <span className="ml-3 text-gray-600">Loading feedback...</span>
                      </div>
                    </td>
                  </tr>
                ) : displayedFeedbacks.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                      {feedbacks.length === 0 ? "No feedback available" : "No feedback matches your search criteria"}
                    </td>
                  </tr>
                ) : (
                  displayedFeedbacks.map((feedback) => (
                    <tr key={feedback.id} className="hover:bg-gray-50 transition-colors duration-200">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-blue-900">{feedback.sponsorId}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <User className="w-4 h-4 mr-2 text-gray-400" />
                          <div className="text-sm font-medium text-gray-900">{feedback.name}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Phone className="w-4 h-4 mr-2 text-gray-400" />
                          <div className="text-sm text-gray-600">{feedback.phone}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-700 max-w-md">
                          {feedback.feedback}
                          {feedback.status === "responded" && feedback.response && (
                            <div className="mt-2 p-2 bg-emerald-50 rounded border border-emerald-200">
                              <div className="text-xs font-medium text-emerald-800">Response:</div>
                              <div className="text-xs text-emerald-700 mt-1">{feedback.response}</div>
                              {feedback.respondedBy && (
                                <div className="text-xs text-emerald-600 mt-1">
                                  — {feedback.respondedBy}
                                  {feedback.responseDate && ` • ${feedback.responseDate}`}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusClasses(feedback.status)}`}>
                          {getStatusIcon(feedback.status)}
                          {feedback.status === "pending" ? "Pending" : "Responded"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => openResponsePopup(feedback)}
                          className={`inline-flex items-center px-3 py-1 rounded-md transition-colors duration-200 ${
                            feedback.status === "pending"
                              ? "bg-blue-600 text-white hover:bg-blue-700"
                              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                          }`}
                        >
                          {feedback.status === "pending" ? "Respond" : "View Response"}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Response Modal */}
      {isResponsePopupOpen && selectedFeedback && (
        <div className="fixed inset-0 bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-white">
                    {selectedFeedback.status === "pending" ? "Respond to Feedback" : "Feedback Response"}
                  </h2>
                  <p className="text-blue-100 mt-1">
                    {selectedFeedback.status === "pending" 
                      ? "Send a response to the sponsor" 
                      : "View the response sent to the sponsor"
                    }
                  </p>
                </div>
                <button
                  onClick={closeResponsePopup}
                  className="text-blue-200 hover:text-white transition-colors duration-200"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Sponsor Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Sponsor</label>
                  <div className="flex items-center">
                    <User className="w-4 h-4 mr-2 text-gray-400" />
                    <span className="font-medium text-gray-900">{selectedFeedback.name}</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Sponsor ID</label>
                  <div className="font-mono text-gray-900">{selectedFeedback.sponsorId}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Phone</label>
                  <div className="flex items-center">
                    <Phone className="w-4 h-4 mr-2 text-gray-400" />
                    <span className="text-gray-900">{selectedFeedback.phone}</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Status</label>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusClasses(selectedFeedback.status)}`}>
                    {getStatusIcon(selectedFeedback.status)}
                    {selectedFeedback.status === "pending" ? "Pending Response" : "Responded"}
                  </span>
                </div>
              </div>

              {/* Feedback Content */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Feedback Content</label>
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-gray-700 italic">"{selectedFeedback.feedback}"</p>
                </div>
              </div>

              {/* Response Section */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {selectedFeedback.status === "pending" ? "Your Response" : "Response Sent"}
                </label>
                {selectedFeedback.status === "pending" ? (
                  <textarea
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 min-h-[120px] resize-y"
                    placeholder="Type your response here..."
                    value={responseText}
                    onChange={(e) => setResponseText(e.target.value)}
                  />
                ) : (
                  <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                    <p className="text-emerald-800">{selectedFeedback.response}</p>
                    {selectedFeedback.respondedBy && (
                      <div className="text-sm text-emerald-600 mt-2">
                        — {selectedFeedback.respondedBy}
                        {selectedFeedback.responseDate && ` • ${selectedFeedback.responseDate}`}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              {selectedFeedback.status === "pending" && (
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={closeResponsePopup}
                    className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={sendResponse}
                    className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Send Response
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Feedback;
