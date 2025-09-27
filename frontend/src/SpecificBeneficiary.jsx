import React, { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { ArrowLeft, User, BookOpen, Heart, Award, Calendar, Phone, Shield, GraduationCap, X, AlertTriangle, Upload, CreditCard, MapPin } from "lucide-react";

const SpecificBeneficiary = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const [beneficiary, setBeneficiary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showGraduateModal, setShowGraduateModal] = useState(false);
  const [showTerminateModal, setShowTerminateModal] = useState(false);
  const [graduateForm, setGraduateForm] = useState({
    reason: '',
    file: null
  });
  const [terminateForm, setTerminateForm] = useState({
    reason: '',
    file: null
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form function
  const resetForms = () => {
    setGraduateForm({ reason: '', file: null });
    setTerminateForm({ reason: '', file: null });
    setIsSubmitting(false);
  };

  useEffect(() => {
  // Always fetch fresh data to get complete details
  fetchBeneficiaryData();
}, [id]);
  
  // Get beneficiary data from location state or fetch from API
  useEffect(() => {
  if (location.state?.beneficiary) {
    setBeneficiary(location.state.beneficiary);
    setLoading(false);
    
    // Add console log here
    console.log('Beneficiary data from location state:', location.state.beneficiary);
    console.log('Phone fields from state:', {
      phone: location.state.beneficiary.phone,
      phone2: location.state.beneficiary.phone2,
      phone3: location.state.beneficiary.phone3
    });
    console.log('Date fields from state:', {
      start_date: location.state.beneficiary.start_date,
      created_at: location.state.beneficiary.created_at,
      updated_at: location.state.beneficiary.updated_at
    });
    
  } else {
    fetchBeneficiaryData();
  }
}, [id, location.state]);

// Also add this useEffect to log when beneficiary state changes
useEffect(() => {
  if (beneficiary) {
    console.log('Beneficiary state updated:', beneficiary);
    console.log('Phone fields in state:', {
      phone: beneficiary.phone,
      phone2: beneficiary.phone2,
      phone3: beneficiary.phone3
    });
    console.log('Date fields in state:', {
      start_date: beneficiary.start_date,
      created_at: beneficiary.created_at,
      updated_at: beneficiary.updated_at
    });
  }
}, [beneficiary]);
// Calculate age from date of birth
const calculateAge = (dateOfBirth) => {
  if (!dateOfBirth) return "N/A";
  try {
    const birthDate = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  } catch (error) {
    return "N/A";
  }
};

  const fetchBeneficiaryData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:5000/api/beneficiaries/${id}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch beneficiary data');
      }
      
      const data = await response.json();
      setBeneficiary(data);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching beneficiary:', err);
    } finally {
      setLoading(false);
    }
  };

  // Handle back button click
  const handleBack = () => {
    navigate(-1);
  };

  // Handle graduate beneficiary
  const handleGraduate = async () => {
    if (!graduateForm.reason.trim()) {
      alert('Please provide a reason for graduation.');
      return;
    }

    setIsSubmitting(true);
    try {
      // Get current user from localStorage
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const employeeId = user.id;

      // Create FormData for file upload
      const formData = new FormData();
      formData.append('beneficiary_id', id);
      formData.append('type', 'graduation');
      formData.append('title', graduateForm.reason);
      formData.append('created_by', employeeId);
      if (graduateForm.file) {
        formData.append('file', graduateForm.file);
      }

      // First, create the graduation record
      const recordResponse = await fetch('http://localhost:5000/api/beneficiary-records', {
        method: 'POST',
        body: formData
      });

      if (!recordResponse.ok) {
        throw new Error('Failed to create graduation record');
      }

      // Then update beneficiary status
      const statusResponse = await fetch(`http://localhost:5000/api/beneficiaries/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'graduated'
        })
      });

      if (statusResponse.ok) {
        const updatedBeneficiary = await statusResponse.json();
        setBeneficiary(updatedBeneficiary.beneficiary);
        setShowGraduateModal(false);
        setGraduateForm({ reason: '', file: null });
        alert("Beneficiary has been successfully graduated!");
        fetchBeneficiaryData(); // Refresh data
      } else {
        throw new Error('Failed to update beneficiary status');
      }
    } catch (error) {
      console.error('Error graduating beneficiary:', error);
      alert('Error graduating beneficiary. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle terminate beneficiary
  const handleTerminate = async () => {
    if (!terminateForm.reason.trim()) {
      alert('Please provide a reason for termination.');
      return;
    }

    setIsSubmitting(true);
    try {
      // Get current user from localStorage
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const employeeId = user.id;

      // Create FormData for file upload
      const formData = new FormData();
      formData.append('beneficiary_id', id);
      formData.append('type', 'termination');
      formData.append('title', terminateForm.reason);
      formData.append('created_by', employeeId);
      if (terminateForm.file) {
        formData.append('file', terminateForm.file);
      }

      // First, create the termination record
      const recordResponse = await fetch('http://localhost:5000/api/beneficiary-records', {
        method: 'POST',
        body: formData
      });

      if (!recordResponse.ok) {
        throw new Error('Failed to create termination record');
      }

      // Then update beneficiary status
      const statusResponse = await fetch(`http://localhost:5000/api/beneficiaries/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'terminated'
        })
      });

      if (statusResponse.ok) {
        const updatedBeneficiary = await statusResponse.json();
        setBeneficiary(updatedBeneficiary.beneficiary);
        setShowTerminateModal(false);
        setTerminateForm({ reason: '', file: null });
        alert("Beneficiary has been terminated.");
        fetchBeneficiaryData(); // Refresh data
      } else {
        throw new Error('Failed to update beneficiary status');
      }
    } catch (error) {
      console.error('Error terminating beneficiary:', error);
      alert('Error terminating beneficiary. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };


  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  if (loading) {
    return (
      <div className="font-poppins bg-[#e6ecf8] p-8 text-[#032990] min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#032990] mx-auto"></div>
          <p className="mt-4 text-lg">Loading beneficiary data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="font-poppins bg-[#e6ecf8] p-8 text-[#032990] min-h-screen flex items-center justify-center">
        <div className="text-center text-red-600">
          <p className="text-lg">Error: {error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-6 py-2 bg-[#032990] text-white rounded-lg hover:bg-[#021f70]"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!beneficiary) {
    return (
      <div className="font-poppins bg-[#e6ecf8] p-8 text-[#032990] min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg">Beneficiary not found</p>
          <button
            onClick={handleBack}
            className="mt-4 px-6 py-2 bg-[#032990] text-white rounded-lg hover:bg-[#021f70]"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="font-poppins bg-[#e6ecf8] p-4 sm:p-6 lg:p-8 text-[#032990] min-h-screen">
      <div className="max-w-6xl mx-auto bg-white p-6 rounded-xl shadow-lg">
        {/* Header Section */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={handleBack}
              className="flex items-center justify-center w-12 h-12 bg-white text-[#032990] rounded-lg shadow-md transition-all duration-300 border border-[#f0f3ff] hover:bg-[#032990] hover:text-white group"
            >
              <ArrowLeft className="w-6 h-6 transition-colors duration-300 group-hover:stroke-white" />
            </button>
            <div>
              <h1 className="text-[#032990] font-bold text-3xl m-0">Beneficiary Details</h1>
              <p className="text-[#6b7280] mt-1">Comprehensive information about your sponsored beneficiary</p>
            </div>
          </div>
          
          {/* Action Buttons - Show for all users */}
          {beneficiary && beneficiary.status !== 'graduated' && beneficiary.status !== 'terminated' && (
            <div className="flex gap-3">
              <button
                onClick={() => setShowGraduateModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-900 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-md"
              >
                <GraduationCap size={18} />
                Graduate
              </button>
              <button
                onClick={() => setShowTerminateModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 shadow-md"
              >
                <X size={18} />
                Terminate
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Profile Card */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden p-6 border border-gray-200">
              <div className="flex justify-center mb-4">
                <div className="relative">
                  <div className="w-32 h-32 rounded-full bg-gradient-to-br from-[#032990] to-[#EAA108] flex items-center justify-center text-white text-4xl font-bold border-4 border-white shadow-lg">
                    {beneficiary.full_name.split(' ').map(name => name[0]).join('')}
                  </div>
                  <div className="absolute bottom-2 right-2 bg-[#EAA108] text-white p-1 rounded-full">
                    <User size={16} />
                  </div>
                </div>
              </div>
              
              <h2 className="text-2xl font-bold text-center text-[#032990] mb-2">
                {beneficiary.full_name}
              </h2>
              
              <div className="text-center text-[#6b7280] mb-6">
                <span className="inline-block bg-[#e6f7ff] text-[#1890ff] px-3 py-1 rounded-full text-sm font-medium mr-2">
                  {beneficiary.type === 'child' ? 'Child' : 'Elderly'}
                </span>
                <span className="inline-block bg-[#ffe6f2] text-[#cc0066] px-3 py-1 rounded-full text-sm font-medium">
                  {beneficiary.gender}
                </span>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center">
                  <div className="bg-[#f0f7ff] p-2 rounded-lg mr-3">
                    <User className="text-[#032990]" size={20} />
                  </div>
                  <div>
                    <p className="text-sm text-[#6b7280]">Age</p>
                    <p className="font-semibold">{calculateAge(beneficiary.date_of_birth)} years</p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <div className="bg-[#f0f7ff] p-2 rounded-lg mr-3">
                    <Shield className="text-[#032990]" size={20} />
                  </div>
                  <div>
                    <p className="text-sm text-[#6b7280]">Guardian</p>
                    <p className="font-semibold">{beneficiary.guardian_name || 'N/A'}</p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <div className="bg-[#f0f7ff] p-2 rounded-lg mr-3">
                    <Phone className="text-[#032990]" size={20} />
                  </div>
                  <div>
                    <p className="text-sm text-[#6b7280]">Phone</p>
                    <p className="font-semibold">{beneficiary.phone || 'N/A'}</p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <div className="bg-[#f0f7ff] p-2 rounded-lg mr-3">
                    <Calendar className="text-[#032990]" size={20} />
                  </div>
                  <div>
                    <p className="text-sm text-[#6b7280]">Joined</p>
                    <p className="font-semibold">{formatDate(beneficiary.start_date || beneficiary.created_at)}</p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <div className="bg-[#f0f7ff] p-2 rounded-lg mr-3">
                    <Calendar className="text-[#032990]" size={20} />
                  </div>
                  <div>
                    <p className="text-sm text-[#6b7280]">Last Updated</p>
                    <p className="font-semibold">{formatDate(beneficiary.updated_at)}</p>
                  </div>
                </div>
              </div>
            </div>
            
          </div>
          
          {/* Right Column - Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Gallery */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
              <h3 className="text-xl font-bold text-[#032990] mb-6 flex items-center">
                <BookOpen className="mr-2 text-[#EAA108]" size={22} />
                Documentation Gallery
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="w-full h-48 bg-gradient-to-br from-[#032990] to-[#EAA108] rounded-xl flex items-center justify-center">
                  <div className="text-center text-white">
                    <User size={48} className="mx-auto mb-2" />
                    <p className="font-medium">Profile Photo</p>
                    <p className="text-sm opacity-80">Not available</p>
                  </div>
                </div>
                
                <div className="w-full h-48 bg-gradient-to-br from-[#EAA108] to-[#032990] rounded-xl flex items-center justify-center">
                  <div className="text-center text-white">
                    <BookOpen size={48} className="mx-auto mb-2" />
                    <p className="font-medium">Support Letter</p>
                    <p className="text-sm opacity-80">Not available</p>
                  </div>
                </div>
                
                <div className="w-full h-48 bg-gradient-to-br from-[#032990] to-[#EAA108] rounded-xl flex items-center justify-center">
                  <div className="text-center text-white">
                    <Heart size={48} className="mx-auto mb-2" />
                    <p className="font-medium">Additional Documents</p>
                    <p className="text-sm opacity-80">Not available</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Detailed Information */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
              <h3 className="text-xl font-bold text-[#032990] mb-6 flex items-center">
                <Heart className="mr-2 text-[#EAA108]" size={22} />
                About {beneficiary.full_name}
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-lg font-semibold text-[#032990] mb-3 border-b pb-2">Basic Information</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-[#6b7280]">Type:</span>
                      <span className="font-medium">{beneficiary.type === 'child' ? 'Child' : 'Elderly'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#6b7280]">Gender:</span>
                      <span className="font-medium capitalize">{beneficiary.gender}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#6b7280]">Date of Birth:</span>
                      <span className="font-medium">{formatDate(beneficiary.date_of_birth)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#6b7280]">Status:</span>
                      <span className="font-medium capitalize text-[#10b981]">{beneficiary.status}</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-lg font-semibold text-[#032990] mb-3 border-b pb-2">Contact Information</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-[#6b7280]">Guardian:</span>
                      <span className="font-medium">{beneficiary.guardian_name || 'N/A'}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-[#6b7280]">Primary Phone:</span>
                      <span className="font-medium">{beneficiary.phone || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#6b7280]">Secondary Phone:</span>
                      <span className="font-medium"> {beneficiary.phone2 || beneficiary.guardian_secondary_phone || beneficiary.secondary_phone || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#6b7280]">Tertiary Phone:</span>
                      <span className="font-medium">{beneficiary.phone3 || 'N/A'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Add this to the left column, after the phone section */}
<div className="flex items-center">
  <div className="bg-[#f0f7ff] p-2 rounded-lg mr-3">
    <MapPin className="text-[#032990]" size={20} />
  </div>
  <div>
    <p className="text-sm text-[#6b7280]">Address</p>
    <p className="font-semibold">
      {beneficiary.address ? 
        `${beneficiary.address.house_number || ''} ${beneficiary.address.woreda || ''}`.trim() || 
        `${beneficiary.address.region || ''}`.trim() || 
        'Available' 
        : 'N/A'
      }
    </p>
  </div>
</div>
              
              {/* Bank Account Information */}
              <div className="mt-6 pt-4 border-t">
                <h4 className="text-lg font-semibold text-[#032990] mb-3 flex items-center">
                  <CreditCard className="mr-2 text-[#EAA108]" size={20} />
                  Bank Account Information
                </h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-[#6b7280]">Bank Name:</span>
                      <span className="font-medium">{beneficiary.bank_information?.bank_name || 'Not provided'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#6b7280]">Account Number:</span>
                      <span className="font-medium">{beneficiary.bank_information?.bank_account_number || 'Not provided'}</span>
                    </div>
                    {beneficiary.bank_information?.bank_book_photo_url && (
                      <div className="flex justify-between">
                        <span className="text-[#6b7280]">Bank Book:</span>
                        <a 
                          href={beneficiary.bank_information.bank_book_photo_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 underline"
                        >
                          View Document
                        </a>
                      </div>
                    )}
                  </div>
              </div>

             {/* Address Information - Fixed */}
{beneficiary.address && (
  <div className="mt-6 pt-4 border-t">
    <h4 className="text-lg font-semibold text-[#032990] mb-3 flex items-center">
      <MapPin className="mr-2 text-[#EAA108]" size={20} />
      Address Information
    </h4>
    <div className="space-y-3">
      {beneficiary.address.house_number && (
        <div className="flex justify-between">
          <span className="text-[#6b7280]">House Number:</span>
          <span className="font-medium">{beneficiary.address.house_number}</span>
        </div>
      )}
      {beneficiary.address.woreda && (
        <div className="flex justify-between">
          <span className="text-[#6b7280]">Woreda:</span>
          <span className="font-medium">{beneficiary.address.woreda}</span>
        </div>
      )}
      {beneficiary.address.sub_region && (
        <div className="flex justify-between">
          <span className="text-[#6b7280]">Sub Region:</span>
          <span className="font-medium">{beneficiary.address.sub_region}</span>
        </div>
      )}
      {beneficiary.address.region && (
        <div className="flex justify-between">
          <span className="text-[#6b7280]">Region:</span>
          <span className="font-medium">{beneficiary.address.region}</span>
        </div>
      )}
      {beneficiary.address.country && (
        <div className="flex justify-between">
          <span className="text-[#6b7280]">Country:</span>
          <span className="font-medium">{beneficiary.address.country}</span>
        </div>
      )}
    </div>
  </div>
)}  
            </div>
          </div>
        </div>
      </div>

      {/* Graduate Modal */}
      {showGraduateModal && (
        <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-2xl font-bold text-[#032990]">Graduate Beneficiary</h2>
              <button 
                onClick={() => {
                  setShowGraduateModal(false);
                  resetForms();
                }} 
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="p-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <div className="flex items-start">
                  <GraduationCap className="text-blue-600 mr-3 mt-0.5" size={20} />
                  <div>
                    <h3 className="font-medium text-blue-800">Congratulations!</h3>
                    <p className="text-blue-700 text-sm mt-1">
                      This beneficiary will be marked as successfully graduated from the program.
                    </p>
                  </div>
                </div>
              </div>
              
              <p className="text-gray-600 mb-6">
                Please provide the graduation details for <strong>{beneficiary.full_name}</strong>:
              </p>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reason for Graduation <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={graduateForm.reason}
                    onChange={(e) => setGraduateForm(prev => ({ ...prev, reason: e.target.value }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter the reason for graduation (e.g., Completed education, Reached age limit, etc.)"
                    rows={3}
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Supporting Document (Optional)
                  </label>
                  <div className="flex items-center justify-center w-full">
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="w-8 h-8 mb-4 text-gray-500" />
                        <p className="mb-2 text-sm text-gray-500">
                          <span className="font-semibold">Click to upload</span> graduation certificate or related document
                        </p>
                        <p className="text-xs text-gray-500">PDF, DOC, DOCX, JPG, PNG (MAX. 10MB)</p>
                      </div>
                      <input
                        type="file"
                        className="hidden"
                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                        onChange={(e) => setGraduateForm(prev => ({ ...prev, file: e.target.files[0] }))}
                      />
                    </label>
                  </div>
                  {graduateForm.file && (
                    <p className="mt-2 text-sm text-green-600">
                      Selected: {graduateForm.file.name}
                    </p>
                  )}
                </div>
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
                <p className="text-blue-800 text-sm">
                  <strong>Note:</strong> This record will be permanently stored with beneficiary ID, employee ID, timestamp, and the provided details.
                </p>
              </div>
            </div>
            
            <div className="flex justify-end gap-4 p-6 border-t">
              <button
                onClick={() => {
                  setShowGraduateModal(false);
                  resetForms();
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleGraduate}
                disabled={isSubmitting || !graduateForm.reason.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Processing...' : 'Graduate Beneficiary'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Terminate Modal */}
      {showTerminateModal && (
        <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-2xl font-bold text-[#032990]">Terminate Beneficiary</h2>
              <button 
                onClick={() => {
                  setShowTerminateModal(false);
                  resetForms();
                }} 
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="p-6">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <div className="flex items-start">
                  <AlertTriangle className="text-red-600 mr-3 mt-0.5" size={20} />
                  <div>
                    <h3 className="font-medium text-red-800">Warning: This action cannot be undone</h3>
                    <p className="text-red-700 text-sm mt-1">
                      Terminating this beneficiary will remove them from active sponsorship.
                    </p>
                  </div>
                </div>
              </div>
              
              <p className="text-gray-600 mb-6">
                Please provide the termination details for <strong>{beneficiary.full_name}</strong>:
              </p>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reason for Termination <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={terminateForm.reason}
                    onChange={(e) => setTerminateForm(prev => ({ ...prev, reason: e.target.value }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="Enter the reason for termination (e.g., Family relocation, Violation of terms, etc.)"
                    rows={3}
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Supporting Document (Optional)
                  </label>
                  <div className="flex items-center justify-center w-full">
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="w-8 h-8 mb-4 text-gray-500" />
                        <p className="mb-2 text-sm text-gray-500">
                          <span className="font-semibold">Click to upload</span> termination notice or related document
                        </p>
                        <p className="text-xs text-gray-500">PDF, DOC, DOCX, JPG, PNG (MAX. 10MB)</p>
                      </div>
                      <input
                        type="file"
                        className="hidden"
                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                        onChange={(e) => setTerminateForm(prev => ({ ...prev, file: e.target.files[0] }))}
                      />
                    </label>
                  </div>
                  {terminateForm.file && (
                    <p className="mt-2 text-sm text-green-600">
                      Selected: {terminateForm.file.name}
                    </p>
                  )}
                </div>
              </div>
              
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-6">
                <p className="text-yellow-800 text-sm">
                  <strong>Note:</strong> This record will be permanently stored with beneficiary ID, employee ID, timestamp, and the provided details.
                </p>
              </div>
            </div>
            
            <div className="flex justify-end gap-4 p-6 border-t">
              <button
                onClick={() => {
                  setShowTerminateModal(false);
                  resetForms();
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleTerminate}
                disabled={isSubmitting || !terminateForm.reason.trim()}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Processing...' : 'Terminate Beneficiary'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SpecificBeneficiary;
