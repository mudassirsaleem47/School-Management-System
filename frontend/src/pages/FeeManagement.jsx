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
  Users,
  AlertCircle
} from 'lucide-react';

const API_BASE = "http://localhost:5000";

const FeeManagement = () => {
  const { currentUser } = useAuth();
  const { showToast } = useToast();
  
  const [statistics, setStatistics] = useState({
    pendingFees: { amount: 0, count: 0 },
    todayCollection: { amount: 0, count: 0 },
    monthlyCollection: { amount: 0, count: 0 }
  });
  
  const [feeStructures, setFeeStructures] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingFee, setEditingFee] = useState(null);
  const { isVisible, isClosing, handleClose } = useModalAnimation(showModal, () => {
    setShowModal(false);
    setEditingFee(null);
  });
  
  const [formData, setFormData] = useState({
    feeName: '',
    feeType: 'Tuition',
    class: '',
    section: '',
    amount: '',
    academicYear: new Date().getFullYear().toString(),
    dueDate: '',
    description: ''
  });

  const feeTypes = ['Tuition', 'Transport', 'Library', 'Sports', 'Lab', 'Exam', 'Uniform', 'Other'];

  useEffect(() => {
    if (currentUser) {
      fetchData();
    }
  }, [currentUser]);

  const fetchData = async () => {
    try {
        setLoading(true);
      const [statsRes, structuresRes, classesRes] = await Promise.all([
        axios.get(`${API_BASE}/FeeStatistics/${currentUser._id}`),
        axios.get(`${API_BASE}/FeeStructures/${currentUser._id}`),
        axios.get(`${API_BASE}/Sclasses/${currentUser._id}`)
      ]);

      setStatistics(statsRes.data || {
        pendingFees: { amount: 0, count: 0 },
        todayCollection: { amount: 0, count: 0 },
        monthlyCollection: { amount: 0, count: 0 }
      });
      setFeeStructures(Array.isArray(structuresRes.data) ? structuresRes.data : []);
      setClasses(Array.isArray(classesRes.data) ? classesRes.data : []);
      setLoading(false);
    } catch (error) {
      console.error('Fee Management Error:', error);
      console.error('Error details:', error.response?.data || error.message);
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
        school: currentUser._id,
        amount: parseFloat(formData.amount)
      };

      if (editingFee) {
        await axios.put(`${API_BASE}/FeeStructure/${editingFee._id}`, payload);
        showToast('Fee structure updated successfully!', 'success');
      } else {
        await axios.post(`${API_BASE}/FeeStructureCreate`, payload);
        showToast('Fee structure created successfully!', 'success');
      }
      
      resetForm();
      fetchData();
    } catch (error) {
      showToast(error.response?.data?.message || 'Error saving fee structure', 'error');
    }
  };

  const handleEdit = (fee) => {
    setEditingFee(fee);
    setFormData({
      feeName: fee.feeName,
      feeType: fee.feeType,
      class: fee.class._id,
      section: fee.section,
      amount: fee.amount.toString(),
      academicYear: fee.academicYear,
      dueDate: fee.dueDate.split('T')[0],
      description: fee.description || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this fee structure?')) {
      try {
        await axios.delete(`${API_BASE}/FeeStructure/${id}`);
        showToast('Fee structure deleted successfully!', 'success');
        fetchData();
      } catch (error) {
        showToast(error.response?.data?.message || 'Error deleting fee structure', 'error');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      feeName: '',
      feeType: 'Tuition',
        class: '',
      amount: '',
      academicYear: new Date().getFullYear().toString(),
        frequency: 'Monthly',
        month: '',
      dueDate: '',
      description: ''
    });
    setEditingFee(null);
    setShowModal(false);
  };

  const getSectionsForClass = (classId) => {
    const selectedClass = classes.find(c => c._id === classId);
    return selectedClass?.sections || [];
  };

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
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Fee Management</h1>
        <p className="text-gray-600">Manage fee structures and monitor collections</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-br from-rose-400 to-pink-500 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-white/20 p-3 rounded-lg">
              <AlertCircle className="w-6 h-6" />
            </div>
            <DollarSign className="w-8 h-8 opacity-50" />
          </div>
          <h3 className="text-white/90 text-sm font-medium mb-1">Total Pending</h3>
          <p className="text-3xl font-bold">Rs. {(statistics?.pendingFees?.amount || 0).toLocaleString()}</p>
          <p className="text-white/80 text-sm mt-2">{statistics?.pendingFees?.count || 0} pending fees</p>
        </div>

        <div className="bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-white/20 p-3 rounded-lg">
              <Calendar className="w-6 h-6" />
            </div>
            <DollarSign className="w-8 h-8 opacity-50" />
          </div>
          <h3 className="text-white/90 text-sm font-medium mb-1">Today's Collection</h3>
          <p className="text-3xl font-bold">Rs. {(statistics?.todayCollection?.amount || 0).toLocaleString()}</p>
          <p className="text-white/80 text-sm mt-2">{statistics?.todayCollection?.count || 0} transactions</p>
        </div>

        <div className="bg-gradient-to-br from-indigo-400 to-purple-500 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-white/20 p-3 rounded-lg">
              <TrendingUp className="w-6 h-6" />
            </div>
            <DollarSign className="w-8 h-8 opacity-50" />
          </div>
          <h3 className="text-white/90 text-sm font-medium mb-1">Monthly Collection</h3>
          <p className="text-3xl font-bold">Rs. {(statistics?.monthlyCollection?.amount || 0).toLocaleString()}</p>
          <p className="text-white/80 text-sm mt-2">{statistics?.monthlyCollection?.count || 0} transactions</p>
        </div>
      </div>

      {/* Fee Structures Section */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Fee Structures</h2>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
          >
            <Plus className="w-5 h-5" />
            Create New
          </button>
        </div>

        {/* Fee Structures Table */}
        {!Array.isArray(feeStructures) ||  feeStructures.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No fee structures created yet</p>
            <p className="text-gray-400 text-sm">Create your first fee structure to get started</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Fee Name</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Class</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Section</th>
                                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Frequency</th>
                                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Month</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Due Date</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Year</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {feeStructures.map((fee) => (
                  <tr key={fee._id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">{fee.feeName}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-3 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                        {fee.feeType}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                      {fee.class?.sclassName || 'N/A'}
                    </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-800">
                                {fee.frequency || 'One-time'}
                            </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                            {fee.month || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-semibold text-gray-900">Rs. {fee.amount.toLocaleString()}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                      {new Date(fee.dueDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                      {fee.academicYear}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(fee)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(fee._id)}
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

      {/* Create/Edit Modal */}
      {isVisible && (
        <div className={`fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 overflow-y-auto p-4 ${isClosing ? 'animate-fade-out' : 'animate-fade-in'}`}>
          <div className={`bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto ${isClosing ? 'animate-scale-down' : 'animate-scale-up'}`}>
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4">
              <h3 className="text-2xl font-bold text-gray-900">
                {editingFee ? 'Edit Fee Structure' : 'Create Fee Structure'}
              </h3>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Fee Name *
                  </label>
                  <input
                    type="text"
                    name="feeName"
                    value={formData.feeName}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="e.g., First Term Tuition"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Fee Type *
                  </label>
                  <select
                    name="feeType"
                    value={formData.feeType}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    {feeTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Class *
                  </label>
                  <select
                    name="class"
                    value={formData.class}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="">Select Class</option>
                                      {classes.map(cls => (
                                          <option key={cls._id} value={cls._id}>
                                              {cls.sclassName || cls.name || 'Unknown Class'}
                                          </option>
                    ))}
                  </select>
                </div>

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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Enter amount"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Academic Year *
                  </label>
                  <input
                    type="text"
                    name="academicYear"
                    value={formData.academicYear}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="2025"
                  />
                </div>

                              <div>
                                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                                      Frequency *
                                  </label>
                                  <select
                                      name="frequency"
                                      value={formData.frequency}
                                      onChange={handleInputChange}
                                      required
                                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                  >
                                      <option value="Monthly">Monthly</option>
                                      <option value="Quarterly">Quarterly</option>
                                      <option value="Yearly">Yearly</option>
                                      <option value="One-time">One-time</option>
                                  </select>
                              </div>

                              {formData.frequency === 'Monthly' && (
                                  <div>
                                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                                          Month *
                                      </label>
                                      <select
                                          name="month"
                                          value={formData.month}
                                          onChange={handleInputChange}
                                          required
                                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                      >
                                          <option value="">Select Month</option>
                                          <option value="January">January</option>
                                          <option value="February">February</option>
                                          <option value="March">March</option>
                                          <option value="April">April</option>
                                          <option value="May">May</option>
                                          <option value="June">June</option>
                                          <option value="July">July</option>
                                          <option value="August">August</option>
                                          <option value="September">September</option>
                                          <option value="October">October</option>
                                          <option value="November">November</option>
                                          <option value="December">December</option>
                                      </select>
                                  </div>
                              )}

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Due Date *
                  </label>
                  <input
                    type="date"
                    name="dueDate"
                    value={formData.dueDate}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows="3"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Optional description"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-semibold transition"
                >
                  {editingFee ? 'Update' : 'Create'} Fee Structure
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

export default FeeManagement;
