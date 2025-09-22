import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useRoleNavigation } from "./hooks/useRoleNavigation";
import {
  ArrowLeft,
  Search,
  ChevronUp,
  ChevronDown,
  Send,
  X,
} from "lucide-react";

const initialFeedbacks = [
  {
    id: 1,
    name: "Fikadu Tulu",
    sponsorId: "01-240",
    phone: "+251912345678",
    feedback: "The platform is very easy to use and intuitive.",
    status: "responded",
    response:
      "Thank you for your feedback! We're glad you find the platform easy to use.",
    respondedBy: "Admin User",
    responseDate: "24 Nov 2023",
  },
  {
    id: 2,
    name: "Selam Ayele",
    sponsorId: "02-185",
    phone: "+251987654321",
    feedback: "I really like the sponsor tracking feature. Great job!",
    status: "responded",
    response:
      "We appreciate your positive feedback about the sponsor tracking feature!",
    respondedBy: "Admin User",
    responseDate: "23 Nov 2023",
  },
  {
    id: 3,
    name: "Yonas Gebre",
    sponsorId: "03-789",
    phone: "+251911223344",
    feedback: "Please add a print option on the reports page.",
    status: "pending",
    response: "",
    respondedBy: "",
    responseDate: "",
  },
  {
    id: 4,
    name: "Meron Teshome",
    sponsorId: "04-321",
    phone: "+251933445566",
    feedback:
      "The reporting feature is excellent but could use more export options.",
    status: "responded",
    response:
      "Thank you for the suggestion. We're working on adding more export options in the next update.",
    respondedBy: "Admin User",
    responseDate: "22 Nov 2023",
  },
  {
    id: 5,
    name: "Tigist Alemayehu",
    sponsorId: "05-123",
    phone: "+251944556677",
    feedback: "The mobile app needs improvement. It crashes frequently.",
    status: "pending",
    response: "",
    respondedBy: "",
    responseDate: "",
  },
  {
    id: 6,
    name: "Samuel Getachew",
    sponsorId: "07-456",
    phone: "+251955667788",
    feedback: "Can you add more filter options to the reports section?",
    status: "pending",
    response: "",
    respondedBy: "",
    responseDate: "",
  },
];

