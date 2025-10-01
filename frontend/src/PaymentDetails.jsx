import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Download, Banknote, FileText, Search, Calendar, Upload, X } from "lucide-react";
import { useAuth } from "./contexts/AuthContext";

const PaymentDetails = () => {
  const navigate = useNavigate();
  const { cluster_id, specific_id } = useParams();
  const { hasRole } = useAuth();
  
  const [sponsor, setSponsor] = useState(null);
  const [paymentData, setPaymentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredPayments, setFilteredPayments] = useState([]);
  const [receiptModalOpen, setReceiptModalOpen] = useState(false);
  const [receiptFile, setReceiptFile] = useState(null);
  const [submittingReceipt, setSubmittingReceipt] = useState(false);
  const fileInputRef = useRef(null);

  // Fetch sponsor and payment data
  const fetchPaymentData = async () => {
    try {
      setLoading(true);
      
      // Fetch sponsor details
      const sponsorResponse = await fetch(
        `http://localhost:5000/api/sponsors/${cluster_id}/${specific_id}`
      );
      
      if (!sponsorResponse.ok) {
        throw new Error('Failed to fetch sponsor data');
      }
      
      const sponsorData = await sponsorResponse.json();
      setSponsor(sponsorData);

      // Fetch payment data
      const dashboardResponse = await fetch(
        `http://localhost:5000/api/sponsors/${cluster_id}/${specific_id}/dashboard`
      );
      
      if (dashboardResponse.ok) {
        const dashboardData = await dashboardResponse.json();
        setPaymentData(dashboardData.payments);
      } else {
        throw new Error('Failed to fetch payment data');
      }

    } catch (err) {
      setError(err.message);
      console.error('Error fetching payment data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (cluster_id && specific_id) {
      fetchPaymentData();
    }
  }, [cluster_id, specific_id]);

  // Filter payments based on search term
  useEffect(() => {
    if (paymentData?.paymentHistory) {
      const filtered = paymentData.paymentHistory.filter(payment => {
        const searchLower = searchTerm.toLowerCase();
        const referenceMatch = payment.referenceNumber?.toLowerCase().includes(searchLower);
        const periodMatch = formatPaymentPeriod(payment).toLowerCase().includes(searchLower);
        const statusMatch = payment.status?.toLowerCase().includes(searchLower);
        return referenceMatch || periodMatch || statusMatch;
      });
      setFilteredPayments(filtered);
    }
  }, [searchTerm, paymentData]);

  // Handle back button click
  const handleBack = () => {
    navigate(-1);
  };

  const resetReceiptForm = () => {
    setReceiptFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleReceiptFileChange = (file) => {
    setReceiptFile(file || null);
  };

  const handleReceiptInputChange = (event) => {
    const file = event.target.files?.[0];
    handleReceiptFileChange(file || null);
  };

  const triggerFileSelect = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
      fileInputRef.current.click();
    }
  };

  const handleReceiptDrop = (event) => {
    event.preventDefault();
    event.stopPropagation();
    const file = event.dataTransfer?.files?.[0];
    handleReceiptFileChange(file || null);
  };

  const handleReceiptDragOver = (event) => {
    event.preventDefault();
    event.stopPropagation();
  };

  const handleReceiptSubmit = async () => {
    if (!receiptFile) {
      alert("Please select a bank receipt file to upload.");
      return;
    }

    try {
      setSubmittingReceipt(true);
      const formData = new FormData();
      formData.append("bank_receipt", receiptFile);

      const token = localStorage.getItem("token");

      const response = await fetch(
        `http://localhost:5000/api/sponsors/${cluster_id}/${specific_id}/payments/receipts`,
        {
          method: "POST",
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {})
          },
          body: formData
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to upload bank receipt.");
      }

      alert("Bank receipt uploaded successfully.");
      setReceiptModalOpen(false);
      resetReceiptForm();
      await fetchPaymentData();
    } catch (err) {
      console.error("Error uploading bank receipt:", err);
      alert(err.message || "Something went wrong while uploading the receipt.");
    } finally {
      setSubmittingReceipt(false);
    }
  };

  // Format currency for display
  const formatCurrency = (amount) => {
    if (!amount) return "0.00 birr";
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount) + " birr";
  };

  // Format payment period for display
  const formatPaymentPeriod = (payment) => {
    let startMonth = payment.startMonth;
    let startYear = payment.startYear;
    let endMonth = payment.endMonth;
    let endYear = payment.endYear;

    if ((!startMonth || !startYear) && payment.paymentDate) {
      const paymentDate = new Date(payment.paymentDate);
      startMonth = paymentDate.getMonth() + 1; // JS months are 0-based
      startYear = paymentDate.getFullYear();
    }

    if (!startMonth || !startYear) {
      if (payment.paymentDate) {
        const paymentDate = new Date(payment.paymentDate);
        const monthNames = [
          "January", "February", "March", "April", "May", "June",
          "July", "August", "September", "October", "November", "December"
        ];
        return `${monthNames[paymentDate.getMonth()]} ${paymentDate.getFullYear()}`;
      }
      return "Payment Date";
    }

    const startPeriod = formatMonthYear(startMonth, startYear);

    if (!endMonth || !endYear || (startMonth === endMonth && startYear === endYear)) {
      return startPeriod;
    }

    const endPeriod = formatMonthYear(endMonth, endYear);
    return `${startPeriod} - ${endPeriod}`;
  };

  // Format month and year for display
  const formatMonthYear = (month, year) => {
    if (!month || !year) return "N/A";
    const monthNames = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    return `${monthNames[month - 1]} ${year}`;
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

  if (loading) {
    return (
      <div className="font-poppins bg-[#f5f7fa] p-8 text-[#032990] min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#032990] mx-auto"></div>
          <p className="mt-4 text-lg">Loading payment data...</p>
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
            Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="font-poppins bg-[#f5f7fa] p-4 sm:p-6 lg:p-8 text-[#032990] min-h-screen">
      <div className="max-w-6xl mx-auto bg-white p-4 sm:p-6 lg:p-8 rounded-xl shadow-lg">
        {/* Header */}
        <div className="flex flex-col gap-4 mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={handleBack}
              className="flex items-center justify-center w-12 h-12 bg-white text-[#032990] rounded-lg shadow-md transition-all duration-300 border border-[#f0f3ff] hover:bg-[#032990] hover:text-white group"
            >
              <ArrowLeft className="w-6 h-6 transition-colors duration-300 group-hover:stroke-white" />
            </button>
            <div className="flex-1">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h1 className="text-[#032990] font-bold text-3xl">Payment Details</h1>
                  <p className="text-[#6b7280] mt-1">
                    Payment history and receipts for {sponsor.full_name} ({sponsor.cluster_id}-{sponsor.specific_id})
                  </p>
                </div>
                <button
                  onClick={() => setReceiptModalOpen(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-[#032990] text-white rounded-lg shadow-md hover:bg-[#0d3ba8] transition-colors"
                >
                  <Upload size={18} />
                  Add Bank Receipt
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Financial Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-r from-[#032990] to-[#0d3ba8] text-white rounded-2xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">Total Contributions</p>
                <p className="text-2xl font-bold mt-1">
                  {formatCurrency(paymentData?.totalContribution || 0)}
                </p>
              </div>
              <Banknote className="w-8 h-8 text-blue-200" />
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-[#EAA108] to-[#f0b432] text-white rounded-2xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-100 text-sm">Last Payment</p>
                <p className="text-2xl font-bold mt-1">
                  {paymentData?.lastPayment 
                    ? formatMonthYear(paymentData.lastPayment.month, paymentData.lastPayment.year)
                    : "No payments"
                  }
                </p>
              </div>
              <Calendar className="w-8 h-8 text-yellow-200" />
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-[#10b981] to-[#34d399] text-white rounded-2xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">Next Payment Due</p>
                <p className="text-2xl font-bold mt-1">
                  {paymentData?.nextPaymentDue 
                    ? formatMonthYear(paymentData.nextPaymentDue.month, paymentData.nextPaymentDue.year)
                    : "N/A"
                  }
                </p>
              </div>
              <FileText className="w-8 h-8 text-green-200" />
            </div>
          </div>
        </div>

        {/* Payment History */}
        <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-200">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <h3 className="text-xl font-bold text-[#032990] flex items-center">
              <FileText className="mr-2 text-[#EAA108]" size={22} />
              Payment Receipts ({paymentData?.paymentHistory?.length || 0})
            </h3>
            
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search by reference, period, or status..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-[#032990] focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          {paymentData?.paymentHistory && paymentData.paymentHistory.length > 0 ? (
            <div className={`space-y-4 ${filteredPayments.length > 5 ? 'max-h-96 overflow-y-auto pr-2' : ''}`}>
              {(searchTerm ? filteredPayments : paymentData.paymentHistory).map((payment) => (
                <div key={payment.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex items-start sm:items-center mb-3 sm:mb-0">
                    <Banknote className="text-[#032990] mr-3 mt-1 sm:mt-0" size={20} />
                    <div>
                      <p className="font-medium text-lg">
                        {formatPaymentPeriod(payment)}
                      </p>
                      <p className="text-sm text-[#6b7280]">
                        Amount: <span className="font-semibold">{formatCurrency(payment.amount)}</span>
                        {payment.referenceNumber && ` • Reference: ${payment.referenceNumber}`}
                        {payment.status && ` • Status: ${payment.status}`}
                      </p>
                      <p className="text-xs text-[#6b7280]">
                        Payment Date: {formatDate(payment.paymentDate)}
                        {payment.confirmedAt && ` • Confirmed: ${formatDate(payment.confirmedAt)}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2 w-full sm:w-auto justify-start sm:justify-end">
                    {payment.bankReceiptUrl && (
                      <button
                        onClick={() => window.open(payment.bankReceiptUrl, '_blank')}
                        className="flex items-center px-3 py-2 bg-[#032990] text-white rounded-lg text-sm hover:bg-[#0d3ba8] transition-colors"
                      >
                        <Download className="w-4 h-4 mr-1" />
                        Bank Receipt
                      </button>
                    )}
                    {payment.companyReceiptUrl && (
                      <button
                        onClick={() => window.open(payment.companyReceiptUrl, '_blank')}
                        className="flex items-center px-3 py-2 bg-[#EAA108] text-white rounded-lg text-sm hover:bg-[#d19108] transition-colors"
                      >
                        <Download className="w-4 h-4 mr-1" />
                        Company Receipt
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <Banknote className="mx-auto mb-4 text-gray-300" size={48} />
              <p className="text-lg">No payment receipts available yet.</p>
              <p className="text-sm mt-1">Receipts will appear here once payments are processed.</p>
            </div>
          )}
          
          {searchTerm && filteredPayments.length === 0 && paymentData?.paymentHistory?.length > 0 && (
            <div className="text-center py-8 text-gray-500">
              <p>No payments found matching your search.</p>
            </div>
          )}
      </div>
    </div>
    {receiptModalOpen && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-[#032990]">Upload Bank Receipt</h2>
            <button
              onClick={() => {
                setReceiptModalOpen(false);
                resetReceiptForm();
              }}
              className="text-gray-500 hover:text-gray-700"
            >
              <X size={20} />
            </button>
          </div>
          <div className="px-6 py-5">
            <label
              htmlFor="bank-receipt-input"
              className={`w-full h-48 flex flex-col items-center justify-center border-2 border-dashed rounded-xl cursor-pointer transition-all duration-200 hover:shadow-lg ${
                receiptFile ? 'border-[#032990] bg-blue-50' : 'border-gray-300 hover:border-[#032990] hover:bg-gray-50'
              }`}
              onDrop={handleReceiptDrop}
              onDragOver={handleReceiptDragOver}
            >
              {receiptFile ? (
                <div className="text-center space-y-2">
                  <Upload className="mx-auto text-[#032990]" size={48} />
                  <div>
                    <p className="font-semibold text-[#032990] text-sm">{receiptFile.name}</p>
                    <p className="text-xs text-gray-600">{(receiptFile.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                </div>
              ) : (
                <div className="text-center space-y-2">
                  <Upload className="mx-auto text-gray-400" size={48} />
                  <div>
                    <p className="font-medium text-gray-700 text-sm">Drop your receipt here</p>
                    <p className="text-xs text-gray-500">or click to browse</p>
                  </div>
                </div>
              )}
            </label>
            <input
              id="bank-receipt-input"
              type="file"
              accept=".pdf,.png,.jpg,.jpeg"
              ref={fileInputRef}
              onChange={handleReceiptInputChange}
              className="hidden"
            />
          </div>
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
            <button
              onClick={() => {
                setReceiptModalOpen(false);
                resetReceiptForm();
              }}
              className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              onClick={handleReceiptSubmit}
              disabled={submittingReceipt || !receiptFile}
              className="px-4 py-2 rounded-lg bg-[#032990] text-white hover:bg-[#0d3ba8] disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submittingReceipt ? "Uploading..." : "Upload Receipt"}
            </button>
          </div>
        </div>
      </div>
    )}
  </div>
);
};

export default PaymentDetails;
