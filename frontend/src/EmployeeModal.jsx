import React, { useState } from "react";
import { X, User } from "lucide-react";

const EmployeeModal = ({
  isOpen,
  onClose,
  departments = [],
  accessLevels = [],
  onEmployeeAdded,
}) => {
  const [formData, setFormData] = useState({
    full_name: "",
    phone_number: "",
    email: "",
    access_level: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

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

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.full_name) newErrors.full_name = "Full name is required";
    if (!formData.phone_number) newErrors.phone_number = "Phone number is required";
    if (!formData.access_level) newErrors.access_level = "Access level is required";

    // Email validation (only if provided, since it's now optional)
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    try {
      const employeeData = {
        full_name: formData.full_name,
        phone_number: formData.phone_number,
        email: formData.email || null, // Email is now optional
        access_level: formData.access_level // send canonical string the backend expects
      };

      const response = await fetch('http://localhost:5000/api/employees', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(employeeData)
      });

      if (response.ok) {
        const data = await response.json();
        
        if (onEmployeeAdded) {
          onEmployeeAdded(data.employee);
        }
        
        alert('Employee registered successfully!');
        onClose();
        
        // Reset form
        setFormData({
          full_name: "",
          phone_number: "",
          email: "",
          access_level: ""
        });
      } else {
        let msg = '';
        try { msg = await response.text(); } catch {}
        console.error('Create employee failed:', response.status, msg);
        throw new Error(msg || 'Failed to add employee');
      }
    } catch (error) {
      console.error('Error adding employee:', error);
      alert(error.message || 'Error adding employee. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

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
          <h2 className="text-xl font-bold text-blue-700">Register Employee</h2>
          <button
            className="text-gray-500 hover:text-gray-700 transition-colors duration-200"
            onClick={onClose}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-blue-700 font-medium mb-2">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.full_name}
              onChange={(e) => handleInputChange('full_name', e.target.value)}
              className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-blue-700 ${
                errors.full_name ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter full name"
            />
            {errors.full_name && <p className="text-red-500 text-sm mt-1">{errors.full_name}</p>}
          </div> 

          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="flex-1">
              <label className="block text-blue-700 font-medium mb-2">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                value={formData.phone_number}
                onChange={(e) => handleInputChange('phone_number', e.target.value)}
                className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-blue-700 ${
                  errors.phone_number ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter phone number"
              />
              {errors.phone_number && <p className="text-red-500 text-sm mt-1">{errors.phone_number}</p>}
            </div>
            <div className="flex-1">
              <label className="block text-blue-700 font-medium mb-2">
                Email <span className="text-gray-500">(Optional)</span>
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-blue-700 ${
                  errors.email ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter email address"
              />
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-blue-700 font-medium mb-2">
              Access Level <span className="text-red-500">*</span>
            </label>
            <select 
              value={formData.access_level}
              onChange={(e) => handleInputChange('access_level', e.target.value)}
              className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-blue-700 ${
                errors.access_level ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="">Select access level</option>
              <option value="Administrator">Administrator</option>
              <option value="Database Officer">Database Officer</option>
              <option value="Coordinator">Coordinator</option>
            </select>
            {errors.access_level && <p className="text-red-500 text-sm mt-1">{errors.access_level}</p>}
          </div>

          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-blue-700 text-sm">
              <strong>Password:</strong> Will be automatically set to the last 4 digits of the phone number. 
              The employee can change it after first login.
            </p>
          </div>

          <div className="flex justify-end gap-3 mt-6">
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
              className="bg-blue-600 text-white px-5 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading}
            >
              {isLoading ? 'Registering...' : 'Register Employee'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EmployeeModal;
