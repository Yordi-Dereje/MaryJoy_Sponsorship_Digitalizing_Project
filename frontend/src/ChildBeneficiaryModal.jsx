import React from "react";
import { X, Upload, FileText } from "lucide-react";

const ChildBeneficiaryModal = ({
  isOpen,
  onClose,
  setupFileUpload,
  guardians,
  guardianSearchTerm,
  handleGuardianSearch,
  selectGuardian,
  openGuardianModal,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex justify-center items-center z-[9999] p-4 backdrop-blur-sm backdrop-brightness-75">
      <div
        className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md max-h-[90vh] overflow-y-auto transform transition-transform duration-300 ease-out scale-95 opacity-0"
        style={{
          opacity: isOpen ? 1 : 0,
          transform: isOpen
            ? "scale(1) translateY(0)"
            : "scale(0.95) translateY(-20px)",
        }}
      >
        <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-blue-700">Add Child Beneficiary</h2>
          <button
            className="text-gray-500 hover:text-gray-700 transition-colors duration-200"
            onClick={onClose}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="mb-4">
          <label className="block text-blue-700 font-medium mb-2">
            Full Name
          </label>
          <input
            type="text"
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-blue-700"
            placeholder="Enter full name"
          />
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <div className="flex-1">
            <label className="block text-blue-700 font-medium mb-2">
              Date of Birth
            </label>
            <input
              type="date"
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-blue-700"
            />
          </div>
          <div className="flex-1">
            <label className="block text-blue-700 font-medium mb-2">
              Gender
            </label>
            <select className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-blue-700">
              <option value="">Select gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <div className="flex-1">
            <label className="block text-blue-700 font-medium mb-2">
              Upload Photo
            </label>
            <div
              className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-blue-500 transition-colors duration-200"
              onClick={() =>
                document.getElementById("beneficiaryPhotoFile").click()
              }
            >
              <Upload className="w-6 h-6 text-gray-500 mx-auto mb-2" />
              <div className="text-gray-700 mb-1">Browse...</div>
              <div className="text-gray-500 text-sm">
                Accepted: JPG, PNG, JPEG
              </div>
              <input
                type="file"
                className="hidden"
                id="beneficiaryPhotoFile"
                accept=".jpg,.png,.jpeg"
                onChange={(e) =>
                  setupFileUpload("beneficiaryPhotoPreview", e.target.files[0])
                }
              />
            </div>
            <div id="beneficiaryPhotoPreview" className="mt-2"></div>
          </div>
          <div className="flex-1">
            <label className="block text-blue-700 font-medium mb-2">
              Upload Case File
            </label>
            <div
              className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-blue-500 transition-colors duration-200"
              onClick={() => document.getElementById("caseFile").click()}
            >
              <FileText className="w-6 h-6 text-gray-500 mx-auto mb-2" />
              <div className="text-gray-700 mb-1">Browse...</div>
              <div className="text-gray-500 text-sm">
                Accepted: PDF, DOC, DOCX
              </div>
              <input
                type="file"
                className="hidden"
                id="caseFile"
                accept=".pdf,.doc,.docx"
                onChange={(e) =>
                  setupFileUpload("caseFilePreview", e.target.files[0])
                }
              />
            </div>
            <div id="caseFilePreview" className="mt-2"></div>
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-blue-700 font-medium mb-2">
            Profile Checklist
          </label>
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                id="supportLetter"
              />
              <label
                className="text-blue-700 font-medium"
                htmlFor="supportLetter"
              >
                Support Letter
              </label>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                id="supportingEvidence"
              />
              <label
                className="text-blue-700 font-medium"
                htmlFor="supportingEvidence"
              >
                Supporting Evidence
              </label>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                id="bankBook"
              />
              <label className="text-blue-700 font-medium" htmlFor="bankBook">
                Bank Book
              </label>
            </div>
          </div>
        </div>

        <div className="mb-6 relative">
          <label className="block text-blue-700 font-medium mb-2">
            Guardian
          </label>
          <input
            type="text"
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-blue-700"
            id="guardianSearch"
            placeholder="Search by name or phone number..."
            value={guardianSearchTerm}
            onChange={handleGuardianSearch}
          />
          {guardians.length > 0 && (
            <div className="absolute bg-white border border-gray-200 rounded-lg shadow-lg mt-1 w-full z-10 max-h-48 overflow-y-auto">
              {guardians.map((guardian) => (
                <div
                  key={guardian.id}
                  className="p-3 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0"
                  onClick={() => selectGuardian(guardian)}
                >
                  <div className="font-medium text-gray-800">
                    {guardian.name}
                  </div>
                  <div className="text-sm text-gray-600">{guardian.phone}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3">
          <button
            className="bg-gray-200 text-gray-800 px-5 py-2 rounded-lg font-medium hover:bg-gray-300 transition-colors duration-200"
            onClick={openGuardianModal}
          >
            Register Guardian
          </button>
          <button className="bg-orange-500 text-white px-5 py-2 rounded-lg font-medium hover:bg-orange-600 transition-colors duration-200">
            Submit Beneficiary
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChildBeneficiaryModal;
