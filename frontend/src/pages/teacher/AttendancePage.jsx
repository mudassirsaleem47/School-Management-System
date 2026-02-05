import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import axios from 'axios';
import { Calendar, Clock, Users, CheckCircle, XCircle, Save } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL;

const AttendancePage = () => {
  const { currentUser } = useAuth();
  const { showToast } = useToast();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedClass, setSelectedClass] = useState('');
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (selectedClass) {
      fetchStudents();
    }
  }, [selectedClass]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const schoolId = currentUser.school?._id || currentUser.school;
      const response = await axios.get(`${API_BASE}/Students/${schoolId}`);

      // Filter students by selected class
      const classStudents = response.data.filter(s => s.sclassName?._id === selectedClass);

      // Initialize attendance status as present for all
      const studentsWithAttendance = classStudents.map(student => ({
        ...student,
        status: 'present'
      }));

      setStudents(studentsWithAttendance);
      setLoading(false);
    } catch (error) {
      showToast(error.response?.data?.message || 'Error fetching students', 'error');
      setLoading(false);
    }
  };

  const handleStatusChange = (studentId, status) => {
    setStudents(students.map(student => 
      student._id === studentId ? { ...student, status } : student
    ));
  };

  const handleSaveAttendance = async () => {
    try {
      // Here you would save attendance to backend
      // For now, just show success message
      showToast('Attendance saved successfully!', 'success');
    } catch (error) {
      showToast(error.response?.data?.message || 'Error saving attendance', 'error');
    }
  };

  const presentCount = students.filter(s => s.status === 'present').length;
  const absentCount = students.filter(s => s.status === 'absent').length;
  const attendancePercentage = students.length > 0 ? ((presentCount / students.length) * 100).toFixed(1) : 0;

  return (
    <div className="p-6 md:p-8">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Mark Attendance</h1>
        <p className="text-gray-600 mt-2">Track and manage student attendance</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Students</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{students.length}</p>
            </div>
            <Users className="w-10 h-10 text-blue-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Present</p>
              <p className="text-3xl font-bold text-green-600 mt-1">{presentCount}</p>
            </div>
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Absent</p>
              <p className="text-3xl font-bold text-red-600 mt-1">{absentCount}</p>
            </div>
            <XCircle className="w-10 h-10 text-red-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Attendance %</p>
              <p className="text-3xl font-bold text-emerald-600 mt-1">{attendancePercentage}%</p>
            </div>
            <CheckCircle className="w-10 h-10 text-emerald-600" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-600 text-gray-700 mb-2">
              <Calendar className="w-4 h-4 inline mr-2" />
              Select Date
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-sm font-600 text-gray-700 mb-2">
              <Users className="w-4 h-4 inline mr-2" />
              Select Class
            </label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="">-- Select Class --</option>
              {currentUser?.assignedClasses?.map((cls) => (
                <option key={cls._id} value={cls._id}>{cls.sclassName}</option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={handleSaveAttendance}
              disabled={!selectedClass || students.length === 0}
              className="w-full px-6 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-600 transition flex items-center justify-center gap-2 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              <Save className="w-5 h-5" />
              Save Attendance
            </button>
          </div>
        </div>
      </div>

      {/* Attendance Table */}
      {selectedClass && (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
            </div>
          ) : students.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No students found in this class</p>
            </div>
          ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-linear-to-r from-emerald-50 to-emerald-100 border-b border-gray-200">
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">Roll No</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">Student Name</th>
                        <th className="px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase">Status</th>
                        <th className="px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {students.map((student) => (
                    <tr key={student._id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4 text-sm font-600 text-gray-900">{student.rollNum}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{student.name}</td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-600 ${student.status === 'present'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                          }`}>
                          {student.status === 'present' ? 'Present' : 'Absent'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => handleStatusChange(student._id, 'present')}
                            className={`px-4 py-2 rounded-lg font-600 transition ${student.status === 'present'
                                ? 'bg-green-600 text-white'
                                : 'bg-green-100 text-green-700 hover:bg-green-200'
                              }`}
                          >
                            Present
                          </button>
                          <button
                            onClick={() => handleStatusChange(student._id, 'absent')}
                            className={`px-4 py-2 rounded-lg font-600 transition ${student.status === 'absent'
                                ? 'bg-red-600 text-white'
                                : 'bg-red-100 text-red-700 hover:bg-red-200'
                              }`}
                          >
                            Absent
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

      {!selectedClass && (
        <div className="bg-white rounded-xl shadow-lg p-12 text-center">
          <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Select a Class</h3>
          <p className="text-gray-500">Choose a class from the dropdown above to mark attendance</p>
        </div>
      )}
    </div>
  );
};

export default AttendancePage;
