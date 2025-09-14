import React, { useState, useEffect } from "react";
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
    consent_document_url: "",
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
  const [sponsorSearchTerm, setSponsorSearchTerm] = useState("");
  const [sponsorSearchResults, setSponsorSearchResults] = useState([]);
  const [showSponsorSearch, setShowSponsorSearch] = useState(false);

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

  useEffect(() => {
    if (sponsorSearchTerm && formData.status === 'active') {
      searchSponsors();
    } else {
      setSponsorSearchResults([]);
    }
  }, [sponsorSearchTerm, formData.status]);

  const searchSponsors = async () => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/sponsors/search?search=${encodeURIComponent(sponsorSearchTerm)}`
      );

      if (response.ok) {
        const data = await response.json();
        setSponsorSearchResults(data.sponsors || []);
      }
    } catch (error) {
      console.error('Error searching sponsors:', error);
    }
  };

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

    // Handle status change for sponsor search
    if (field === 'status') {
      setShowSponsorSearch(value === 'active');
      if (value !== 'active') {
        setSponsorSearchTerm("");
      }
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

  const handleSponsorSearch = (e) => {
    setSponsorSearchTerm(e.target.value);
  };

  const selectSponsor = (sponsor) => {
    setSponsorSearchTerm(`${sponsor.full_name} (ID: ${sponsor.id})`);
    setSponsorSearchResults([]);
  };

  const handleFileUpload = (field, file, previewId) => {
    setFormData(prev => ({
      ...prev,
      [field]: file
    }));
    setupFileUpload(previewId, file);
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
      // Create address first if needed
      let addressId = null;
      if (formData.address && (formData.address.country || formData.address.region)) {
        const addressResponse = await fetch('http://localhost:5000/api/addresses', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            country: formData.address.country || 'Ethiopia',
            region: formData.address.region,
            sub_region: formData.address.sub_region,
            woreda: formData.address.woreda,
            house_number: formData.address.house_number
          })
        });

        if (addressResponse.ok) {
          const addressData = await addressResponse.json();
          addressId = addressData.address.id;
        }
      }

      // Prepare beneficiary data
      const beneficiaryData = {
        full_name: formData.full_name,
        date_of_birth: formData.date_of_birth,
        gender: formData.gender,
        status: formData.status,
        address_id: addressId,
        support_letter_url: formData.support_letter_url,
        consent_document_url: formData.consent_document_url
      };

      const response = await fetch('http://localhost:5000/api/beneficiaries/elderly', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(beneficiaryData)
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
          consent_document_url: "",
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
        setShowSponsorSearch(false);
        setSponsorSearchTerm("");
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
        {/* Header with X button */}
        <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-blue-700">Register Elderly Beneficiary</h2>
          <button
            className="text-gray-500 hover:text-gray-700 transition-colors duration-200"
            onClick={onClose}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

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

          {/* Date of Birth and Gender - Reordered with gender first */}
          <div className="flex flex-col md:flex-row gap-4 mb-4">
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
          </div>

          {/* Status Dropdown and Sponsor Search in same row */}
          <div className="mb-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <label className="block text-blue-700 font-medium mb-2">
                  Status
                </label>
                <select
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.status}
                  onChange={(e) => handleInputChange(null, "status", e.target.value)}
                >
                  <option value="waiting_list">Waiting List</option>
                  <option value="active">Active</option>
                  <option value="terminated">Terminated</option>
                  <option value="graduated">Graduated</option>
                  <option value="awaiting_reassignment">Awaiting Reassignment</option>
                </select>
              </div>

              {showSponsorSearch && (
                <div className="flex-1 relative">
                  <label className="block text-blue-700 font-medium mb-2">
                    Sponsor
                  </label>
                  <input
                    type="text"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Search by ID, name or phone number"
                    value={sponsorSearchTerm}
                    onChange={handleSponsorSearch}
                  />

                  {sponsorSearchResults.length > 0 && (
                    <div className="absolute bg-white border border-gray-200 rounded-lg shadow-lg mt-1 w-full z-10 max-h-48 overflow-y-auto">
                      {sponsorSearchResults.map((sponsor) => (
                        <div
                          key={sponsor.id}
                          className="p-3 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0"
                          onClick={() => selectSponsor(sponsor)}
                        >
                          <div className="font-medium text-gray-800">{sponsor.full_name}</div>
                          <div className="text-sm text-gray-600">ID: {sponsor.id}</div>
                          <div className="text-sm text-gray-600">Phone: {sponsor.phone_number}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Contact Information with all three phone numbers */}
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
              <div>
                <label className="block text-blue-700 font-medium mb-2">
                  Secondary Phone
                </label>
                <input
                  type="tel"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="+251..."
                  value={formData.phone_numbers.secondary}
                  onChange={(e) => handleInputChange("phone_numbers", "secondary", e.target.value)}
                />
              </div>
              <div>
                <label className="block text-blue-700 font-medium mb-2">
                  Tertiary Phone
                </label>
                <input
                  type="tel"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="+251..."
                  value={formData.phone_numbers.tertiary}
                  onChange={(e) => handleInputChange("phone_numbers", "tertiary", e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Address Information with complete address fields */}
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
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.address.country}
                  onChange={(e) => handleInputChange("address", "country", e.target.value)}
                />
              </div>
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
              <div>
                <label className="block text-blue-700 font-medium mb-2">
                  Sub Region
                </label>
                <input
                  type="text"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Central, North"
                  value={formData.address.sub_region}
                  onChange={(e) => handleInputChange("address", "sub_region", e.target.value)}
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
                  value={formData.address.woreda}
                  onChange={(e) => handleInputChange("address", "woreda", e.target.value)}
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-blue-700 font-medium mb-2">
                  House Number
                </label>
                <input
                  type="text"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="House number"
                  value={formData.address.house_number}
                  onChange={(e) => handleInputChange("address", "house_number", e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Bank Information Section */}
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
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.bank_info.bank_name}
                  onChange={(e) => handleInputChange("bank_info", "bank_name", e.target.value)}
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
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Account number"
                  value={formData.bank_info.account_number}
                  onChange={(e) => handleInputChange("bank_info", "account_number", e.target.value)}
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-blue-700 font-medium mb-2">
                  Upload Bank Document
                </label>
                <div
                  className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-blue-500 transition-colors duration-200"
                  onClick={() => document.getElementById("bankDocumentFile").click()}
                >
                  <div className="flex flex-col items-center">
                    <Upload className="w-6 h-6 text-gray-500 mb-2" />
                    <div className="text-gray-700 mb-1">Click to upload bank document</div>
                    <div className="text-gray-500 text-sm">
                      Accepted formats: PDF, JPG, PNG (Max 5MB)
                    </div>
                  </div>
                  <input
                    type="file"
                    className="hidden"
                    id="bankDocumentFile"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => handleFileUpload("bank_info", "document_url", e.target.files[0], "bankDocumentPreview")}
                  />
                </div>
                <div id="bankDocumentPreview" className="mt-2">
                  {formData.bank_info.document_url && (
                    <div className="flex items-center p-2 bg-gray-50 rounded mt-2">
                      <FileText className="w-4 h-4 text-green-500 mr-2" />
                      <span className="text-sm text-gray-700">
                        {typeof formData.bank_info.document_url === 'string'
                          ? formData.bank_info.document_url.split('/').pop()
                          : formData.bank_info.document_url?.name || 'Bank document ready'}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Consent Document Upload Section */}
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-blue-700 mb-3 border-b pb-2">
              Consent Documents
            </h3>
            <div>
              <label className="block text-blue-700 font-medium mb-2">
                Upload Consent Document
              </label>
              <div
                className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-blue-500 transition-colors duration-200"
                onClick={() => document.getElementById("consentDocumentFile").click()}
              >
                <div className="flex flex-col items-center">
                  <Upload className="w-6 h-6 text-gray-500 mb-2" />
                  <div className="text-gray-700 mb-1">Click to upload consent document</div>
                  <div className="text-gray-500 text-sm">
                    Accepted formats: PDF, JPG, PNG (Max 5MB)
                  </div>
                </div>
                <input
                  type="file"
                  className="hidden"
                  id="consentDocumentFile"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => handleFileUpload("consent_document_url", e.target.files[0], "consentDocumentPreview")}
                />
              </div>
              <div id="consentDocumentPreview" className="mt-2">
                {formData.consent_document_url && (
                  <div className="flex items-center p-2 bg-gray-50 rounded mt-2">
                    <FileText className="w-4 h-4 text-green-500 mr-2" />
                    <span className="text-sm text-gray-700">
                      {typeof formData.consent_document_url === 'string'
                        ? formData.consent_document_url.split('/').pop()
                        : formData.consent_document_url?.name || 'Consent document ready'}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
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

