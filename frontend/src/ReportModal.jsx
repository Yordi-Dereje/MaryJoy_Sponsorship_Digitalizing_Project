import React, { useState, useEffect } from "react";
import { X, Upload, FileText, AlertCircle } from "lucide-react";

const ReportModal = ({
  isOpen,
  onClose,
  onSubmit,
  editingReport = null,
  isLoading = false
}) => {
  const [formData, setFormData] = useState({
    file_name: "",
    file: null
  });
  const [errors, setErrors] = useState({});
  const [dragActive, setDragActive] = useState(false);

  useEffect(() => {
    if (editingReport) {
      setFormData({
        file_name: editingReport.file_name || "",
        file: null
      });
    } else {
      setFormData({
        file_name: "",
        file: null
      });
    }
    setErrors({});
  }, [editingReport, isOpen]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        file: file
      }));
      
      // Auto-fill file name if empty
      if (!formData.file_name) {
        const nameWithoutExtension = file.name.replace(/\.[^/.]+$/, "");
        setFormData(prev => ({
          ...prev,
          file_name: nameWithoutExtension
        }));
      }
      
      if (errors.file) {
        setErrors(prev => ({
          ...prev,
          file: ""
        }));
      }
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setFormData(prev => ({
        ...prev,
        file: file
      }));
      
      // Auto-fill file name if empty
      if (!formData.file_name) {
        const nameWithoutExtension = file.name.replace(/\.[^/.]+$/, "");
        setFormData(prev => ({
          ...prev,
          file_name: nameWithoutExtension
        }));
      }
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.file_name.trim()) {
      newErrors.file_name = "Report name is required";
    }
    
    if (!editingReport && !formData.file) {
      newErrors.file = "Please select a file to upload";
    }
    
    if (formData.file) {
      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'text/plain',
        'text/csv'
      ];
      
      if (!allowedTypes.includes(formData.file.type)) {
        newErrors.file = "Invalid file type. Only PDF, Word, Excel, and text files are allowed.";
      }
      
      if (formData.file.size > 50 * 1024 * 1024) {
        newErrors.file = "File size must be less than 50MB";
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    const submitData = new FormData();
    submitData.append('file_name', formData.file_name);
    
    if (formData.file) {
      submitData.append('file', formData.file);
    }
    
    onSubmit(submitData);
  };

  const handleClose = () => {
    setFormData({
      file_name: "",
      file: null
    });
    setErrors({});
    setDragActive(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-white/30 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {editingReport ? 'Edit Report' : 'Add New Report'}
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={isLoading}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Report Name */}
          <div>
            <label htmlFor="file_name" className="block text-sm font-medium text-gray-700 mb-2">
              Report Name *
            </label>
            <input
              type="text"
              id="file_name"
              name="file_name"
              value={formData.file_name}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.file_name ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter report name"
              disabled={isLoading}
            />
            {errors.file_name && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {errors.file_name}
              </p>
            )}
          </div>

          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Report File {!editingReport && '*'}
            </label>
            
            {/* File Drop Zone */}
            <div
              className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                dragActive
                  ? 'border-blue-500 bg-blue-50'
                  : errors.file
                  ? 'border-red-500 bg-red-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <input
                type="file"
                onChange={handleFileChange}
                accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.csv"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                disabled={isLoading}
              />
              
              <div className="space-y-2">
                {formData.file ? (
                  <>
                    <FileText className="w-12 h-12 text-green-500 mx-auto" />
                    <p className="text-sm font-medium text-gray-900">
                      {formData.file.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {(formData.file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </>
                ) : (
                  <>
                    <Upload className="w-12 h-12 text-gray-400 mx-auto" />
                    <p className="text-sm font-medium text-gray-900">
                      Drop your file here, or click to browse
                    </p>
                    <p className="text-xs text-gray-500">
                      PDF, Word, Excel, or text files up to 50MB
                    </p>
                  </>
                )}
              </div>
            </div>
            
            {errors.file && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {errors.file}
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {editingReport ? 'Updating...' : 'Creating...'}
                </div>
              ) : (
                editingReport ? 'Update Report' : 'Create Report'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReportModal;
