import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useRoleNavigation } from "./hooks/useRoleNavigation";
import ReportsSection from "./ReportsSection";
import maryJoyLogo from "../../matjoylogo.jpg";
import {
  Bell,
  User,
  X,
  Users,
  Banknote,
  Calendar,
  BarChart3,
  MessageSquare,
  Edit,
  UserPlus,
  Heart,
  FileText,
  Download,
  Eye,
  UserCog,
  ChevronRight,
  Star,
  Clock,
  Mail,
  MapPin,
  CreditCard,
  Shield,
  LogOut,
  Phone,
  Save,
  EyeOff,
  Lock
} from "lucide-react";

const FeedbacksTable = ({ feedbacks, currentSponsorId }) => {
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <section className="bg-white rounded-2xl shadow-md p-6 mb-10">
      <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
        <MessageSquare className="mr-2 text-blue-600" size={24} />
        Feedbacks
      </h2>

      {feedbacks.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <MessageSquare size={48} className="mx-auto mb-4 text-gray-300" />
          <p>No feedback records found.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {feedbacks.map((feedback) => {
            const isCurrentSponsor = feedback.sponsor_id === currentSponsorId;
            return (
              <div 
                key={feedback.id} 
                className={`p-4 rounded-xl transition-all duration-200 ${
                  isCurrentSponsor 
                    ? 'bg-blue-50 border border-blue-100 shadow-sm' 
                    : 'bg-white border border-gray-100'
                }`}
              >
                {/* Feedback bubble */}
                <div className="mb-3">
                  <div className={`p-4 rounded-2xl ${
                    isCurrentSponsor 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-blue-100 text-blue-900'
                  }`}>
                    <p className="text-sm leading-relaxed">{feedback.feedback}</p>
                  </div>
                  <div className="text-xs text-gray-500 mt-1 ml-4">
                    {formatDate(feedback.created_at)}
                  </div>
                </div>

                {/* Response bubble - only show if there's a response */}
                {feedback.response && (
                  <div className="ml-6">
                    <div className="p-4 bg-blue-50 rounded-2xl border border-blue-200">
                      <p className="text-blue-800 text-sm leading-relaxed">
                        <span className="font-semibold text-blue-600">MJE:</span> {feedback.response}
                      </p>
                    </div>
                    <div className="text-xs text-gray-500 mt-1 ml-4">
                      {formatDate(feedback.updated_at)}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};

const BeneficiaryPieChart = ({ data }) => {
  const { active = 0, waiting = 0, reassigning = 0 } = data;
  const total = active + waiting + reassigning;
  
  if (total === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-md p-6 border-t-4 border-blue-600">
        <h3 className="text-lg font-semibold mb-4 text-gray-800 text-center">
          Beneficiary Status
        </h3>
        <div className="text-center py-8 text-gray-500">
          <Users size={48} className="mx-auto mb-4 text-gray-300" />
          <p>No beneficiary data available</p>
        </div>
      </div>
    );
  }

  const activePercentage = (active / total) * 100;
  const waitingPercentage = (waiting / total) * 100;
  const reassigningPercentage = (reassigning / total) * 100;

  // Calculate SVG path for pie chart
  let currentAngle = 0;
  
  const getCoordinates = (percent) => {
    const angle = (percent / 100) * 360;
    const x = 50 + 40 * Math.cos((currentAngle + angle / 2) * Math.PI / 180);
    const y = 50 + 40 * Math.sin((currentAngle + angle / 2) * Math.PI / 180);
    currentAngle += angle;
    return { x, y };
  };

  const activeCoords = getCoordinates(activePercentage);
  const waitingCoords = getCoordinates(waitingPercentage);
  const reassigningCoords = getCoordinates(reassigningPercentage);

  return (
    <div className="bg-white rounded-2xl shadow-md p-6 border-t-4 border-blue-600 hover:-translate-y-1 transition-transform duration-300">
      <h3 className="text-lg font-semibold mb-4 text-gray-800 text-center">
        Beneficiary Status
      </h3>
      
      <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
        {/* Pie Chart */}
        <div className="flex-1 max-w-xs">
          <svg viewBox="0 0 100 100" className="w-full h-48">
            {/* Active segment */}
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="transparent"
              stroke="#08349e"
              strokeWidth="20"
              strokeDasharray={`${activePercentage * 2.513} ${(100 - activePercentage) * 2.513}`}
              strokeDashoffset="0"
            />
            
            {/* Waiting segment */}
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="transparent"
              stroke="#edaa20"
              strokeWidth="20"
              strokeDasharray={`${waitingPercentage * 2.513} ${(100 - waitingPercentage) * 2.513}`}
              strokeDashoffset={`${-activePercentage * 2.513}`}
            />
            
            {/* Reassigning segment */}
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="transparent"
              stroke="#ef4444"
              strokeWidth="20"
              strokeDasharray={`${reassigningPercentage * 2.513} ${(100 - reassigningPercentage) * 2.513}`}
              strokeDashoffset={`${-(activePercentage + waitingPercentage) * 2.513}`}
            />
            
            {/* Center text */}
            <text x="50" y="50" textAnchor="middle" dy="0.3em" fontSize="12" fontWeight="bold" fill="#374151">
              {total}
            </text>
            <text x="50" y="62" textAnchor="middle" dy="0.3em" fontSize="8" fill="#6b7280">
              Total
            </text>
          </svg>
        </div>

        {/* Legend */}
        <div className="flex-1 space-y-3">
          <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 rounded-full bg-[#08349e]"></div>
              <span className="text-sm font-medium text-gray-700">Active</span>
            </div>
            <span className="text-sm font-bold text-gray-800">{active}</span>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-amber-50 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 rounded-full bg-[#edaa20]"></div>
              <span className="text-sm font-medium text-gray-700">Waiting</span>
            </div>
            <span className="text-sm font-bold text-gray-800">{waiting}</span>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 rounded-full bg-[#ef4444]"></div>
              <span className="text-sm font-medium text-gray-700">Reassigning</span>
            </div>
            <span className="text-sm font-bold text-gray-800">{reassigning}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const Overlay = ({ isActive, onClick }) => (
  <div
    className={`fixed inset-0 bg-black transition-opacity duration-300 z-40 ${
      isActive ? "opacity-50 visible" : "opacity-0 invisible"
    }`}
    onClick={onClick}
  />
);

const Modal = ({ isOpen, onClose, title, children }) => (
  <>
    <Overlay isActive={isOpen} onClick={onClose} />
    <div
      className={`fixed inset-0 flex items-center justify-center z-50 transition-opacity duration-300 ${
        isOpen ? "opacity-100 visible" : "opacity-0 invisible"
      }`}
    >
      <div
        className={`bg-white rounded-2xl w-full max-w-md mx-4 p-6 shadow-xl transition-transform duration-300 ${
          isOpen ? "translate-y-0" : "-translate-y-5"
        }`}
      >
        <div className="flex justify-between items-center pb-4 mb-4 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 p-1 rounded-md hover:bg-gray-100 transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        {children}
      </div>
    </div>
  </>
);

const SponsorDashboard = () => {
  const navigate = useNavigate();
  const { navigateToDashboard } = useRoleNavigation();
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [requestModalOpen, setRequestModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [feedbackText, setFeedbackText] = useState("");
  const [feedbackSubmitting, setFeedbackSubmitting] = useState(false);
  const [requestSubmitting, setRequestSubmitting] = useState(false);
  const [childCount, setChildCount] = useState(0);
  const [elderlyCount, setElderlyCount] = useState(0);

  const [paymentData, setPaymentData] = useState(null);
  const [beneficiaryStats, setBeneficiaryStats] = useState({
    active: 0,
    waiting: 0,
    reassigning: 0
  });

  // Profile editing state
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editedProfile, setEditedProfile] = useState({});
  const [profilePasswordData, setProfilePasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    oldPassword: false,
    newPassword: false,
    confirmPassword: false
  });

  const [notifications, setNotifications] = useState([]);
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);

  const [sponsorProfile, setSponsorProfile] = useState({
    name: "",
    email: "",
    role: "Sponsor",
    joinDate: "",
    phone: "",
    address: "",
    status: "Active",
    lastLogin: "Today, 09:45 AM EAT",
    impact: "Making a difference",
    memberSince: "",
    sponsorId: "",
    monthlyPayment: 0,
    type: "",
    gender: "",
    emergencyContactName: "",
    emergencyContactPhone: ""
  });

  const [stats, setStats] = useState({
    activeSponsorships: 0,
    totalSponsorships: 0,
    childrenSponsorships: 0,
    elderlySponsorships: 0,
    yearsOfSupport: 0
  });

  const formatMonthYear = (month, year) => {
    if (!month || !year) return "N/A";
    const monthNames = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    return `${monthNames[month - 1]} ${year}`;
  };

  const [recentSponsorships, setRecentSponsorships] = useState([]);
  const [reports, setReports] = useState([]);
  const [beneficiaries, setBeneficiaries] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);

  // Helper function to get user data with fallbacks
  const getUserData = () => {
    try {
      const userData = localStorage.getItem('user');
      const token = localStorage.getItem('token');
      
      if (!userData || !token) {
        throw new Error("No user data found. Please log in again.");
      }

      const user = JSON.parse(userData);
      console.log('User data from localStorage:', user);

      // Check if we have the required sponsor identifiers
      if (user.role === 'sponsor') {
        // Try different possible field names
        const cluster_id = user.cluster_id || user.sponsor_cluster_id;
        const specific_id = user.specific_id || user.sponsor_specific_id;
        
        if (!cluster_id || !specific_id) {
          // Last resort: try to extract from userId
          if (user.userId && typeof user.userId === 'string' && user.userId.includes('-')) {
            const [extractedCluster, extractedSpecific] = user.userId.split('-');
            user.cluster_id = extractedCluster;
            user.specific_id = extractedSpecific;
          } else {
            throw new Error("Sponsor identification data missing. Please contact support.");
          }
        } else {
          user.cluster_id = cluster_id;
          user.specific_id = specific_id;
        }
      }

      return user;
    } catch (error) {
      console.error('Error parsing user data:', error);
      throw new Error("Invalid user data. Please log in again.");
    }
  };

  // Fetch beneficiary statistics
  const fetchBeneficiaryStats = async () => {
    try {
      const [waitingResponse, reassigningResponse, activeResponse] = await Promise.all([
        fetch("http://localhost:5000/api/beneficiaries?status=waiting_list"),
        fetch("http://localhost:5000/api/beneficiaries?status=pending_reassignment"),
        fetch("http://localhost:5000/api/beneficiaries?status=active")
      ]);

      const waitingData = await waitingResponse.json();
      const reassigningData = await reassigningResponse.json();
      const activeData = await activeResponse.json();

      setBeneficiaryStats({
        waiting: waitingData.beneficiaries?.length || 0,
        reassigning: reassigningData.beneficiaries?.length || 0,
        active: activeData.beneficiaries?.length || 0
      });
    } catch (error) {
      console.error('Error fetching beneficiary stats:', error);
    }
  };

  // Fetch sponsor data from API
  useEffect(() => {
    const fetchSponsorData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const user = getUserData();
        console.log('User object:', user);
        
        // Check if user is a sponsor
        if (user.role !== 'sponsor') {
          throw new Error("Access denied. This dashboard is for sponsors only.");
        }

        const clusterId = user.cluster_id;
        const specificId = user.specific_id;
        
        if (!clusterId || !specificId) {
          throw new Error("Sponsor identification not found. Please contact support.");
        }

        console.log(`Fetching dashboard data for: ${clusterId}-${specificId}`);
        
        const response = await fetch(`http://localhost:5000/api/sponsors/${clusterId}/${specificId}/dashboard`);
        
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error("Sponsor profile not found. Please contact support.");
          }
          const errorText = await response.text();
          throw new Error(`Failed to fetch sponsor data: ${response.status}`);
        }

        const dashboardData = await response.json();
        console.log('Dashboard data received:', dashboardData);

        setPaymentData(dashboardData.payments || null);
        
        // Calculate years of support
        const joinDate = dashboardData.sponsor?.joinDate ? new Date(dashboardData.sponsor.joinDate) : new Date();
        const yearsOfSupport = new Date().getFullYear() - joinDate.getFullYear();
        
        // Update sponsor profile with safe data handling
        setSponsorProfile({
          name: dashboardData.sponsor?.name || user.full_name || "Sponsor",
          email: dashboardData.sponsor?.email || user.email || "",
          role: "Sponsor",
          joinDate: dashboardData.sponsor?.joinDate ? new Date(dashboardData.sponsor.joinDate).toLocaleDateString() : "N/A",
          phone: dashboardData.sponsor?.phone || user.phone_number || "N/A",
          address: dashboardData.sponsor?.address ? 
            `${dashboardData.sponsor.address.house_number || ''} ${dashboardData.sponsor.address.woreda || ''} ${dashboardData.sponsor.address.region || ''}`.trim() 
            : "N/A",
          status: dashboardData.sponsor?.status || "Active",
          lastLogin: dashboardData.lastLogin || new Date().toLocaleString(),
          impact: `Supporting ${dashboardData.stats?.activeSponsorships || 0} beneficiaries`,
          memberSince: dashboardData.sponsor?.memberSince || new Date().getFullYear(),
          sponsorId: dashboardData.sponsor?.sponsorId || `${clusterId}-${specificId}`,
          monthlyPayment: dashboardData.sponsor?.monthlyPayment || 0,
          type: dashboardData.sponsor?.type || user.type || "",
          gender: dashboardData.sponsor?.gender || "",
          emergencyContactName: dashboardData.sponsor?.emergencyContactName || "",
          emergencyContactPhone: dashboardData.sponsor?.emergencyContactPhone || "",
          yearsOfSupport: yearsOfSupport
        });

        // Fetch notifications
        await fetchNotifications(clusterId, specificId);

        // Update stats with safe defaults
        setStats({
          activeSponsorships: dashboardData.stats?.activeSponsorships || 0,
          totalSponsorships: dashboardData.stats?.totalSponsorships || 0,
          childrenSponsorships: dashboardData.stats?.childrenSponsorships || 0,
          elderlySponsorships: dashboardData.stats?.elderlySponsorships || 0,
          yearsOfSupport: yearsOfSupport
        });
        
        // Update recent sponsorships
        setRecentSponsorships(dashboardData.recentSponsorships || []);
        
        // Update reports
        setReports(dashboardData.reports || []);

        // Update beneficiaries count
        setBeneficiaries(Array(dashboardData.stats?.activeSponsorships || 0).fill({}));

        // Fetch feedbacks
        try {
          const feedbackResponse = await fetch('http://localhost:5000/api/feedbacks');
          if (feedbackResponse.ok) {
            const feedbackData = await feedbackResponse.json();
            if (feedbackData.success) {
              setFeedbacks(feedbackData.feedbacks || []);
            }
          }
        } catch (feedbackError) {
          console.error('Error fetching feedbacks:', feedbackError);
          // Don't set error state for feedback fetch failure
        }

        // Fetch beneficiary statistics
        await fetchBeneficiaryStats();

      } catch (err) {
        console.error("Error fetching sponsor data:", err);
        setError(err.message);
        
        // Fallback to localStorage data with better error message
        try {
          const user = getUserData();
          setSponsorProfile(prev => ({
            ...prev,
            name: user.full_name || "Sponsor",
            email: user.email || "",
            sponsorId: user.cluster_id && user.specific_id ? `${user.cluster_id}-${user.specific_id}` : "Unknown",
            impact: "Unable to load impact data"
          }));
        } catch (fallbackError) {
          console.error("Fallback also failed:", fallbackError);
        }
        
        setBeneficiaries([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSponsorData();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login", { state: { logout: true } });
  };

  // Fetch notifications from API
  const fetchNotifications = async (clusterId, specificId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/notifications/sponsors/${clusterId}/${specificId}?page=1&limit=20`);
      if (response.ok) {
        const data = await response.json();
        
        // Transform API notifications to match the expected format
        const transformedNotifications = data.notifications.map(notification => ({
          id: notification.id,
          title: getNotificationTitle(notification.notification_type),
          message: notification.message,
          time: formatTimeAgo(notification.created_at),
          unread: !notification.is_read,
          icon: getNotificationIcon(notification.notification_type),
          priority: notification.priority
        }));
        
        setNotifications(transformedNotifications);
        setUnreadNotificationCount(data.unreadCount || 0);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  // Get notification title based on type
  const getNotificationTitle = (type) => {
    switch (type) {
      case 'payment_due':
        return 'Payment Due';
      case 'payment_reminder':
        return 'Payment Reminder';
      case 'payment_confirmed':
        return 'Payment Confirmed';
      case 'report_uploaded':
        return 'New Report Available';
      case 'sponsorship_updated':
        return 'Sponsorship Updated';
      default:
        return 'Notification';
    }
  };

  // Get notification icon based on type
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'payment_due':
      case 'payment_reminder':
        return <CreditCard size={16} />;
      case 'payment_confirmed':
        return <Banknote size={16} />;
      case 'report_uploaded':
        return <FileText size={16} />;
      case 'sponsorship_updated':
        return <Users size={16} />;
      default:
        return <Bell size={16} />;
    }
  };

  // Format time ago
  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays} days ago`;
    
    return date.toLocaleDateString();
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    try {
      const user = getUserData();
      const response = await fetch(
        `http://localhost:5000/api/notifications/sponsors/${user.cluster_id}/${user.specific_id}/read-all`,
        { method: 'PUT' }
      );
      
      if (response.ok) {
        setNotifications(prev => prev.map(notif => ({ ...notif, unread: false })));
        setUnreadNotificationCount(0);
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  // Mark single notification as read
  const markAsRead = async (notificationId) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/notifications/${notificationId}/read`,
        { method: 'PUT' }
      );
      
      if (response.ok) {
        setNotifications(prev =>
          prev.map(notif =>
            notif.id === notificationId
              ? { ...notif, unread: false }
              : notif
          )
        );
        setUnreadNotificationCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Profile editing functions
  const handleEditProfile = () => {
    setEditedProfile({ ...sponsorProfile });
    setIsEditingProfile(true);
  };

  const handleCancelEdit = () => {
    setEditedProfile({});
    setProfilePasswordData({
      oldPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    setIsEditingProfile(false);
  };

  const handleProfileInputChange = (field, value) => {
    setEditedProfile(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePasswordInputChange = (field, value) => {
    setProfilePasswordData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const handleSaveProfile = async () => {
    try {
      // Update email and phone if changed
      if (editedProfile.email !== sponsorProfile.email || editedProfile.phone !== sponsorProfile.phone) {
        // For now, just update the local state
        const updatedUser = { ...sponsorProfile, email: editedProfile.email, phone: editedProfile.phone };
        const userData = JSON.parse(localStorage.getItem('user') || '{}');
        const updatedUserData = { ...userData, email: editedProfile.email, phone_number: editedProfile.phone };
        localStorage.setItem('user', JSON.stringify(updatedUserData));
        setSponsorProfile(updatedUser);
      }

      // Handle password change
      if (profilePasswordData.oldPassword && profilePasswordData.newPassword) {
        if (profilePasswordData.newPassword !== profilePasswordData.confirmPassword) {
          alert("New passwords don't match!");
          return;
        }

        // For now, just show success message without API call
        alert("Password change functionality would be implemented here");

        setProfilePasswordData({
          oldPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      }

      setIsEditingProfile(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Error updating profile. Please try again.');
    }
  };

  const handleFeedbackSubmit = async () => {
    if (!feedbackText.trim()) {
      alert("Please enter your feedback before submitting.");
      return;
    }

    try {
      setFeedbackSubmitting(true);
      const user = getUserData();
      const token = localStorage.getItem("token");

      const response = await fetch("http://localhost:5000/api/feedbacks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          sponsor_cluster_id: user.cluster_id,
          sponsor_specific_id: user.specific_id,
          feedback_text: feedbackText.trim()
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Unable to submit feedback.");
      }

      alert("Thank you for your feedback!");
      setFeedbackText("");
      setFeedbackModalOpen(false);
    } catch (submitError) {
      console.error("Feedback submission failed:", submitError);
      alert(submitError.message || "Something went wrong while submitting feedback.");
    } finally {
      setFeedbackSubmitting(false);
    }
  };

  const handleRequestSubmit = async () => {
    const children = Number(childCount) || 0;
    const elders = Number(elderlyCount) || 0;
    const total = children + elders;

    if (total <= 0) {
      alert("Please specify at least one beneficiary to support.");
      return;
    }

    try {
      setRequestSubmitting(true);
      const user = getUserData();
      const token = localStorage.getItem("token");

      const payload = {
        sponsor_cluster_id: user.cluster_id,
        sponsor_specific_id: user.specific_id,
        number_of_child_beneficiaries: children,
        number_of_elderly_beneficiaries: elders,
        total_beneficiaries: total,
        status: "pending",
        request_date: new Date().toISOString().split("T")[0],
        created_at: new Date().toISOString()
      };

      const response = await fetch("http://localhost:5000/api/sponsor_requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Unable to submit request.");
      }

      alert("Your request has been submitted. We'll review it shortly.");
      setChildCount(0);
      setElderlyCount(0);
      setRequestModalOpen(false);
    } catch (submitError) {
      console.error("Request submission failed:", submitError);
      alert(submitError.message || "Something went wrong while submitting your request.");
    } finally {
      setRequestSubmitting(false);
    }
  };

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") {
        setNotificationsOpen(false);
        setFeedbackModalOpen(false);
        setProfileModalOpen(false);
        setRequestModalOpen(false);
        // Reset editing state when modal closes
        setIsEditingProfile(false);
        setEditedProfile({});
        setProfilePasswordData({
          oldPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-amber-50 flex items-center justify-center">
        <div className="text-lg">Loading sponsor information...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-amber-50 flex items-center justify-center">
        <div className="text-red-600 text-center max-w-md p-6 bg-white rounded-lg shadow-md">
          <p className="text-lg font-semibold mb-2">Error Loading Dashboard</p>
          <p className="mb-4">{error}</p>
          <div className="flex gap-4 justify-center">
            <button 
              onClick={() => window.location.reload()} 
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Try Again
            </button>
            <button 
              onClick={handleLogout}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              Re-login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-amber-50 text-gray-800 font-inter">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-30 py-4 px-8 flex justify-between items-center border-b border-gray-200/50">
        <div className="flex items-center gap-3">
          <img src={maryJoyLogo} alt="MaryJoy Logo" className="h-14 w-14" />
          <div className="text-2xl font-bold bg-gradient-to-r from-blue-800 to-blue-600 bg-clip-text text-transparent">         
            Mary Joy Ethiopia
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div
            className="relative p-2 rounded-full hover:bg-blue-50 cursor-pointer transition-colors duration-200"
            onClick={() => setNotificationsOpen(true)}
          >
            <Bell size={20} className="text-blue-700" />
            {unreadNotificationCount > 0 && (
              <div className="absolute top-1 right-1 w-5 h-5 bg-red-500 rounded-full border-2 border-white flex items-center justify-center">
                <span className="text-xs text-white font-bold">
                  {unreadNotificationCount > 9 ? '9+' : unreadNotificationCount}
                </span>
              </div>
            )}
          </div>
          <div
            className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-full flex items-center justify-center text-white cursor-pointer hover:shadow-md transition-all duration-200 shadow-sm"
            onClick={() => setProfileModalOpen(true)}
          >
            <User size={20} />
          </div>
        </div>
      </header>

      {/* Notification Sidebar */}
      <Overlay
        isActive={notificationsOpen}
        onClick={() => setNotificationsOpen(false)}
      />
      <div
        className={`fixed top-0 right-0 w-full sm:w-96 h-full bg-white shadow-xl z-50 transition-transform duration-300 ${
          notificationsOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="p-6 border-b border-gray-200 flex justify-between items-center bg-gradient-to-r from-blue-800 to-blue-600 text-white">
          <h2 className="text-xl font-semibold">Notifications</h2>
          <button
            onClick={() => setNotificationsOpen(false)}
            className="text-white/80 hover:text-white p-1 rounded-md hover:bg-white/10 transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        <div className="h-full overflow-y-auto">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`p-4 border-b border-gray-100 flex items-start gap-3 cursor-pointer ${
                notification.unread ? "bg-blue-50" : "bg-white"
              } hover:bg-gray-50 transition-colors duration-150`}
              onClick={() => {
                if (notification.unread) {
                  markAsRead(notification.id);
                }
              }}
            >
              <div className={`mt-1 p-2 rounded-lg ${
                notification.priority === 'urgent' 
                  ? 'bg-red-100 text-red-700' 
                  : notification.priority === 'high' 
                    ? 'bg-orange-100 text-orange-700' 
                    : 'bg-blue-100 text-blue-700'
              }`}>
                {notification.icon}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold mb-1 text-gray-800">{notification.title}</h3>
                <p className="text-sm text-gray-600 mb-1">{notification.message}</p>
                <span className="text-xs text-gray-500 flex items-center gap-1">
                  <Clock size={12} />
                  {notification.time}
                </span>
              </div>
              {notification.unread && (
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
              )}
            </div>
          ))}
        </div>
        <div className="p-4 border-t border-gray-200 text-center bg-gray-50">
          <button
            onClick={markAllAsRead}
            className="text-blue-600 font-medium hover:text-blue-800 transition-colors flex items-center justify-center gap-2 mx-auto"
          >
            Mark all as read
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-10xl mx-auto py-8 px-4 sm:px-6">
        {/* Welcome Section */}
        <section className="bg-gradient-to-r from-blue-800 to-blue-600 rounded-2xl shadow-lg p-8 mb-10 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-12 -translate-x-12"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-2">Welcome back, {sponsorProfile.name.split(' ')[0]}!</h1>
              <p className="text-blue-100 text-lg mb-4">
                Thank you for {sponsorProfile.yearsOfSupport > 0 ? `${sponsorProfile.yearsOfSupport} year${sponsorProfile.yearsOfSupport > 1 ? 's' : ''} of ` : ''}making a difference in the lives of others
              </p>
            </div>
            <button
              onClick={() => {
                const user = getUserData();
                if (user.cluster_id && user.specific_id) {
                  navigate(`/sponsor_beneficiaries/${user.cluster_id}/${user.specific_id}`);
                } else {
                  navigate("/sponsor_beneficiaries");
                }
              }}
              className="bg-gradient-to-r from-amber-500 to-amber-600 text-white px-8 py-4 rounded-lg font-semibold hover:shadow-lg transition-all duration-300 flex items-center gap-3 whitespace-nowrap hover:gap-4 shadow-md"
            >
              <Users size={24} />
              View Beneficiaries 
              <ChevronRight size={20} />
            </button>
          </div>
        </section>

        {/* Stats Grid - Now 3 cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {/* Total Beneficiaries */}
          <div
            className="bg-white rounded-2xl shadow-md p-6 border-l-4 border-blue-600 hover:-translate-y-1 transition-transform duration-300 cursor-pointer group relative overflow-hidden"
            onClick={() => {
              const user = getUserData();
              if (user.cluster_id && user.specific_id) {
                navigate(`/sponsor_beneficiaries/${user.cluster_id}/${user.specific_id}`);
              } else {
                navigate("/sponsor_beneficiaries");
              }
            }}
          >
            <div className="absolute top-0 right-0 w-16 h-16 bg-blue-100 rounded-bl-full opacity-50 group-hover:opacity-70 transition-opacity"></div>
            <div className="flex justify-between items-center mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-700 group-hover:bg-blue-200 transition-colors shadow-sm">
                <Users size={24} />
              </div>
            </div>
            <div className="space-y-2 relative z-10">
              <h3 className="text-sm font-medium text-gray-600">
                Supported Beneficiaries
              </h3>
              <p className="text-3xl font-bold text-blue-800">{beneficiaries.length}</p>
              <p className="text-xs text-gray-500 flex items-center gap-1">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                Active sponsorships
              </p>
            </div>
          </div>

          {/* Total Contributions */}
          <div className="bg-white rounded-2xl shadow-md p-6 border-l-4 border-blue-600 hover:-translate-y-1 transition-transform duration-300 group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-16 h-16 bg-blue-100 rounded-bl-full opacity-50 group-hover:opacity-70 transition-opacity"></div>
            <div className="flex justify-between items-center mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-700 group-hover:bg-blue-200 transition-colors shadow-sm">
                <Banknote size={24} />
              </div>
            </div>
            <div className="space-y-2 relative z-10">
              <h3 className="text-sm font-medium text-gray-600">
                Monthly Contributions
              </h3>
              <p className="text-3xl font-bold text-blue-800">
                {sponsorProfile.monthlyPayment ? `${sponsorProfile.monthlyPayment} birr` : '0 birr'}
              </p>
              <p className="text-xs text-gray-500">Recurring payment</p>
            </div>
          </div>

          {/* Upcoming Payment */}
          <div className="bg-white rounded-2xl shadow-md p-6 border-l-4 border-blue-600 hover:-translate-y-1 transition-transform duration-300 group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-16 h-16 bg-blue-100 rounded-bl-full opacity-50 group-hover:opacity-70 transition-opacity"></div>
            <div className="flex justify-between items-center mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-700 group-hover:bg-blue-200 transition-colors shadow-sm">
                <Calendar size={24} />
              </div>
            </div>
            <div className="space-y-2 relative z-10">
              <h3 className="text-sm font-medium text-gray-600">
                Upcoming Payment
              </h3>
              <p className="text-lg font-bold text-blue-800">
                {paymentData?.nextPaymentDue 
                  ? formatMonthYear(paymentData.nextPaymentDue.month, paymentData.nextPaymentDue.year)
                  : "No upcoming payment"
                }
              </p>
              <p className="text-xs text-gray-500">Next billing cycle</p>
            </div>
            <div className="pt-4 mt-4 border-t border-gray-200">
              <button
                className="flex items-center gap-2 text-blue-600 text-sm font-medium hover:text-blue-800 transition-colors group-hover:underline"
                onClick={() => {
                  const user = getUserData();
                  if (user.cluster_id && user.specific_id) {
                    navigate(`/sponsor/${user.cluster_id}/${user.specific_id}/payments`);
                  } else {
                    console.error('Sponsor identifiers not found');
                  }
                }}
              >
                <Eye size={16} />
                View Payment Details
              </button>
            </div>
          </div>
        </div>

        {/* Action Cards with Pie Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
          {/* Give Feedback */}
          <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-md p-6 border-t-4 border-blue-600 hover:-translate-y-1 transition-transform duration-300 text-center group">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 mx-auto mb-4 group-hover:bg-blue-200 transition-colors shadow-sm">
              <MessageSquare size={28} />
            </div>
            <h3 className="text-lg font-semibold mb-2 text-gray-800">Share Your Experience</h3>
            <p className="text-gray-600 text-sm mb-6">
              Your feedback helps us improve our program and serve beneficiaries and sponsors better
            </p>
            <button
              className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-lg font-medium hover:shadow-md transition-all duration-300 flex items-center justify-center gap-2 mx-auto group-hover:gap-3"
              onClick={() => setFeedbackModalOpen(true)}
            >
              <Edit size={16} />
              Provide Feedback
              <ChevronRight size={16} />
            </button>
          </div>

          {/* Pie Chart */}
          <BeneficiaryPieChart data={beneficiaryStats} />

          {/* Request Additional Beneficiary */}
          <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-md p-6 border-t-4 border-blue-600 hover:-translate-y-1 transition-transform duration-300 text-center group">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 mx-auto mb-4 group-hover:bg-blue-200 transition-colors shadow-sm">
              <UserPlus size={28} />
            </div>
            <h3 className="text-lg font-semibold mb-2 text-gray-800">
              Expand Your Impact
            </h3>
            <p className="text-gray-600 text-sm mb-6">
              Support additional beneficiaries and make an even greater difference in your community
            </p>
            <button
              className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-lg font-medium hover:shadow-md transition-all duration-300 flex items-center justify-center gap-2 mx-auto group-hover:gap-3"
              onClick={() => setRequestModalOpen(true)}
            >
              <Heart size={16} />
              Support More
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        {/* Reports Section */}
        <ReportsSection 
          userRole="sponsor" 
          userId={sponsorProfile.id} 
        />

        {/* Feedbacks Section */}
        <div className="mt-8">
          <FeedbacksTable 
            feedbacks={feedbacks} 
            currentSponsorId={getUserData().cluster_id && getUserData().specific_id ? `${getUserData().cluster_id}-${getUserData().specific_id}` : ''}
          />
        </div>
      </main>

      {/* Feedback Modal */}
      <Modal
        isOpen={feedbackModalOpen}
        onClose={() => setFeedbackModalOpen(false)}
        title="Share Your Feedback"
      >
        <div className="mb-6">
          <label className="block text-gray-700 font-medium mb-2">
            How can we improve your experience?
          </label>
          <textarea
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            placeholder="We'd love to hear your thoughts..."
            rows={5}
            value={feedbackText}
            onChange={(e) => setFeedbackText(e.target.value)}
          />
        </div>
        <div className="flex justify-end gap-3">
          <button
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
            onClick={() => setFeedbackModalOpen(false)}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:shadow-md transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            onClick={handleFeedbackSubmit}
            disabled={feedbackSubmitting}
          >
            Submit Feedback
          </button>
        </div>
      </Modal>

      {/* Request Beneficiary Modal */}
      <Modal
        isOpen={requestModalOpen}
        onClose={() => setRequestModalOpen(false)}
        title="Support More Beneficiaries"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Child beneficiaries
            </label>
            <input
              type="number"
              min="0"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              value={childCount}
              onChange={(e) => setChildCount(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Elderly beneficiaries
            </label>
            <input
              type="number"
              min="0"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              value={elderlyCount}
              onChange={(e) => setElderlyCount(e.target.value)}
            />
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
            Total beneficiaries: <span className="font-semibold">{Number(childCount || 0) + Number(elderlyCount || 0)}</span>
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <button
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
            onClick={() => setRequestModalOpen(false)}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:shadow-md transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            onClick={handleRequestSubmit}
            disabled={requestSubmitting}
          >
            Continue
          </button>
        </div>
      </Modal>

      {/* Profile Modal - Updated for Sponsor */}
      {profileModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-[9999] backdrop-blur-sm backdrop-brightness-75">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-800 to-blue-600 text-white rounded-t-2xl">
              <h2 className="text-xl font-semibold">{isEditingProfile ? 'Edit Profile' : 'Sponsor Profile'}</h2>
              <button
                onClick={() => setProfileModalOpen(false)}
                className="text-white/80 hover:text-white p-1 rounded-md hover:bg-white/10 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="p-6">
              <div className="space-y-6">
                <div className="flex items-center space-x-6">
                  <div className="w-24 h-24 bg-gradient-to-br from-blue-600 to-blue-700 rounded-full flex items-center justify-center text-white shadow-md">
                    <User className="h-12 w-12" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-800">
                      {sponsorProfile.name}
                    </h3>
                    <p className="text-gray-600 flex items-center gap-2">
                      <Shield size={16} className="text-blue-600" />
                      {sponsorProfile.role}
                    </p>
                    <p className="text-sm text-gray-500 mt-1 flex items-center gap-2">
                      <Mail size={14} />
                      {isEditingProfile ? (
                        <input
                          type="email"
                          value={editedProfile.email || ''}
                          onChange={(e) => handleProfileInputChange('email', e.target.value)}
                          className="text-gray-800 bg-white border border-gray-300 rounded px-2 py-1 w-full"
                          placeholder="Enter email address"
                        />
                      ) : (
                        sponsorProfile.email
                      )}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">
                      Personal Information
                    </h4>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Full Name
                        </label>
                        <p className="text-gray-900">{sponsorProfile.name}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Email Address
                        </label>
                        <p className="text-gray-900">{sponsorProfile.email}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Sponsor ID
                        </label>
                        <p className="text-gray-900">{sponsorProfile.sponsorId || '01-240'}</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">
                      Contact Information
                    </h4>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Phone Number
                        </label>
                        <p className="text-gray-900 flex items-center gap-2">
                          <Phone size={14} className="text-gray-500" />

                          {isEditingProfile ? (
                            <input
                              type="tel"
                              value={editedProfile.phone || ''}
                              onChange={(e) => handleProfileInputChange('phone', e.target.value)}
                              className="text-gray-800 bg-white border border-gray-300 rounded px-2 py-1 flex-1"
                              placeholder="Enter phone number"
                            />
                          ) : (
                            sponsorProfile.phone
                          )}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Address
                        </label>
                        <p className="text-gray-900 flex items-center gap-2">
                          <MapPin size={14} className="text-gray-500" />
                          {sponsorProfile.address}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Beneficiaries Supported
                        </label>
                        
                        <p className="text-gray-900 flex items-center gap-2" >
                        <Users size={14} className="text-gray-500" />
                        {beneficiaries.length}</p>

                      </div>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">
                    Account Information
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-blue-50 p-4 rounded-xl">
                      <h5 className="font-medium text-gray-800 flex items-center gap-2">
                        <Clock size={16} />
                        Last Login
                      </h5>
                      <p className="text-sm text-gray-600 mt-1">
                        {sponsorProfile.lastLogin}
                      </p>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-xl">
                      <h5 className="font-medium text-gray-800 flex items-center gap-2">
                        <Clock size={16} />
                        Start Date
                      </h5>
                      <p className="text-sm text-gray-600 mt-1">
                        {sponsorProfile.joinDate}
                      </p>
                    </div>

                    <div className="bg-blue-50 p-4 rounded-xl">
                      <h5 className="font-medium text-gray-800 flex items-center gap-2">
                        <Shield size={16} />
                        Account Status
                      </h5>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 mt-1">
                        {sponsorProfile.status}
                      </span>
                    </div>
                    
                  </div>
                </div>
                
                {/* Password Change Section - Only shown in edit mode */}
                {isEditingProfile && (
                  <div className="space-y-4 pt-4 border-t border-gray-200">
                    <h4 className="text-lg font-semibold text-gray-800">
                      Change Password
                    </h4>
                    
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                        <Lock className="w-5 h-5 text-blue-600" />
                        <div className="flex-1">
                          <p className="text-sm text-gray-600">Current Password</p>
                          <div className="relative">
                            <input
                              type={showPasswords.oldPassword ? "text" : "password"}
                              value={profilePasswordData.oldPassword}
                              onChange={(e) => handlePasswordInputChange('oldPassword', e.target.value)}
                              className="text-gray-800 bg-white border border-gray-300 rounded px-2 py-1 w-full pr-10"
                              placeholder="Enter current password"
                            />
                            <button
                              type="button"
                              onClick={() => togglePasswordVisibility('oldPassword')}
                              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500"
                            >
                              {showPasswords.oldPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                        <Lock className="w-5 h-5 text-blue-600" />
                        <div className="flex-1">
                          <p className="text-sm text-gray-600">New Password</p>
                          <div className="relative">
                            <input
                              type={showPasswords.newPassword ? "text" : "password"}
                              value={profilePasswordData.newPassword}
                              onChange={(e) => handlePasswordInputChange('newPassword', e.target.value)}
                              className="text-gray-800 bg-white border border-gray-300 rounded px-2 py-1 w-full pr-10"
                              placeholder="Enter new password"
                            />
                            <button
                              type="button"
                              onClick={() => togglePasswordVisibility('newPassword')}
                              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500"
                            >
                              {showPasswords.newPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                        <Lock className="w-5 h-5 text-blue-600" />
                        <div className="flex-1">
                          <p className="text-sm text-gray-600">Confirm New Password</p>
                          <div className="relative">
                            <input
                              type={showPasswords.confirmPassword ? "text" : "password"}
                              value={profilePasswordData.confirmPassword}
                              onChange={(e) => handlePasswordInputChange('confirmPassword', e.target.value)}
                              className="text-gray-800 bg-white border border-gray-300 rounded px-2 py-1 w-full pr-10"
                              placeholder="Confirm new password"
                            />
                            <button
                              type="button"
                              onClick={() => togglePasswordVisibility('confirmPassword')}
                              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500"
                            >
                              {showPasswords.confirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
              </div>
            </div>
            <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
              <button 
                onClick={handleLogout}
                className="text-gray-600 hover:text-gray-800 transition-colors flex items-center gap-2"
              >
                <LogOut size={16} />
                Sign Out
              </button>
              <div className="flex items-center gap-3">
                {isEditingProfile ? (
                  <>
                    <button
                      onClick={handleCancelEdit}
                      className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveProfile}
                      className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:shadow-md transition-all flex items-center"
                    >
                      <Save size={16} className="mr-2" />
                      Save Changes
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => setProfileModalOpen(false)}
                      className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                    >
                      Close
                    </button>
                    <button
                      onClick={handleEditProfile}
                      className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:shadow-md transition-all flex items-center"
                    >
                      <UserCog size={16} className="mr-2" />
                      Edit Profile
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SponsorDashboard;
