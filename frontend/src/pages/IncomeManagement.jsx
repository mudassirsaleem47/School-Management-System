import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useModalAnimation } from '../hooks/useModalAnimation';
import axios from 'axios';
import { 
  DollarSign, 
  TrendingUp, 
  Calendar, 
  Plus, 
  Edit, 
  Trash2,
  FileText,
  Filter,
  X
} from 'lucide-react';

const API_BASE = "http://localhost:5000";

const IncomeManagement = () => {
  const { currentUser } = useAuth();
  const { showToast } = useToast();
  
  const [statistics, setStatistics] = useState({
    totalIncome: { amount: 0, count: 0 },
    todayIncome: { amount: 0, count: 0 },
    monthlyIncome: { amount: 0, count: 0 },
    categoryBreakdown: []
  });
  
  const [incomeEntries, setIncomeEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingIncome, setEditingIncome] = useState(null);
  const [filterCategory, setFilterCategory] = useState('');
  
  const { isVisible, isClosing, handleClose } = useModalAnimation(showModal, () => {
    setShowModal(false);
    setEditingIncome(null);
  });
  
  const [formData, setFormData] = useState({
    amount: '',
    category: 'Fee Collection',
    description: '',
    date: new Date().toISOString().split('T')[0],
    paymentMethod: 'Cash',
    reference: ''
  });

  const incomeCategories = ['Fee Collection', 'Donations', 'Grants', 'Events', 'Other Income'];
  const paymentMethods = ['Cash', 'Bank Transfer', 'Cheque', 'Online', 'Other'];

  useEffect(() => {
    if (currentUser) {
      fetchData();
    }
  }, [currentUser]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [statsRes, entriesRes] = await Promise.all([
        axios.get(`${API_BASE}/IncomeStatistics/${currentUser._id}`),
        axios.get(`${API_BASE}/Income/${currentUser._id}`)
      ]);

      setStatistics(statsRes.data);
      setIncomeEntries(Array.isArray(entriesRes.data) ? entriesRes.data : []);
      setLoading(false);
    } catch (error) {
      console.error('Income Management Error:', error);
      showToast(error.response?.data?.message || 'Error fetching data', 'error');
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const payload = {
        ...formData,
        amount: parseFloat(formData.amount),
        school: currentUser._id,
        createdBy: currentUser._id
      };

      if (editingIncome) {
        await axios.put(`${API_BASE}/Income/${editingIncome._id}`, payload);
        showToast('Income updated successfully!', 'success');
      } else {
        await axios.post(`${API_BASE}/IncomeCreate`, payload);
        showToast('Income added successfully!', 'success');
      }
      
      resetForm();
      fetchData();
    } catch (error) {
      showToast(error.response?.data?.message || 'Error saving income', 'error');
    }
  };

  const handleEdit = (income) => {
    setEditingIncome(income);
    setFormData({
      amount: income.amount.toString(),
      category: income.category,
      description: income.description,
      date:new Date(income.date).toISOString().split('T')[0],
      paymentMethod: income.paymentMethod,
      reference: income.reference || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this income entry?')) {
      try {
        await axios.delete(`${API_BASE}/Income/${id}`);
        showToast('Income deleted successfully!', 'success');
        fetchData();
      } catch (error) {
        showToast(error.response?.data?.message || 'Error deleting income', 'error');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      amount: '',
      category: 'Fee Collection',
      description: '',
      date: new Date().toISOString().split('T')[0],
      paymentMethod: 'Cash',
      reference: ''
    });
    setEditingIncome(null);
    setShowModal(false);
  };

  const filteredEntries = incomeEntries.filter(entry => 
    !filterCategory || entry.category === filterCategory
  );

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
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Income Management</h1>
        <p className="text-gray-600">Track and manage all income sources</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-white/20 p-3 rounded-lg">
              <DollarSign className="w-6 h-6" />
            </div>
            <TrendingUp className="w-8 h-8 opacity-50" />
          </div>
          <h3 className="text-white/90 text-sm font-medium mb-1">Total Income</h3>
          <p className="text-3xl font-bold">Rs. {statistics.totalIncome.amount.toLocaleString()}</p>
          <p className="text-white/80 text-sm mt-2">{statistics.totalIncome.count} entries</p>
        </div>

        <div className="bg-gradient-to-br from-blue-400 to-indigo-500 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-white/20 p-3 rounded-lg">
              <Calendar className="w-6 h-6" />
            </div>
            <DollarSign className="w-8 h-8 opacity-50" />
          </div>
          <h3 className="text-white/90 text-sm font-medium mb-1">Today's Income</h3>
          <p className="text-3xl font-bold">Rs. {statistics.todayIncome.amount.toLocaleString()}</p>
          <p className="text-white/80 text-sm mt-2">{statistics.todayIncome.count} entries</p>
        </div>

        <div className="bg-gradient-to-br from-purple-400 to-pink-500 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-white/20 p-3 rounded-lg">
              <TrendingUp className="w-6 h-6" />
            </div>
            <DollarSign className="w-8 h-8 opacity-50" />
          </div>
          <h3 className="text-white/90 text-sm font-medium mb-1">Monthly Income</h3>
          <p className="text-3xl font-bold">Rs. {statistics.monthlyIncome.amount.toLocaleString()}</p>
          <p className="text-white/80 text-sm mt-2">{statistics.monthlyIncome.count} entries</p>
        </div>
      </div>

      {/* Income Table Section */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Income Entries</h2>
          <div className="flex gap-3">
            {/* Category Filter */}
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="">All Categories</option>
              {incomeCategories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            
            {filterCategory && (
              <button 
                onClick={() => setFilterCategory('')}
                className="flex items-center gap-1 px-3 py-2 text-sm text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
              >
                <X size={14} /> Clear
              </button>
            )}
            
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
            >
              <Plus className="w-5 h-5" />
              Add Income
            </button>
          </div>
        </div>

        {/* Income Table */}
        {filteredEntries.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No income entries yet</p>
            <p className="text-gray-400 text-sm">Click "Add Income" to create your first entry</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Description</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Payment Method</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredEntries.map((income) => (
                  <tr key={income._id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {new Date(income.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-3 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                        {income.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">{income.description}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-semibold text-gray-900">Rs. {income.amount.toLocaleString()}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{income.paymentMethod}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(income)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(income._id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {isVisible && (
        <div className={`fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 overflow-y-auto p-4 ${isClosing ? 'animate-fade-out' : 'animate-fade-in'}`}>
          <div className={`bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto ${isClosing ? 'animate-scale-down' : 'animate-scale-up'}`}>
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4">
              <h3 className="text-2xl font-bold text-gray-900">
                {editingIncome ? 'Edit Income Entry' : 'Add Income Entry'}
              </h3>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Amount (Rs.) *
                  </label>
                  <input
                    type="number"
                    name="amount"
                    value={formData.amount}
                    onChange={handleInputChange}
                    required
                    min="0"
                    step="0.01"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Enter amount"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Category *
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    {incomeCategories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Date *
                  </label>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Payment Method *
                  </label>
                  <select
                    name="paymentMethod"
                    value={formData.paymentMethod}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    {paymentMethods.map(method => (
                      <option key={method} value={method}>{method}</option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Description *
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    required
                    rows="3"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Enter description"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Reference (Optional)
                  </label>
                  <input
                    type="text"
                    name="reference"
                    value={formData.reference}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Receipt number, transaction ID, etc."
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-semibold transition"
                >
                  {editingIncome ? 'Update' : 'Add'} Income
                </button>
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-semibold transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default IncomeManagement;
