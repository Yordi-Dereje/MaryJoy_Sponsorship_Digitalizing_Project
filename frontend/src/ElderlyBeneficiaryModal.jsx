import React, { useState } from "react";
import { X, Upload, FileText } from "lucide-react";

const ElderlyBeneficiaryModal = ({
  isOpen,
  onClose,
  setupFileUpload,
}) => {
  const [formData, setFormData] = useState({
    full_name: "",
    date_of_birth: "",
    gender: "",
    status: "waiting_list",
    support_letter_url: "",
    address: {
      country: "Ethiopia",
      region: "",
      sub_region: "",
      woreda: "",
      house_number: ""
    },
    phone_numbers: {
      primary: "",
      secondary: "",
      tertiary: ""
    },
    bank_info: {
      bank_name: "",
      account_number: "",
      document_url: ""
    }
  });

  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const banks = [
    "Commercial Bank Of Ethiopia",
    "Nib Bank",
    "Dashen Bank",
    "Awash Bank",
    "Bank of Abyssinia",
    "Wegagen Bank",
    "Hibret Bank",
    "Abay Bank",
    "Addis International Bank",
    "Berhan Bank",
    "Zemen Bank",
    "Bunna Bank",
    "Shabelle Bank",
    "Oromia Bank",
    "Lion International Bank",
    "Cooperative Bank of Oromia",
    "Enat Bank",
    "ZamZam Bank",
    "Siinqee Bank",
    "Goh Betoch Bank"
  ];

  const handleInputChange = (section, field, value) => {
    if (section) {
      setFormData(prev => ({
        ...prev,
        [section]: {
          ...prev[section],
          [field]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }

    // Clear error
    const errorKey = section ? `${section}_${field}` : field;
    if (errors[errorKey]) {
      setErrors(prev => ({
        ...prev,
        [errorKey]: ""
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.full_name) newErrors.full_name = "Full name is required";
    if (!formData.date_of_birth) newErrors.date_of_birth = "Date of birth is required";
    if (!formData.gender) newErrors.gender = "Gender is required";
    if (!formData.address.region) newErrors.address_region = "Region is required";
    if (!formData.phone_numbers.primary) newErrors.phone_primary = "Primary phone is required";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/beneficiaries/elderly', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        const data = await response.json();
        alert('Elderly beneficiary added successfully!');
        onClose();
        // Reset form
        setFormData({
          full_name: "",
          date_of_birth: "",
          gender: "",
          status: "waiting_list",
          support_letter_url: "",
          address: {
            country: "Ethiopia",
            region: "",
            sub_region: "",
            woreda: "",
            house_number: ""
          },
          phone_numbers: {
            primary: "",
            secondary: "",
            tertiary: ""
          },
          bank_info: {
            bank_name: "",
            account_number: "",
            document_url: ""
          }
        });
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add beneficiary');
      }
    } catch (error) {
      console.error('Error adding elderly beneficiary:', error);
      alert(error.message || 'Error adding beneficiary. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex justify-center items-center z-[9999] p-4 backdrop-blur-sm backdrop-brightness-75">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* ... (keep the existing JSX structure) ... */}
        
        <form onSubmit={handleSubmit}>
          {/* Basic Information */}
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
              onChange={(e) => handleInputChange(null, "full_name", e.target.value)}
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
                onChange={(e) => handleInputChange(null, "date_of_birth", e.target.value)}
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
                onChange={(e) => handleInputChange(null, "gender", e.target.value)}
              >
                <option value="">Select gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
              {errors.gender && <p className="text-red-500 text-sm mt-1">{errors.gender}</p>}
            </div>
          </div>

          {/* Contact Information */}
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-blue-700 mb-3 border-b pb-2">
              Contact Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-blue-700 font-medium mb-2">
                  Primary Phone *
                </label>
                <input
                  type="tel"
                  className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.phone_primary ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="+251..."
                  value={formData.phone_numbers.primary}
                  onChange={(e) => handleInputChange("phone_numbers", "primary", e.target.value)}
                />
                {errors.phone_primary && <p className="text-red-500 text-sm mt-1">{errors.phone_primary}</p>}
              </div>
              {/* ... other phone fields ... */}
            </div>
          </div>

          {/* Address Information */}
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-blue-700 mb-3 border-b pb-2">
              Address Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-blue-700 font-medium mb-2">
                  Region *
                </label>
                <input
                  type="text"
                  className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.address_region ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="e.g., Addis Ababa, Oromia"
                  value={formData.address.region}
                  onChange={(e) => handleInputChange("address", "region", e.target.value)}
                />
                {errors.address_region && <p className="text-red-500 text-sm mt-1">{errors.address_region}</p>}
              </div>
              {/* ... other address fields ... */}
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-3">
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

export default ElderlyBeneficiaryModal;