const Feedback = () => {
  const { navigateToDashboard } = useRoleNavigation();
  const navigate = useNavigate();
  const [feedbacks, setFeedbacks] = useState(initialFeedbacks);
  const [searchInput, setSearchInput] = useState("");
  const [currentSortColumn, setCurrentSortColumn] = useState(0);
  const [currentSortDirection, setCurrentSortDirection] = useState("asc");
  const [isResponsePopupOpen, setIsResponsePopupOpen] = useState(false);
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [responseText, setResponseText] = useState("");

  const handleBack = () => {
    navigateToDashboard();
  };

  const totalFeedbacks = feedbacks.length;
  const pendingResponses = feedbacks.filter(
    (f) => f.status === "pending"
  ).length;
  const respondedFeedbacks = feedbacks.filter(
    (f) => f.status === "responded"
  ).length;
  const featureRequests = 5; // Placeholder

  useEffect(() => {
    filterAndSortTable();
  }, [searchInput, currentSortColumn, currentSortDirection]);

  const filterAndSortTable = () => {
    let filteredData = initialFeedbacks.filter((item) => {
      const searchTerm = searchInput.toLowerCase();
      return (
        item.name.toLowerCase().includes(searchTerm) ||
        item.sponsorId.toLowerCase().includes(searchTerm) ||
        item.feedback.toLowerCase().includes(searchTerm)
      );
    });

    const sortedData = [...filteredData].sort((a, b) => {
      let aValue, bValue;

      switch (currentSortColumn) {
        case 0:
          aValue = a.sponsorId;
          bValue = b.sponsorId;
          break;
        case 1:
          aValue = a.name;
          bValue = b.name;
          break;
        default:
          aValue = a.id;
          bValue = b.id;
      }

      return currentSortDirection === "asc"
        ? String(aValue).localeCompare(String(bValue))
        : String(bValue).localeCompare(String(aValue));
    });

    const finalSortedData = [
      ...sortedData.filter((f) => f.status === "pending"),
      ...sortedData.filter((f) => f.status === "responded"),
    ];

    setFeedbacks(finalSortedData);
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
      ? "bg-amber-100 text-amber-800"
      : "bg-emerald-100 text-emerald-800";
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

  const sendResponse = () => {
    if (!responseText.trim()) {
      alert("Please enter a response before sending.");
      return;
    }

    setFeedbacks((prevFeedbacks) =>
      prevFeedbacks.map((fb) =>
        fb.id === selectedFeedback.id
          ? {
              ...fb,
              status: "responded",
              response: responseText,
              respondedBy: "Current User",
              responseDate: new Date().toLocaleDateString("en-GB", {
                day: "numeric",
                month: "short",
                year: "numeric",
              }),
            }
          : fb
      )
    );
    alert("Response sent successfully!");
    closeResponsePopup();
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6 font-inter text-slate-800">
      <div className="container mx-auto bg-white rounded-xl shadow-lg p-6 flex flex-col h-[90vh]">
        {/* Header */}
        <div className="flex items-center mb-6 gap-4">
          <button
            onClick={handleBack}
            className="flex items-center justify-center w-12 h-12 bg-[#ffffff] text-[#032990] rounded-lg shadow-[0_4px_8px_rgba(0,0,0,0.1)] transition-all duration-300 border-2 border-[#f0f3ff] hover:bg-[#032990] hover:text-white group"
          >
            <ArrowLeft className="w-6 h-6 stroke-[#032990] transition-colors duration-300 group-hover:stroke-white" />
          </button>

          <h1 className="text-3xl font-bold text-[#032990]">Feedbacks</h1>
                  </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="p-4 rounded-lg shadow-sm border-l-4 border-[#032990] bg-amber-50 text-center">
            <div className="text-3xl font-bold text-[#032990]">
              {totalFeedbacks}
            </div>
            <div className="text-sm text-slate-500">Total Feedbacks</div>
          </div>
          <div className="p-4 rounded-lg shadow-sm border-l-4 border-amber-700 bg-amber-100 text-center">
            <div className="text-3xl font-bold text-amber-700">
              {pendingResponses}
            </div>
            <div className="text-sm text-slate-500">Pending Response</div>
          </div>
          <div className="p-4 rounded-lg shadow-sm border-l-4 border-emerald-700 bg-emerald-100 text-center">
            <div className="text-3xl font-bold text-emerald-700">
              {respondedFeedbacks}
            </div>
            <div className="text-sm text-slate-500">Responded</div>
          </div>
          <div className="p-4 rounded-lg shadow-sm border-l-4 border-[#032990] bg-amber-50 text-center">
            <div className="text-3xl font-bold text-[#032990]">
              {featureRequests}
            </div>
            <div className="text-sm text-slate-500">Feature Requests</div>
          </div>
        </div>

        {/* Search */}
        <div className="flex flex-wrap gap-4 mb-6 items-center">
          <div className="relative flex-1 min-w-[300px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              className="pl-10 p-3.5 w-full border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200 shadow-sm"
              placeholder="Search by sponsor name, ID, or feedback content..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto flex-1 border border-slate-200 rounded-lg shadow-sm">
          <table className="min-w-full border-separate border-spacing-0">
            <thead className="bg-[#f0f3ff] sticky top-0">
              <tr>
                {[
                  "Sponsor ID",
                  "Sponsor Name",
                  "Phone",
                  "Feedback",
                  "Status",
                  "Action",
                ].map((header, index) => (
                  <th
                    key={header}
                    className="px-4 py-3 text-left text-sm font-semibold text-[#032990] uppercase tracking-wider cursor-pointer hover:bg-[#e0e8ff] transition-colors duration-200"
                    onClick={() => handleSort(index)}
                  >
                    {header}
                    {getSortIndicator(index)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white">
              {feedbacks.map((feedbackItem) => (
                <tr
                  key={feedbackItem.id}
                  className={`transition-colors duration-200 ${
                    feedbackItem.status === "pending"
                      ? "bg-amber-50"
                      : "even:bg-slate-50"
                  } hover:bg-amber-100`}
                >
                  <td className="px-4 py-4 text-sm font-semibold text-[#032990] border-b border-slate-200">
                    {feedbackItem.sponsorId}
                  </td>
                  <td
                    className="px-4 py-4 text-sm font-semibold text-slate-800 border-b border-slate-200 cursor-pointer hover:text-amber-600"
                    onClick={() => openResponsePopup(feedbackItem)}
                  >
                    {feedbackItem.name}
                  </td>
                  <td className="px-4 py-4 text-sm text-slate-600 border-b border-slate-200">
                    {feedbackItem.phone}
                  </td>
                  <td className="px-4 py-4 text-sm text-slate-600 border-b border-slate-200">
                    {feedbackItem.feedback}
                    {feedbackItem.status === "responded" && (
                      <div className="text-xs text-slate-400 italic mt-1">
                        Response: {feedbackItem.response} (
                        {feedbackItem.respondedBy} - {feedbackItem.responseDate}
                        )
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm border-b border-slate-200">
                    <span
                      className={`px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClasses(
                        feedbackItem.status
                      )}`}
                    >
                      {feedbackItem.status === "pending"
                        ? "Pending"
                        : "Responded"}
                    </span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm border-b border-slate-200">
                    <button
                      className="px-3 py-1 bg-amber-500 text-[#032990] rounded-md font-medium hover:bg-[#032990] hover:text-white transition-colors duration-200"
                      onClick={() => openResponsePopup(feedbackItem)}
                    >
                      Respond
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Response Popup */}
      {isResponsePopupOpen && selectedFeedback && (
        <div className="fixed inset-0 bg-slate-900 flex items-center justify-center z-[1000] p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-lg p-6 relative max-h-[90vh] overflow-y-auto">
            <button
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 transition-colors duration-200"
              onClick={closeResponsePopup}
            >
              <X className="w-6 h-6" />
            </button>
            <div className="pb-4 mb-4 border-b border-slate-200">
              <h2 className="text-2xl font-bold text-slate-800">
                Respond to Feedback
              </h2>
            </div>
            <div className="mb-6">
              <div className="mb-4">
                <div className="text-sm font-medium text-slate-500 mb-1">
                  From:
                </div>
                <div className="text-base font-semibold text-slate-800">
                  {selectedFeedback.name}
                </div>
              </div>
              <div className="mb-4">
                <div className="text-sm font-medium text-slate-500 mb-1">
                  Sponsor ID:
                </div>
                <div className="text-base text-slate-800">
                  {selectedFeedback.sponsorId}
                </div>
              </div>
              <div className="mb-4">
                <div className="text-sm font-medium text-slate-500 mb-1">
                  Feedback:
                </div>
                <div className="text-base text-slate-700 italic">
                  "{selectedFeedback.feedback}"
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Your Response
                </label>
                <textarea
                  className="w-full p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200 min-h-[120px] resize-y"
                  placeholder="Type your response here..."
                  value={responseText}
                  onChange={(e) => setResponseText(e.target.value)}
                ></textarea>
              </div>
            </div>
            <button
              className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-emerald-600 text-white font-semibold rounded-lg shadow-md hover:bg-emerald-700 transition-colors duration-200"
              onClick={sendResponse}
            >
              <Send className="w-5 h-5" />
              Send Response
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Feedback;
