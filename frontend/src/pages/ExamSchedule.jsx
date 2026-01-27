import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useModalAnimation } from '../hooks/useModalAnimation';
import axios from 'axios';
import { Calendar, Plus, Edit, Trash2, Clock, BookOpen, FileText } from 'lucide-react';


const API_BASE = "http://localhost:5000";

const ExamSchedule = () => {
  const { currentUser } = useAuth();
  const { showToast } = useToast();
  
  const [schedules, setSchedules] = useState([]);
  const [examGroups, setExamGroups] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState('');
  const [selectedDeleteId, setSelectedDeleteId] = useState(null);
  
  const { isVisible, isClosing, handleClose } = useModalAnimation(showModal, () => {
    setShowModal(false);
    setEditingSchedule(null);
  });
  
  const [formData, setFormData] = useState({
    examGroup: '',
    class: '',
    subject: '',
    examDate: '',
    startTime: '',
    duration: '',
    totalMarks: '',
    passingMarks: '',
    roomNumber: '',
    instructions: ''
  });

  useEffect(() => {
    if (currentUser) {
      fetchInitialData();
    }
  }, [currentUser]);

  useEffect(() => {
    if (selectedGroup) {
      fetchSchedules();
    }
  }, [selectedGroup]);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [groupsRes, classesRes] = await Promise.all([
        axios.get(`${API_BASE}/ExamGroups/${currentUser._id}`),
        axios.get(`${API_BASE}/Sclasses/${currentUser._id}`)
      ]);
      
      setExamGroups(Array.isArray(groupsRes.data) ? groupsRes.data : []);
      setClasses(Array.isArray(classesRes.data) ? classesRes.data : []);
      setLoading(false);
    } catch (error) {
      showToast(error.response?.data?.message || 'Error fetching data', 'error');
      setLoading(false);
    }
  };

  const fetchSchedules = async () => {
    try {
      const response = await axios.get(`${API_BASE}/ExamSchedules/Group/${selectedGroup}`);
      setSchedules(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      showToast(error.response?.data?.message || 'Error fetching schedules', 'error');
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
        duration: parseInt(formData.duration),
        totalMarks: parseFloat(formData.totalMarks),
        passingMarks: parseFloat(formData.passingMarks),
        school: currentUser._id
      };

      if (editingSchedule) {
        await axios.put(`${API_BASE}/ExamSchedule/${editingSchedule._id}`, payload);
        showToast('Schedule updated successfully!', 'success');
      } else {
        await axios.post(`${API_BASE}/ExamScheduleCreate`, payload);
        showToast('Exam scheduled successfully!', 'success');
      }
      
      resetForm();
      fetchSchedules();
    } catch (error) {
      showToast(error.response?.data?.message || 'Error saving schedule', 'error');
    }
  };

  const handleEdit = (schedule) => {
    setEditingSchedule(schedule);
    setFormData({
      examGroup: schedule.examGroup._id || schedule.examGroup,
      class: schedule.class._id || schedule.class,
      subject: schedule.subject,
      examDate: new Date(schedule.examDate).toISOString().split('T')[0],
      startTime: schedule.startTime,
      duration: schedule.duration.toString(),
      totalMarks: schedule.totalMarks.toString(),
      passingMarks: schedule.passingMarks.toString(),
      roomNumber: schedule.roomNumber || '',
      instructions: schedule.instructions || ''
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
          await axios.delete(`${API_BASE}/ExamSchedule/${selectedDeleteId}`);
        showToast('Schedule deleted successfully!', 'success');
        fetchSchedules();
        } catch (error) {
        showToast(error.response?.data?.message || 'Error deleting schedule', 'error');
        }
      setSelectedDeleteId(null);
  };

  const resetForm = () => {
    setFormData({
      examGroup: '',
      class: '',
      subject: '',
      examDate: '',
      startTime: '',
      duration: '',
      totalMarks: '',
      passingMarks: '',
      roomNumber: '',
      instructions: ''
    });
    setEditingSchedule(null);
    setShowModal(false);
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
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Exam Schedule</h1>
        <p className="text-gray-600">Create and manage exam timetables</p>
      </div>

      {/* Group Selector */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Select Exam Group
        </label>
        <select
          value={selectedGroup}
          onChange={(e) => setSelectedGroup(e.target.value)}
          className="w-full md:w-1/2 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        >
          <option value="">-- Select Exam Group --</option>
          {examGroups.map(group => (
            <option key={group._id} value={group._id}>
              {group.groupName} ({group.academicYear})
            </option>
          ))}
        </select>
      </div>

      {selectedGroup && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Exam Timetable</h2>
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
            >
              <Plus className="w-5 h-5" />
              Add Exam
            </button>
          </div>

          {schedules.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No exams scheduled yet</p>
              <p className="text-gray-400 text-sm">Add exams to create a timetable</p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Time</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Class</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Subject</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Duration</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Marks</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Room</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {schedules.map((schedule) => (
                    <tr key={schedule._id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-indigo-600" />
                          <span className="text-sm font-medium text-gray-900">
                            {new Date(schedule.examDate).toLocaleDateString()}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-indigo-600" />
                          <span className="text-sm text-gray-700">{schedule.startTime}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                          {schedule.class?.sclassName || 'N/A'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <BookOpen className="w-4 h-4 text-gray-400" />
                          <span className="font-medium text-gray-900">{schedule.subject}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {schedule.duration} min
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {schedule.totalMarks} ({schedule.passingMarks} to pass)
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {schedule.roomNumber || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEdit(schedule)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(schedule._id)}
                            className={`p-2 rounded-lg transition overflow-hidden ${selectedDeleteId === schedule._id
                              ? "bg-red-600 text-white w-20 hover:bg-red-700"
                              : "text-red-600 hover:bg-red-50"
                              }`}
                            title="Delete"
                          >
                            {selectedDeleteId === schedule._id ? (
                              <span className="text-xs font-bold">Sure?</span>
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
      )}

      {/* Add/Edit Modal */}
      {isVisible && (
        <div className={`fixed inset-0 bg-black/70 flex items-center justify-center z-50 overflow-y-auto p-4 ${isClosing ? 'animate-fade-out' : 'animate-fade-in'}`}>
          <div className={`bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto ${isClosing ? 'animate-scale-down' : 'animate-scale-up'}`}>
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-xl">
              <h3 className="text-2xl font-bold text-gray-900">
                {editingSchedule ? 'Edit Exam Schedule' : 'Add Exam Schedule'}
              </h3>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Exam Group *</label>
                  <select
                    name="examGroup"
                    value={formData.examGroup}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="">Select Group</option>
                    {examGroups.map(group => (
                      <option key={group._id} value={group._id}>{group.groupName}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Class *</label>
                  <select
                    name="class"
                    value={formData.class}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="">Select Class</option>
                    {classes.map(cls => (
                      <option key={cls._id} value={cls._id}>{cls.sclassName}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Subject *</label>
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="e.g., Mathematics"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Exam Date *</label>
                  <input
                    type="date"
                    name="examDate"
                    value={formData.examDate}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Start Time *</label>
                  <input
                    type="time"
                    name="startTime"
                    value={formData.startTime}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Duration (minutes) *</label>
                  <input
                    type="number"
                    name="duration"
                    value={formData.duration}
                    onChange={handleInputChange}
                    required
                    min="1"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="e.g., 90"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Total Marks *</label>
                  <input
                    type="number"
                    name="totalMarks"
                    value={formData.totalMarks}
                    onChange={handleInputChange}
                    required
                    min="1"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="e.g., 100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Passing Marks *</label>
                  <input
                    type="number"
                    name="passingMarks"
                    value={formData.passingMarks}
                    onChange={handleInputChange}
                    required
                    min="1"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="e.g., 33"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Room Number</label>
                  <input
                    type="text"
                    name="roomNumber"
                    value={formData.roomNumber}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="e.g., Room 101"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Instructions</label>
                  <textarea
                    name="instructions"
                    value={formData.instructions}
                    onChange={handleInputChange}
                    rows="3"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Special instructions for students"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-semibold transition"
                >
                  {editingSchedule ? 'Update' : 'Add'} Schedule
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

export default ExamSchedule;
