import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const SpecificBeneficiary = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // In a real app, you would get this data from the route parameters or location state
  // For this example, we'll hardcode Tsion's data
  const beneficiary = {
    id: 1,
    type: "child",
    name: "Tsion Abebe",
    age: 15,
    gender: "female",
    guardian: "Alem Assefa (Mother)",
    phone: "+251991164564"
  };

  // Handle back button click
  const handleBack = () => {
    navigate("/sponsor_beneficiaries");
  };

  return (
    <div className="font-poppins bg-[#f5f7fa] p-4 sm:p-6 lg:p-8 text-[#032990] leading-relaxed min-h-screen">
      <div className="max-w-6xl mx-auto bg-[#ffffff] p-4 sm:p-6 lg:p-8 rounded-xl shadow-[0_5px_15px_rgba(0,0,0,0.08)]">
        <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
          <h1 className="text-[#032990] font-bold text-3xl m-0">
            Beneficiary Details
          </h1>
          <button
            onClick={handleBack}
            className="flex items-center justify-center w-12 h-12 bg-[#ffffff] text-[#032990] rounded-lg shadow-[0_4px_8px_rgba(0,0,0,0.1)] transition-all duration-300 border-2 border-[#f0f3ff] hover:bg-[#032990] hover:text-white group"
          >
            <ArrowLeft className="w-6 h-6 stroke-[#032990] transition-colors duration-300 group-hover:stroke-white" />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Beneficiary Information Card */}
          <div className="lg:col-span-1 bg-gradient-to-br from-[#e6f7ff] to-[#bae7ff] p-6 rounded-xl shadow-[0_3px_10px_rgba(0,0,0,0.08)]">
            <h2 className="text-2xl font-bold text-[#1890ff] mb-4">Personal Information</h2>
            
            <div className="space-y-4">
              <div>
                <p className="text-sm text-[#64748b]">Name</p>
                <p className="text-lg font-semibold text-[#032990]">{beneficiary.name}</p>
              </div>
              
              <div>
                <p className="text-sm text-[#64748b]">Age</p>
                <p className="text-lg font-semibold text-[#032990]">{beneficiary.age} years</p>
              </div>
              
              <div>
                <p className="text-sm text-[#64748b]">Gender</p>
                <p className="text-lg font-semibold text-[#032990] capitalize">{beneficiary.gender}</p>
              </div>
              
              <div>
                <p className="text-sm text-[#64748b]">Guardian</p>
                <p className="text-lg font-semibold text-[#032990]">{beneficiary.guardian}</p>
              </div>
              
              <div>
                <p className="text-sm text-[#64748b]">Phone</p>
                <p className="text-lg font-semibold text-[#032990]">{beneficiary.phone}</p>
              </div>
            </div>
          </div>

          {/* Images Section */}
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold text-[#032990] mb-4">Photo Gallery</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-4 rounded-xl shadow-[0_3px_10px_rgba(0,0,0,0.08)] text-center">
                <img 
                  src="./Tsion_pic.jpg" 
                  alt="Tsion Abebe" 
                  className="w-full h-48 object-cover rounded-lg mb-3"
                />
                <p className="text-sm font-medium text-[#032990]">Picture</p>
              </div>
              
              <div className="bg-white p-4 rounded-xl shadow-[0_3px_10px_rgba(0,0,0,0.08)] text-center">
                <img 
                  src="/Tsion_form.jpg" 
                  alt="Tsion's Form" 
                  className="w-full h-48 object-cover rounded-lg mb-3"
                />
                <p className="text-sm font-medium text-[#032990]">Application Form</p>
              </div>
              
              <div className="bg-white p-4 rounded-xl shadow-[0_3px_10px_rgba(0,0,0,0.08)] text-center">
                <img 
                  src="/Tsion_support.jpg" 
                  alt="Support for Tsion" 
                  className="w-full h-48 object-cover rounded-lg mb-3"
                />
                <p className="text-sm font-medium text-[#032990]">Support Provided</p>
              </div>
            </div>
            
            {/* Additional Information */}
            <div className="mt-6 bg-gradient-to-br from-[#fff7e6] to-[#ffe7ba] p-6 rounded-xl shadow-[0_3px_10px_rgba(0,0,0,0.08)]">
              <h3 className="text-xl font-bold text-[#fa8c16] mb-3">About Tsion</h3>
              <p className="text-[#032990]">
                Tsion is a bright 15-year-old student who excels in her studies despite facing economic challenges. 
                She lives with her mother, Alem Assefa, in Addis Ababa. With your support, Tsion is able to continue 
                her education.
              </p>
            </div>
          </div>
        </div>

        {/* Progress Section */}
        <div className="bg-white p-6 rounded-xl shadow-[0_3px_10px_rgba(0,0,0,0.08)]">
          <h2 className="text-2xl font-bold text-[#032990] mb-4">Progress Report</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-[#f0f9ff] rounded-lg">
              <p className="text-3xl font-bold text-[#0891b2]">92%</p>
              <p className="text-sm text-[#64748b]">School Attendance</p>
            </div>
            
            <div className="text-center p-4 bg-[#f0fdf4] rounded-lg">
              <p className="text-3xl font-bold text-[#16a34a]">B+</p>
              <p className="text-sm text-[#64748b]">Average Grade</p>
            </div>
            
            <div className="text-center p-4 bg-[#fffbeb] rounded-lg">
              <p className="text-3xl font-bold text-[#ca8a04]">18</p>
              <p className="text-sm text-[#64748b]">Months Supported</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpecificBeneficiary;
