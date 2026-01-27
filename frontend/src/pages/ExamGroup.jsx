import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useModalAnimation } from '../hooks/useModalAnimation';
import axios from 'axios';
import { BookOpen, Plus, Edit, Trash2, Calendar, FileText, X } from 'lucide-react';


const API_BASE = "http://localhost:5000";

const ExamGroup = () => {
  const { currentUser } = useAuth();
  const { showToast } = useToast();
  
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingGroup, setEditingGroup] = useState(null);
  const [selectedDeleteId, setSelectedDeleteId] = useState(null);
  
  const { isVisible, isClosing, handleClose } = useModalAnimation(showModal, () => {
    setShowModal(false);
    setEditingGroup(null);
  });
  
  const [formData, setFormData] = useState({
    groupName: '',
    academicYear: new Date().getFullYear().toString(),
    description: '',
    status: 'Active'
  });

  useEffect(() => {
    if (currentUser) {
      fetchGroups();
    }
  }, [currentUser]);

  const fetchGroups = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE}/ExamGroups/${currentUser._id}`);
      setGroups(Array.isArray(response.data) ? response.data : []);
      setLoading(false);
    } catch (error) {
      showToast(error.response?.data?.message || 'Error fetching exam groups', 'error');
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
      const payload = { ...formData, school: currentUser._id };

      if (editingGroup) {
        await axios.put(`${API_BASE}/ExamGroup/${editingGroup._id}`, payload);
        showToast('Exam group updated successfully!', 'success');
      } else {
        await axios.post(`${API_BASE}/ExamGroupCreate`, payload);
        showToast('Exam group created successfully!', 'success');
      }
      
      resetForm();
      fetchGroups();
    } catch (error) {
      showToast(error.response?.data?.message || 'Error saving exam group', 'error');
    }
  };

  const handleEdit = (group) => {
    setEditingGroup(group);
    setFormData({
      groupName: group.groupName,
      academicYear: group.academicYear,
      description: group.description || '',
      status: group.status
    });
    setShowModal(true);
  };

    const handleDelete = (id) => {
      if (selectedDeleteId === id) {
        confirmDelete();
      } else {
        setSelectedDeleteId(id);
        setTimeout(() => {
          setSelectedDeleteId(prev => prev === id ? null : prev);
        }, 3000);
      }
    };

    const confirmDelete = async () => {
      if (!selectedDeleteId) return;
        try {
          await axios.delete(`${API_BASE}/ExamGroup/${selectedDeleteId}`);
        showToast('Exam group deleted successfully!', 'success');
        fetchGroups();
    } catch (error) {
        showToast(error.response?.data?.message || 'Error deleting exam group', 'error');
    }
      setSelectedDeleteId(null);
  };

  const resetForm = () => {
    setFormData({
      groupName: '',
      academicYear: new Date().getFullYear().toString(),
      description: '',
      status: 'Active'
    });
    setEditingGroup(null);
    setShowModal(false);
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'Active': return 'bg-green-100 text-green-800';
      case 'Inactive': return 'bg-gray-100 text-gray-800';
      case 'Completed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
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
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Exam Groups</h1>
        <p className="text-gray-600">Organize exams by term, semester, or academic year</p>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">All Exam Groups</h2>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
          >
            <Plus className="w-5 h-5" />
            Create Exam Group
          </button>
        </div>

        {groups.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No exam groups yet</p>
            <p className="text-gray-400 text-sm">Create your first exam group to get started</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {groups.map((group) => (
              <div
                key={group._id}
                className="bg-linear-to-br from-indigo-50 to-purple-50 rounded-xl p-6 border-2 border-indigo-100 hover:shadow-lg transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="bg-indigo-600 p-3 rounded-lg">
                    <BookOpen className="w-6 h-6 text-white" />
                  </div>
                  <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(group.status)}`}>
                    {group.status}
                  </span>
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 mb-2">{group.groupName}</h3>
                <div className="flex items-center gap-2 text-gray-600 text-sm mb-3">
                  <Calendar className="w-4 h-4" />
                  <span>{group.academicYear}</span>
                </div>
                
                {group.description && (
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">{group.description}</p>
                )}
                
                <div className="flex items-center gap-2 pt-4 border-t border-indigo-200">
                  <button
                    onClick={() => handleEdit(group)}
                    className="flex-1 px-3 py-2 bg-white text-indigo-600 rounded-lg hover:bg-indigo-50 transition flex items-center justify-center gap-2"
                  >
                    <Edit className="w-4 h-4" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(group._id)}
                    className={`flex-1 px-3 py-2 rounded-lg transition flex items-center justify-center gap-2 ${selectedDeleteId === group._id
                      ? "bg-red-600 text-white hover:bg-red-700 font-bold"
                      : "bg-white text-red-600 hover:bg-red-50"
                      }`}
                  >
                    {selectedDeleteId === group._id ? (
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
        <div className={`fixed inset-0 bg-black/70 flex items-center justify-center z-50 overflow-y-auto p-4 ${isClosing ? 'animate-fade-out' : 'animate-fade-in'}`}>
          <div className={`bg-white rounded-xl shadow-2xl max-w-2xl w-full ${isClosing ? 'animate-scale-down' : 'animate-scale-up'}`}>
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-xl">
              <h3 className="text-2xl font-bold text-gray-900">
                {editingGroup ? 'Edit Exam Group' : 'Create Exam Group'}
              </h3>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Group Name *
                </label>
                <input
                  type="text"
                  name="groupName"
                  value={formData.groupName}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="e.g., Mid Term 2024, Final Exam"
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
                  placeholder="e.g., 2024"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Status *
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>

              <div>
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

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-semibold transition"
                >
                  {editingGroup ? 'Update' : 'Create'} Group
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

export default ExamGroup;
