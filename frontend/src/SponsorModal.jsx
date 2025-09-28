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
    email: "", 
    consent_document_url: "",
    starting_date: "",
    agreed_monthly_payment: "750", // Default value
    emergency_contact_name: "",
    emergency_contact_phone: "",
    status: "new",
    country: "Ethiopia", // Default value
    region: "",
    sub_region: "",
    woreda: "",
    house_number: "",
    address_id: "",
    password_hash: "",
    // New fields for sponsor_requests
    number_of_child_beneficiaries: "0",
    number_of_elderly_beneficiaries: "0",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState({});
  const [addressOptions, setAddressOptions] = useState([]);
  const [errors, setErrors] = useState({});

  // List of countries sorted alphabetically
  const countries = [
    "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Antigua and Barbuda", 
    "Argentina", "Armenia", "Australia", "Austria", "Azerbaijan", "Bahamas", 
    "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin", 
    "Bhutan", "Bolivia", "Bosnia and Herzegovina", "Botswana", "Brazil", "Brunei", 
    "Bulgaria", "Burkina Faso", "Burundi", "Cabo Verde", "Cambodia", "Cameroon", 
    "Canada", "Central African Republic", "Chad", "Chile", "China", "Colombia", 
    "Comoros", "Congo", "Costa Rica", "Croatia", "Cuba", "Cyprus", "Czech Republic", 
    "Denmark", "Djibouti", "Dominica", "Dominican Republic", "East Timor", 
    "Ecuador", "Egypt", "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia", 
    "Eswatini", "Ethiopia", "Fiji", "Finland", "France", "Gabon", "Gambia", 
    "Georgia", "Germany", "Ghana", "Greece", "Grenada", "Guatemala", "Guinea", 
    "Guinea-Bissau", "Guyana", "Haiti", "Honduras", "Hungary", "Iceland", "India", 
    "Indonesia", "Iran", "Iraq", "Ireland", "Israel", "Italy", "Jamaica", "Japan", 
    "Jordan", "Kazakhstan", "Kenya", "Kiribati", "Korea, North", "Korea, South", 
    "Kosovo", "Kuwait", "Kyrgyzstan", "Laos", "Latvia", "Lebanon", "Lesotho", 
    "Liberia", "Libya", "Liechtenstein", "Lithuania", "Luxembourg", "Madagascar", 
    "Malawi", "Malaysia", "Maldives", "Mali", "Malta", "Marshall Islands", 
    "Mauritania", "Mauritius", "Mexico", "Micronesia", "Moldova", "Monaco", 
    "Mongolia", "Montenegro", "Morocco", "Mozambique", "Myanmar", "Namibia", 
    "Nauru", "Nepal", "Netherlands", "New Zealand", "Nicaragua", "Niger", 
    "Nigeria", "North Macedonia", "Norway", "Oman", "Pakistan", "Palau", 
    "Palestine", "Panama", "Papua New Guinea", "Paraguay", "Peru", "Philippines", 
    "Poland", "Portugal", "Qatar", "Romania", "Russia", "Rwanda", "Saint Kitts and Nevis", 
    "Saint Lucia", "Saint Vincent and the Grenadines", "Samoa", "San Marino", 
    "Sao Tome and Principe", "Saudi Arabia", "Senegal", "Serbia", "Seychelles", 
    "Sierra Leone", "Singapore", "Slovakia", "Slovenia", "Solomon Islands", 
    "Somalia", "South Africa", "South Sudan", "Spain", "Sri Lanka", "Sudan", 
    "Suriname", "Sweden", "Switzerland", "Syria", "Taiwan", "Tajikistan", 
    "Tanzania", "Thailand", "Togo", "Tonga", "Trinidad and Tobago", "Tunisia", 
    "Turkey", "Turkmenistan", "Tuvalu", "Uganda", "Ukraine", "United Arab Emirates", 
    "United Kingdom", "United States", "Uruguay", "Uzbekistan", "Vanuatu", 
    "Vatican City", "Venezuela", "Vietnam", "Yemen", "Zambia", "Zimbabwe"
  ].sort(); // Sort alphabetically

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
    // Only save address if at least one field is provided
    if (!formData.country && !formData.region && !formData.sub_region && !formData.woreda && !formData.house_number) {
      return null;
    }

    try {
      const response = await fetch("/api/addresses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          country: formData.country || "Ethiopia",
          region: formData.region || "",
          sub_region: formData.sub_region || "",
          woreda: formData.woreda || "",
          house_number: formData.house_number || "",
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

  const createSponsorRequest = async (sponsorClusterId, sponsorSpecificId) => {
    try {
      const requestData = {
        sponsor_cluster_id: sponsorClusterId,
        sponsor_specific_id: sponsorSpecificId,
        number_of_child_beneficiaries: parseInt(formData.number_of_child_beneficiaries) || 0,
        number_of_elderly_beneficiaries: parseInt(formData.number_of_elderly_beneficiaries) || 0,
        total_beneficiaries: (parseInt(formData.number_of_child_beneficiaries) || 0) + (parseInt(formData.number_of_elderly_beneficiaries) || 0),
        status: "pending",
        request_date: new Date().toISOString().split('T')[0],
        estimated_monthly_commitment: parseFloat(formData.agreed_monthly_payment) || 750,
        created_by: 1, // Replace with actual logged-in user ID
      };

      const response = await fetch('http://localhost:5000/api/sponsor-requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Failed to create sponsor request:', errorData);
        // Don't throw error here - we don't want sponsor creation to fail because of request creation
      }
    } catch (error) {
      console.error('Error creating sponsor request:', error);
      // Don't throw error here - we don't want sponsor creation to fail because of request creation
    }
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
      if (!addressId && (formData.country || formData.region || formData.sub_region || formData.woreda || formData.house_number)) {
        addressId = await saveAddress();
      }

      // Generate password if not provided
      const finalPassword = formData.password_hash || generatePassword();
      
      // Use today's date if starting_date is not provided
      const startingDate = formData.starting_date || new Date().toISOString().split('T')[0];
      
      const sponsorData = {
        cluster_id: formData.cluster_id,
        specific_id: formData.specific_id,
        type: formData.type,
        full_name: formData.full_name,
        phone_number: formData.phone_number,
        email: formData.email || null, // Make email optional
        date_of_birth: formData.type === "individual" ? (formData.date_of_birth || null) : null, // Make date_of_birth optional
        gender: formData.type === "individual" ? (formData.gender || null) : null, // Make gender optional
        consent_document_url: formData.consent_document_url,
        starting_date: startingDate, // Use provided date or today's date
        agreed_monthly_payment: parseFloat(formData.agreed_monthly_payment) || 750, // Default to 750
        emergency_contact_name: formData.emergency_contact_name || null, // Make optional
        emergency_contact_phone: formData.emergency_contact_phone || null, // Make optional
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
        
        // Create sponsor request after successful sponsor creation
        await createSponsorRequest(formData.cluster_id, formData.specific_id);
        
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
            
            {/* Phone Number Field - Required */}
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
            
            {/* Email Field - Optional */}
            <div>
              <label className="block text-blue-700 font-medium mb-2">
                Email
              </label>
              <input
                type="email"
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter email address (optional)"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
              />
            </div>

            {/* Conditionally show gender for individuals only - Optional */}
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
                  <option value="">Select gender (optional)</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option> 
                </select>
              </div>
            )}
            
            {/* Conditionally show date of birth for individuals only - Optional */}
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
            
            {/* Starting Date - Optional */}
            <div>
              <label className="block text-blue-700 font-medium mb-2">
                Starting Date
              </label>
              <input
                type="date"
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.starting_date}
                onChange={(e) => handleInputChange("starting_date", e.target.value)}
              />
              <div className="text-sm text-gray-500 mt-1">
                {!formData.starting_date ? "Today's date will be used if not specified" : ""}
              </div>
            </div>
          </div>

          {/* Beneficiary Request Information */}
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-blue-700 mb-3 border-b pb-2">
              Beneficiary Request (Optional)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-blue-700 font-medium mb-2">
                  Number of Child Beneficiaries
                </label>
                <input
                  type="number"
                  min="0"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0"
                  value={formData.number_of_child_beneficiaries}
                  onChange={(e) => handleInputChange("number_of_child_beneficiaries", e.target.value)}
                />
                <div className="text-sm text-gray-500 mt-1">
                  Default: 0
                </div>
              </div>
              <div>
                <label className="block text-blue-700 font-medium mb-2">
                  Number of Elderly Beneficiaries
                </label>
                <input
                  type="number"
                  min="0"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0"
                  value={formData.number_of_elderly_beneficiaries}
                  onChange={(e) => handleInputChange("number_of_elderly_beneficiaries", e.target.value)}
                />
                <div className="text-sm text-gray-500 mt-1">
                  Default: 0
                </div>
              </div>
            </div>
            <div className="mt-2 text-sm text-gray-600">
              <p>Total Beneficiaries Requested: <span className="font-semibold">
                {(parseInt(formData.number_of_child_beneficiaries) || 0) + (parseInt(formData.number_of_elderly_beneficiaries) || 0)}
              </span></p>
            </div>
          </div>

          {/* Financial Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Monthly Payment - Default 750 */}
            <div>
              <label className="block text-blue-700 font-medium mb-2">
                Agreed Monthly Payment (ETB)
              </label>
              <input
                type="number"
                step="0.01"
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="750.00"
                value={formData.agreed_monthly_payment}
                onChange={(e) => handleInputChange("agreed_monthly_payment", e.target.value)}
              />
              <div className="text-sm text-gray-500 mt-1">
                Default: 750 ETB
              </div>
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
              </select>
            </div>
          </div>

          {/* Emergency Contact - Both Optional */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-blue-700 font-medium mb-2">
                Emergency Contact Name
              </label>
              <input
                type="text"
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Emergency contact name (optional)"
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
                placeholder="+251... (optional)"
                value={formData.emergency_contact_phone}
                onChange={(e) => handleInputChange("emergency_contact_phone", e.target.value)}
              />
            </div>
          </div>

          {/* Address Information - All Optional except Country has default */}
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-blue-700 mb-3 border-b pb-2">
              Address Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-blue-700 font-medium mb-2">
                  Country
                </label>
                <select
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.country}
                  onChange={(e) => handleInputChange("country", e.target.value)}
                >
                  {countries.map(country => (
                    <option key={country} value={country}>
                      {country}
                    </option>
                  ))}
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
                  placeholder="e.g., Addis Ababa, Oromia (optional)"
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
                  placeholder="e.g., Central, North (optional)"
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
                  placeholder="e.g., Kirkos, Arada (optional)"
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
                  placeholder="House number (optional)"
                  value={formData.house_number}
                  onChange={(e) => handleInputChange("house_number", e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Consent Document - Optional */}
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
                Accepted: PDF, DOC, DOCX (optional)
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
