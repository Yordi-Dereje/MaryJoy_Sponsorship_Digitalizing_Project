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
  const [sponsorSearchTerm, setSponsorSearchTerm] = useState("");
  const [sponsorSearchResults, setSponsorSearchResults] = useState([]);
  const [showSponsorSearch, setShowSponsorSearch] = useState(false);

  useEffect(() => {
    if (guardianSearchTerm) {
      searchGuardians();
    } else {
      setGuardians([]);
    }
  }, [guardianSearchTerm]);

  useEffect(() => {
    if (sponsorSearchTerm && formData.status === 'active') {
      searchSponsors();
    } else {
      setSponsorSearchResults([]);
    }
  }, [sponsorSearchTerm, formData.status]);

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

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    if (field === 'status') {
      setShowSponsorSearch(value === 'active');
      if (value !== 'active') {
        setSponsorSearchTerm("");
      }
    }

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

  const handleSponsorSearch = (e) => {
    setSponsorSearchTerm(e.target.value);
  };

  const selectGuardian = (guardian) => {
    setFormData(prev => ({
      ...prev,
      guardian_id: guardian.id
    }));
    setGuardianSearchTerm(guardian.name);
    setGuardians([]);
  };

  const selectSponsor = (sponsor) => {
    setSponsorSearchTerm(`${sponsor.full_name} (ID: ${sponsor.id})`);
    setSponsorSearchResults([]);
  };

  const handleFileUpload = (field, file, previewId) => {
    setFormData(prev => ({
      ...prev,
      [field]: file,
      [`has_${field}`]: !!file
    }));
    setupFileUpload(previewId, file);
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
        setShowSponsorSearch(false);
        setSponsorSearchTerm("");
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
        <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-blue-700">Register Child Beneficiary</h2>
          <button
            className="text-gray-500 hover:text-gray-700 transition-colors duration-200"
            onClick={onClose}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

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
                onChange={(e) => handleInputChange("gender", e.target.value)}
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
                onChange={(e) => handleInputChange("date_of_birth", e.target.value)}
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
                  onChange={(e) => handleInputChange("status", e.target.value)}
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

          {/* Guardian Search */}
          <div className="mb-4 relative">
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

          {/* Support Letter Upload Section */}
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-blue-700 mb-3 border-b pb-2">
              Support Letter
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-blue-700 font-medium mb-2">
                  Upload Support Letter
                </label>
                <div
                  className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-blue-500 transition-colors duration-200"
                  onClick={() => document.getElementById("supportLetterFile").click()}
                >
                  <div className="flex flex-col items-center">
                    <Upload className="w-6 h-6 text-gray-500 mb-2" />
                    <div className="text-gray-700 mb-1">Click to upload or drag and drop</div>
                    <div className="text-gray-500 text-sm">
                      Accepted formats: PDF, JPG, PNG (Max 5MB)
                    </div>
                  </div>
                  <input
                    type="file"
                    className="hidden"
                    id="supportLetterFile"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => handleFileUpload("support_letter_url", e.target.files[0], "supportLetterPreview")}
                  />
                </div>
                <div id="supportLetterPreview" className="mt-2">
                  {formData.has_support_letter && (
                    <div className="flex items-center p-2 bg-gray-50 rounded mt-2">
                      <FileText className="w-4 h-4 text-green-500 mr-2" />
                      <span className="text-sm text-gray-700">
                        {typeof formData.support_letter_url === 'string'
                          ? formData.support_letter_url.split('/').pop()
                          : formData.support_letter_url?.name || 'Support letter ready'}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
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

