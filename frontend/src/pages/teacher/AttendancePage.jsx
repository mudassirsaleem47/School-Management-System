import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Calendar, Clock, Users, CheckCircle, XCircle, Save } from 'lucide-react';

const AttendancePage = () => {
  const { currentUser } = useAuth();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedClass, setSelectedClass] = useState('');

  // Mock student data
  const [students, setStudents] = useState([
    { id: 1, name: 'Ahmed Ali', rollNo: '001', status: 'present' },
    { id: 2, name: 'Fatima Khan', rollNo: '002', status: 'present' },
    { id: 3, name: 'Hassan Ahmed', rollNo: '003', status: 'absent' },
    { id: 4, name: 'Ayesha Malik', rollNo: '004', status: 'present' },
    { id: 5, name: 'Usman Tariq', rollNo: '005', status: 'present' },
  ]);

  const handleStatusChange = (studentId, status) => {
    setStudents(students.map(student => 
      student.id === studentId ? { ...student, status } : student
    ));
  };

  const handleSaveAttendance = () => {
    alert('Attendance saved successfully!');
  };

  const presentCount = students.filter(s => s.status === 'present').length;
  const absentCount = students.filter(s => s.status === 'absent').length;
  const attendancePercentage = ((presentCount / students.length) * 100).toFixed(1);

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
              <option value="">All Classes</option>
              {currentUser?.assignedClasses?.map((cls, idx) => (
                <option key={idx} value={cls._id}>{cls.sclassName}</option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={handleSaveAttendance}
              className="w-full px-6 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-600 transition flex items-center justify-center gap-2"
            >
              <Save className="w-5 h-5" />
              Save Attendance
            </button>
          </div>
        </div>
      </div>

      {/* Attendance Table */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
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
                <tr key={student.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4 text-sm font-600 text-gray-900">{student.rollNo}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{student.name}</td>
                  <td className="px-6 py-4 text-center">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-600 ${
                      student.status === 'present' 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {student.status === 'present' ? 'Present' : 'Absent'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => handleStatusChange(student.id, 'present')}
                        className={`px-4 py-2 rounded-lg font-600 transition ${
                          student.status === 'present'
                            ? 'bg-green-600 text-white'
                            : 'bg-green-100 text-green-700 hover:bg-green-200'
                        }`}
                      >
                        Present
                      </button>
                      <button
                        onClick={() => handleStatusChange(student.id, 'absent')}
                        className={`px-4 py-2 rounded-lg font-600 transition ${
                          student.status === 'absent'
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
      </div>
    </div>
  );
};

export default AttendancePage;
