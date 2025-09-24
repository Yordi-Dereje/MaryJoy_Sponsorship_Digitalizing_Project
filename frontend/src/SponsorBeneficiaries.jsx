import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Search, ChevronUp, ChevronDown, User } from "lucide-react";

const SponsorBeneficiaries = () => {
  const navigate = useNavigate();
  const { cluster_id, specific_id } = useParams();
  
  const [beneficiaries, setBeneficiaries] = useState([]);
  const [filteredBeneficiaries, setFilteredBeneficiaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: 'full_name', direction: 'ascending' });

  // Fetch beneficiaries data from API
  useEffect(() => {
    const fetchBeneficiaries = async () => {
      try {
        setLoading(true);
        setError(null);

        let finalClusterId = cluster_id;
        let finalSpecificId = specific_id;
        
        // If no URL parameters, try to get from localStorage
        if (!cluster_id || !specific_id) {
          const userData = localStorage.getItem('user');
          if (userData) {
            const user = JSON.parse(userData);
            finalClusterId = user.cluster_id;
            finalSpecificId = user.specific_id;
          }
        }

        if (!finalClusterId || !finalSpecificId) {
          throw new Error("Sponsor identification not found");
        }

        console.log(`🔍 Fetching beneficiaries for sponsor: ${finalClusterId}-${finalSpecificId}`);
        
        const apiUrl = `http://localhost:5000/api/sponsors/${finalClusterId}/${finalSpecificId}/beneficiaries`;
        console.log('📋 API URL:', apiUrl);
        
        const response = await fetch(apiUrl);
        
        console.log('📡 Response status:', response.status);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('❌ API Error:', errorText);
          throw new Error(`Failed to fetch beneficiaries: ${response.status}`);
        }

        const data = await response.json();
        console.log('✅ Full API Response:', data);
        
        // Handle different response structures - FIXED VERSION
        let beneficiariesData = [];
        
        if (data.success && data.beneficiaries) {
          // Structure with success flag and beneficiaries array
          beneficiariesData = data.beneficiaries;
        } else if (data.beneficiaries && Array.isArray(data.beneficiaries)) {
          // Direct beneficiaries array in data object
          beneficiariesData = data.beneficiaries;
        } else if (Array.isArray(data)) {
          // Response is the array itself
          beneficiariesData = data;
        } else {
          console.warn('⚠️ Unexpected response structure:', data);
          throw new Error('Unexpected API response format');
        }

        // Transform the data to match the expected structure
        const transformedBeneficiaries = beneficiariesData.map(beneficiary => {
          console.log('📊 Raw beneficiary data:', beneficiary);
          
          return {
            id: beneficiary.id,
            // Use the correct field names from your API response
            type: beneficiary.type || 'child', // Default to 'child' if not specified
            name: beneficiary.name || beneficiary.full_name || 'Unknown',
            full_name: beneficiary.full_name || beneficiary.name || 'Unknown',
            gender: beneficiary.gender || 'Unknown',
            birthDate: beneficiary.birthDate || beneficiary.date_of_birth,
            age: beneficiary.age || 0,
            status: beneficiary.status || 'active',
            guardian: beneficiary.guardian || beneficiary.guardian_name || 'N/A',
            guardian_name: beneficiary.guardian_name || beneficiary.guardian || 'N/A',
            phone: beneficiary.phone || beneficiary.guardian_phone || 'N/A'
          };
        });

        console.log('🔄 Transformed beneficiaries:', transformedBeneficiaries);
        console.log(`✅ Loaded ${transformedBeneficiaries.length} beneficiaries`);
        
        setBeneficiaries(transformedBeneficiaries);
        setFilteredBeneficiaries(transformedBeneficiaries);

      } catch (err) {
        console.error("❌ Error fetching beneficiaries:", err);
        setError(err.message);
        
        // Fallback to dummy data for testing
        const dummyData = getDummyData();
        setBeneficiaries(dummyData);
        setFilteredBeneficiaries(dummyData);
        console.log('🔄 Using fallback dummy data');
      } finally {
        setLoading(false);
      }
    };

    fetchBeneficiaries();
  }, [cluster_id, specific_id]);

  // Fallback dummy data function
  const getDummyData = () => {
    const calculateAge = (birthDate) => {
      const today = new Date();
      const birth = new Date(birthDate);
      let age = today.getFullYear() - birth.getFullYear();
      const monthDiff = today.getMonth() - birth.getMonth();
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age--;
      }
      
      return age;
    };

    return [
      {
        id: 8,
        type: "child",
        name: "Bereket Tadesse",
        full_name: "Bereket Tadesse",
        gender: "male",
        birthDate: "2016-04-22",
        status: "active",
        age: calculateAge("2016-04-22"),
        guardian: "Solomon Tadesse",
        guardian_name: "Solomon Tadesse",
        phone: "+251911200008"
      },
      {
        id: 10,
        type: "child",
        name: "Selam Tadesse",
        full_name: "Selam Tadesse",
        gender: "female",
        birthDate: "2012-02-28",
        status: "active",
        age: calculateAge("2012-02-28"),
        guardian: "Solomon Tadesse",
        guardian_name: "Solomon Tadesse",
        phone: "+251911200010"
      },
      {
        id: 9,
        type: "child",
        name: "Meskel Tadesse",
        full_name: "Meskel Tadesse",
        gender: "male",
        birthDate: "2014-09-05",
        status: "active",
        age: calculateAge("2014-09-05"),
        guardian: "Solomon Tadesse",
        guardian_name: "Solomon Tadesse",
        phone: "+251911200009"
      }
    ];
  };

  // Filter beneficiaries based on search term
  useEffect(() => {
    if (!beneficiaries.length) return;

    const filtered = beneficiaries.filter(beneficiary =>
      beneficiary.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      beneficiary.guardian_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      beneficiary.phone?.includes(searchTerm)
    );
    
    setFilteredBeneficiaries(filtered);
  }, [searchTerm, beneficiaries]);

  // Sort beneficiaries
  const handleSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const sortedBeneficiaries = React.useMemo(() => {
    if (!filteredBeneficiaries.length) return [];

    const sortableItems = [...filteredBeneficiaries];
    return sortableItems.sort((a, b) => {
      const aValue = a[sortConfig.key] || '';
      const bValue = b[sortConfig.key] || '';
      
      if (aValue < bValue) {
        return sortConfig.direction === 'ascending' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'ascending' ? 1 : -1;
      }
      return 0;
    });
  }, [filteredBeneficiaries, sortConfig]);

  const handleBeneficiaryClick = (beneficiary) => {
    navigate(`/specific_beneficiary/${beneficiary.id}`, {
      state: { 
        beneficiary: {
          id: beneficiary.id,
          type: beneficiary.type,
          full_name: beneficiary.full_name,
          gender: beneficiary.gender,
          date_of_birth: beneficiary.birthDate,
          status: beneficiary.status,
          guardian_name: beneficiary.guardian_name,
          phone: beneficiary.phone,
          age: beneficiary.age
        }
      }
    });
  };

  const handleBack = () => {
    navigate("/sponsor_dashboard");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-amber-50 flex items-center justify-center">
        <div className="text-lg">Loading beneficiaries...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-amber-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={handleBack}
              className="flex items-center justify-center w-12 h-12 bg-white text-blue-800 rounded-lg shadow-md hover:bg-blue-50 transition-colors"
            >
              <ArrowLeft size={24} />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-blue-800">Sponsored Beneficiaries</h1>
              <p className="text-gray-600">Manage and view your sponsored beneficiaries</p>
              {error && (
                <p className="text-amber-600 text-sm mt-1">
                  Note: Using demo data due to API error
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Beneficiaries Table */}
        <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-200">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-blue-800 flex items-center">
              <User className="mr-2 text-amber-500" size={22} />
              Sponsored Beneficiaries ({beneficiaries.length})
            </h3>
            
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search by name, guardian, or phone..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 text-left text-sm text-gray-600">
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
                      className="hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => handleBeneficiaryClick(beneficiary)}
                    >
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          beneficiary.type === "child" 
                            ? "bg-blue-100 text-blue-800" 
                            : "bg-amber-100 text-amber-800"
                        }`}>
                          {beneficiary.type === "child" ? "Child" : "Elderly"}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-medium text-gray-900">
                        {beneficiary.full_name || beneficiary.name || 'Unknown'}
                      </td>
                      <td className="px-4 py-3 text-gray-700">
                        {beneficiary.guardian_name || beneficiary.guardian || "-"}
                      </td>
                      <td className="px-4 py-3 text-gray-700">{beneficiary.age || "-"}</td>
                      <td className="px-4 py-3 text-gray-700">{beneficiary.phone || "-"}</td>
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
      </div>
    </div>
  );
};

export default SponsorBeneficiaries;
