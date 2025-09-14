import React, { useState, useEffect } from "react";
import { X, Upload } from "lucide-react";

const SponsorModal = ({ isOpen, onClose, onSponsorAdded }) => {
  const [formData, setFormData] = useState({
    cluster_id: "",
    specific_id: "",
    type: "individual",
    full_name: "",
    phone_number: "",
    date_of_birth: "",
    gender: "", 
    consent_document_url: "",
    starting_date: "",
    agreed_monthly_payment: "",
    emergency_contact_name: "",
    emergency_contact_phone: "",
    status: "pending_review",
    country: "Ethiopia",
    region: "",
    sub_region: "",
    woreda: "",
    house_number: "",
    address_id: "",
    password_hash: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState({});
  const [addressOptions, setAddressOptions] = useState([]);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    // Automatically determine diaspora status based on country
    const isDiaspora = formData.country !== "Ethiopia";
    setFormData(prev => ({ ...prev, is_diaspora: isDiaspora }));
  }, [formData.country]);

  useEffect(() => {
    if (isOpen) {
      fetchAddressOptions();
    }
  }, [isOpen]);

  const fetchAddressOptions = async () => {
    try {
      const response = await fetch("/api/addresses");
      if (response.ok) {
        const addresses = await response.json();
        setAddressOptions(addresses);
      }
    } catch (error) {
      console.error("Error fetching addresses:", error);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when field is updated
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ""
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.phone_number) {
      newErrors.phone_number = "Phone number is required";
    }
    
    if (!formData.starting_date) {
      newErrors.starting_date = "Starting date is required";
    }
    
    if (!formData.agreed_monthly_payment) {
      newErrors.agreed_monthly_payment = "Monthly payment is required";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFileUpload = async (file, field) => {
    const uploadFormData = new FormData();
    uploadFormData.append("file", file);
    
    try {
      setUploadStatus(prev => ({ ...prev, [field]: "uploading" }));
      
      const response = await fetch("/api/upload", {
        method: "POST",
        body: uploadFormData,
      });
      
      if (response.ok) {
        const data = await response.json();
        setFormData(prev => ({
          ...prev,
          [field]: data.fileUrl
        }));
        setUploadStatus(prev => ({ ...prev, [field]: "success" }));
        return data.fileUrl;
      } else {
        throw new Error("Upload failed");
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      setUploadStatus(prev => ({ ...prev, [field]: "error" }));
      alert("Error uploading file. Please try again.");
      return null;
    }
  };

  const generatePassword = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    return Array.from({ length: 12 }, () => 
      chars.charAt(Math.floor(Math.random() * chars.length))
    ).join('');
  };

  const saveAddress = async () => {
    if (!formData.country || !formData.region) return null;

    try {
      const response = await fetch("/api/addresses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          country: formData.country,
          region: formData.region,
          sub_region: formData.sub_region,
          woreda: formData.woreda,
          house_number: formData.house_number,
        }),
      });

      if (response.ok) {
        const newAddress = await response.json();
        return newAddress.id;
      }
    } catch (error) {
      console.error("Error saving address:", error);
    }
    return null;
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  
  // Validate required fields
  if (!validateForm()) {
    return;
  }
  
  setIsLoading(true);

  try {
    // Save or get address ID
    let addressId = formData.address_id;
    if (!addressId && formData.country && formData.region) {
      // Create new address
      const addressResponse = await fetch('http://localhost:5000/api/addresses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          country: formData.country,
          region: formData.region,
          sub_region: formData.sub_region,
          woreda: formData.woreda,
          house_number: formData.house_number
        })
      });

      if (addressResponse.ok) {
        const addressData = await addressResponse.json();
        addressId = addressData.address.id;
      }
    }

    // Generate password if not provided
    const finalPassword = formData.password_hash || generatePassword();
    
    const sponsorData = {
      cluster_id: formData.cluster_id,
      specific_id: formData.specific_id,
      type: formData.type,
      full_name: formData.full_name,
      phone_number: formData.phone_number,
      date_of_birth: formData.type === "individual" ? formData.date_of_birth : null,
      gender: formData.type === "individual" ? formData.gender : null,
      consent_document_url: formData.consent_document_url,
      starting_date: formData.starting_date,
      agreed_monthly_payment: parseFloat(formData.agreed_monthly_payment) || 0,
      emergency_contact_name: formData.emergency_contact_name,
      emergency_contact_phone: formData.emergency_contact_phone,
      status: formData.status,
      is_diaspora: formData.country !== "Ethiopia",
      address_id: addressId,
      password_hash: finalPassword,
      created_by: 1, // Replace with actual logged-in user ID
    };

    const response = await fetch('http://localhost:5000/api/sponsors', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(sponsorData)
    });

    if (response.ok) {
      const newSponsor = await response.json();
      if (onSponsorAdded) {
        onSponsorAdded(newSponsor);
      }
      alert('Sponsor added successfully!');
      onClose();
    } else {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to add sponsor');
    }
  } catch (error) {
    console.error('Error adding sponsor:', error);
    alert(error.message || 'Error adding sponsor. Please try again.');
  } finally {
    setIsLoading(false);
  }
};
  const handleFileChange = (field, file) => {
    setFormData(prev => ({
      ...prev,
      [field]: file,
      [`${field}_name`]: file.name
    }));
  };

  if (!isOpen) return null;

  const isIndividual = formData.type === "individual";

  return (
    <div className="fixed inset-0 flex justify-center items-center z-[9999] p-4 backdrop-blur-sm backdrop-brightness-75">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto border-2 border-blue-200">
        <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-blue-700">Add New Sponsor</h2>
          <button
            className="text-gray-500 hover:text-gray-700 transition-colors duration-200"
            onClick={onClose}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Sponsor ID Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-blue-700 font-medium mb-2">
                Cluster ID <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                maxLength={2}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 01"
                value={formData.cluster_id}
                onChange={(e) => handleInputChange("cluster_id", e.target.value.toUpperCase())}
              />
            </div>
            <div>
              <label className="block text-blue-700 font-medium mb-2">
                Specific ID <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                maxLength={4}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 0240"
                value={formData.specific_id}
                onChange={(e) => handleInputChange("specific_id", e.target.value)}
              />
            </div>
            <div>
              <label className="block text-blue-700 font-medium mb-2">
                Sponsor Type <span className="text-red-500">*</span>
              </label>
              <select
                required
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.type}
                onChange={(e) => handleInputChange("type", e.target.value)}
              >
                <option value="individual">Individual</option>
                <option value="organization">Organization</option>
              </select>
            </div>
          </div>

          {/* Personal Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-blue-700 font-medium mb-2">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter full name"
                value={formData.full_name}
                onChange={(e) => handleInputChange("full_name", e.target.value)}
              />
            </div>
            
            {/* Phone Number Field - Now Required */}
            <div>
              <label className="block text-blue-700 font-medium mb-2">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                required
                className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.phone_number ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="+251..."
                value={formData.phone_number}
                onChange={(e) => handleInputChange("phone_number", e.target.value)}
              />
              {errors.phone_number && (
                <p className="text-red-500 text-sm mt-1">{errors.phone_number}</p>
              )}
            </div>
            
            {/* Conditionally show date of birth for individuals only */}
            {isIndividual && (
              <div>
                <label className="block text-blue-700 font-medium mb-2">
                  Date of Birth
                </label>
                <input
                  type="date"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.date_of_birth}
                  onChange={(e) => handleInputChange("date_of_birth", e.target.value)}
                />
              </div>
            )}
            
            {/* Conditionally show gender for individuals only */}
            {isIndividual && (
              <div>
                <label className="block text-blue-700 font-medium mb-2">
                  Gender
                </label>
                <select
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.gender}
                  onChange={(e) => handleInputChange("gender", e.target.value)}
                >
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option> 
                </select>
              </div>
            )}
            
            {/* Starting Date - Now Required */}
            <div>
              <label className="block text-blue-700 font-medium mb-2">
                Starting Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                required
                className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.starting_date ? "border-red-500" : "border-gray-300"
                }`}
                value={formData.starting_date}
                onChange={(e) => handleInputChange("starting_date", e.target.value)}
              />
              {errors.starting_date && (
                <p className="text-red-500 text-sm mt-1">{errors.starting_date}</p>
              )}
            </div>
          </div>

          {/* Financial Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Monthly Payment - Now Required */}
            <div>
              <label className="block text-blue-700 font-medium mb-2">
                Agreed Monthly Payment (ETB) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                required
                className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.agreed_monthly_payment ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="0.00"
                value={formData.agreed_monthly_payment}
                onChange={(e) => handleInputChange("agreed_monthly_payment", e.target.value)}
              />
              {errors.agreed_monthly_payment && (
                <p className="text-red-500 text-sm mt-1">{errors.agreed_monthly_payment}</p>
              )}
            </div>
            <div>
              <label className="block text-blue-700 font-medium mb-2">
                Status <span className="text-red-500">*</span>
              </label>
              <select
                required
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.status}
                onChange={(e) => handleInputChange("status", e.target.value)}
              >
                <option value="pending_review">Pending Review</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>
          </div>

          {/* Emergency Contact */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-blue-700 font-medium mb-2">
                Emergency Contact Name
              </label>
              <input
                type="text"
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Emergency contact name"
                value={formData.emergency_contact_name}
                onChange={(e) => handleInputChange("emergency_contact_name", e.target.value)}
              />
            </div>
            <div>
              <label className="block text-blue-700 font-medium mb-2">
                Emergency Contact Phone
              </label>
              <input
                type="tel"
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="+251..."
                value={formData.emergency_contact_phone}
                onChange={(e) => handleInputChange("emergency_contact_phone", e.target.value)}
              />
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
                  Country <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.country}
                  onChange={(e) => handleInputChange("country", e.target.value)}
                >
                  <option value="Ethiopia">Ethiopia</option>
                  <option value="United States">United States</option>
                  <option value="United Kingdom">United Kingdom</option>
                  <option value="Canada">Canada</option>
                  <option value="Australia">Australia</option>
                  <option value="Germany">Germany</option>
                  <option value="Sweden">Sweden</option>
                  <option value="Israel">Israel</option>
                  <option value="United Arab Emirates">United Arab Emirates</option>
                  <option value="Saudi Arabia">Saudi Arabia</option>
                  <option value="Other">Other</option>
                </select>
                <div className="text-sm text-gray-500 mt-1">
                  {formData.country !== "Ethiopia" ? 
                    "Diaspora sponsor (auto-detected)" : 
                    "Local sponsor (auto-detected)"}
                </div>
              </div>
              <div>
                <label className="block text-blue-700 font-medium mb-2">
                  Region
                </label>
                <input
                  type="text"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Addis Ababa, Oromia"
                  value={formData.region}
                  onChange={(e) => handleInputChange("region", e.target.value)}
                />
              </div>
              <div>
                <label className="block text-blue-700 font-medium mb-2">
                  Sub Region
                </label>
                <input
                  type="text"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Central, North"
                  value={formData.sub_region}
                  onChange={(e) => handleInputChange("sub_region", e.target.value)}
                />
              </div>
              <div>
                <label className="block text-blue-700 font-medium mb-2">
                  Woreda
                </label>
                <input
                  type="text"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Kirkos, Arada"
                  value={formData.woreda}
                  onChange={(e) => handleInputChange("woreda", e.target.value)}
                />
              </div>
              <div>
                <label className="block text-blue-700 font-medium mb-2">
                  House Number
                </label>
                <input
                  type="text"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="House number"
                  value={formData.house_number}
                  onChange={(e) => handleInputChange("house_number", e.target.value)}
                />
              </div>
            </div>
          </div>

          
            
            
            <div>
              <label className="block text-blue-700 font-medium mb-2">
                Consent Document
              </label>
              <div
                className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-blue-500 transition-colors duration-200"
                onClick={() => document.getElementById("consentDocument").click()}
              >
                <Upload className="w-6 h-6 text-gray-500 mx-auto mb-2" />
                <div className="text-gray-700 mb-1">Browse...</div>
                <div className="text-gray-500 text-sm">
                  Accepted: PDF, DOC, DOCX
                </div>
                <input
                  type="file"
                  className="hidden"
                  id="consentDocument"
                  accept=".pdf,.doc,.docx"
                  onChange={(e) => handleFileChange("consent_document_file", e.target.files[0])}
                />
                {formData.consent_document_file && (
                  <div className="text-sm text-green-600 mt-2">
                    Selected: {formData.consent_document_file.name}
                  </div>
                )}
              </div>
            
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              className="bg-gray-200 text-gray-800 px-5 py-2 rounded-lg font-medium hover:bg-gray-300 transition-colors duration-200"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-orange-500 text-white px-5 py-2 rounded-lg font-medium hover:bg-orange-600 transition-colors duration-200 disabled:opacity-50"
              disabled={isLoading}
            >
              {isLoading ? "Adding..." : "Add Sponsor"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SponsorModal;
