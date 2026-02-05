import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import axios from 'axios';
import { 
  FileText, 
  Download, 
  Calendar,
  DollarSign,
  AlertCircle,
  TrendingUp,
  Users,
  Filter
} from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL;

const FeeReports = () => {
  const { currentUser } = useAuth();
  const { showToast } = useToast();
  
  const [pendingFees, setPendingFees] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending'); // pending, transactions, defaulters
  
  const [dateFilter, setDateFilter] = useState({
    startDate: new Date(new Date().setDate(1)).toISOString().split('T')[0], // First day of month
    endDate: new Date().toISOString().split('T')[0] // Today
  });

  useEffect(() => {
    if (currentUser) {
      fetchData();
    }
  }, [currentUser, dateFilter]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [pendingRes, transactionsRes] = await Promise.all([
        axios.get(`${API_BASE}/PendingFees/${currentUser._id}`),
        axios.get(`${API_BASE}/FeeTransactions/${currentUser._id}`, {
          params: dateFilter
        })
      ]);
      
      setPendingFees(pendingRes.data);
      setTransactions(transactionsRes.data);
      setLoading(false);
    } catch (error) {
      showToast('Error fetching data', 'error');
      setLoading(false);
    }
  };

  const calculateTotals = () => {
    const totalPending = pendingFees.reduce((sum, fee) => sum + fee.pendingAmount, 0);
    const totalCollected = transactions.reduce((sum, txn) => sum + txn.amount, 0);
    const defaultersCount = pendingFees.filter(fee => fee.status === 'Overdue').length;
    
    return { totalPending, totalCollected, defaultersCount };
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'Paid': return 'bg-green-100 text-green-800';
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      case 'Partial': return 'bg-orange-100 text-orange-800';
      case 'Overdue': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const exportToCSV = (data, filename) => {
    // Simple CSV export implementation
    let csv = '';
    
    if (activeTab === 'pending') {
      csv = 'Student Name,Roll Number,Class,Fee Type,Total Amount,Paid Amount,Pending Amount,Due Date,Status\n';
      data.forEach(fee => {
        csv += `"${fee.student?.name}","${fee.student?.rollNum}","${fee.student?.sclassName?.sclassName} ${fee.student?.section}","${fee.feeStructure?.feeName}","${fee.totalAmount}","${fee.paidAmount}","${fee.pendingAmount}","${new Date(fee.dueDate).toLocaleDateString()}","${fee.status}"\n`;
      });
    } else {
      csv = 'Date,Receipt Number,Student Name,Roll Number,Fee Type,Amount,Payment Method,Collected By\n';
      data.forEach(txn => {
        csv += `"${new Date(txn.paymentDate).toLocaleDateString()}","${txn.receiptNumber}","${txn.student?.name}","${txn.student?.rollNum}","${txn.fee?.feeStructure?.feeName || 'N/A'}","${txn.amount}","${txn.paymentMethod}","${txn.collectedBy?.schoolName || 'N/A'}"\n`;
      });
    }
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    
    showToast('Report exported successfully!', 'success');
  };

  const totals = calculateTotals();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Fee Reports</h1>
        <p className="text-gray-600">View and export fee collection reports</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-red-500">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-gray-600 text-sm font-medium">Total Pending Fees</h3>
            <AlertCircle className="w-5 h-5 text-red-500" />
          </div>
          <p className="text-3xl font-bold text-gray-900">Rs.{totals.totalPending.toLocaleString()}</p>
          <p className="text-sm text-gray-500 mt-1">{pendingFees.length} pending fees</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-gray-600 text-sm font-medium">Total Collected</h3>
            <TrendingUp className="w-5 h-5 text-green-500" />
          </div>
          <p className="text-3xl font-bold text-gray-900">Rs.{totals.totalCollected.toLocaleString()}</p>
          <p className="text-sm text-gray-500 mt-1">{transactions.length} transactions</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-orange-500">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-gray-600 text-sm font-medium">Fee Defaulters</h3>
            <Users className="w-5 h-5 text-orange-500" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{totals.defaultersCount}</p>
          <p className="text-sm text-gray-500 mt-1">Overdue fees</p>
        </div>
      </div>

      {/* Tabs & Filters */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('pending')}
              className={`px-4 py-2 rounded-lg font-semibold transition ${
                activeTab === 'pending'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Pending Fees
            </button>
            <button
              onClick={() => setActiveTab('transactions')}
              className={`px-4 py-2 rounded-lg font-semibold transition ${
                activeTab === 'transactions'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Transactions
            </button>
            <button
              onClick={() => setActiveTab('defaulters')}
              className={`px-4 py-2 rounded-lg font-semibold transition ${
                activeTab === 'defaulters'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Defaulters
            </button>
          </div>

          {activeTab === 'transactions' && (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-gray-400" />
                <input
                  type="date"
                  value={dateFilter.startDate}
                  onChange={(e) => setDateFilter(prev => ({ ...prev, startDate: e.target.value }))}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
                <span className="text-gray-500">to</span>
                <input
                  type="date"
                  value={dateFilter.endDate}
                  onChange={(e) => setDateFilter(prev => ({ ...prev, endDate: e.target.value }))}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
            </div>
          )}
        </div>

        {/* Export Button */}
        <div className="flex justify-end">
          <button
            onClick={() => {
              if (activeTab === 'pending' || activeTab === 'defaulters') {
                const data = activeTab === 'defaulters' 
                  ? pendingFees.filter(f => f.status === 'Overdue')
                  : pendingFees;
                exportToCSV(data, activeTab);
              } else {
                exportToCSV(transactions, 'transactions');
              }
            }}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
          >
            <Download className="w-4 h-4" />
            Export to CSV
          </button>
        </div>
      </div>

      {/* Report Content */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        {activeTab === 'pending' && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Student</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Roll No</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Class</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Fee Type</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Total</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Paid</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Pending</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Due Date</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {pendingFees.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="px-6 py-12 text-center">
                      <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500">No pending fees found</p>
                    </td>
                  </tr>
                ) : (
                  pendingFees.map((fee) => (
                    <tr key={fee._id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900">{fee.student?.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-700">{fee.student?.rollNum}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                        {fee.student?.sclassName?.sclassName} {fee.student?.section}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                        {fee.feeStructure?.feeName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-900">
                        Rs.{fee.totalAmount.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-900">
                        Rs.{fee.paidAmount.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="font-semibold text-red-600">
                          Rs.{fee.pendingAmount.toLocaleString()}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                        {new Date(fee.dueDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(fee.status)}`}>
                          {fee.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'transactions' && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Receipt #</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Student</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Roll No</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Fee Type</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Method</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {transactions.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-12 text-center">
                      <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500">No transactions found for selected period</p>
                    </td>
                  </tr>
                ) : (
                  transactions.map((txn) => (
                    <tr key={txn._id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                        {new Date(txn.paymentDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-indigo-600">{txn.receiptNumber}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900">{txn.student?.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                        {txn.student?.rollNum}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                        {txn.fee?.feeStructure?.feeName || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="font-semibold text-green-600">
                          Rs.{txn.amount.toLocaleString()}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-3 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                          {txn.paymentMethod}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'defaulters' && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Student</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Roll No</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Class</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Fee Type</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Pending Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Due Date</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Days Overdue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {pendingFees.filter(f => f.status === 'Overdue').length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-12 text-center">
                      <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500">No defaulters found</p>
                    </td>
                  </tr>
                ) : (
                  pendingFees.filter(f => f.status === 'Overdue').map((fee) => {
                    const daysOverdue = Math.floor((new Date() - new Date(fee.dueDate)) / (1000 * 60 * 60 * 24));
                    return (
                      <tr key={fee._id} className="hover:bg-gray-50 transition">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-medium text-gray-900">{fee.student?.name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-700">{fee.student?.rollNum}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                          {fee.student?.sclassName?.sclassName} {fee.student?.section}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                          {fee.feeStructure?.feeName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="font-semibold text-red-600">
                            Rs.{fee.pendingAmount.toLocaleString()}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                          {new Date(fee.dueDate).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-3 py-1 text-xs font-bold rounded-full bg-red-100 text-red-800">
                            {daysOverdue} days
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default FeeReports;
