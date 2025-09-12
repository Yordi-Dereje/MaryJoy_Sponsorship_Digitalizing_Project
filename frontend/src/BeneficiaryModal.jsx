import React, { useState, useEffect } from "react";
import { X, Upload, FileText, Search } from "lucide-react";

const BeneficiaryModal = ({
  isOpen,
  onClose,
  setupFileUpload,
  onBeneficiaryAdded,
  onSearchSponsor,
  onSearchGuardian
}) => {
  const [beneficiaryType, setBeneficiaryType] = useState("child");
  const [formData, setFormData] = useState({
    // Common fields
    fullName: "",
    gender: "",
    dateOfBirth: "",
    status: "active",
    sponsor: null,
    guardian: null,
    address: {
      country: "Ethiopia",
      region: "",
      subRegion: "",
      woreda: "",
      houseNumber: ""
    },
    phoneNumbers: {
      primaryPhone: "",
      secondaryPhone: "",
      tertiaryPhone: ""
    },
    bankInfo: {
      bankName: "",
      bankAccountNumber: "",
      bankDocument: null
    },
    documents: {
      supportLetter: null,
      idDocument: null
    },

    // Child-specific fields
    schoolName: "",
    gradeLevel: "",
    schoolAddress: "",
    favoriteSubject: "",
    healthConditions: "",

    // Elderly-specific fields
    occupation: "",
    monthlyIncome: "",
    healthStatus: "",
    mobilityLevel: "",
    dependents: ""
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchType, setSearchType] = useState(null); // 'sponsor' or 'guardian'

  if (!isOpen) return null;

  const banks = [
    "Commercial Bank Of Ethiopia", "Nib Bank", "Dashen Bank", "Awash Bank",
    "Bank of Abyssinia", "Wegagen Bank", "Hibret Bank", "Abay Bank",
    "Addis International Bank", "Berhan Bank", "Zemen Bank", "Bunna Bank",
    "Shabelle Bank", "Oromia Bank", "Lion International Bank",
    "Cooperative Bank of Oromia", "Enat Bank", "ZamZam Bank", "Siinqee Bank",
    "Goh Betoch Bank"
  ];

  const statusOptions = [
    { value: "active", label: "Active" },
    { value: "inactive", label: "Inactive" },
    { value: "pending", label: "Pending" },
    { value: "suspended", label: "Suspended" }
  ];

  const handleInputChange = (section, field, value) => {
    setFormData(prev => {
      if (section) {
        return {
          ...prev,
          [section]: {
            ...prev[section],
            [field]: value
          }
        };
      }
      return { ...prev, [field]: value };
    });
  };

  const handleFileUpload = (section, field, file, previewId) => {
    setFormData(prev => {
      if (section) {
        return {
          ...prev,
          [section]: {
            ...prev[section],
            [field]: file
          }
        };
      }
      return { ...prev, [field]: file };
    });
    setupFileUpload(previewId, file);
  };

  const handleSearch = async (type) => {
    setSearchType(type);
    if (searchTerm.trim() === "") return;

    try {
      const results = type === "sponsor"
        ? await onSearchSponsor(searchTerm)
        : await onSearchGuardian(searchTerm);
      setSearchResults(results);
    } catch (error) {
      console.error(`Error searching ${type}:`, error);
    }
  };

  const selectSearchResult = (result) => {
    if (searchType === "sponsor") {
      handleInputChange(null, "sponsor", result);
    } else {
      handleInputChange(null, "guardian", result);
    }
    setSearchTerm("");
    setSearchResults([]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Beneficiary data:", {
      ...formData,
      type: beneficiaryType,
      status: formData.status
    });

    if (onBeneficiaryAdded) {
      onBeneficiaryAdded({
        id: Date.now(),
        name: formData.fullName,
        type: beneficiaryType,
        status: formData.status,
        sponsor: formData.sponsor,
        guardian: formData.guardian
      });
    }

    alert(`${beneficiaryType.charAt(0).toUpperCase() + beneficiaryType.slice(1)} registered successfully!`);
    onClose();
  };

  return (
    <div className="fixed inset-0 flex justify-center items-center z-[9999] p-4 bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-blue-700">Register Beneficiary</h2>
          <button
            className="text-gray-500 hover:text-gray-700 transition-colors duration-200"
            onClick={onClose}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Beneficiary Type Toggle */}
        <div className="flex mb-6">
          <button
            type="button"
            className={`flex-1 py-2 rounded-l-lg ${beneficiaryType === "child" ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-700"}`}
            onClick={() => setBeneficiaryType("child")}
          >
            Child
          </button>
          <button
            type="button"
            className={`flex-1 py-2 rounded-r-lg ${beneficiaryType === "elderly" ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-700"}`}
            onClick={() => setBeneficiaryType("elderly")}
          >
            Elderly
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Status Section */}
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-blue-700 mb-3 border-b pb-2">
              Status Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-blue-700 font-medium mb-2">
                  Status <span className="text-red-500">*</span>
                </label>
                <select
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-blue-700"
                  value={formData.status}
                  onChange={(e) => handleInputChange(null, "status", e.target.value)}
                  required
                >
                  {statusOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {formData.status === "active" && (
                <>
                  <div className="md:col-span-2">
                    <label className="block text-blue-700 font-medium mb-2">
                      {searchType === "sponsor" ? "Search Sponsor" : "Search Guardian"}
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        className="w-full p-3 border border-gray-300 rounded-lg pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-blue-700"
                        placeholder={`Search by ID, name or phone number...`}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                        onClick={() => handleSearch(searchType)}
                      >
                        <Search className="w-5 h-5" />
                      </button>
                    </div>

                    {searchResults.length > 0 && (
                      <div className="mt-2 border border-gray-200 rounded-lg bg-white shadow-lg max-h-40 overflow-y-auto">
                        {searchResults.map((result) => (
                          <div
                            key={result.id}
                            className="p-2 hover:bg-gray-100 cursor-pointer border-b last:border-b-0"
                            onClick={() => selectSearchResult(result)}
                          >
                            <div className="font-medium">{result.name}</div>
                            <div className="text-sm text-gray-500">
                              {result.phone} - {result.id}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="md:col-span-2 flex gap-2">
                    <button
                      type="button"
                      className={`flex-1 py-2 ${searchType === "sponsor" ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-700"}`}
                      onClick={() => setSearchType("sponsor")}
                    >
                      Add Sponsor
                    </button>
                    <button
                      type="button"
                      className={`flex-1 py-2 ${searchType === "guardian" ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-700"}`}
                      onClick={() => setSearchType("guardian")}
                    >
                      Add Guardian
                    </button>
                  </div>

                  {formData.sponsor && (
                    <div className="md:col-span-2 p-3 bg-gray-50 rounded-lg">
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="font-medium">Sponsor: {formData.sponsor.name}</div>
                          <div className="text-sm text-gray-500">
                            ID: {formData.sponsor.id} | Phone: {formData.sponsor.phone}
                          </div>
                        </div>
                        <button
                          type="button"
                          className="text-red-500 hover:text-red-700"
                          onClick={() => handleInputChange(null, "sponsor", null)}
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}

                  {formData.guardian && (
                    <div className="md:col-span-2 p-3 bg-gray-50 rounded-lg">
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="font-medium">Guardian: {formData.guardian.name}</div>
                          <div className="text-sm text-gray-500">
                            Relation: {formData.guardian.relation} | Phone: {formData.guardian.phone}
                          </div>
                        </div>
                        <button
                          type="button"
                          className="text-red-500 hover:text-red-700"
                          onClick={() => handleInputChange(null, "guardian", null)}
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Personal Information */}
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-blue-700 mb-3 border-b pb-2">
              Personal Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-blue-700 font-medium mb-2">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-blue-700"
                  placeholder="Enter full name"
                  value={formData.fullName}
                  onChange={(e) => handleInputChange(null, "fullName", e.target.value)}
                />
              </div>
              <div>
                <label className="block text-blue-700 font-medium mb-2">
                  Gender <span className="text-red-500">*</span>
                </label>
                <select
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-blue-700"
                  value={formData.gender}
                  onChange={(e) => handleInputChange(null, "gender", e.target.value)}
                  required
                >
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-blue-700 font-medium mb-2">
                  Date of Birth <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-blue-700"
                  value={formData.dateOfBirth}
                  onChange={(e) => handleInputChange(null, "dateOfBirth", e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Type-Specific Information */}
          {beneficiaryType === "child" ? (
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-blue-700 mb-3 border-b pb-2">
                Child Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-blue-700 font-medium mb-2">
                    School Name
                  </label>
                  <input
                    type="text"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-blue-700"
                    placeholder="School name"
                    value={formData.schoolName}
                    onChange={(e) => handleInputChange(null, "schoolName", e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-blue-700 font-medium mb-2">
                    Grade Level
                  </label>
                  <input
                    type="text"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-blue-700"
                    placeholder="Grade level"
                    value={formData.gradeLevel}
                    onChange={(e) => handleInputChange(null, "gradeLevel", e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-blue-700 font-medium mb-2">
                    School Address
                  </label>
                  <input
                    type="text"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-blue-700"
                    placeholder="School address"
                    value={formData.schoolAddress}
                    onChange={(e) => handleInputChange(null, "schoolAddress", e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-blue-700 font-medium mb-2">
                    Favorite Subject
                  </label>
                  <input
                    type="text"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-blue-700"
                    placeholder="Favorite subject"
                    value={formData.favoriteSubject}
                    onChange={(e) => handleInputChange(null, "favoriteSubject", e.target.value)}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-blue-700 font-medium mb-2">
                    Health Conditions
                  </label>
                  <textarea
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-blue-700"
                    placeholder="Any health conditions or special needs"
                    value={formData.healthConditions}
                    onChange={(e) => handleInputChange(null, "healthConditions", e.target.value)}
                    rows="3"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-blue-700 mb-3 border-b pb-2">
                Elderly Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-blue-700 font-medium mb-2">
                    Occupation
                  </label>
                  <input
                    type="text"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-blue-700"
                    placeholder="Current or previous occupation"
                    value={formData.occupation}
                    onChange={(e) => handleInputChange(null, "occupation", e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-blue-700 font-medium mb-2">
                    Monthly Income (ETB)
                  </label>
                  <input
                    type="number"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-blue-700"
                    placeholder="Monthly income in ETB"
                    value={formData.monthlyIncome}
                    onChange={(e) => handleInputChange(null, "monthlyIncome", e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-blue-700 font-medium mb-2">
                    Health Status
                  </label>
                  <select
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-blue-700"
                    value={formData.healthStatus}
                    onChange={(e) => handleInputChange(null, "healthStatus", e.target.value)}
                  >
                    <option value="">Select health status</option>
                    <option value="good">Good</option>
                    <option value="fair">Fair</option>
                    <option value="poor">Poor</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
                <div>
                  <label className="block text-blue-700 font-medium mb-2">
                    Mobility Level
                  </label>
                  <select
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-blue-700"
                    value={formData.mobilityLevel}
                    onChange={(e) => handleInputChange(null, "mobilityLevel", e.target.value)}
                  >
                    <option value="">Select mobility level</option>
                    <option value="independent">Independent</option>
                    <option value="assisted">Needs Assistance</option>
                    <option value="wheelchair">Wheelchair Bound</option>
                    <option value="bedridden">Bedridden</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-blue-700 font-medium mb-2">
                    Dependents Information
                  </label>
                  <textarea
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-blue-700"
                    placeholder="Information about dependents if any"
                    value={formData.dependents}
                    onChange={(e) => handleInputChange(null, "dependents", e.target.value)}
                    rows="3"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Contact Information */}
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
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-blue-700"
                  placeholder="+251..."
                  value={formData.phoneNumbers.primaryPhone}
                  onChange={(e) => handleInputChange("phoneNumbers", "primaryPhone", e.target.value)}
                />
              </div>
              <div>
                <label className="block text-blue-700 font-medium mb-2">
                  Secondary Phone
                </label>
                <input
                  type="tel"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-blue-700"
                  placeholder="+251..."
                  value={formData.phoneNumbers.secondaryPhone}
                  onChange={(e) => handleInputChange("phoneNumbers", "secondaryPhone", e.target.value)}
                />
              </div>
              <div>
                <label className="block text-blue-700 font-medium mb-2">
                  Tertiary Phone
                </label>
                <input
                  type="tel"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-blue-700"
                  placeholder="+251..."
                  value={formData.phoneNumbers.tertiaryPhone}
                  onChange={(e) => handleInputChange("phoneNumbers", "tertiaryPhone", e.target.value)}
                />
              </div>
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
                  Country
                </label>
                <input
                  type="text"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-blue-700"
                  value={formData.address.country}
                  onChange={(e) => handleInputChange("address", "country", e.target.value)}
                />
              </div>
              <div>
                <label className="block text-blue-700 font-medium mb-2">
                  Region
                </label>
                <input
                  type="text"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-blue-700"
                  placeholder="e.g., Addis Ababa, Oromia"
                  value={formData.address.region}
                  onChange={(e) => handleInputChange("address", "region", e.target.value)}
                />
              </div>
              <div>
                <label className="block text-blue-700 font-medium mb-2">
                  Sub Region
                </label>
                <input
                  type="text"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-blue-700"
                  placeholder="e.g., Central, North"
                  value={formData.address.subRegion}
                  onChange={(e) => handleInputChange("address", "subRegion", e.target.value)}
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
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-blue-700"
                  placeholder="House number"
                  value={formData.address.houseNumber}
                  onChange={(e) => handleInputChange("address", "houseNumber", e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Bank Information */}
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
                  value={formData.bankInfo.bankName}
                  onChange={(e) => handleInputChange("bankInfo", "bankName", e.target.value)}
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
                  value={formData.bankInfo.bankAccountNumber}
                  onChange={(e) => handleInputChange("bankInfo", "bankAccountNumber", e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Document Uploads */}
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-blue-700 mb-3 border-b pb-2">
              Document Uploads
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-blue-700 font-medium mb-2">
                  Upload Support Letter
                </label>
                <div
                  className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-blue-500 transition-colors duration-200"
                  onClick={() => document.getElementById("supportLetterFile").click()}
                >
                  <FileText className="w-6 h-6 text-gray-500 mx-auto mb-2" />
                  <div className="text-gray-700 mb-1">Browse...</div>
                  <div className="text-gray-500 text-sm">
                    Accepted: PDF, JPG, PNG
                  </div>
                  <input
                    type="file"
                    className="hidden"
                    id="supportLetterFile"
                    accept=".pdf,.jpg,.png"
                    onChange={(e) => handleFileUpload("documents", "supportLetter", e.target.files[0], "supportLetterPreview")}
                  />
                </div>
                <div id="supportLetterPreview" className="mt-2"></div>
              </div>

              <div>
                <label className="block text-blue-700 font-medium mb-2">
                  Upload ID Document
                </label>
                <div
                  className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-blue-500 transition-colors duration-200"
                  onClick={() => document.getElementById("idDocumentFile").click()}
                >
                  <FileText className="w-6 h-6 text-gray-500 mx-auto mb-2" />
                  <div className="text-gray-700 mb-1">Browse...</div>
                  <div className="text-gray-500 text-sm">
                    Accepted: PDF, JPG, PNG
                  </div>
                  <input
                    type="file"
                    className="hidden"
                    id="idDocumentFile"
                    accept=".pdf,.jpg,.png"
                    onChange={(e) => handleFileUpload("documents", "idDocument", e.target.files[0], "idDocumentPreview")}
                  />
                </div>
                <div id="idDocumentPreview" className="mt-2"></div>
              </div>

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
                    onChange={(e) => handleFileUpload("bankInfo", "bankDocument", e.target.files[0], "bankDocumentPreview")}
                  />
                </div>
                <div id="bankDocumentPreview" className="mt-2"></div>
              </div>
            </div>
          </div>

          {/* Form Actions */}
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
              className="bg-orange-500 text-white px-5 py-2 rounded-lg font-medium hover:bg-orange-600 transition-colors duration-200"
            >
              Register {beneficiaryType.charAt(0).toUpperCase() + beneficiaryType.slice(1)}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BeneficiaryModal;

