import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import axios from 'axios';
import { Award, Search, TrendingUp, Users, CheckCircle, XCircle, AlertCircle, BookOpen } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL;

const TeacherResultsPage = () => {
  const { currentUser } = useAuth();
  const { showToast } = useToast();
  
  const [examGroups, setExamGroups] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [students, setStudents] = useState([]);
  const [results, setResults] = useState([]);
  const [grades, setGrades] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [selectedGroup, setSelectedGroup] = useState('');
  const [selectedSchedule, setSelectedSchedule] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

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
      // Handle both cases: school as object or as string ID
      const schoolId = currentUser.school?._id || currentUser.school;
      
      const [groupsRes, gradesRes] = await Promise.all([
        axios.get(`${API_BASE}/ExamGroups/${schoolId}`),
        axios.get(`${API_BASE}/MarksGrades/${schoolId}`)
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

      // Handle both cases: school as object or as string ID
      const schoolId = currentUser.school?._id || currentUser.school;

      const [studentsRes, resultsRes] = await Promise.all([
        axios.get(`${API_BASE}/Students/${schoolId}`),
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

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.rollNum.toString().includes(searchTerm)
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  const currentSchedule = schedules.find(s => s._id === selectedSchedule);

  return (
    <div className="p-4 md:p-6 bg-gray-50 min-h-screen">
      <div className="mb-6 md:mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
            <Award className="w-6 h-6 text-emerald-600" />
          </div>
          <h1 className="text-2xl md:text-4xl font-bold text-gray-900">Exam Results</h1>
        </div>
        <p className="text-gray-600 ml-0 md:ml-13">View student exam results and performance</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-lg p-4 md:p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Select Exam Group</label>
            <select
              value={selectedGroup}
              onChange={(e) => {
                setSelectedGroup(e.target.value);
                setSelectedSchedule('');
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent disabled:bg-gray-100"
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
          <div className="mt-4 p-4 bg-emerald-50 rounded-lg border border-emerald-200">
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
        <div className="bg-white rounded-xl shadow-lg p-4 md:p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
            <div className="flex items-center gap-2">
              <h2 className="text-xl md:text-2xl font-bold text-gray-900">Student Results</h2>
              <div className="flex items-center gap-2 text-sm">
                <Users className="w-4 h-4 text-gray-600" />
                <span className="text-gray-600">{students.length} Students</span>
              </div>
            </div>

            {/* Search */}
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search student..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>
          </div>

          {filteredStudents.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">
                {searchTerm ? 'No students found matching your search' : 'No students found'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 md:px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Roll No</th>
                    <th className="px-4 md:px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Student Name</th>
                    <th className="px-4 md:px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Marks</th>
                    <th className="px-4 md:px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Percentage</th>
                    <th className="px-4 md:px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Grade</th>
                    <th className="px-4 md:px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredStudents.map((student) => {
                    const result = getStudentResult(student._id);
                    return (
                      <tr key={student._id} className="hover:bg-gray-50 transition">
                        <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {student.rollNum}
                        </td>
                        <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                          <div className="font-medium text-gray-900">{student.name}</div>
                        </td>
                        <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                          {result ? (
                            <span className="font-semibold text-gray-900">
                              {result.marksObtained}/{currentSchedule.totalMarks}
                            </span>
                          ) : (
                            <span className="text-gray-400">Not entered</span>
                          )}
                        </td>
                        <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                          {result ? (
                            <div className="flex items-center gap-2">
                              <TrendingUp className="w-4 h-4 text-emerald-600" />
                              <span className="font-semibold">{result.percentage}%</span>
                            </div>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                          {result && result.grade ? (
                            <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-sm font-bold">
                              {result.grade}
                            </span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-4 md:px-6 py-4 whitespace-nowrap">
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
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Empty State */}
      {!selectedSchedule && (
        <div className="bg-white rounded-xl shadow-lg p-12 text-center">
          <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Select an Exam to View Results</h3>
          <p className="text-gray-500">Choose an exam group and exam from the filters above to view student results</p>
        </div>
      )}
    </div>
  );
};

export default TeacherResultsPage;
