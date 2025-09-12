import React, { useState, useEffect } from "react";
import { X, Upload, FileText } from "lucide-react";

const ChildBeneficiaryModal = ({
  isOpen,
  onClose,
  setupFileUpload,
  openGuardianModal,
}) => {
  const [formData, setFormData] = useState({
    full_name: "",
    date_of_birth: "",
    gender: "",
    photo_url: "",
    status: "waiting_list",
    guardian_id: "",
    support_letter_url: "",
    has_support_letter: false,
    has_supporting_evidence: false,
    has_bank_book: false
  });

  const [guardians, setGuardians] = useState([]);
  const [guardianSearchTerm, setGuardianSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (guardianSearchTerm) {
      searchGuardians();
    } else {
      setGuardians([]);
    }
  }, [guardianSearchTerm]);

  const searchGuardians = async () => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/beneficiaries/guardians/search?search=${encodeURIComponent(guardianSearchTerm)}`
      );
      
      if (response.ok) {
        const data = await response.json();
        setGuardians(data.guardians);
      }
    } catch (error) {
      console.error('Error searching guardians:', error);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ""
      }));
    }
  };

  const handleGuardianSearch = (e) => {
    setGuardianSearchTerm(e.target.value);
  };

  const selectGuardian = (guardian) => {
    setFormData(prev => ({
      ...prev,
      guardian_id: guardian.id
    }));
    setGuardianSearchTerm(guardian.name);
    setGuardians([]);
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.full_name) newErrors.full_name = "Full name is required";
    if (!formData.date_of_birth) newErrors.date_of_birth = "Date of birth is required";
    if (!formData.gender) newErrors.gender = "Gender is required";
    if (!formData.guardian_id) newErrors.guardian_id = "Guardian is required";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/beneficiaries/children', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        const data = await response.json();
        alert('Child beneficiary added successfully!');
        onClose();
        // Reset form
        setFormData({
          full_name: "",
          date_of_birth: "",
          gender: "",
          photo_url: "",
          status: "waiting_list",
          guardian_id: "",
          support_letter_url: "",
          has_support_letter: false,
          has_supporting_evidence: false,
          has_bank_book: false
        });
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add beneficiary');
      }
    } catch (error) {
      console.error('Error adding child beneficiary:', error);
      alert(error.message || 'Error adding beneficiary. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex justify-center items-center z-[9999] p-4 backdrop-blur-sm backdrop-brightness-75">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* ... (keep the existing JSX structure) ... */}
        
        <form onSubmit={handleSubmit}>
          {/* Full Name */}
          <div className="mb-4">
            <label className="block text-blue-700 font-medium mb-2">
              Full Name *
            </label>
            <input
              type="text"
              className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.full_name ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="Enter full name"
              value={formData.full_name}
              onChange={(e) => handleInputChange("full_name", e.target.value)}
            />
            {errors.full_name && <p className="text-red-500 text-sm mt-1">{errors.full_name}</p>}
          </div>

          {/* Date of Birth and Gender */}
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="flex-1">
              <label className="block text-blue-700 font-medium mb-2">
                Date of Birth *
              </label>
              <input
                type="date"
                className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.date_of_birth ? "border-red-500" : "border-gray-300"
                }`}
                value={formData.date_of_birth}
                onChange={(e) => handleInputChange("date_of_birth", e.target.value)}
              />
              {errors.date_of_birth && <p className="text-red-500 text-sm mt-1">{errors.date_of_birth}</p>}
            </div>
            <div className="flex-1">
              <label className="block text-blue-700 font-medium mb-2">
                Gender *
              </label>
              <select 
                className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.gender ? "border-red-500" : "border-gray-300"
                }`}
                value={formData.gender}
                onChange={(e) => handleInputChange("gender", e.target.value)}
              >
                <option value="">Select gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
              {errors.gender && <p className="text-red-500 text-sm mt-1">{errors.gender}</p>}
            </div>
          </div>

          {/* Guardian Search */}
          <div className="mb-6 relative">
            <label className="block text-blue-700 font-medium mb-2">
              Guardian *
            </label>
            <input
              type="text"
              className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.guardian_id ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="Search by name or phone number..."
              value={guardianSearchTerm}
              onChange={handleGuardianSearch}
            />
            {errors.guardian_id && <p className="text-red-500 text-sm mt-1">{errors.guardian_id}</p>}
            
            {guardians.length > 0 && (
              <div className="absolute bg-white border border-gray-200 rounded-lg shadow-lg mt-1 w-full z-10 max-h-48 overflow-y-auto">
                {guardians.map((guardian) => (
                  <div
                    key={guardian.id}
                    className="p-3 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0"
                    onClick={() => selectGuardian(guardian)}
                  >
                    <div className="font-medium text-gray-800">{guardian.name}</div>
                    <div className="text-sm text-gray-600">{guardian.phone}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-3">
            <button
              type="button"
              className="bg-gray-200 text-gray-800 px-5 py-2 rounded-lg font-medium hover:bg-gray-300 transition-colors duration-200"
              onClick={openGuardianModal}
            >
              Register Guardian
            </button>
            <button 
              type="submit"
              className="bg-orange-500 text-white px-5 py-2 rounded-lg font-medium hover:bg-orange-600 transition-colors duration-200 disabled:opacity-50"
              disabled={isLoading}
            >
              {isLoading ? "Submitting..." : "Submit Beneficiary"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChildBeneficiaryModal;
