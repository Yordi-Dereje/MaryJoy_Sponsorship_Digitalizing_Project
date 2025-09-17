import React, { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { 
  ArrowLeft, User, Building, MapPin, Phone, Mail, Calendar, 
  DollarSign, Shield, FileText, Download, Search, Plus, X, 
  Edit3, Link, AlertTriangle, RefreshCw, Check, ExternalLink
} from "lucide-react";

const SponsorDetails = () => {
  const navigate = useNavigate();
  const { cluster_id, specific_id } = useParams();
  const location = useLocation();
  
  const [sponsor, setSponsor] = useState(null);
  const [beneficiaries, setBeneficiaries] = useState([]);
  const [availableBeneficiaries, setAvailableBeneficiaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [availableSearch, setAvailableSearch] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [selectedBeneficiaries, setSelectedBeneficiaries] = useState([]);
  const [linkSuccess, setLinkSuccess] = useState(false);
  const [editForm, setEditForm] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch sponsor data
  const fetchSponsorData = async () => {
    try {
      setLoading(true);
      setRefreshing(true);
      
      // Fetch sponsor details
      const sponsorResponse = await fetch(
        `http://localhost:5000/api/sponsors/${cluster_id}/${specific_id}`
      );
      
      if (!sponsorResponse.ok) {
        throw new Error('Failed to fetch sponsor data');
      }
      
      const sponsorData = await sponsorResponse.json();
      setSponsor(sponsorData);
      setEditForm(sponsorData);

      // Fetch sponsor's beneficiaries
      const beneficiariesResponse = await fetch(
        `http://localhost:5000/api/sponsors/${cluster_id}/${specific_id}/beneficiaries`
      );
      
      if (beneficiariesResponse.ok) {
        const beneficiariesData = await beneficiariesResponse.json();
        setBeneficiaries(beneficiariesData.beneficiaries || []);
      }

      // Fetch available beneficiaries (waiting list and needs reassigning)
      const availableResponse = await fetch(
        'http://localhost:5000/api/beneficiaries?status=waiting_list,pending_reassignment'
      );
      
      if (availableResponse.ok) {
        const availableData = await availableResponse.json();
        setAvailableBeneficiaries(availableData.beneficiaries || []);
      }

    } catch (err) {
      setError(err.message);
      console.error('Error fetching sponsor data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (cluster_id && specific_id) {
      fetchSponsorData();
    }
  }, [cluster_id, specific_id]);

  // Handle back button click
  const handleBack = () => {
    // Check if we came from inactive sponsors list
    if (location.state?.fromInactive) {
      navigate("/inactive_sponsors");
    } else {
      navigate("/sponsor_list");
    }
  };

  // Handle refresh
  const handleRefresh = () => {
    fetchSponsorData();
  };

  // Handle beneficiary row click
  const handleBeneficiaryClick = (beneficiary) => {
    navigate(`/specific_beneficiary/${beneficiary.id}`, { 
      state: { beneficiary } 
    });
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  // Format currency for display
  const formatCurrency = (amount) => {
    if (!amount) return "$0.00";
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  // Handle sort request
  const handleSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  // Filter beneficiaries based on search term
  const filteredBeneficiaries = beneficiaries.filter(beneficiary =>
    beneficiary.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (beneficiary.phone && beneficiary.phone.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (beneficiary.guardian_name && beneficiary.guardian_name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Sort beneficiaries
  const sortedBeneficiaries = [...filteredBeneficiaries].sort((a, b) => {
    if (!sortConfig.key) return 0;
    
    if (a[sortConfig.key] < b[sortConfig.key]) {
      return sortConfig.direction === 'ascending' ? -1 : 1;
    }
    if (a[sortConfig.key] > b[sortConfig.key]) {
      return sortConfig.direction === 'ascending' ? 1 : -1;
    }
    return 0;
  });

  // Filter available beneficiaries based on search term
  const filteredAvailableBeneficiaries = availableBeneficiaries.filter(beneficiary =>
    beneficiary.full_name.toLowerCase().includes(availableSearch.toLowerCase()) ||
    (beneficiary.phone && beneficiary.phone.toLowerCase().includes(availableSearch.toLowerCase())) ||
    (beneficiary.guardian_name && beneficiary.guardian_name.toLowerCase().includes(availableSearch.toLowerCase()))
  );

  // Toggle beneficiary selection in available list
  const toggleBeneficiarySelection = (beneficiaryId) => {
    if (selectedBeneficiaries.includes(beneficiaryId)) {
      setSelectedBeneficiaries(selectedBeneficiaries.filter(id => id !== beneficiaryId));
    } else {
      setSelectedBeneficiaries([...selectedBeneficiaries, beneficiaryId]);
    }
  };

  // Handle confirm linking
  const handleConfirmLinking = async () => {
    try {
      setRefreshing(true);
      
      // Link each selected beneficiary to this sponsor
      for (const beneficiaryId of selectedBeneficiaries) {
        const response = await fetch('http://localhost:5000/api/sponsorships', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            sponsor_cluster_id: cluster_id,
            sponsor_specific_id: specific_id,
            beneficiary_id: beneficiaryId,
            start_date: new Date().toISOString().split('T')[0],
            monthly_amount: sponsor.monthly_amount / (beneficiaries.length + 1), // Distribute amount
            status: 'active'
          })
        });

        if (!response.ok) {
          throw new Error('Failed to link beneficiary');
        }
      }

      // Show success message
      setLinkSuccess(true);
      
      // Refresh data
      setTimeout(() => {
        fetchSponsorData();
        setLinkSuccess(false);
        setShowLinkModal(false);
        setSelectedBeneficiaries([]);
      }, 2000);

    } catch (error) {
      console.error('Error linking beneficiaries:', error);
      alert('Error linking beneficiaries. Please try again.');
    } finally {
      setRefreshing(false);
    }
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditForm({
      ...editForm,
      [name]: value
    });
  };

  // Handle address input changes
  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setEditForm({
      ...editForm,
      address: {
        ...editForm.address,
        [name]: value
      }
    });
  };

  // Handle save edits
  const handleSaveEdits = async () => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/sponsors/${cluster_id}/${specific_id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(editForm)
        }
      );

      if (response.ok) {
        const updatedSponsor = await response.json();
        setSponsor(updatedSponsor.sponsor);
        setShowEditModal(false);
        alert('Sponsor updated successfully!');
      } else {
        throw new Error('Failed to update sponsor');
      }
    } catch (error) {
      console.error('Error updating sponsor:', error);
      alert('Error updating sponsor. Please try again.');
    }
  };

  // Handle deactivate sponsor
  const handleDeactivate = async () => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/sponsors/${cluster_id}/${specific_id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            status: 'inactive'
          })
        }
      );

      if (response.ok) {
        const updatedSponsor = await response.json();
        setSponsor(updatedSponsor.sponsor);
        setShowDeactivateModal(false);
        
        // Update beneficiaries status to "needs reassigning"
        for (const beneficiary of beneficiaries) {
          await fetch(`http://localhost:5000/api/beneficiaries/${beneficiary.id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              status: 'pending_reassignment'
            })
          });
        }

        alert("Sponsor has been deactivated. Their beneficiaries have been moved to 'needs reassigning' status.");
        fetchSponsorData(); // Refresh data
      } else {
        throw new Error('Failed to deactivate sponsor');
      }
    } catch (error) {
      console.error('Error deactivating sponsor:', error);
      alert('Error deactivating sponsor. Please try again.');
    }
  };

  // Handle activate sponsor
  const handleActivate = async () => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/sponsors/${cluster_id}/${specific_id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            status: 'active'
          })
        }
      );

      if (response.ok) {
        const updatedSponsor = await response.json();
        setSponsor(updatedSponsor.sponsor);
        alert('Sponsor activated successfully!');
        fetchSponsorData(); // Refresh data
      } else {
        throw new Error('Failed to activate sponsor');
      }
    } catch (error) {
      console.error('Error activating sponsor:', error);
      alert('Error activating sponsor. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="font-poppins bg-[#f5f7fa] p-8 text-[#032990] min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#032990] mx-auto"></div>
          <p className="mt-4 text-lg">Loading sponsor data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="font-poppins bg-[#f5f7fa] p-8 text-[#032990] min-h-screen flex items-center justify-center">
        <div className="text-center text-red-600">
          <p className="text-lg">Error: {error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-6 py-2 bg-[#032990] text-white rounded-lg hover:bg-[#021f70]"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!sponsor) {
    return (
      <div className="font-poppins bg-[#f5f7fa] p-8 text-[#032990] min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg">Sponsor not found</p>
          <button
            onClick={handleBack}
            className="mt-4 px-6 py-2 bg-[#032990] text-white rounded-lg hover:bg-[#021f70]"
          >
            Back to Sponsors
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="font-poppins bg-[#f5f7fa] p-4 sm:p-6 lg:p-8 text-[#032990] min-h-screen">
      <div className="max-w-6xl mx-auto bg-white p-4 sm:p-6 lg:p-8 rounded-xl shadow-lg">
        {/* Header */}
        <div className="flex items-center mb-8 gap-4">
          <button
            onClick={handleBack}
            className="flex items-center justify-center w-12 h-12 bg-white text-[#032990] rounded-lg shadow-md transition-all duration-300 border border-[#f0f3ff] hover:bg-[#032990] hover:text-white group"
          >
            <ArrowLeft className="w-6 h-6 transition-colors duration-300 group-hover:stroke-white" />
          </button>
          <div>
            <h1 className="text-[#032990] font-bold text-3xl">Sponsor Details</h1>
            <p className="text-[#6b7280] mt-1">Comprehensive information about sponsor {sponsor.cluster_id}-{sponsor.specific_id}</p>
          </div>
          <div className="flex gap-3 ml-auto">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className={`flex items-center px-4 py-2 bg-gray-200 text-gray-800 rounded-lg shadow-md transition-all duration-300 hover:bg-gray-300 ${
                refreshing ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              <RefreshCw className={`w-5 h-5 mr-2 ${refreshing ? "animate-spin" : ""}`} />
              Refresh
            </button>
            <button
              onClick={() => setShowEditModal(true)}
              className="flex items-center px-4 py-2 bg-[#032990] text-white rounded-lg shadow-md transition-all duration-300 hover:bg-[#0d3ba8]"
            >
              <Edit3 className="w-5 h-5 mr-2" />
              Edit
            </button>
            <button
              onClick={() => setShowLinkModal(true)}
              className="flex items-center px-4 py-2 bg-[#EAA108] text-white rounded-lg shadow-md transition-all duration-300 hover:bg-[#d19108]"
            >
              <Link className="w-5 h-5 mr-2" />
              Link Beneficiaries
            </button>
            {sponsor.status === "active" ? (
              <button
                onClick={() => setShowDeactivateModal(true)}
                className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg shadow-md transition-all duration-300 hover:bg-red-700"
              >
                <AlertTriangle className="w-5 h-5 mr-2" />
                Deactivate
              </button>
            ) : (
              <button
                onClick={handleActivate}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg shadow-md transition-all duration-300 hover:bg-green-700"
              >
                <AlertTriangle className="w-5 h-5 mr-2" />
                Activate
              </button>
            )}
          </div>
        </div>

        {/* Rest of the component remains mostly the same, but update data references */}
        {/* For example: */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Profile Card */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-2xl shadow-md overflow-hidden border border-gray-200">
              <div className="h-32 bg-gradient-to-r from-[#032990] to-[#0d3ba8]"></div>
              <div className="px-6 pb-6 relative">
                <div className="flex justify-center -mt-16 mb-4">
                  <div className="relative">
                  <div className="w-32 h-32 rounded-full bg-gradient-to-br from-[#032990] to-[#EAA108] flex items-center justify-center text-white text-4xl font-bold">
                      {sponsor.full_name.split(' ').map(name => name[0]).join('')}
                    </div>
                    <div className={`absolute bottom-0 right-0 w-6 h-6 rounded-full border-2 border-white ${sponsor.status === 'active' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  </div>
                </div>
                
                <h2 className="text-2xl font-bold text-center text-[#032990] mb-2">
                  {sponsor.full_name}
                </h2>
                
                <div className="text-center text-[#6b7280] mb-4">
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium mr-2 ${
                    sponsor.type === "individual" 
                      ? "bg-blue-100 text-blue-800" 
                      : "bg-purple-100 text-purple-800"
                  }`}>
                    {sponsor.type === "individual" ? (
                      <User className="inline mr-1 h-4 w-4" />
                    ) : (
                      <Building className="inline mr-1 h-4 w-4" />
                    )}
                    {sponsor.type === "individual" ? "Private" : "Organization"}
                  </span>
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium mr-2 ${
                    sponsor.is_diaspora ? "bg-yellow-100 text-yellow-800" : "bg-green-100 text-green-800"
                  }`}>
                    <MapPin className="inline mr-1 h-4 w-4" />
                    {sponsor.is_diaspora ? "Diaspora" : "Local"}
                  </span>
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                    sponsor.gender === "male" 
                      ? "bg-blue-100 text-blue-800" 
                      : "bg-pink-100 text-pink-800"
                  }`}>
                    {sponsor.gender === "male" ? (
                      <User className="inline mr-1 h-4 w-4" />
                    ) : (
                      <User className="inline mr-1 h-4 w-4" />
                    )}
                    {sponsor.gender ? sponsor.gender.charAt(0).toUpperCase() + sponsor.gender.slice(1) : "N/A"}
                  </span>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center">
                    <div className="bg-[#f0f7ff] p-2 rounded-lg mr-3">
                      <Phone className="text-[#032990]" size={20} />
                    </div>
                    <div>
                      <p className="text-sm text-[#6b7280]">Phone</p>
                      <p className="font-semibold">{sponsor.phone_numbers?.primary || "N/A"}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <div className="bg-[#f0f7ff] p-2 rounded-lg mr-3">
                      <Mail className="text-[#032990]" size={20} />
                    </div>
                    <div>
                      <p className="text-sm text-[#6b7280]">Email</p>
                      <p className="font-semibold">{sponsor.email || "N/A"}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <div className="bg-[#f0f7ff] p-2 rounded-lg mr-3">
                      <Calendar className="text-[#032990]" size={20} />
                    </div>
                    <div>
                      <p className="text-sm text-[#6b7280]">Date of Birth</p>
                      <p className="font-semibold">{formatDate(sponsor.date_of_birth)}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <div className="bg-[#f0f7ff] p-2 rounded-lg mr-3">
                      <Calendar className="text-[#032990]" size={20} />
                    </div>
                    <div>
                      <p className="text-sm text-[#6b7280]">Status</p>
                      <p className="font-semibold capitalize">{sponsor.status}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <div className="bg-[#f0f7ff] p-2 rounded-lg mr-3">
                      <User className="text-[#032990]" size={20} />
                    </div>
                    <div>
                      <p className="text-sm text-[#6b7280]">Sponsor ID</p>
                      <p className="font-semibold">{sponsor.cluster_id}-{sponsor.specific_id}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Address & Emergency Contact Card */}
            <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-200">
              <h3 className="text-xl font-bold text-[#032990] mb-4 flex items-center">
                <MapPin className="mr-2 text-[#EAA108]" size={22} />
                Address & Emergency Contact
              </h3>
              
              <div className="space-y-4">
                <div>
                  <h4 className="text-lg font-semibold text-[#032990] mb-3 border-b pb-2">Address Information</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-[#6b7280]">Country:</span>
                      <span className="font-medium">{sponsor.address?.country || "N/A"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#6b7280]">Region:</span>
                      <span className="font-medium">{sponsor.address?.region || "N/A"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#6b7280]">Sub Region:</span>
                      <span className="font-medium">{sponsor.address?.sub_region || "N/A"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#6b7280]">Woreda:</span>
                      <span className="font-medium">{sponsor.address?.woreda || "N/A"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#6b7280]">House Number:</span>
                      <span className="font-medium">{sponsor.address?.house_number || "N/A"}</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-lg font-semibold text-[#032990] mb-3 border-b pb-2">Emergency Contact</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-[#6b7280]">Contact Name:</span>
                      <span className="font-medium">{sponsor.emergency_contact_name || "N/A"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#6b7280]">Contact Phone:</span>
                      <span className="font-medium">{sponsor.emergency_contact_phone || "N/A"}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Right Column - Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Financial Information */}
            <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-200">
              <h3 className="text-xl font-bold text-[#032990] mb-6 flex items-center">
                <DollarSign className="mr-2 text-[#EAA108]" size={22} />
                Financial Information
              </h3>
              
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-1 space-y-4">
                  <div className="flex justify-between">
                    <span className="text-[#6b7280]">Agreed Monthly Payment:</span>
                    <span className="font-medium">{formatCurrency(sponsor.monthly_amount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#6b7280]">Starting Date:</span>
                    <span className="font-medium">{formatDate(sponsor.starting_date)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#6b7280]">Beneficiary Count:</span>
                    <span className="font-medium">{sponsor.active_beneficiaries} beneficiaries</span>
                  </div>
                </div>
                
                <div className="hidden md:block border-l-2 border-[#032990] mx-2"></div>
                
                <div className="flex-1 space-y-4">
                  <div className="flex justify-between">
                    <span className="text-[#6b7280]">Total Contributions:</span>
                    <span className="font-medium">{formatCurrency(sponsor.monthly_amount * 12)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#6b7280]">Last Payment:</span>
                    <span className="font-medium">May 5, 2024</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#6b7280]">Next Payment Due:</span>
                    <span className="font-medium">June 5, 2024</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Beneficiaries Table */}
            <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-200">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-[#032990] flex items-center">
                  <User className="mr-2 text-[#EAA108]" size={22} />
                  Sponsored Beneficiaries ({sponsor.active_beneficiaries})
                </h3>
                
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    placeholder="Search by name or phone..."
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#032990] focus:border-transparent"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 text-left text-sm text-[#6b7280]">
                      <th 
                        className="px-4 py-3 font-medium cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSort('type')}
                      >
                        Type {sortConfig.key === 'type' && (sortConfig.direction === 'ascending' ? '↑' : '↓')}
                      </th>
                      <th 
                        className="px-4 py-3 font-medium cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSort('full_name')}
                      >
                        Beneficiary Name {sortConfig.key === 'full_name' && (sortConfig.direction === 'ascending' ? '↑' : '↓')}
                      </th>
                      <th 
                        className="px-4 py-3 font-medium cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSort('guardian_name')}
                      >
                        Guardian Name {sortConfig.key === 'guardian_name' && (sortConfig.direction === 'ascending' ? '↑' : '↓')}
                      </th>
                      <th 
                        className="px-4 py-3 font-medium cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSort('age')}
                      >
                        Age {sortConfig.key === 'age' && (sortConfig.direction === 'ascending' ? '↑' : '↓')}
                      </th>
                      <th 
                        className="px-4 py-3 font-medium cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSort('phone')}
                      >
                        Phone {sortConfig.key === 'phone' && (sortConfig.direction === 'ascending' ? '↑' : '↓')}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {sortedBeneficiaries.length > 0 ? (
                      sortedBeneficiaries.map((beneficiary) => (
                        <tr 
                          key={beneficiary.id} 
                          className="hover:bg-gray-50 cursor-pointer"
                          onClick={() => handleBeneficiaryClick(beneficiary)}
                        >
                                                    <td className="px-4 py-3">
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              beneficiary.type === "child" 
                                ? "bg-blue-100 text-blue-800" 
                                : "bg-yellow-100 text-yellow-800"
                            }`}>
                              {beneficiary.type === "child" ? "Child" : "Elderly"}
                            </span>
                          </td>
                          <td className="px-4 py-3 font-medium">{beneficiary.full_name}</td>
                          <td className="px-4 py-3">{beneficiary.guardian_name || "-"}</td>
                          <td className="px-4 py-3">{beneficiary.age || "-"}</td>
                          <td className="px-4 py-3">{beneficiary.phone || "-"}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="px-4 py-8 text-center text-gray-500">
                          {beneficiaries.length === 0 
                            ? "No beneficiaries linked to this sponsor yet." 
                            : "No beneficiaries found matching your search."}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            
            {/* Documents Section */}
            <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-200">
              <h3 className="text-xl font-bold text-[#032990] mb-6 flex items-center">
                <FileText className="mr-2 text-[#EAA108]" size={22} />
                Documents
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <FileText className="text-[#032990] mr-3" size={20} />
                    <div>
                      <p className="font-medium">Consent Document</p>
                      <p className="text-sm text-[#6b7280]">Signed agreement form</p>
                    </div>
                  </div>
                  {sponsor.consent_document_url ? (
                    <a 
                      href={sponsor.consent_document_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center px-3 py-2 bg-[#032990] text-white rounded-lg text-sm font-medium hover:bg-[#0d3ba8] transition-colors"
                    >
                      <Download className="mr-1" size={16} />
                      Download
                    </a>
                  ) : (
                    <span className="text-sm text-gray-500">Not available</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Link Beneficiaries Modal */}
        {showLinkModal && (
          <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-5xl max-h-[90vh] overflow-hidden">
              <div className="flex items-center justify-between p-6 border-b">
                <h2 className="text-2xl font-bold text-[#032990]">Link Beneficiaries to Sponsor</h2>
                <button onClick={() => setShowLinkModal(false)} className="text-gray-400 hover:text-gray-600">
                  <X size={24} />
                </button>
              </div>
              
              <div className="p-6 overflow-y-auto max-h-[60vh]">
                {linkSuccess ? (
                  <div className="text-center py-8">
                    <div className="bg-green-100 text-green-800 p-4 rounded-lg mb-4">
                      <Check className="inline mr-2" size={20} />
                      Beneficiaries successfully linked to sponsor!
                    </div>
                    <p className="text-gray-600">The page will refresh shortly...</p>
                  </div>
                ) : (
                  <>
                    <div className="mb-6">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                        <input
                          type="text"
                          placeholder="Search by beneficiary name, guardian name, or phone number..."
                          className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-[#032990] focus:border-transparent"
                          value={availableSearch}
                          onChange={(e) => setAvailableSearch(e.target.value)}
                        />
                      </div>
                      <p className="text-sm text-gray-500 mt-2">
                        {filteredAvailableBeneficiaries.length} beneficiaries found needing sponsorship
                      </p>
                    </div>
                    
                    <div className="overflow-y-auto max-h-[40vh]">
                      <table className="w-full">
                        <thead>
                          <tr className="bg-gray-50 text-left text-sm text-gray-500">
                            <th className="px-4 py-2 font-medium">Select</th>
                            <th className="px-4 py-2 font-medium">Name</th>
                            <th className="px-4 py-2 font-medium">Guardian</th>
                            <th className="px-4 py-2 font-medium">Type</th>
                            <th className="px-4 py-2 font-medium">Age</th>
                            <th className="px-4 py-2 font-medium">Phone</th>
                            <th className="px-4 py-2 font-medium">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {filteredAvailableBeneficiaries.length > 0 ? (
                            filteredAvailableBeneficiaries.map((beneficiary) => (
                              <tr key={beneficiary.id} className={`hover:bg-gray-50 ${
                                beneficiary.status === "pending_reassignment" ? "bg-red-50" : ""
                              }`}>
                                <td className="px-4 py-3">
                                  <input
                                    type="checkbox"
                                    checked={selectedBeneficiaries.includes(beneficiary.id)}
                                    onChange={() => toggleBeneficiarySelection(beneficiary.id)}
                                    className="h-4 w-4 text-[#032990] focus:ring-[#032990] border-gray-300 rounded"
                                  />
                                </td>
                                <td className="px-4 py-3 font-medium">{beneficiary.full_name}</td>
                                <td className="px-4 py-3">{beneficiary.guardian_name || "-"}</td>
                                <td className="px-4 py-3">
                                  <span className={`px-2 py-1 rounded-full text-xs ${
                                    beneficiary.type === "child" 
                                      ? "bg-blue-100 text-blue-800" 
                                      : "bg-yellow-100 text-yellow-800"
                                  }`}>
                                    {beneficiary.type === "child" ? "Child" : "Elderly"}
                                  </span>
                                </td>
                                <td className="px-4 py-3">{beneficiary.age || "-"}</td>
                                <td className="px-4 py-3">{beneficiary.phone || "-"}</td>
                                <td className="px-4 py-3">
                                  <span className={`px-2 py-1 rounded-full text-xs ${
                                    beneficiary.status === "pending_reassignment" 
                                      ? "bg-red-100 text-red-800" 
                                      : "bg-yellow-100 text-yellow-800"
                                  }`}>
                                    {beneficiary.status === "pending_reassignment" 
                                      ? "Needs Reassigning" 
                                      : "Waiting List"}
                                  </span>
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan="7" className="px-4 py-8 text-center text-gray-500">
                                No beneficiaries found needing sponsorship.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </>
                )}
              </div>
              
              <div className="flex justify-end gap-4 p-6 border-t">
                <button
                  onClick={() => setShowLinkModal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmLinking}
                  disabled={selectedBeneficiaries.length === 0 || refreshing}
                  className={`px-4 py-2 bg-[#EAA108] text-white rounded-lg hover:bg-[#d19108] transition-colors ${
                    selectedBeneficiaries.length === 0 || refreshing ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  {refreshing ? "Linking..." : `Link ${selectedBeneficiaries.length} Beneficiaries`}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Sponsor Modal */}
        {showEditModal && editForm && (
          <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b">
                <h2 className="text-2xl font-bold text-[#032990]">Edit Sponsor Information</h2>
                <button onClick={() => setShowEditModal(false)} className="text-gray-400 hover:text-gray-600">
                  <X size={24} />
                </button>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                    <input
                      type="text"
                      name="full_name"
                      value={editForm.full_name || ""}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#032990] focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={editForm.email || ""}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#032990] focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                    <input
                      type="text"
                      name="phone"
                      value={editForm.phone_numbers?.primary || ""}
                      onChange={(e) => setEditForm({
                        ...editForm,
                        phone_numbers: { primary: e.target.value }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#032990] focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Monthly Amount</label>
                    <input
                      type="number"
                      name="monthly_amount"
                      value={editForm.monthly_amount || ""}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#032990] focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Emergency Contact Name</label>
                    <input
                      type="text"
                      name="emergency_contact_name"
                      value={editForm.emergency_contact_name || ""}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#032990] focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Emergency Contact Phone</label>
                    <input
                      type="text"
                      name="emergency_contact_phone"
                      value={editForm.emergency_contact_phone || ""}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#032990] focus:border-transparent"
                    />
                  </div>
                </div>
                
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-[#032990] mb-3">Address Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                      <input
                        type="text"
                        name="country"
                        value={editForm.address?.country || ""}
                        onChange={handleAddressChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#032990] focus:border-transparent"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Region</label>
                      <input
                        type="text"
                        name="region"
                        value={editForm.address?.region || ""}
                        onChange={handleAddressChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#032990] focus:border-transparent"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Sub Region</label>
                      <input
                        type="text"
                        name="sub_region"
                        value={editForm.address?.sub_region || ""}
                        onChange={handleAddressChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#032990] focus:border-transparent"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Woreda</label>
                      <input
                        type="text"
                        name="woreda"
                        value={editForm.address?.woreda || ""}
                        onChange={handleAddressChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#032990] focus:border-transparent"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">House Number</label>
                      <input
                        type="text"
                        name="house_number"
                        value={editForm.address?.house_number || ""}
                        onChange={handleAddressChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#032990] focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end gap-4 p-6 border-t">
                <button
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEdits}
                  className="px-4 py-2 bg-[#032990] text-white rounded-lg hover:bg-[#0d3ba8] transition-colors"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Deactivate Sponsor Modal */}
        {showDeactivateModal && (
          <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl">
              <div className="flex items-center justify-between p-6 border-b">
                <h2 className="text-2xl font-bold text-[#032990]">Deactivate Sponsor</h2>
                <button onClick={() => setShowDeactivateModal(false)} className="text-gray-400 hover:text-gray-600">
                  <X size={24} />
                </button>
              </div>
              
              <div className="p-6">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                  <div className="flex items-start">
                    <AlertTriangle className="text-red-600 mr-3 mt-0.5" size={20} />
                    <div>
                      <h3 className="font-medium text-red-800">Warning: This action cannot be undone</h3>
                      <p className="text-red-700 text-sm mt-1">
                        Deactivating this sponsor will also move all their beneficiaries to "needs reassigning" status.
                      </p>
                    </div>
                  </div>
                </div>
                
                <p className="text-gray-600 mb-4">
                  Are you sure you want to deactivate {sponsor.full_name} ({sponsor.cluster_id}-{sponsor.specific_id})?
                  This sponsor currently has {beneficiaries.length} active beneficiaries.
                </p>
                
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-yellow-800 text-sm">
                    <strong>Note:</strong> You can reactivate this sponsor later from the inactive sponsors list.
                  </p>
                </div>
              </div>
              
              <div className="flex justify-end gap-4 p-6 border-t">
                <button
                  onClick={() => setShowDeactivateModal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeactivate}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Yes, Deactivate Sponsor
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SponsorDetails;