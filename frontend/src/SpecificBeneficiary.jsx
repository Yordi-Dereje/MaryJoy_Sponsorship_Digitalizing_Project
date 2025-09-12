import React, { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { ArrowLeft, User, BookOpen, Heart, Award, Calendar, Phone, Shield } from "lucide-react";

const SpecificBeneficiary = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const [beneficiary, setBeneficiary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Get beneficiary data from location state or fetch from API
  useEffect(() => {
    if (location.state?.beneficiary) {
      setBeneficiary(location.state.beneficiary);
      setLoading(false);
    } else {
      fetchBeneficiaryData();
    }
  }, [id, location.state]);

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
        <div className="flex items-center mb-8 gap-4">
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
                    <p className="font-semibold">{beneficiary.age || 'N/A'} years</p>
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
                    <p className="font-semibold">{formatDate(beneficiary.created_at)}</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Your Impact Section */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
              <h3 className="text-xl font-bold text-[#032990] mb-4 flex items-center">
                <Award className="mr-2 text-[#EAA108]" size={22} />
                Your Impact
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-[#f8faff] rounded-lg">
                  <div className="flex items-center">
                    <div className="bg-[#032990] p-2 rounded-lg mr-3">
                      <BookOpen className="text-white" size={18} />
                    </div>
                    <div>
                      <p className="font-medium">Education Funded</p>
                      <p className="text-sm text-[#6b7280]">2 full years</p>
                    </div>
                  </div>
                  <div className="bg-[#e6f7ff] text-[#032990] px-2 py-1 rounded-full text-sm font-bold">
                    100%
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-[#f8faff] rounded-lg">
                  <div className="flex items-center">
                    <div className="bg-[#032990] p-2 rounded-lg mr-3">
                      <Heart className="text-white" size={18} />
                    </div>
                    <div>
                      <p className="font-medium">Healthcare Provided</p>
                      <p className="text-sm text-[#6b7280]">Regular checkups</p>
                    </div>
                  </div>
                  <div className="bg-[#e6f7ff] text-[#032990] px-2 py-1 rounded-full text-sm font-bold">
                    4 visits
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-[#f8faff] rounded-lg">
                  <div className="flex items-center">
                    <div className="bg-[#032990] p-2 rounded-lg mr-3">
                      <Calendar className="text-white" size={18} />
                    </div>
                    <div>
                      <p className="font-medium">Duration</p>
                      <p className="text-sm text-[#6b7280]">Continuous support</p>
                    </div>
                  </div>
                  <div className="bg-[#e6f7ff] text-[#032990] px-2 py-1 rounded-full text-sm font-bold">
                    18 months
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
                      <span className="text-[#6b7280]">Phone:</span>
                      <span className="font-medium">{beneficiary.phone || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#6b7280]">Guardian:</span>
                      <span className="font-medium">{beneficiary.guardian_name || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#6b7280]">Joined:</span>
                      <span className="font-medium">{formatDate(beneficiary.created_at)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#6b7280]">Last Updated:</span>
                      <span className="font-medium">{formatDate(beneficiary.updated_at)}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 pt-4 border-t">
                <h4 className="text-lg font-semibold text-[#032990] mb-3">Background Information</h4>
                <p className="text-[#6b7280] leading-relaxed">
                  {beneficiary.full_name} is a {beneficiary.age}-year-old {beneficiary.gender} {beneficiary.type} 
                  who has been part of our sponsorship program since {formatDate(beneficiary.created_at)}. 
                  {beneficiary.guardian_name && ` They are under the care of ${beneficiary.guardian_name}.`}
                  {beneficiary.phone && ` You can reach them at ${beneficiary.phone}.`}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpecificBeneficiary;
