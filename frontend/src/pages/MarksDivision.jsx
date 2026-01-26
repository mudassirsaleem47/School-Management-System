import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useModalAnimation } from '../hooks/useModalAnimation';
import axios from 'axios';
import { Award, Plus, Edit, Trash2, TrendingUp } from 'lucide-react';


const API_BASE = "http://localhost:5000";

const MarksDivision = () => {
  const { currentUser } = useAuth();
  const { showToast } = useToast();
  
  const [divisions, setDivisions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingDivision, setEditingDivision] = useState(null);
  const [selectedDeleteId, setSelectedDeleteId] = useState(null);
  
  const { isVisible, isClosing, handleClose } = useModalAnimation(showModal, () => {
    setShowModal(false);
    setEditingDivision(null);
  });
  
  const [formData, setFormData] = useState({
    divisionName: '',
    percentageFrom: '',
    percentageTo: ''
  });

  useEffect(() => {
    if (currentUser) {
      fetchDivisions();
    }
  }, [currentUser]);

  const fetchDivisions = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE}/MarksDivisions/${currentUser._id}`);
      setDivisions(Array.isArray(response.data) ? response.data : []);
      setLoading(false);
    } catch (error) {
      showToast(error.response?.data?.message || 'Error fetching divisions', 'error');
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
        percentageFrom: parseFloat(formData.percentageFrom),
        percentageTo: parseFloat(formData.percentageTo),
        school: currentUser._id
      };

      if (editingDivision) {
        await axios.put(`${API_BASE}/MarksDivision/${editingDivision._id}`, payload);
        showToast('Division updated successfully!', 'success');
      } else {
        await axios.post(`${API_BASE}/MarksDivisionCreate`, payload);
        showToast('Division created successfully!', 'success');
      }
      
      resetForm();
      fetchDivisions();
    } catch (error) {
      showToast(error.response?.data?.message || 'Error saving division', 'error');
    }
  };

  const handleEdit = (division) => {
    setEditingDivision(division);
    setFormData({
      divisionName: division.divisionName,
      percentageFrom: division.percentageFrom.toString(),
      percentageTo: division.percentageTo.toString()
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
      await axios.delete(`${API_BASE}/MarksDivision/${selectedDeleteId}`);
      showToast('Division deleted successfully!', 'success');
      fetchDivisions();
    } catch (error) {
      showToast(error.response?.data?.message || 'Error deleting division', 'error');
    }
    setSelectedDeleteId(null);
  };

  const resetForm = () => {
    setFormData({
      divisionName: '',
      percentageFrom: '',
      percentageTo: ''
    });
    setEditingDivision(null);
    setShowModal(false);
  };

  const getDivisionColor = (divisionName) => {
    const colors = {
      '1st': 'from-emerald-500 to-teal-500',
      'First': 'from-emerald-500 to-teal-500',
      '2nd': 'from-blue-500 to-cyan-500',
      'Second': 'from-blue-500 to-cyan-500',
      '3rd': 'from-orange-500 to-amber-500',
      'Third': 'from-orange-500 to-amber-500'
    };
    return colors[divisionName] || 'from-indigo-500 to-purple-500';
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
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Marks Division Configuration</h1>
        <p className="text-gray-600">Configure division system based on percentage</p>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Division System</h2>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
          >
            <Plus className="w-5 h-5" />
            Add Division
          </button>
        </div>

        {divisions.length === 0 ? (
          <div className="text-center py-12">
            <Award className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No divisions configured yet</p>
            <p className="text-gray-400 text-sm">Set up division criteria to classify student performance</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {divisions.map((division) => (
              <div
                key={division._id}
                className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-6 border-2 border-indigo-100 hover:shadow-lg transition-all"
              >
                <div className={`w-full h-24 rounded-lg bg-gradient-to-br ${getDivisionColor(division.divisionName)} flex items-center justify-center mb-4 shadow-lg`}>
                  <div className="text-center">
                    <div className="text-white font-bold text-3xl">{division.divisionName}</div>
                    <div className="text-white/90 text-sm">Division</div>
                  </div>
                </div>
                
                <div className="flex items-center justify-center gap-2 mb-4">
                  <TrendingUp className="w-5 h-5 text-indigo-600" />
                  <span className="text-lg font-semibold text-gray-900">
                    {division.percentageFrom}% - {division.percentageTo}%
                  </span>
                </div>
                
                <div className="flex items-center gap-2 pt-4 border-t border-indigo-200">
                  <button
                    onClick={() => handleEdit(division)}
                    className="flex-1 px-3 py-2 bg-white text-indigo-600 rounded-lg hover:bg-indigo-50 transition flex items-center justify-center gap-2"
                  >
                    <Edit className="w-4 h-4" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(division._id)}
                    className={`flex-1 px-3 py-2 rounded-lg transition flex items-center justify-center gap-2 ${selectedDeleteId === division._id
                      ? "bg-red-600 text-white hover:bg-red-700 font-bold"
                      : "bg-white text-red-600 hover:bg-red-50"
                      }`}
                  >
                    {selectedDeleteId === division._id ? (
                      <span>Sure?</span>
                    ) : (
                      <>
                          <Trash2 className="w-4 h-4" />
                          Delete
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {isVisible && (
        <div className={`fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 overflow-y-auto p-4 ${isClosing ? 'animate-fade-out' : 'animate-fade-in'}`}>
          <div className={`bg-white rounded-xl shadow-2xl max-w-xl w-full ${isClosing ? 'animate-scale-down' : 'animate-scale-up'}`}>
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-xl">
              <h3 className="text-2xl font-bold text-gray-900">
                {editingDivision ? 'Edit Division' : 'Add New Division'}
              </h3>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Division Name *
                </label>
                <input
                  type="text"
                  name="divisionName"
                  value={formData.divisionName}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="e.g., 1st, 2nd, 3rd"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Percentage From *
                  </label>
                  <input
                    type="number"
                    name="percentageFrom"
                    value={formData.percentageFrom}
                    onChange={handleInputChange}
                    required
                    min="0"
                    max="100"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="e.g., 60"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Percentage To *
                  </label>
                  <input
                    type="number"
                    name="percentageTo"
                    value={formData.percentageTo}
                    onChange={handleInputChange}
                    required
                    min="0"
                    max="100"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="e.g., 100"
                  />
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <strong>Example:</strong> 1st Division: 60% - 100%, 2nd Division: 45% - 59%, 3rd Division: 33% - 44%
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-semibold transition"
                >
                  {editingDivision ? 'Update' : 'Add'} Division
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

export default MarksDivision;
