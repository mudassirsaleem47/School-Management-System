import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useModalAnimation } from '../hooks/useModalAnimation';
import axios from 'axios';
import { Award, Plus, Edit, Trash2, TrendingUp } from 'lucide-react';

const API_BASE = "http://localhost:5000";

const MarksGrade = () => {
  const { currentUser } = useAuth();
  const { showToast } = useToast();
  
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingGrade, setEditingGrade] = useState(null);
  
  const { isVisible, isClosing, handleClose } = useModalAnimation(showModal, () => {
    setShowModal(false);
    setEditingGrade(null);
  });
  
  const [formData, setFormData] = useState({
    gradeName: '',
    percentageFrom: '',
    percentageTo: '',
    gradePoint: '',
    remarks: ''
  });

  useEffect(() => {
    if (currentUser) {
      fetchGrades();
    }
  }, [currentUser]);

  const fetchGrades = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE}/MarksGrades/${currentUser._id}`);
      setGrades(Array.isArray(response.data) ? response.data : []);
      setLoading(false);
    } catch (error) {
      showToast(error.response?.data?.message || 'Error fetching grades', 'error');
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
        gradePoint: parseFloat(formData.gradePoint),
        school: currentUser._id
      };

      if (editingGrade) {
        await axios.put(`${API_BASE}/MarksGrade/${editingGrade._id}`, payload);
        showToast('Grade updated successfully!', 'success');
      } else {
        await axios.post(`${API_BASE}/MarksGradeCreate`, payload);
        showToast('Grade created successfully!', 'success');
      }
      
      resetForm();
      fetchGrades();
    } catch (error) {
      showToast(error.response?.data?.message || 'Error saving grade', 'error');
    }
  };

  const handleEdit = (grade) => {
    setEditingGrade(grade);
    setFormData({
      gradeName: grade.gradeName,
      percentageFrom: grade.percentageFrom.toString(),
      percentageTo: grade.percentageTo.toString(),
      gradePoint: grade.gradePoint.toString(),
      remarks: grade.remarks || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this grade?')) {
      try {
        await axios.delete(`${API_BASE}/MarksGrade/${id}`);
        showToast('Grade deleted successfully!', 'success');
        fetchGrades();
      } catch (error) {
        showToast(error.response?.data?.message || 'Error deleting grade', 'error');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      gradeName: '',
      percentageFrom: '',
      percentageTo: '',
      gradePoint: '',
      remarks: ''
    });
    setEditingGrade(null);
    setShowModal(false);
  };

  const getGradeColor = (gradeName) => {
    const colors = {
      'A+': 'from-emerald-500 to-teal-500',
      'A': 'from-green-500 to-emerald-500',
      'B+': 'from-blue-500 to-cyan-500',
      'B': 'from-indigo-500 to-blue-500',
      'C': 'from-yellow-500 to-orange-500',
      'D': 'from-orange-500 to-red-500',
      'F': 'from-red-500 to-pink-500'
    };
    return colors[gradeName] || 'from-gray-500 to-gray-600';
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
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Marks Grade Configuration</h1>
        <p className="text-gray-600">Configure grading system with percentage ranges</p>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Grade System</h2>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
          >
            <Plus className="w-5 h-5" />
            Add Grade
          </button>
        </div>

        {grades.length === 0 ? (
          <div className="text-center py-12">
            <Award className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No grades configured yet</p>
            <p className="text-gray-400 text-sm">Set up your grading system to get started</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Grade</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Percentage Range</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Grade Point</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Remarks</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {grades.map((grade) => (
                  <tr key={grade._id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4">
                      <div className={`inline-flex items-center justify-center w-16 h-16 rounded-xl bg-gradient-to-br ${getGradeColor(grade.gradeName)} text-white font-bold text-2xl shadow-lg`}>
                        {grade.gradeName}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-indigo-600" />
                        <span className="font-semibold text-gray-900">
                          {grade.percentageFrom}% - {grade.percentageTo}%
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm font-medium">
                        {grade.gradePoint}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {grade.remarks || '-'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(grade)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(grade._id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
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
          <div className={`bg-white rounded-xl shadow-2xl max-w-2xl w-full ${isClosing ? 'animate-scale-down' : 'animate-scale-up'}`}>
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-xl">
              <h3 className="text-2xl font-bold text-gray-900">
                {editingGrade ? 'Edit Grade' : 'Add New Grade'}
              </h3>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Grade Name *
                  </label>
                  <input
                    type="text"
                    name="gradeName"
                    value={formData.gradeName}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="e.g., A+, A, B+"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Grade Point *
                  </label>
                  <input
                    type="number"
                    name="gradePoint"
                    value={formData.gradePoint}
                    onChange={handleInputChange}
                    required
                    step="0.01"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="e.g., 4.0"
                  />
                </div>

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
                    placeholder="e.g., 90"
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

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Remarks
                </label>
                <input
                  type="text"
                  name="remarks"
                  value={formData.remarks}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="e.g., Excellent, Good, etc."
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-semibold transition"
                >
                  {editingGrade ? 'Update' : 'Add'} Grade
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

export default MarksGrade;
