import React, { useState, useEffect } from 'react';

const SponsorsLedger = () => {
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [lastYear, setLastYear] = useState(new Date().getFullYear());
  const [history, setHistory] = useState([]);
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(true);
  const [activeTab, setActiveTab] = useState('ledger');

  useEffect(() => {
    // Initial history entry
    const initialHistory = [
      {
        employee: 'Alemu Tesfaye',
        startDate: new Date(2021, 0, 1),
        endDate: new Date(),
        timestamp: new Date(),
        monthsSelected: calculateMonthsSelected(new Date(2021, 0, 1), new Date())
      }
    ];
    setHistory(initialHistory);

    // Initial payment history
    const initialPaymentHistory = [
      {
        period: 'Jan 2021 - Dec 2023',
        startDate: new Date(2021, 0, 1),
        endDate: new Date(2023, 11, 31),
        amount: 9000,
        beneficiaries: 5
      },
      {
        period: 'Jan 2024 - Present',
        startDate: new Date(2024, 0, 1),
        endDate: new Date(),
        amount: 1500,
        beneficiaries: 5
      }
    ];
    setPaymentHistory(initialPaymentHistory);
  }, []);

  const calculateMonthsSelected = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    return (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth()) + 1;
  };

  const handleEndDateChange = (e) => {
    const newEndDate = e.target.value;
    setEndDate(newEndDate);
    
    // Add to history
    const newHistoryEntry = {
      employee: 'Current User',
      startDate: new Date(2021, 0, 1),
      endDate: new Date(newEndDate),
      timestamp: new Date(),
      monthsSelected: calculateMonthsSelected(new Date(2021, 0, 1), new Date(newEndDate))
    };
    
    setHistory(prevHistory => [newHistoryEntry, ...prevHistory.slice(0, 9)]);
  };

  const addYear = () => {
    setLastYear(prevYear => prevYear + 1);
  };

  const toggleHistory = () => {
    setShowHistory(prev => !prev);
  };

  const formatDate = (date) => {
    return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
  };

  const formatDateTime = (date) => {
    return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`;
  };

  const getMonthAbbr = (month) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months[month];
  };

  const generateMonthCells = (year) => {
    let cells = [];
    for (let month = 0; month < 12; month++) {
      const monthDate = new Date(year, month, 1);
      const startDate = new Date(2021, 0, 1);
      const endDateObj = new Date(endDate);
      const isChecked = monthDate >= startDate && monthDate <= endDateObj;
      
      cells.push(
        <td key={`${year}-${month}`} className="px-2 py-2 text-center">
          <div
            className={`w-8 h-8 flex items-center justify-center rounded-full mx-auto transition-colors ${
              isChecked
                ? 'bg-blue-700 text-white'
                : 'bg-blue-100 text-blue-800'
            }`}
          >
            {getMonthAbbr(month).charAt(0)}
          </div>
        </td>
      );
    }
    return cells;
  };

  const generateLedgerYears = () => {
    const startYear = 2021;
    const rows = [];
    
    for (let year = startYear; year <= lastYear; year++) {
      rows.push(
        <tr key={year} className="hover:bg-blue-50 transition-colors">
          <td className="px-4 py-3 bg-blue-800 text-white font-bold text-center sticky left-0 z-10">{year}</td>
          {generateMonthCells(year)}
        </tr>
      );
    }
    
    return rows;
  };

  return (
    <div className="min-h-screen bg-blue-50 py-4 px-4">
      <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-blue-900 text-white p-4">
          <h1 className="text-xl md:text-2xl font-bold text-center uppercase tracking-wide">
            MARY JOY SPONSORS LEDGER
          </h1>
          <div className="flex justify-between items-center mt-2">
            <span className="text-sm bg-blue-700 px-3 py-1 rounded-full">
              Sponsor ID: 01-001
            </span>
            <span className="text-sm bg-blue-700 px-3 py-1 rounded-full">
              CHART NO. 22
            </span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-blue-200">
          <button
            className={`px-6 py-3 font-medium text-sm ${activeTab === 'ledger' ? 'bg-white text-blue-800 border-b-2 border-blue-800' : 'bg-blue-100 text-blue-600'}`}
            onClick={() => setActiveTab('ledger')}
          >
            Ledger
          </button>
          <button
            className={`px-6 py-3 font-medium text-sm ${activeTab === 'details' ? 'bg-white text-blue-800 border-b-2 border-blue-800' : 'bg-blue-100 text-blue-600'}`}
            onClick={() => setActiveTab('details')}
          >
            Sponsor Details
          </button>
          <button
            className={`px-6 py-3 font-medium text-sm ${activeTab === 'history' ? 'bg-white text-blue-800 border-b-2 border-blue-800' : 'bg-blue-100 text-blue-600'}`}
            onClick={() => setActiveTab('history')}
          >
            Payment History
          </button>
        </div>

        <div className="p-4">
          {/* Main Content Area */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Left Sidebar - 25% */}
            <div className="lg:col-span-1 bg-blue-50 p-4 rounded-lg">
              <div className="mb-6">
                <h3 className="text-md font-semibold text-blue-800 mb-3">Date Range</h3>
                <div className="space-y-2">
                  <div>
                    <label className="block text-sm font-medium text-blue-700 mb-1">Start Date</label>
                    <div className="text-sm bg-white p-2 rounded border border-blue-200">01/01/2021</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-blue-700 mb-1">End Date</label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={handleEndDateChange}
                      className="w-full px-3 py-2 text-sm border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-md font-semibold text-blue-800 mb-3">Quick Stats</h3>
                <div className="space-y-3">
                  <div className="bg-white p-3 rounded-lg shadow-sm border border-blue-100">
                    <div className="text-xs text-blue-600">Total Months</div>
                    <div className="text-lg font-bold text-blue-800">{calculateMonthsSelected(new Date(2021, 0, 1), new Date(endDate))}</div>
                  </div>
                  <div className="bg-white p-3 rounded-lg shadow-sm border border-blue-100">
                    <div className="text-xs text-blue-600">Total Contribution</div>
                    <div className="text-lg font-bold text-blue-800">$10,500.00</div>
                  </div>
                  <div className="bg-white p-3 rounded-lg shadow-sm border border-blue-100">
                    <div className="text-xs text-blue-600">Active Beneficiaries</div>
                    <div className="text-lg font-bold text-blue-800">2</div>
                  </div>
                </div>
              </div>

              <button
                onClick={addYear}
                className="w-full flex items-center justify-center px-4 py-2 bg-blue-700 text-white font-medium rounded-md hover:bg-blue-800 transition-colors text-sm"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                Add Another Year
              </button>
            </div>

            {/* Main Ledger - 75% */}
            <div className="lg:col-span-3">
              {/* Ledger Table */}
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr>
                        <th className="px-4 py-3 bg-blue-800 text-white font-bold text-center text-sm sticky left-0 z-20">YEAR</th>
                        {[...Array(12)].map((_, i) => (
                          <th key={i} className="px-2 py-3 bg-blue-800 text-white font-bold text-center text-sm">
                            {getMonthAbbr(i)}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {generateLedgerYears()}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Legend */}
              <div className="mt-4 flex justify-center items-center space-x-6 text-xs">
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-blue-700 rounded-full mr-2"></div>
                  <span className="text-blue-800">Paid Month</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-blue-100 rounded-full mr-2 border border-blue-300"></div>
                  <span className="text-blue-800">Unpaid Month</span>
                </div>
              </div>
            </div>
          </div>

          {/* Update History */}
          <div className="mt-6 bg-white rounded-lg shadow overflow-hidden">
            <div 
              className="bg-blue-800 text-white px-4 py-3 flex justify-between items-center cursor-pointer"
              onClick={toggleHistory}
            >
              <h3 className="text-md font-semibold">Ledger Update History</h3>
              <svg 
                className={`w-4 h-4 transform transition-transform ${showHistory ? 'rotate-180' : ''}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
              </svg>
            </div>
            
            {showHistory && (
              <div className="p-4">
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-sm">
                    <thead>
                      <tr>
                        <th className="px-3 py-2 bg-blue-700 text-white font-medium text-left">Updated By</th>
                        <th className="px-3 py-2 bg-blue-700 text-white font-medium text-left">Start Date</th>
                        <th className="px-3 py-2 bg-blue-700 text-white font-medium text-left">End Date</th>
                        <th className="px-3 py-2 bg-blue-700 text-white font-medium text-left">Timestamp</th>
                        <th className="px-3 py-2 bg-blue-700 text-white font-medium text-left">Months</th>
                      </tr>
                    </thead>
                    <tbody>
                      {history.map((record, index) => (
                        <tr key={index} className={index % 2 === 0 ? 'bg-blue-50' : 'bg-white'}>
                          <td className="px-3 py-2 border-b border-blue-100">{record.employee}</td>
                          <td className="px-3 py-2 border-b border-blue-100">{formatDate(record.startDate)}</td>
                          <td className="px-3 py-2 border-b border-blue-100">{formatDate(record.endDate)}</td>
                          <td className="px-3 py-2 border-b border-blue-100">{formatDateTime(record.timestamp)}</td>
                          <td className="px-3 py-2 border-b border-blue-100">{record.monthsSelected}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-blue-900 text-white text-center p-3 text-xs">
          <p>Mary Joy Development Association &copy; 2024 | Chart No. 22</p>
        </div>
      </div>
    </div>
  );
};

export default SponsorsLedger;
