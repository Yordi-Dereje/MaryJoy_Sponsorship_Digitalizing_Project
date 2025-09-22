import React, { useState, useEffect } from 'react';
import { X, User, Mail, Phone, Shield, Calendar, Edit, Save, Lock, Eye, EyeOff } from 'lucide-react';

const ProfileModal = ({ isOpen, onClose }) => {
  const [userData, setUserData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState({});
  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    oldPassword: false,
    newPassword: false,
    confirmPassword: false
  });

  useEffect(() => {
    if (isOpen) {
      // Get user data from localStorage (from your login response)
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      setUserData(user);
      setEditedData(user);
    }
  }, [isOpen]);

  const handleInputChange = (field, value) => {
    setEditedData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePasswordChange = (field, value) => {
    setPasswordData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const handleSave = async () => {
    try {
      // Update email and phone if changed
      if (editedData.email !== userData.email || editedData.phone !== userData.phone) {
        const response = await fetch('http://localhost:5000/api/user/update', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({
            email: editedData.email,
            phone: editedData.phone
          })
        });

        if (response.ok) {
          const updatedUser = { ...userData, email: editedData.email, phone: editedData.phone };
          localStorage.setItem('user', JSON.stringify(updatedUser));
          setUserData(updatedUser);
        }
      }

      // Handle password change
      if (passwordData.oldPassword && passwordData.newPassword) {
        if (passwordData.newPassword !== passwordData.confirmPassword) {
          alert("New passwords don't match!");
          return;
        }

        const passwordResponse = await fetch('http://localhost:5000/api/user/change-password', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({
            currentPassword: passwordData.oldPassword,
            newPassword: passwordData.newPassword
          })
        });

        if (!passwordResponse.ok) {
          const errorData = await passwordResponse.json();
          alert(errorData.error || 'Failed to change password');
          return;
        }

        alert("Password changed successfully!");
        setPasswordData({
          oldPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      }

      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Error updating profile. Please try again.');
    }
  };

  const handleCancelEdit = () => {
    setEditedData(userData);
    setPasswordData({
      oldPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    setIsEditing(false);
  };

  const formatRole = (role) => {
    switch (role) {
      case 'admin': return 'Administrator';
      case 'database_officer': return 'Database Officer';
      case 'coordinator': return 'Coordinator';
      case 'sponsor': return 'Sponsor';
      default: return role;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="bg-blue-900 py-6 px-6 rounded-t-2xl">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-white">
              {isEditing ? 'Edit Profile' : 'User Profile'}
            </h2>
            <button
              onClick={onClose}
              className="text-white hover:text-blue-200 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Profile Content */}
        <div className="p-6">
          {userData ? (
            <div className="space-y-6">
              {/* User Header */}
              <div className="text-center">
                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <User className="w-10 h-10 text-blue-800" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800">{userData.fullName || userData.name || 'User'}</h3>
                <p className="text-blue-600 font-medium">
                  {formatRole(userData.role)}
                </p>
              </div>

              {/* User Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Personal Information */}
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">
                    Personal Information
                  </h4>
                  
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <Mail className="w-5 h-5 text-blue-600" />
                    <div className="flex-1">
                      <p className="text-sm text-gray-600">Email</p>
                      {isEditing ? (
                        <input
                          type="email"
                          value={editedData.email || ''}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          className="text-gray-800 bg-white border border-gray-300 rounded px-2 py-1 w-full"
                          placeholder="Enter email address"
                        />
                      ) : (
                        <p className="text-gray-800">{userData.email || 'Not provided'}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <Phone className="w-5 h-5 text-blue-600" />
                    <div className="flex-1">
                      <p className="text-sm text-gray-600">Phone</p>
                      {isEditing ? (
                        <input
                          type="tel"
                          value={editedData.phone || editedData.phone_number || ''}
                          onChange={(e) => handleInputChange('phone', e.target.value)}
                          className="text-gray-800 bg-white border border-gray-300 rounded px-2 py-1 w-full"
                          placeholder="Enter phone number"
                        />
                      ) : (
                        <p className="text-gray-800">{userData.phone || userData.phone_number || 'Not provided'}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* System Information */}
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">
                    System Information
                  </h4>
                  
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <Shield className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="text-sm text-gray-600">Role</p>
                      <p className="text-gray-800">{formatRole(userData.role)}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <Calendar className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="text-sm text-gray-600">Last Login</p>
                      <p className="text-gray-800">
                        {userData.lastLogin ? new Date(userData.lastLogin).toLocaleString() : 'Never logged in'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Password Change Section - Only shown in edit mode */}
              {isEditing && (
                <div className="space-y-4 pt-4 border-t border-gray-200">
                  <h4 className="text-lg font-semibold text-gray-800">
                    Change Password
                  </h4>
                  
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <Lock className="w-5 h-5 text-blue-600" />
                      <div className="flex-1">
                        <p className="text-sm text-gray-600">Current Password</p>
                        <div className="relative">
                          <input
                            type={showPasswords.oldPassword ? "text" : "password"}
                            value={passwordData.oldPassword}
                            onChange={(e) => handlePasswordChange('oldPassword', e.target.value)}
                            className="text-gray-800 bg-white border border-gray-300 rounded px-2 py-1 w-full pr-10"
                            placeholder="Enter current password"
                          />
                          <button
                            type="button"
                            onClick={() => togglePasswordVisibility('oldPassword')}
                            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500"
                          >
                            {showPasswords.oldPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <Lock className="w-5 h-5 text-blue-600" />
                      <div className="flex-1">
                        <p className="text-sm text-gray-600">New Password</p>
                        <div className="relative">
                          <input
                            type={showPasswords.newPassword ? "text" : "password"}
                            value={passwordData.newPassword}
                            onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
                            className="text-gray-800 bg-white border border-gray-300 rounded px-2 py-1 w-full pr-10"
                            placeholder="Enter new password"
                          />
                          <button
                            type="button"
                            onClick={() => togglePasswordVisibility('newPassword')}
                            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500"
                          >
                            {showPasswords.newPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <Lock className="w-5 h-5 text-blue-600" />
                      <div className="flex-1">
                        <p className="text-sm text-gray-600">Confirm New Password</p>
                        <div className="relative">
                          <input
                            type={showPasswords.confirmPassword ? "text" : "password"}
                            value={passwordData.confirmPassword}
                            onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
                            className="text-gray-800 bg-white border border-gray-300 rounded px-2 py-1 w-full pr-10"
                            placeholder="Confirm new password"
                          />
                          <button
                            type="button"
                            onClick={() => togglePasswordVisibility('confirmPassword')}
                            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500"
                          >
                            {showPasswords.confirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                {isEditing ? (
                  <>
                    <button
                      onClick={handleCancelEdit}
                      className="px-6 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSave}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      Save Changes
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Profile
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">No user data available</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileModal;
