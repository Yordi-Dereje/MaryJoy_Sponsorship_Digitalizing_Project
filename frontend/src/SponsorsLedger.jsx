import React, { useState, useEffect } from 'react';

const SponsorsLedger = () => {
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [lastYear, setLastYear] = useState(new Date().getFullYear());
  const [history, setHistory] = useState([]);
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(true);

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
      employee: 'Current User', // Will be replaced with session data later
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
        <td key={`${year}-${month}`} className="px-3 py-2 text-center">
          <input
            type="checkbox"
            id={`m-${year}-${month}`}
            checked={isChecked}
            readOnly
            className="hidden"
          />
          <label
            htmlFor={`m-${year}-${month}`}
            className={`block px-3 py-2 rounded-md cursor-pointer transition-colors ${
              isChecked
                ? 'bg-blue-700 text-white'
                : 'hover:bg-blue-50'
            }`}
          >
            {getMonthAbbr(month)}
          </label>
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
        <tr key={year}>
          <td className="px-4 py-3 bg-blue-800 text-white font-bold text-center">{year}</td>
          {generateMonthCells(year)}
        </tr>
      );
    }
    
    return rows;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-6 px-4">
      <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-md overflow-hidden p-5 md:p-6">
        {/* Header - Made smaller */}
        <div className="text-center mb-6 pb-4 border-b border-blue-600">
          <h1 className="text-xl md:text-2xl font-bold text-blue-700 uppercase tracking-tight">
            MARY JOY DEVELOPMENT ASSOCIATION SPONSORS' LEDGER
          </h1>
        </div>

        {/* Combined Sponsor Information and Financial Details Card */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6 p-5 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg shadow">
          {/* Sponsor Information */}
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <h3 className="text-md font-semibold text-blue-700 mb-3 pb-2 border-b border-gray-200">Sponsor Information</h3>
            <div className="space-y-2">
              <div className="flex">
                <span className="font-medium text-gray-700 text-sm min-w-[100px]">Sponsor ID:</span>
                <span className="text-gray-900 text-sm">01-001</span>
              </div>
              <div className="flex">
                <span className="font-medium text-gray-700 text-sm min-w-[100px]">Name:</span>
                <span className="text-gray-900 text-sm">John Smith</span>
              </div>
              <div className="flex">
                <span className="font-medium text-gray-700 text-sm min-w-[100px]">Email:</span>
                <span className="text-gray-900 text-sm">john.smith@example.com</span>
              </div>
              <div className="flex">
                <span className="font-medium text-gray-700 text-sm min-w-[100px]">Phone:</span>
                <span className="text-gray-900 text-sm">+16-55-5 21/03.03.3432</span>
              </div>
              <div className="flex">
                <span className="font-medium text-gray-700 text-sm min-w-[100px]">Address:</span>
                <span className="text-gray-900 text-sm">123 Main St, New York, NY</span>
              </div>
            </div>
          </div>

          {/* Financial Information */}
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <h3 className="text-md font-semibold text-blue-700 mb-3 pb-2 border-b border-gray-200">Financial Information</h3>
            <div className="space-y-2">
              <div className="flex">
                <span className="font-medium text-gray-700 text-sm min-w-[140px]">Monthly Payment:</span>
                <span className="text-gray-900 text-sm">$800.00</span>
              </div>
              <div className="flex">
                <span className="font-medium text-gray-700 text-sm min-w-[140px]">Starting Date:</span>
                <span className="text-gray-900 text-sm">January 10, 2023</span>
              </div>
              <div className="flex">
                <span className="font-medium text-gray-700 text-sm min-w-[140px]">Beneficiaries:</span>
                <span className="text-gray-900 text-sm">1 child and 1 elder</span>
              </div>
              <div className="flex">
                <span className="font-medium text-gray-700 text-sm min-w-[140px]">Total Contributions:</span>
                <span className="text-gray-900 text-sm">$11,200.00</span>
              </div>
              <div className="flex">
                <span className="font-medium text-gray-700 text-sm min-w-[140px]">Last Payment:</span>
                <span className="text-gray-900 text-sm">May 5, 2024</span>
              </div>
              <div className="flex">
                <span className="font-medium text-gray-700 text-sm min-w-[140px]">Next Payment Due:</span>
                <span className="text-gray-900 text-sm">June 5, 2024</span>
              </div>
            </div>
          </div>
        </div>

        {/* Chart Number */}
        <div className="text-center mb-4">
          <span className="inline-block bg-blue-100 text-blue-700 font-bold px-4 py-1 rounded-full text-sm">
            CHART NO. 22
          </span>
        </div>

        {/* End Date Selector */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-5 p-3 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-md shadow">
          <div className="flex items-center space-x-3 mb-3 md:mb-0">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={handleEndDateChange}
                className="px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Ledger Table */}
        <div className="overflow-x-auto mb-6 rounded-lg shadow">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="px-4 py-2 bg-blue-700 text-white font-bold text-center text-sm">YEAR</th>
                {[...Array(12)].map((_, i) => (
                  <th key={i} className="px-2 py-2 bg-blue-700 text-white font-bold text-center text-sm">
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

        {/* Add Year Button */}
        <button
          onClick={addYear}
          className="flex items-center justify-center mx-auto mb-8 px-4 py-2 bg-blue-700 text-white font-medium rounded-md hover:bg-blue-800 transition-colors text-sm"
        >
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          Add Another Year
        </button>

        {/* Payment History */}
        <div className="mb-6 rounded-lg overflow-hidden shadow">
          <div className="bg-blue-700 text-white px-4 py-2">
            <h3 className="text-md font-semibold">Payment History</h3>
          </div>
          <div className="bg-white p-4">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr>
                  <th className="px-3 py-1.5 bg-blue-600 text-white font-medium text-left">Period</th>
                  <th className="px-3 py-1.5 bg-blue-600 text-white font-medium text-left">Start Date</th>
                  <th className="px-3 py-1.5 bg-blue-600 text-white font-medium text-left">End Date</th>
                  <th className="px-3 py-1.5 bg-blue-600 text-white font-medium text-left">Amount</th>
                  <th className="px-3 py-1.5 bg-blue-600 text-white font-medium text-left">Beneficiaries</th>
                </tr>
              </thead>
              <tbody>
                {paymentHistory.map((payment, index) => (
                  <tr key={index} className={index % 2 === 0 ? 'bg-blue-50' : 'bg-white'}>
                    <td className="px-3 py-2 border-b border-gray-200">{payment.period}</td>
                    <td className="px-3 py-2 border-b border-gray-200">{formatDate(payment.startDate)}</td>
                    <td className="px-3 py-2 border-b border-gray-200">{formatDate(payment.endDate)}</td>
                    <td className="px-3 py-2 border-b border-gray-200">${payment.amount.toLocaleString()}</td>
                    <td className="px-3 py-2 border-b border-gray-200">{payment.beneficiaries}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Update History */}
        <div className="mb-6 rounded-lg overflow-hidden shadow">
          <div 
            className="bg-blue-700 text-white px-4 py-2 flex justify-between items-center cursor-pointer"
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
            <div className="bg-white p-4">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr>
                    <th className="px-3 py-1.5 bg-blue-600 text-white font-medium text-left">Updated By</th>
                    <th className="px-3 py-1.5 bg-blue-600 text-white font-medium text-left">Start Date</th>
                    <th className="px-3 py-1.5 bg-blue-600 text-white font-medium text-left">End Date</th>
                    <th className="px-3 py-1.5 bg-blue-600 text-white font-medium text-left">Timestamp</th>
                    <th className="px-3 py-1.5 bg-blue-600 text-white font-medium text-left">Months Selected</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((record, index) => (
                    <tr key={index} className={index % 2 === 0 ? 'bg-blue-50' : 'bg-white'}>
                      <td className="px-3 py-2 border-b border-gray-200">{record.employee}</td>
                      <td className="px-3 py-2 border-b border-gray-200">{formatDate(record.startDate)}</td>
                      <td className="px-3 py-2 border-b border-gray-200">{formatDate(record.endDate)}</td>
                      <td className="px-3 py-2 border-b border-gray-200">{formatDateTime(record.timestamp)}</td>
                      <td className="px-3 py-2 border-b border-gray-200">{record.monthsSelected}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="text-xs text-gray-500 mt-2 italic">
                Recent updates to the sponsorship period will appear here
              </p>
            </div>
          )}
        </div>

        {/* Signature Section */}
        <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-md shadow">
          <h3 className="text-md font-semibold text-blue-700 mb-3 text-center">Authorization</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Checked By</label>
              <div className="border-b border-gray-400 pb-1"></div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Date</label>
              <div className="border-b border-gray-400 pb-1"></div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Signature</label>
              <div className="border-b border-gray-400 pb-1"></div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-600">
            Mary Joy Development Association &copy; 2023 | Chart No. 22
          </p>
        </div>
      </div>
    </div>
  );
};

export default SponsorsLedger;
