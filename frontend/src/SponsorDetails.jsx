import React, { useState, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, User, Building, MapPin, Phone, Mail, Calendar, DollarSign, Shield, FileText, Download, Search, Plus, X, Edit3, Link, AlertTriangle } from "lucide-react";

const SponsorDetails = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get sponsor data from navigation state or use default data
  const [sponsor, setSponsor] = useState(location.state?.sponsor || {
    sponsor_id: "01-0004",
    full_name: "Alemayehu Tadesse",
    type: "Private",
    residency: "Diaspora",
    phone_number: "+14165550123",
    beneficiary_count: "1 child and 1 elder",
    cluster_id: "01",
    specific_id: "0004",
    date_of_birth: "1970-04-20",
    gender: "male",
    profile_picture_url: "",
    starting_date: "2023-01-10",
    agreed_monthly_payment: 800.00,
    emergency_contact_name: "Meseret Alemayehu",
    emergency_contact_phone: "+14165550123",
    status: "active",
    is_diaspora: true,
    address_id: 6,
    consent_document_url: "",
    email: "alemayehu.tadesse@example.com",
    address: {
      city: "New York",
      country: "USA",
      state: "NY",
      street: "123 Main St",
      zip_code: "10001"
    }
  });

  // Sample beneficiaries data
  const [beneficiaries, setBeneficiaries] = useState([
    {
      id: "B-001",
      name: "Tigist Lemma",
      type: "Elder",
      age: 72,
      join_date: "2023-02-15",
      status: "Active",
      last_payment: "2024-05-01",
      next_payment: "2024-06-01",
      phone: "+251911223344",
      guardian: "-",
      needs: "Medical care, Food support"
    },
    {
      id: "B-002",
      name: "Meron Abebe",
      type: "Child",
      age: 9,
      join_date: "2023-03-10",
      status: "Active",
      last_payment: "2024-05-05",
      next_payment: "2024-06-05",
      phone: "+251922334455",
      guardian: "Kebede Abebe",
      needs: "School supplies, Nutrition"
    }
  ]);

  // Sample waiting list data
  const [waitingList, setWaitingList] = useState([
    {
      id: "W-001",
      name: "Solomon Girma",
      type: "Child",
      age: 7,
      needs_reassigning: true,
      phone: "+251933445566",
      guardian: "Girma Lemma",
      unassigned: false,
      waiting_since: "2024-04-15",
      needs: "School fees, Uniform"
    },
    {
      id: "W-002",
      name: "Worknesh Demisse",
      type: "Child",
      age: 8,
      needs_reassigning: false,
      phone: "+251944556677",
      guardian: "Demisse Haile",
      unassigned: true,
      waiting_since: "2024-05-20",
      needs: "Food, Clothing"
    },
    {
      id: "W-003",
      name: "Abebe Bikila",
      type: "Elder",
      age: 75,
      needs_reassigning: true,
      phone: "+251955667788",
      guardian: "-",
      unassigned: false,
      waiting_since: "2024-03-10",
      needs: "Medical care, Housing"
    },
    {
      id: "W-004",
      name: "Selamawit Teshome",
      type: "Child",
      age: 10,
      needs_reassigning: false,
      phone: "+251966778899",
      guardian: "Teshome Kebede",
      unassigned: true,
      waiting_since: "2024-06-01",
      needs: "School supplies, Tutoring"
    }
  ]);

  const [searchTerm, setSearchTerm] = useState("");
  const [waitingListSearch, setWaitingListSearch] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [selectedBeneficiaries, setSelectedBeneficiaries] = useState([]);
  const [linkSuccess, setLinkSuccess] = useState(false);
  const [editForm, setEditForm] = useState(sponsor);

  // Handle back button click
  const handleBack = () => {
    navigate("/sponsors");
  };

  // Handle beneficiary row click
  const handleBeneficiaryClick = (beneficiaryId) => {
    navigate(`/specific_beneficiary/${beneficiaryId}`);
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
  const filteredBeneficiaries = useMemo(() => {
    return beneficiaries.filter(beneficiary =>
      beneficiary.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      beneficiary.phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
      beneficiary.guardian.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [beneficiaries, searchTerm]);

  // Sort beneficiaries
  const sortedBeneficiaries = useMemo(() => {
    if (!sortConfig.key) return filteredBeneficiaries;
    
    return [...filteredBeneficiaries].sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === 'ascending' ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === 'ascending' ? 1 : -1;
      }
      return 0;
    });
  }, [filteredBeneficiaries, sortConfig]);

  // Filter waiting list based on search term
  const filteredWaitingList = useMemo(() => {
    return waitingList.filter(beneficiary =>
      beneficiary.name.toLowerCase().includes(waitingListSearch.toLowerCase()) ||
      beneficiary.phone.toLowerCase().includes(waitingListSearch.toLowerCase()) ||
      beneficiary.guardian.toLowerCase().includes(waitingListSearch.toLowerCase())
    );
  }, [waitingList, waitingListSearch]);

  // Toggle beneficiary selection in waiting list
  const toggleBeneficiarySelection = (beneficiaryId) => {
    if (selectedBeneficiaries.includes(beneficiaryId)) {
      setSelectedBeneficiaries(selectedBeneficiaries.filter(id => id !== beneficiaryId));
    } else {
      setSelectedBeneficiaries([...selectedBeneficiaries, beneficiaryId]);
    }
  };

  // Handle confirm linking
  const handleConfirmLinking = () => {
    // In a real app, this would make API calls to link the beneficiaries
    console.log("Linking beneficiaries:", selectedBeneficiaries);
    
    // Show success message
    setLinkSuccess(true);
    
    // Reset after 3 seconds
    setTimeout(() => {
      setLinkSuccess(false);
      setShowLinkModal(false);
      setSelectedBeneficiaries([]);
    }, 3000);
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
  const handleSaveEdits = () => {
    setSponsor(editForm);
    setShowEditModal(false);
    // In a real app, you would also save to the database here
  };

  // Handle deactivate sponsor
  const handleDeactivate = () => {
    setSponsor({
      ...sponsor,
      status: "inactive"
    });
    
    // In a real app, you would update beneficiaries status to "needs reassigning"
    setShowDeactivateModal(false);
    
    // Show success message
    setTimeout(() => {
      alert("Sponsor has been deactivated. Their beneficiaries have been moved to 'needs reassigning' status.");
    }, 300);
  };

  return (
    <div className="font-poppins bg-[#f5f7fa] p-4 sm:p-6 lg:p-8 text-[#032990] min-h-screen">
      <div className="max-w-6xl mx-auto bg-white p-4 sm:p-6 lg:p-8 rounded-xl shadow-lg">
        {/* Header */}
        <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
          <div>
            <h1 className="text-[#032990] font-bold text-3xl">Sponsor Details</h1>
            <p className="text-[#6b7280] mt-1">Comprehensive information about sponsor {sponsor.sponsor_id}</p>
          </div>
          <div className="flex gap-3">
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
                onClick={() => setSponsor({...sponsor, status: "active"})}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg shadow-md transition-all duration-300 hover:bg-green-700"
              >
                <AlertTriangle className="w-5 h-5 mr-2" />
                Activate
              </button>
            )}
            <button
              onClick={handleBack}
              className="flex items-center justify-center w-12 h-12 bg-white text-[#032990] rounded-lg shadow-md transition-all duration-300 border border-[#f0f3ff] hover:bg-[#032990] hover:text-white group"
            >
              <ArrowLeft className="w-6 h-6 transition-colors duration-300 group-hover:stroke-white" />
            </button>
          </div>
        </div>

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
                    sponsor.type === "Private" 
                      ? "bg-blue-100 text-blue-800" 
                      : "bg-purple-100 text-purple-800"
                  }`}>
                    {sponsor.type === "Private" ? (
                      <User className="inline mr-1 h-4 w-4" />
                    ) : (
                      <Building className="inline mr-1 h-4 w-4" />
                    )}
                    {sponsor.type}
                  </span>
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium mr-2 ${
                    sponsor.residency === "Local" 
                      ? "bg-green-100 text-green-800" 
                      : "bg-yellow-100 text-yellow-800"
                  }`}>
                    <MapPin className="inline mr-1 h-4 w-4" />
                    {sponsor.residency}
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
                      <p className="font-semibold">{sponsor.phone_number}</p>
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
                      <p className="font-semibold">{sponsor.sponsor_id}</p>
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
                      <span className="text-[#6b7280]">Street:</span>
                      <span className="font-medium">{sponsor.address?.street || "N/A"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#6b7280]">City:</span>
                      <span className="font-medium">{sponsor.address?.city || "N/A"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#6b7280]">State/Region:</span>
                      <span className="font-medium">{sponsor.address?.state || "N/A"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#6b7280]">Country:</span>
                      <span className="font-medium">{sponsor.address?.country || "N/A"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#6b7280]">ZIP Code:</span>
                      <span className="font-medium">{sponsor.address?.zip_code || "N/A"}</span>
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
                    <span className="font-medium">{formatCurrency(sponsor.agreed_monthly_payment)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#6b7280]">Starting Date:</span>
                    <span className="font-medium">{formatDate(sponsor.starting_date)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#6b7280]">Beneficiary Count:</span>
                    <span className="font-medium">{sponsor.beneficiary_count}</span>
                  </div>
                </div>
                
                <div className="hidden md:block border-l-2 border-[#032990] mx-2"></div>
                
                <div className="flex-1 space-y-4">
                  <div className="flex justify-between">
                    <span className="text-[#6b7280]">Total Contributions:</span>
                    <span className="font-medium">{formatCurrency(11200)}</span>
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
                  Sponsored Beneficiaries
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
                        onClick={() => handleSort('name')}
                      >
                        Beneficiary Name {sortConfig.key === 'name' && (sortConfig.direction === 'ascending' ? '↑' : '↓')}
                      </th>
                      <th 
                        className="px-4 py-3 font-medium cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSort('guardian')}
                      >
                        Guardian Name {sortConfig.key === 'guardian' && (sortConfig.direction === 'ascending' ? '↑' : '↓')}
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
                      <th 
                        className="px-4 py-3 font-medium cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSort('join_date')}
                      >
                        Join Date {sortConfig.key === 'join_date' && (sortConfig.direction === 'ascending' ? '↑' : '↓')}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {sortedBeneficiaries.length > 0 ? (
                      sortedBeneficiaries.map((beneficiary) => (
                        <tr 
                          key={beneficiary.id} 
                          className="hover:bg-gray-50 cursor-pointer"
                          onClick={() => handleBeneficiaryClick(beneficiary.id)}
                        >
                          <td className="px-4 py-3">
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              beneficiary.type === "Child" 
                                ? "bg-blue-100 text-blue-800" 
                                : "bg-yellow-100 text-yellow-800"
                            }`}>
                              {beneficiary.type}
                            </span>
                          </td>
                          <td className="px-4 py-3 font-medium">{beneficiary.name}</td>
                          <td className="px-4 py-3">{beneficiary.guardian}</td>
                          <td className="px-4 py-3">{beneficiary.age}</td>
                          <td className="px-4 py-3">{beneficiary.phone}</td>
                          <td className="px-4 py-3">{formatDate(beneficiary.join_date)}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" className="px-4 py-8 text-center text-gray-500">
                          No beneficiaries found matching your search.
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
      </div>

      {/* Link Beneficiaries Modal */}
      {showLinkModal && (
        <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-5xl max-h-[90vh] overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-[#032990]">Link Beneficiaries to {sponsor.full_name}</h2>
              <button 
                onClick={() => setShowLinkModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
              {linkSuccess ? (
                <div className="text-center py-8">
                  <div className="text-green-500 text-5xl mb-4">✓</div>
                  <h3 className="text-xl font-bold text-green-700 mb-2">Success!</h3>
                  <p className="text-gray-600">Beneficiaries have been successfully linked to the sponsor.</p>
                </div>
              ) : (
                <>
                  <div className="mb-6">
                    <p className="text-gray-600 mb-4">Select beneficiaries from the waiting list to link to this sponsor. Those marked as "Needs Reassigning" will be prioritized.</p>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                      <input
                        type="text"
                        placeholder="Search by name, guardian, phone, or needs..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#032990] focus:border-transparent"
                        value={waitingListSearch}
                        onChange={(e) => setWaitingListSearch(e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold text-[#032990] mb-2">Needs Reassigning ({filteredWaitingList.filter(b => b.needs_reassigning).length})</h3>
                    <div className="space-y-2">
                      {filteredWaitingList
                        .filter(b => b.needs_reassigning)
                        .map(beneficiary => (
                          <div 
                            key={beneficiary.id} 
                            className={`p-4 rounded-lg border flex items-start justify-between cursor-pointer ${
                              selectedBeneficiaries.includes(beneficiary.id) 
                                ? 'border-[#032990] bg-blue-50' 
                                : 'border-gray-200 hover:bg-gray-50'
                            } ${beneficiary.needs_reassigning ? 'bg-red-50 border-red-200' : ''}`}
                            onClick={() => toggleBeneficiarySelection(beneficiary.id)}
                          >
                            <div className="flex-1">
                              <div className="font-medium text-lg">{beneficiary.name}</div>
                              <div className="text-sm text-gray-600 mt-1">
                                <span className="inline-block px-2 py-1 rounded-full bg-blue-100 text-blue-800 text-xs mr-2">
                                  {beneficiary.type}
                                </span>
                                {beneficiary.age} years • {beneficiary.guardian} • {beneficiary.phone}
                              </div>
                              <div className="text-sm text-gray-700 mt-2">
                                <span className="font-medium">Needs:</span> {beneficiary.needs}
                              </div>
                              <div className="text-xs text-gray-500 mt-1">
                                Waiting since: {formatDate(beneficiary.waiting_since)}
                              </div>
                            </div>
                            <input 
                              type="checkbox" 
                              checked={selectedBeneficiaries.includes(beneficiary.id)} 
                              onChange={() => toggleBeneficiarySelection(beneficiary.id)}
                              className="h-5 w-5 text-[#032990] focus:ring-[#032990] border-gray-300 rounded mt-2"
                            />
                          </div>
                        ))
                      }
                      
                      {filteredWaitingList.filter(b => b.needs_reassigning).length === 0 && (
                        <p className="text-gray-500 text-center py-3">No beneficiaries needing reassignment</p>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold text-[#032990] mb-2">Unassigned Beneficiaries ({filteredWaitingList.filter(b => b.unassigned && !b.needs_reassigning).length})</h3>
                    <div className="space-y-2">
                      {filteredWaitingList
                        .filter(b => b.unassigned && !b.needs_reassigning)
                        .map(beneficiary => (
                          <div 
                            key={beneficiary.id} 
                            className={`p-4 rounded-lg border flex items-start justify-between cursor-pointer ${
                              selectedBeneficiaries.includes(beneficiary.id) 
                                ? 'border-[#032990] bg-blue-50' 
                                : 'border-gray-200 hover:bg-gray-50'
                            }`}
                            onClick={() => toggleBeneficiarySelection(beneficiary.id)}
                          >
                            <div className="flex-1">
                              <div className="font-medium text-lg">{beneficiary.name}</div>
                              <div className="text-sm text-gray-600 mt-1">
                                <span className="inline-block px-2 py-1 rounded-full bg-blue-100 text-blue-800 text-xs mr-2">
                                  {beneficiary.type}
                                </span>
                                {beneficiary.age} years • {beneficiary.guardian} • {beneficiary.phone}
                              </div>
                              <div className="text-sm text-gray-700 mt-2">
                                <span className="font-medium">Needs:</span> {beneficiary.needs}
                              </div>
                              <div className="text-xs text-gray-500 mt-1">
                                Waiting since: {formatDate(beneficiary.waiting_since)}
                              </div>
                            </div>
                            <input 
                              type="checkbox" 
                              checked={selectedBeneficiaries.includes(beneficiary.id)} 
                              onChange={() => toggleBeneficiarySelection(beneficiary.id)}
                              className="h-5 w-5 text-[#032990] focus:ring-[#032990] border-gray-300 rounded mt-2"
                            />
                          </div>
                        ))
                      }
                      
                      {filteredWaitingList.filter(b => b.unassigned && !b.needs_reassigning).length === 0 && (
                        <p className="text-gray-500 text-center py-3">No unassigned beneficiaries</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="mt-6 flex justify-end">
                    <button
                      onClick={handleConfirmLinking}
                      disabled={selectedBeneficiaries.length === 0}
                      className={`px-6 py-2 rounded-lg font-medium ${
                        selectedBeneficiaries.length === 0
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : 'bg-[#032990] text-white hover:bg-[#0d3ba8]'
                      }`}
                    >
                      Confirm Linking ({selectedBeneficiaries.length})
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Edit Sponsor Modal */}
      {showEditModal && (
        <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-[#032990]">Edit Sponsor Information</h2>
              <button 
                onClick={() => setShowEditModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-[#032990] mb-4">Personal Information</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                      <input
                        type="text"
                        name="full_name"
                        value={editForm.full_name}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#032990] focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                      <input
                        type="email"
                        name="email"
                        value={editForm.email}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#032990] focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                      <input
                        type="text"
                        name="phone_number"
                        value={editForm.phone_number}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#032990] focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                      <input
                        type="date"
                        name="date_of_birth"
                        value={editForm.date_of_birth}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#032990] focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                      <select
                        name="gender"
                        value={editForm.gender}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#032990] focus:border-transparent"
                      >
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-[#032990] mb-4">Sponsorship Details</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Agreed Monthly Payment ($)</label>
                      <input
                        type="number"
                        name="agreed_monthly_payment"
                        value={editForm.agreed_monthly_payment}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#032990] focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Starting Date</label>
                      <input
                        type="date"
                        name="starting_date"
                        value={editForm.starting_date}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#032990] focus:border-transparent"
                      />
                    </div>
                  </div>
                  
                  <h3 className="text-lg font-semibold text-[#032990] mb-4 mt-6">Address Information</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Street</label>
                      <input
                        type="text"
                        name="street"
                        value={editForm.address.street}
                        onChange={handleAddressChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#032990] focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                      <input
                        type="text"
                        name="city"
                        value={editForm.address.city}
                        onChange={handleAddressChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#032990] focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">State/Region</label>
                      <input
                        type="text"
                        name="state"
                        value={editForm.address.state}
                        onChange={handleAddressChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#032990] focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">ZIP Code</label>
                      <input
                        type="text"
                        name="zip_code"
                        value={editForm.address.zip_code}
                        onChange={handleAddressChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#032990] focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEdits}
                  className="px-4 py-2 bg-[#032990] text-white rounded-lg hover:bg-[#0d3ba8]"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Deactivate Sponsor Modal */}
      {showDeactivateModal && (
        <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-[#032990]">Deactivate Sponsor</h2>
              <button 
                onClick={() => setShowDeactivateModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="p-6">
              <div className="flex items-start mb-6">
                <div className="bg-red-100 p-3 rounded-full mr-4">
                  <AlertTriangle className="text-red-600" size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-red-700 mb-2">Warning: This action cannot be undone</h3>
                  <p className="text-gray-600">
                    Deactivating this sponsor will change their status to inactive and move all their current beneficiaries to a "needs reassigning" state. 
                    These beneficiaries will need to be linked to a new sponsor to continue receiving support.
                  </p>
                </div>
              </div>
              
              <div className="bg-red-50 p-4 rounded-lg mb-6">
                <h4 className="font-semibold text-red-800 mb-2">Affected Beneficiaries:</h4>
                <ul className="list-disc list-inside text-red-700">
                  {beneficiaries.map(b => (
                    <li key={b.id}>{b.name} ({b.type})</li>
                  ))}
                </ul>
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowDeactivateModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeactivate}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Confirm Deactivation
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SponsorDetails;
