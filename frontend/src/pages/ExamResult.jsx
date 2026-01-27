import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useModalAnimation } from '../hooks/useModalAnimation';
import axios from 'axios';
import { Award, Plus, Edit, Search, TrendingUp, Users, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

const API_BASE = "http://localhost:5000";

const ExamResult = () => {
  const { currentUser } = useAuth();
  const { showToast } = useToast();
  
  const [examGroups, setExamGroups] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [students, setStudents] = useState([]);
  const [results, setResults] = useState([]);
  const [grades, setGrades] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingResult, setEditingResult] = useState(null);
  
  const [selectedGroup, setSelectedGroup] = useState('');
  const [selectedSchedule, setSelectedSchedule] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  
  const { isVisible, isClosing, handleClose } = useModalAnimation(showModal, () => {
    setShowModal(false);
    setEditingResult(null);
  });
  
  const [formData, setFormData] = useState({
    marksObtained: '',
    status: 'Pass',
    remarks: ''
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

  useEffect(() => {
    if (selectedSchedule) {
      fetchScheduleDetails();
    }
  }, [selectedSchedule]);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [groupsRes, gradesRes] = await Promise.all([
        axios.get(`${API_BASE}/ExamGroups/${currentUser._id}`),
        axios.get(`${API_BASE}/MarksGrades/${currentUser._id}`)
      ]);
      
      setExamGroups(Array.isArray(groupsRes.data) ? groupsRes.data : []);
      setGrades(Array.isArray(gradesRes.data) ? gradesRes.data : []);
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

  const fetchScheduleDetails = async () => {
    try {
      const schedule = schedules.find(s => s._id === selectedSchedule);
      if (!schedule) return;

      const [studentsRes, resultsRes] = await Promise.all([
        axios.get(`${API_BASE}/Students/${currentUser._id}`),
        axios.get(`${API_BASE}/ExamResults/Exam/${selectedSchedule}`)
      ]);

      // Filter students by class
      const classStudents = studentsRes.data.filter(s => s.sclassName?._id === schedule.class._id);
      setStudents(classStudents);
      setResults(Array.isArray(resultsRes.data) ? resultsRes.data : []);
    } catch (error) {
      showToast(error.response?.data?.message || 'Error fetching details', 'error');
    }
  };

  const calculateGrade = (percentage) => {
    for (const grade of grades) {
      if (percentage >= grade.percentageFrom && percentage <= grade.percentageTo) {
        return grade.gradeName;
      }
    }
    return 'N/A';
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddResult = (student) => {
    setSelectedStudent(student);
    setEditingResult(null);
    setFormData({
      marksObtained: '',
      status: 'Pass',
      remarks: ''
    });
    setShowModal(true);
  };

  const handleEditResult = (result, student) => {
    setSelectedStudent(student);
    setEditingResult(result);
    setFormData({
      marksObtained: result.marksObtained.toString(),
      status: result.status,
      remarks: result.remarks || ''
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const schedule = schedules.find(s => s._id === selectedSchedule);
    if (!schedule) return;

    try {
      const marksObtained = parseFloat(formData.marksObtained);
      const percentage = ((marksObtained / schedule.totalMarks) * 100).toFixed(2);
      const grade = calculateGrade(parseFloat(percentage));

      const payload = {
        student: selectedStudent._id,
        examSchedule: selectedSchedule,
        marksObtained,
        totalMarks: schedule.totalMarks,
        percentage: parseFloat(percentage),
        grade,
        status: formData.status,
        remarks: formData.remarks,
        school: currentUser._id
      };

      if (editingResult) {
        await axios.put(`${API_BASE}/ExamResult/${editingResult._id}`, payload);
        showToast('Result updated successfully!', 'success');
      } else {
        await axios.post(`${API_BASE}/ExamResultCreate`, payload);
        showToast('Result added successfully!', 'success');
      }
      
      handleClose();
      fetchScheduleDetails();
    } catch (error) {
      showToast(error.response?.data?.message || 'Error saving result', 'error');
    }
  };

  const getStudentResult = (studentId) => {
    return results.find(r => r.student._id === studentId || r.student === studentId);
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'Pass': return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'Fail': return <XCircle className="w-5 h-5 text-red-600" />;
      case 'Absent': return <AlertCircle className="w-5 h-5 text-orange-600" />;
      default: return null;
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'Pass': return 'bg-green-100 text-green-800';
      case 'Fail': return 'bg-red-100 text-red-800';
      case 'Absent': return 'bg-orange-100 text-orange-800';
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

  const currentSchedule = schedules.find(s => s._id === selectedSchedule);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Exam Results</h1>
        <p className="text-gray-600">Enter and manage student exam results</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Select Exam Group</label>
            <select
              value={selectedGroup}
              onChange={(e) => {
                setSelectedGroup(e.target.value);
                setSelectedSchedule('');
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="">-- Select Exam Group --</option>
              {examGroups.map(group => (
                <option key={group._id} value={group._id}>
                  {group.groupName} ({group.academicYear})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Select Exam</label>
            <select
              value={selectedSchedule}
              onChange={(e) => setSelectedSchedule(e.target.value)}
              disabled={!selectedGroup}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-100"
            >
              <option value="">-- Select Exam --</option>
              {schedules.map(schedule => (
                <option key={schedule._id} value={schedule._id}>
                  {schedule.class?.sclassName} - {schedule.subject}
                </option>
              ))}
            </select>
          </div>
        </div>

        {currentSchedule && (
          <div className="mt-4 p-4 bg-indigo-50 rounded-lg border border-indigo-200">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Subject:</span>
                <span className="ml-2 font-semibold text-gray-900">{currentSchedule.subject}</span>
              </div>
              <div>
                <span className="text-gray-600">Total Marks:</span>
                <span className="ml-2 font-semibold text-gray-900">{currentSchedule.totalMarks}</span>
              </div>
              <div>
                <span className="text-gray-600">Passing Marks:</span>
                <span className="ml-2 font-semibold text-gray-900">{currentSchedule.passingMarks}</span>
              </div>
              <div>
                <span className="text-gray-600">Date:</span>
                <span className="ml-2 font-semibold text-gray-900">
                  {new Date(currentSchedule.examDate).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Results Table */}
      {selectedSchedule && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Student Results</h2>
            <div className="flex items-center gap-2 text-sm">
              <Users className="w-4 h-4 text-gray-600" />
              <span className="text-gray-600">{students.length} Students</span>
            </div>
          </div>

          {students.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No students found</p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Roll No</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Student Name</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Marks Obtained</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Percentage</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Grade</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {students.map((student) => {
                    const result = getStudentResult(student._id);
                    return (
                      <tr key={student._id} className="hover:bg-gray-50 transition">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {student.rollNum}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-medium text-gray-900">{student.name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {result ? (
                            <span className="font-semibold text-gray-900">
                              {result.marksObtained}/{currentSchedule.totalMarks}
                            </span>
                          ) : (
                            <span className="text-gray-400">Not entered</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {result ? (
                            <div className="flex items-center gap-2">
                              <TrendingUp className="w-4 h-4 text-indigo-600" />
                              <span className="font-semibold">{result.percentage}%</span>
                            </div>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {result && result.grade ? (
                            <span className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm font-bold">
                              {result.grade}
                            </span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {result ? (
                            <div className="flex items-center gap-2">
                              {getStatusIcon(result.status)}
                              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(result.status)}`}>
                                {result.status}
                              </span>
                            </div>
                          ) : (
                            <span className="text-gray-400">Pending</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {result ? (
                            <button
                              onClick={() => handleEditResult(result, student)}
                              className="flex items-center gap-1 px-3 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition text-sm"
                            >
                              <Edit className="w-4 h-4" />
                              Edit
                            </button>
                          ) : (
                            <button
                              onClick={() => handleAddResult(student)}
                              className="flex items-center gap-1 px-3 py-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition text-sm"
                            >
                              <Plus className="w-4 h-4" />
                              Add
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Add/Edit Modal */}
      {isVisible && selectedStudent && (
        <div className={`fixed inset-0 bg-black/70 flex items-center justify-center z-50 overflow-y-auto p-4 ${isClosing ? 'animate-fade-out' : 'animate-fade-in'}`}>
          <div className={`bg-white rounded-xl shadow-2xl max-w-xl w-full ${isClosing ? 'animate-scale-down' : 'animate-scale-up'}`}>
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-xl">
              <h3 className="text-2xl font-bold text-gray-900">
                {editingResult ? 'Edit' : 'Add'} Result for {selectedStudent.name}
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Roll No: {selectedStudent.rollNum} | Total Marks: {currentSchedule?.totalMarks}
              </p>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Marks Obtained *
                </label>
                <input
                  type="number"
                  name="marksObtained"
                  value={formData.marksObtained}
                  onChange={handleInputChange}
                  required
                  min="0"
                  max={currentSchedule?.totalMarks}
                  step="0.5"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder={`Enter marks (Max: ${currentSchedule?.totalMarks})`}
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
                  <option value="Pass">Pass</option>
                  <option value="Fail">Fail</option>
                  <option value="Absent">Absent</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Remarks
                </label>
                <textarea
                  name="remarks"
                  value={formData.remarks}
                  onChange={handleInputChange}
                  rows="3"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Optional remarks"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-semibold transition"
                >
                  {editingResult ? 'Update' : 'Add'} Result
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

export default ExamResult;
