import React, { useState, useEffect } from "react";
import { X, Upload, FileText } from "lucide-react";

const GuardianModal = ({
  isOpen,
  onClose,
  setupFileUpload,
  onGuardianAdded,
}) => {
  const [formData, setFormData] = useState({
    fullName: "",
    relationToBeneficiary: "",
    primaryPhone: "",
    secondaryPhone: "",
    tertiaryPhone: "",
    country: "Ethiopia",
    region: "",
    subRegion: "",
    woreda: "",
    houseNumber: "",
    bankName: "",
    bankAccountNumber: "",
    bankDocument: null,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setFormData({
        fullName: "",
        relationToBeneficiary: "",
        primaryPhone: "",
        secondaryPhone: "",
        tertiaryPhone: "",
        country: "Ethiopia",
        region: "",
        subRegion: "",
        woreda: "",
        houseNumber: "",
        bankName: "",
        bankAccountNumber: "",
        bankDocument: null,
      });
      setErrors({});
      setIsLoading(false);
    }
  }, [isOpen]);

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

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ""
      }));
    }
  };

  const handleFileUpload = (field, file, previewId) => {
    setFormData(prev => ({
      ...prev,
      [field]: file
    }));
    if (setupFileUpload) {
      setupFileUpload(previewId, file);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full name is required";
    }

    if (!formData.relationToBeneficiary.trim()) {
      newErrors.relationToBeneficiary = "Relation to beneficiary is required";
    }

    if (!formData.region.trim()) {
      newErrors.region = "Region is required";
    }

    if (!formData.primaryPhone.trim()) {
      newErrors.primaryPhone = "Primary phone is required";
    } else if (formData.primaryPhone.trim().length > 20) {
      newErrors.primaryPhone = "Phone number must be 20 characters or less";
    }

    // Validate secondary and tertiary phones if provided
    if (formData.secondaryPhone && formData.secondaryPhone.trim().length > 20) {
      newErrors.secondaryPhone = "Phone number must be 20 characters or less";
    }

    if (formData.tertiaryPhone && formData.tertiaryPhone.trim().length > 20) {
      newErrors.tertiaryPhone = "Phone number must be 20 characters or less";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      // Create address first if needed
      let addressId = null;
      if (formData.country || formData.region) {
        const addressResponse = await fetch('http://localhost:5000/api/addresses', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            country: formData.country || 'Ethiopia',
            region: formData.region,
            sub_region: formData.subRegion,
            woreda: formData.woreda,
            house_number: formData.houseNumber
          })
        });

        if (addressResponse.ok) {
          const addressData = await addressResponse.json();
          addressId = addressData.address.id;
        }
      }

      // Prepare guardian data
      const guardianData = {
        full_name: formData.fullName.trim(),
        relation_to_beneficiary: formData.relationToBeneficiary.trim(),
        address_id: addressId,
        phone_numbers: {
          primary: formData.primaryPhone.trim(),
          secondary: formData.secondaryPhone ? formData.secondaryPhone.trim() : null,
          tertiary: formData.tertiaryPhone ? formData.tertiaryPhone.trim() : null
        },
        bank_info: formData.bankName || formData.bankAccountNumber ? {
          bank_name: formData.bankName || null,
          account_number: formData.bankAccountNumber ? formData.bankAccountNumber.trim() : null,
          document_url: formData.bankDocument
        } : null
      };

      const response = await fetch('http://localhost:5000/api/guardians', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(guardianData)
      });

      if (response.ok) {
        const data = await response.json();
        
        if (onGuardianAdded) {
          onGuardianAdded({
            id: data.guardian.id,
            name: data.guardian.full_name,
            phone: formData.primaryPhone.trim(),
            relation: data.guardian.relation_to_beneficiary
          });
        }
        
        alert("Guardian registered successfully!");
        onClose();
      } else {
        const errorData = await response.json();
        if (response.status === 400) {
          // Handle validation errors from backend
          if (errorData.errors) {
            setErrors(errorData.errors);
          } else {
            alert(errorData.error || 'Validation error. Please check your input.');
          }
        } else {
          throw new Error(errorData.error || 'Failed to add guardian');
        }
      }
    } catch (error) {
      console.error('Error adding guardian:', error);
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        alert('Network error. Please check your connection and try again.');
      } else {
        alert(error.message || 'Error adding guardian. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex justify-center items-center z-[9999] p-4 backdrop-blur-sm backdrop-brightness-75">
      <div
        className="bg-white p-6 rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto transform transition-transform duration-300 ease-out scale-95 opacity-0"
        style={{
          opacity: isOpen ? 1 : 0,
          transform: isOpen
            ? "scale(1) translateY(0)"
            : "scale(0.95) translateY(-20px)",
        }}
        >
        <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-blue-700">Register Guardian</h2>
          <button
            className="text-gray-500 hover:text-gray-700 transition-colors duration-200"
            onClick={onClose}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <h3 className="text-lg font-semibold text-blue-700 mb-4">Register New Guardian</h3>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <h4 className="text-lg font-semibold text-blue-700 mb-4">
              Personal Information
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-blue-700 font-medium mb-2">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-blue-700 ${
                    errors.fullName ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Enter full name"
                  value={formData.fullName}
                  onChange={(e) => handleInputChange("fullName", e.target.value)}
                />
                {errors.fullName && <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>}
              </div>
              <div>
                <label className="block text-blue-700 font-medium mb-2">
                  Relation to Beneficiary <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-blue-700 ${
                    errors.relationToBeneficiary ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="e.g., Parent, Grandparent, Sibling"
                  value={formData.relationToBeneficiary}
                  onChange={(e) => handleInputChange("relationToBeneficiary", e.target.value)}
                />
                {errors.relationToBeneficiary && <p className="text-red-500 text-sm mt-1">{errors.relationToBeneficiary}</p>}
              </div>
            </div>
          </div>

          <div className="mb-4">
            <h3 className="text-lg font-semibold text-blue-700 mb-3 border-b pb-2">
              Contact Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-blue-700 font-medium mb-2">
                  Primary Phone <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-blue-700 ${
                    errors.primaryPhone ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="+251..."
                  value={formData.primaryPhone}
                  onChange={(e) => handleInputChange("primaryPhone", e.target.value)}
                />
                {errors.primaryPhone && <p className="text-red-500 text-sm mt-1">{errors.primaryPhone}</p>}
              </div>
              <div>
                <label className="block text-blue-700 font-medium mb-2">
                  Secondary Phone
                </label>
                <input
                  type="tel"
                  className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-blue-700 ${
                    errors.secondaryPhone ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="+251..."
                  value={formData.secondaryPhone}
                  onChange={(e) => handleInputChange("secondaryPhone", e.target.value)}
                />
                {errors.secondaryPhone && <p className="text-red-500 text-sm mt-1">{errors.secondaryPhone}</p>}
              </div>
              <div>
                <label className="block text-blue-700 font-medium mb-2">
                  Tertiary Phone
                </label>
                <input
                  type="tel"
                  className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-blue-700 ${
                    errors.tertiaryPhone ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="+251..."
                  value={formData.tertiaryPhone}
                  onChange={(e) => handleInputChange("tertiaryPhone", e.target.value)}
                />
                {errors.tertiaryPhone && <p className="text-red-500 text-sm mt-1">{errors.tertiaryPhone}</p>}
              </div>
            </div>
          </div>

          <div className="mb-4">
            <h3 className="text-lg font-semibold text-blue-700 mb-3 border-b pb-2">
              Address Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-blue-700 font-medium mb-2">
                  Country
                </label>
                <input
                  type="text"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-blue-700"
                  value={formData.country}
                  onChange={(e) => handleInputChange("country", e.target.value)}
                />
              </div>
              <div>
                <label className="block text-blue-700 font-medium mb-2">
                  Region <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-blue-700 ${
                    errors.region ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="e.g., Addis Ababa, Oromia"
                  value={formData.region}
                  onChange={(e) => handleInputChange("region", e.target.value)}
                />
                {errors.region && <p className="text-red-500 text-sm mt-1">{errors.region}</p>}
              </div>
              <div>
                <label className="block text-blue-700 font-medium mb-2">
                  Sub Region
                </label>
                <input
                  type="text"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-blue-700"
                  placeholder="e.g., Central, North"
                  value={formData.subRegion}
                  onChange={(e) => handleInputChange("subRegion", e.target.value)}
                />
              </div>
              <div>
                <label className="block text-blue-700 font-medium mb-2">
                  Woreda
                </label>
                <input
                  type="text"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-blue-700"
                  placeholder="e.g., Kirkos, Arada"
                  value={formData.woreda}
                  onChange={(e) => handleInputChange("woreda", e.target.value)}
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-blue-700 font-medium mb-2">
                  House Number
                </label>
                <input
                  type="text"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-blue-700"
                  placeholder="House number"
                  value={formData.houseNumber}
                  onChange={(e) => handleInputChange("houseNumber", e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="mb-4">
            <h3 className="text-lg font-semibold text-blue-700 mb-3 border-b pb-2">
              Bank Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-blue-700 font-medium mb-2">
                  Bank Name
                </label>
                <select 
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-blue-700"
                  value={formData.bankName}
                  onChange={(e) => handleInputChange("bankName", e.target.value)}
                >
                  <option value="">Select Bank</option>
                  {banks.map((bank, index) => (
                    <option key={index} value={bank}>
                      {bank}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-blue-700 font-medium mb-2">
                  Bank Account Number
                </label>
                <input
                  type="text"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-blue-700"
                  placeholder="Account number"
                  value={formData.bankAccountNumber}
                  onChange={(e) => handleInputChange("bankAccountNumber", e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="mb-4">
            <h3 className="text-lg font-semibold text-blue-700 mb-3 border-b pb-2">
              Document Upload
            </h3>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-blue-700 font-medium mb-2">
                  Upload Bank Document
                </label>
                <div
                  className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-blue-500 transition-colors duration-200"
                  onClick={() => document.getElementById("bankDocumentFile").click()}
                >
                  <FileText className="w-6 h-6 text-gray-500 mx-auto mb-2" />
                  <div className="text-gray-700 mb-1">Browse...</div>
                  <div className="text-gray-500 text-sm">
                    Accepted: PDF, JPG, PNG
                  </div>
                  <input
                    type="file"
                    className="hidden"
                    id="bankDocumentFile"
                    accept=".pdf,.jpg,.png"
                    onChange={(e) => handleFileUpload("bankDocument", e.target.files[0], "bankDocumentPreview")}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              className="bg-gray-200 text-gray-800 px-5 py-2 rounded-lg font-medium hover:bg-gray-300 transition-colors duration-200"
              onClick={onClose}
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="bg-orange-500 text-white px-5 py-2 rounded-lg font-medium hover:bg-orange-600 transition-colors duration-200 disabled:opacity-50"
              disabled={isLoading}
            >
              {isLoading ? "Registering..." : "Register Guardian"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GuardianModal;