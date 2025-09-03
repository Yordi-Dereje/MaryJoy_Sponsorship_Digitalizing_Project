import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, User, BookOpen, Heart, Award, Calendar, Phone, Shield, X } from "lucide-react";

// Import images from src directory
import TsionPic from "../src/Tsion_pic.jpg";
import TsionForm from "../src/Tsion_form.jpg";
import TsionSupport from "../src/Tsion_support.jpg";

const SpecificBeneficiary = () => {
  const navigate = useNavigate();
  const [selectedImage, setSelectedImage] = useState(null);
  
  // Beneficiary data
  const beneficiary = {
    id: 1,
    type: "child",
    name: "Tsion Abebe",
    age: 15,
    gender: "female",
    guardian: "Alem Assefa (Mother)",
    phone: "+251991164564",
    joined: "January 2022",
    school: "St. Mary's High School",
    grade: "Grade 10",
    performance: "Excellent",
    health: "Good"
  };

  // Handle back button click
  const handleBack = () => {
    navigate("/sponsor_beneficiaries");
  };

  // Handle image click to open modal
  const handleImageClick = (image) => {
    setSelectedImage(image);
  };

  // Close modal
  const closeModal = () => {
    setSelectedImage(null);
  };

  return (
    <div className="font-poppins bg-[#e6ecf8] p-4 sm:p-6 lg:p-8 text-[#032990] min-h-screen">
      {/* Image Modal */}
      {selectedImage && (
  <div className="fixed inset-0 backdrop-blur-md bg-black/30 flex items-center justify-center z-50 p-4" onClick={closeModal}>
    <div className="relative max-w-4xl max-h-full" onClick={(e) => e.stopPropagation()}>
      <button 
        className="absolute -top-12 right-0 text-white hover:text-[#EAA108] z-10 bg-[#032990] rounded-full p-1"
        onClick={closeModal}
      >
        <X size={30} />
      </button>
      <img 
        src={selectedImage} 
        alt="Enlarged view" 
        className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-2xl"
      />
    </div>
  </div>
)}
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
          <div>
            <h1 className="text-[#032990] font-bold text-3xl m-0">Beneficiary Details</h1>
            <p className="text-[#6b7280] mt-1">Comprehensive information about your sponsored beneficiary</p>
          </div>
          <button
            onClick={handleBack}
            className="flex items-center justify-center w-12 h-12 bg-white text-[#032990] rounded-lg shadow-md transition-all duration-300 border border-[#f0f3ff] hover:bg-[#032990] hover:text-white group"
          >
            <ArrowLeft className="w-6 h-6 transition-colors duration-300 group-hover:stroke-white" />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Profile Card */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="h-32 bg-gradient-to-r from-[#032990] to-[#0d3ba8]"></div>
              <div className="px-6 pb-6 relative">
                <div className="flex justify-center -mt-16 mb-4">
                  <div className="relative">
                    <img 
                      src={TsionPic} 
                      alt={beneficiary.name} 
                      className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg cursor-pointer"
                      onClick={() => handleImageClick(TsionPic)}
                    />
                    <div className="absolute bottom-2 right-2 bg-[#EAA108] text-white p-1 rounded-full">
                      <User size={16} />
                    </div>
                  </div>
                </div>
                
                <h2 className="text-2xl font-bold text-center text-[#032990] mb-2">
                  {beneficiary.name}
                </h2>
                
                <div className="text-center text-[#6b7280] mb-6">
                  <span className="inline-block bg-[#e6f7ff] text-[#1890ff] px-3 py-1 rounded-full text-sm font-medium mr-2">
                    {beneficiary.type}
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
                      <p className="font-semibold">{beneficiary.age} years</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <div className="bg-[#f0f7ff] p-2 rounded-lg mr-3">
                      <Shield className="text-[#032990]" size={20} />
                    </div>
                    <div>
                      <p className="text-sm text-[#6b7280]">Guardian</p>
                      <p className="font-semibold">{beneficiary.guardian}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <div className="bg-[#f0f7ff] p-2 rounded-lg mr-3">
                      <Phone className="text-[#032990]" size={20} />
                    </div>
                    <div>
                      <p className="text-sm text-[#6b7280]">Phone</p>
                      <p className="font-semibold">{beneficiary.phone}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <div className="bg-[#f0f7ff] p-2 rounded-lg mr-3">
                      <Calendar className="text-[#032990]" size={20} />
                    </div>
                    <div>
                      <p className="text-sm text-[#6b7280]">Joined</p>
                      <p className="font-semibold">{beneficiary.joined}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Your Impact Section - Replaced Progress Summary */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
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
          
          {/* Right Column - Gallery and Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Gallery */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-[#032990] mb-6 flex items-center">
                <BookOpen className="mr-2 text-[#EAA108]" size={22} />
                Documentation Gallery
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div 
                  className="group relative overflow-hidden rounded-xl cursor-pointer"
                  onClick={() => handleImageClick(TsionPic)}
                >
                  <img 
                    src={TsionPic} 
                    alt="Tsion's Profile" 
                    className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#032990] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                    <p className="text-white font-medium">Profile Photo</p>
                  </div>
                </div>
                
                <div 
                  className="group relative overflow-hidden rounded-xl cursor-pointer"
                  onClick={() => handleImageClick(TsionForm)}
                >
                  <img 
                    src={TsionForm} 
                    alt="Tsion's Application Form" 
                    className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#032990] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                    <p className="text-white font-medium">Application Form</p>
                  </div>
                </div>
                
                <div 
                  className="group relative overflow-hidden rounded-xl cursor-pointer"
                  onClick={() => handleImageClick(TsionSupport)}
                >
                  <img 
                    src={TsionSupport} 
                    alt="Support for Tsion" 
                    className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#032990] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                    <p className="text-white font-medium">Support Documentation</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Detailed Information */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-[#032990] mb-6 flex items-center">
                <Heart className="mr-2 text-[#EAA108]" size={22} />
                About {beneficiary.name}
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-lg font-semibold text-[#032990] mb-3 border-b pb-2">Education</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-[#6b7280]">School:</span>
                      <span className="font-medium">{beneficiary.school}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#6b7280]">Grade:</span>
                      <span className="font-medium">{beneficiary.grade}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#6b7280]">Performance:</span>
                      <span className="font-medium text-[#10b981]">{beneficiary.performance}</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-lg font-semibold text-[#032990] mb-3 border-b pb-2">Health & Wellbeing</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-[#6b7280]">Health Status:</span>
                      <span className="font-medium text-[#10b981]">{beneficiary.health}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#6b7280]">Last Checkup:</span>
                      <span className="font-medium">March 2023</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#6b7280]">Vaccinations:</span>
                      <span className="font-medium text-[#10b981]">Up to date</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 pt-4 border-t">
                <h4 className="text-lg font-semibold text-[#032990] mb-3">Background Story</h4>
                <p className="text-[#6b7280] leading-relaxed">
                  Tsion is a bright 15-year-old student who excels in her studies despite facing economic challenges. 
                  She lives with her mother, Alem Assefa, in Addis Ababa. With your support, Tsion is able to continue 
                  her education and pursue her dream of becoming a doctor. She is particularly talented in science and mathematics.
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
