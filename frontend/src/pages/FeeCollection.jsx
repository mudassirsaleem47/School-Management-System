import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import axios from 'axios';
import { 
  Search, 
  DollarSign, 
  User, 
  Calendar,
  CreditCard,
  Receipt,
  X,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

const API_BASE = "http://localhost:5000";

const FeeCollection = () => {
  const { currentUser } = useAuth();
  const { showToast } = useToast();
  
  const [students, setStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentFees, setStudentFees] = useState([]);
  const [selectedFee, setSelectedFee] = useState(null);
  const [showReceipt, setShowReceipt] = useState(false);
  const [receiptData, setReceiptData] = useState(null);
  
  const [paymentForm, setPaymentForm] = useState({
    amount: '',
    paymentMethod: 'Cash',
    chequeNumber: '',
    bankName: '',
    transactionReference: '',
    remarks: ''
  });

  const paymentMethods = ['Cash', 'Online', 'Cheque', 'Card', 'Bank Transfer'];

  useEffect(() => {
    if (currentUser) {
      fetchStudents();
    }
  }, [currentUser]);

  const fetchStudents = async () => {
      try {
        const response = await axios.get(`${API_BASE}/Students/${currentUser._id}`);
      setStudents(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      showToast(error.response?.data?.message || 'Error fetching students', 'error');
    }
  };

  const fetchStudentFees = async (studentId) => {
    try {
        console.log('🔍 Fetching fees for student ID:', studentId);
      const response = await axios.get(`${API_BASE}/StudentFees/${studentId}`);
        console.log('📊 Student fees response:', response.data);
        console.log('📝 Number of fees:', response.data?.length || 0);

        if (response.data && response.data.length > 0) {
            response.data.forEach((fee, index) => {
                console.log(`Fee ${index + 1}:`, {
                    feeName: fee.feeStructure?.feeName,
                    status: fee.status,
                    total: fee.totalAmount,
                    pending: fee.pendingAmount
                });
            });
        }

      setStudentFees(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
        console.error('❌ Error fetching student fees:', error);
        console.error('Error details:', error.response?.data);
      showToast('Error fetching student fees', 'error');
    }
  };

  const handleStudentSelect = (student) => {
    setSelectedStudent(student);
    fetchStudentFees(student._id);
    setSelectedFee(null);
    resetPaymentForm();
  };

  const handleFeeSelect = (fee) => {
    setSelectedFee(fee);
    setPaymentForm(prev => ({
      ...prev,
      amount: fee.pendingAmount.toString()
    }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPaymentForm(prev => ({ ...prev, [name]: value }));
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedFee) {
      showToast('Please select a fee to pay', 'error');
      return;
    }

    const amount = parseFloat(paymentForm.amount);
    if (amount <= 0 || amount > selectedFee.pendingAmount) {
      showToast(`Invalid amount. Pending: Rs.${selectedFee.pendingAmount}`, 'error');
      return;
    }

    try {
      const payload = {
        feeId: selectedFee._id,
        amount,
        paymentMethod: paymentForm.paymentMethod,
        collectedBy: currentUser._id,
        chequeNumber: paymentForm.chequeNumber,
        bankName: paymentForm.bankName,
        transactionReference: paymentForm.transactionReference,
        remarks: paymentForm.remarks
      };

      const response = await axios.post(`${API_BASE}/CollectFee`, payload);
      
      showToast('Payment collected successfully!', 'success');
      
      // Fetch receipt details
      const receiptResponse = await axios.get(
        `${API_BASE}/FeeReceipt/${response.data.transaction._id}`
      );
      setReceiptData(receiptResponse.data);
      setShowReceipt(true);
      
      // Refresh student fees
      fetchStudentFees(selectedStudent._id);
      resetPaymentForm();
      setSelectedFee(null);
      
    } catch (error) {
      showToast(error.response?.data?.message || 'Error processing payment', 'error');
    }
  };

  const resetPaymentForm = () => {
    setPaymentForm({
      amount: '',
      paymentMethod: 'Cash',
      chequeNumber: '',
      bankName: '',
      transactionReference: '',
      remarks: ''
    });
  };

  const printReceipt = () => {
    window.print();
  };

  const filteredStudents = students.filter(student => 
    student.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.rollNum?.toString().includes(searchTerm)
  );

  const getStatusColor = (status) => {
    switch(status) {
      case 'Paid': return 'bg-green-100 text-green-800';
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      case 'Partial': return 'bg-orange-100 text-orange-800';
      case 'Overdue': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Fee Collection</h1>
        <p className="text-gray-600">Process student fee payments and generate receipts</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Student Search & List */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Select Student</h2>
            
            {/* Search */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by name or roll number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            {/* Student List */}
            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {filteredStudents.length === 0 ? (
                <div className="text-center py-8">
                  <User className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-500">No students found</p>
                </div>
              ) : (
                filteredStudents.map((student) => (
                  <div
                    key={student._id}
                    onClick={() => handleStudentSelect(student)}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition ${
                      selectedStudent?._id === student._id
                        ? 'border-indigo-500 bg-indigo-50'
                        : 'border-gray-200 hover:border-indigo-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="bg-indigo-100 p-2 rounded-lg">
                        <User className="w-5 h-5 text-indigo-600" />
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-gray-900">{student.name}</div>
                        <div className="text-sm text-gray-600">
                          Roll: {student.rollNum} | Class: {student.sclassName?.sclassName} {student.section}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Fee Details & Payment Form */}
        <div className="lg:col-span-2">
          {!selectedStudent ? (
            <div className="bg-white rounded-xl shadow-lg p-12 text-center">
              <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Student Selected</h3>
              <p className="text-gray-500">Please select a student to view their fees and collect payment</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Student Info Card */}
              <div className="bg-gradient-to-br from-indigo-400 to-indigo-500 rounded-xl shadow-lg p-6 text-white">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-2xl font-bold mb-2">{selectedStudent.name}</h2>
                    <div className="space-y-1 text-indigo-100">
                      <p>Roll Number: {selectedStudent.rollNum}</p>
                      <p>Class: {selectedStudent.sclassName?.sclassName} - Section {selectedStudent.section}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedStudent(null)}
                    className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Pending Fees */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Pending Fees</h3>
                
                {studentFees.filter(f => f.status !== 'Paid').length === 0 ? (
                  <div className="text-center py-8">
                    <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                    <p className="text-gray-600 font-medium">All fees are paid!</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {studentFees.filter(f => f.status !== 'Paid').map((fee) => (
                      <div
                        key={fee._id}
                        onClick={() => handleFeeSelect(fee)}
                        className={`p-4 rounded-lg border-2 cursor-pointer transition ${
                          selectedFee?._id === fee._id
                            ? 'border-indigo-500 bg-indigo-50'
                            : 'border-gray-200 hover:border-indigo-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="font-semibold text-gray-900">
                                {fee.feeStructure?.feeName}
                              </h4>
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(fee.status)}`}>
                                {fee.status}
                              </span>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                              <div>Total: Rs.{fee.totalAmount.toLocaleString()}</div>
                              <div>Paid: Rs.{fee.paidAmount.toLocaleString()}</div>
                              <div className="font-semibold text-red-600">
                                Pending: Rs.{fee.pendingAmount.toLocaleString()}
                              </div>
                              <div>Due: {new Date(fee.dueDate).toLocaleDateString()}</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Payment Form */}
              {selectedFee && (
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Collect Payment</h3>
                  
                  <form onSubmit={handlePaymentSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Amount (Rs.) *
                        </label>
                        <input
                          type="number"
                          name="amount"
                          value={paymentForm.amount}
                          onChange={handleInputChange}
                          required
                          min="0.01"
                          max={selectedFee.pendingAmount}
                          step="0.01"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Maximum: Rs.{selectedFee.pendingAmount.toLocaleString()}
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Payment Method *
                        </label>
                        <select
                          name="paymentMethod"
                          value={paymentForm.paymentMethod}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        >
                          {paymentMethods.map(method => (
                            <option key={method} value={method}>{method}</option>
                          ))}
                        </select>
                      </div>

                      {paymentForm.paymentMethod === 'Cheque' && (
                        <>
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              Cheque Number
                            </label>
                            <input
                              type="text"
                              name="chequeNumber"
                              value={paymentForm.chequeNumber}
                              onChange={handleInputChange}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              Bank Name
                            </label>
                            <input
                              type="text"
                              name="bankName"
                              value={paymentForm.bankName}
                              onChange={handleInputChange}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            />
                          </div>
                        </>
                      )}

                      {(paymentForm.paymentMethod === 'Online' || paymentForm.paymentMethod === 'Bank Transfer') && (
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Transaction Reference
                          </label>
                          <input
                            type="text"
                            name="transactionReference"
                            value={paymentForm.transactionReference}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                          />
                        </div>
                      )}

                      <div className="md:col-span-2">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Remarks
                        </label>
                        <textarea
                          name="remarks"
                          value={paymentForm.remarks}
                          onChange={handleInputChange}
                          rows="2"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                          placeholder="Optional notes"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold transition flex items-center justify-center gap-2"
                    >
                      <DollarSign className="w-5 h-5" />
                      Collect Payment
                    </button>
                  </form>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Receipt Modal */}
      {showReceipt && receiptData && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full">
            <div className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white p-6 rounded-t-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-white/20 p-3 rounded-lg">
                    <Receipt className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold">Payment Receipt</h3>
                    <p className="text-green-100">Transaction Successful</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowReceipt(false)}
                  className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6" id="receipt-content">
              {/* School Details */}
              <div className="text-center border-b pb-4">
                <h2 className="text-2xl font-bold text-gray-900">{receiptData.school?.schoolName}</h2>
                <p className="text-gray-600">{receiptData.school?.address}</p>
                <p className="text-gray-600">
                  {receiptData.school?.email} | {receiptData.school?.phone}
                </p>
              </div>

              {/* Receipt Details */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600 mb-1">Receipt Number</p>
                  <p className="font-semibold text-gray-900">{receiptData.receiptNumber}</p>
                </div>
                <div>
                  <p className="text-gray-600 mb-1">Transaction ID</p>
                  <p className="font-semibold text-gray-900">{receiptData.transactionId}</p>
                </div>
                <div>
                  <p className="text-gray-600 mb-1">Date</p>
                  <p className="font-semibold text-gray-900">
                    {new Date(receiptData.paymentDate).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600 mb-1">Time</p>
                  <p className="font-semibold text-gray-900">
                    {new Date(receiptData.paymentDate).toLocaleTimeString()}
                  </p>
                </div>
              </div>

              {/* Student Details */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">Student Details</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-gray-600">Name:</span>{' '}
                    <span className="font-medium">{receiptData.student?.name}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Roll Number:</span>{' '}
                    <span className="font-medium">{receiptData.student?.rollNum}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Class:</span>{' '}
                    <span className="font-medium">
                      {receiptData.student?.sclassName?.sclassName} - {receiptData.student?.section}
                    </span>
                  </div>
                </div>
              </div>

              {/* Payment Details */}
              <div className="border-t border-b py-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-600">Fee Type:</span>
                  <span className="font-semibold">{receiptData.fee?.feeStructure?.feeName}</span>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-600">Payment Method:</span>
                  <span className="font-semibold">{receiptData.paymentMethod}</span>
                </div>
                <div className="flex items-center justify-between text-xl">
                  <span className="font-bold text-gray-900">Amount Paid:</span>
                  <span className="font-bold text-green-600">Rs.{receiptData.amount.toLocaleString()}</span>
                </div>
              </div>

              {receiptData.remarks && (
                <div>
                  <p className="text-gray-600 text-sm mb-1">Remarks:</p>
                  <p className="text-gray-900">{receiptData.remarks}</p>
                </div>
              )}

              <div className="text-center text-sm text-gray-500 pt-4">
                <p>This is a computer-generated receipt.</p>
                <p className="mt-1">Collected by: {receiptData.collectedBy?.schoolName}</p>
              </div>
            </div>

            <div className="p-6 bg-gray-50 rounded-b-xl flex gap-3">
              <button
                onClick={printReceipt}
                className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-semibold transition"
              >
                Print Receipt
              </button>
              <button
                onClick={() => setShowReceipt(false)}
                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-semibold transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FeeCollection;
