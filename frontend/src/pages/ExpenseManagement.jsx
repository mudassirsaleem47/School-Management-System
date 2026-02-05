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
  X,
  Check
} from 'lucide-react';


const API_BASE = import.meta.env.VITE_API_URL;

const ExpenseManagement = () => {
  const { currentUser } = useAuth();
  const { showToast } = useToast();
  
  const [statistics, setStatistics] = useState({
    totalExpense: { amount: 0, count: 0 },
    todayExpense: { amount: 0, count: 0 },
    monthlyExpense: { amount: 0, count: 0 },
    categoryBreakdown: []
  });
  
  const [expenseEntries, setExpenseEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [filterCategory, setFilterCategory] = useState('');
  const [selectedDeleteId, setSelectedDeleteId] = useState(null);
  
  const { isVisible, isClosing, handleClose } = useModalAnimation(showModal, () => {
    setShowModal(false);
    setEditingExpense(null);
  });
  
  const [formData, setFormData] = useState({
    amount: '',
    category: 'Fee Collection',
    description: '',
    date: new Date().toISOString().split('T')[0],
    paymentMethod: 'Cash',
    reference: ''
  });

  const expenseCategories = ['Salaries', 'Utilities', 'Supplies & Materials', 'Maintenance', 'Transportation', 'Events', 'Other Expenses'];
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
        axios.get(`${API_BASE}/ExpenseStatistics/${currentUser._id}`),
        axios.get(`${API_BASE}/Expense/${currentUser._id}`)
      ]);

      setStatistics(statsRes.data);
      setExpenseEntries(Array.isArray(entriesRes.data) ? entriesRes.data : []);
      setLoading(false);
    } catch (error) {
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

      if (editingExpense) {
        await axios.put(`${API_BASE}/Expense/${editingExpense._id}`, payload);
        showToast('Expense updated successfully!', 'success');
      } else {
        await axios.post(`${API_BASE}/ExpenseCreate`, payload);
        showToast('Expense added successfully!', 'success');
      }
      
      resetForm();
      fetchData();
    } catch (error) {
      showToast(error.response?.data?.message || 'Error saving expense', 'error');
    }
  };

  const handleEdit = (expense) => {
    setEditingExpense(expense);
    setFormData({
      amount: expense.amount.toString(),
      category: expense.category,
      description: expense.description,
      date:new Date(expense.date).toISOString().split('T')[0],
      paymentMethod: expense.paymentMethod,
      reference: expense.reference || ''
    });
    setShowModal(true);
  };

  const handleDelete = (id) => {
    if (selectedDeleteId === id) {
      confirmDelete();
    } else {
      setSelectedDeleteId(id);
      setTimeout(() => setSelectedDeleteId(prev => prev === id ? null : prev), 3000);
    }
  };

  const confirmDelete = async () => {
    if (!selectedDeleteId) return;
    try {
      await axios.delete(`${API_BASE}/Expense/${selectedDeleteId}`);
      showToast('Expense deleted successfully!', 'success');
      fetchData();
    } catch (error) {
      showToast(error.response?.data?.message || 'Error deleting expense', 'error');
    }
    setSelectedDeleteId(null);
  };

  const resetForm = () => {
    setFormData({
      amount: '',
      category: 'Salaries',
      description: '',
      date: new Date().toISOString().split('T')[0],
      paymentMethod: 'Cash',
      reference: ''
    });
    setEditingExpense(null);
    setShowModal(false);
  };

  const filteredEntries = expenseEntries.filter(entry => 
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
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Expense Management</h1>
        <p className="text-gray-600">Track and manage all expenses</p>
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
          <h3 className="text-white/90 text-sm font-medium mb-1">Total Expense</h3>
          <p className="text-3xl font-bold">Rs. {statistics.totalExpense.amount.toLocaleString()}</p>
          <p className="text-white/80 text-sm mt-2">{statistics.totalExpense.count} entries</p>
        </div>

        <div className="bg-gradient-to-br from-blue-400 to-indigo-500 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-white/20 p-3 rounded-lg">
              <Calendar className="w-6 h-6" />
            </div>
            <DollarSign className="w-8 h-8 opacity-50" />
          </div>
          <h3 className="text-white/90 text-sm font-medium mb-1">Today's Expense</h3>
          <p className="text-3xl font-bold">Rs. {statistics.todayExpense.amount.toLocaleString()}</p>
          <p className="text-white/80 text-sm mt-2">{statistics.todayExpense.count} entries</p>
        </div>

        <div className="bg-gradient-to-br from-purple-400 to-pink-500 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-white/20 p-3 rounded-lg">
              <TrendingUp className="w-6 h-6" />
            </div>
            <DollarSign className="w-8 h-8 opacity-50" />
          </div>
          <h3 className="text-white/90 text-sm font-medium mb-1">Monthly Expense</h3>
          <p className="text-3xl font-bold">Rs. {statistics.monthlyExpense.amount.toLocaleString()}</p>
          <p className="text-white/80 text-sm mt-2">{statistics.monthlyExpense.count} entries</p>
        </div>
      </div>

      {/* Expense Table Section */}
      <div className="bg-white rounded-xl shadow-lg pt-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl ml-6 font-bold text-gray-900">Expense Entries</h2>
          <div className="flex gap-3 mr-6">
            {/* Category Filter */}
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="">All Categories</option>
              {expenseCategories.map(cat => (
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
              Add Expense
            </button>
          </div>
        </div>

        {/* Expense Table */}
        {filteredEntries.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No expense entries yet</p>
            <p className="text-gray-400 text-sm">Click "Add Expense" to create your first entry</p>
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
                {filteredEntries.map((expense) => (
                  <tr key={expense._id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {new Date(expense.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-3 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
                        {expense.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">{expense.description}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-semibold text-gray-900">Rs. {expense.amount.toLocaleString()}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{expense.paymentMethod}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(expense)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(expense._id)}
                          className={`p-2 rounded-lg transition overflow-hidden ${selectedDeleteId === expense._id
                            ? "bg-red-600 text-white hover:bg-red-700"
                            : "text-red-600 hover:bg-red-50"
                            }`}
                          title="Delete"
                        >
                          {selectedDeleteId === expense._id ? (
                            <Check className="w-4 h-4" />
                          ) : (
                              <Trash2 className="w-4 h-4" />
                          )}
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
        <div className={`fixed inset-0 bg-black/70 flex items-center justify-center z-50 overflow-y-auto p-4 ${isClosing ? 'animate-fade-out' : 'animate-fade-in'}`}>
          <div className={`bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto ${isClosing ? 'animate-scale-down' : 'animate-scale-up'}`}>
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4">
              <h3 className="text-2xl font-bold text-gray-900">
                {editingExpense ? 'Edit Expense Entry' : 'Add Expense Entry'}
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
                    {expenseCategories.map(cat => (
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
                  {editingExpense ? 'Update' : 'Add'} Expense
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

export default ExpenseManagement;
