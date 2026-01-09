import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Search, Filter, Eye, Mail, Phone, Calendar } from 'lucide-react';

const TeacherStudentsPage = () => {
  const { currentUser } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClass, setSelectedClass] = useState('');

  // Mock students data
  const students = [
    { id: 1, name: 'Ahmed Ali', rollNo: '001', class: 'Class 10-A', email: 'ahmed@example.com', phone: '0300-1234567', attendance: '95%', performance: 'A' },
    { id: 2, name: 'Fatima Khan', rollNo: '002', class: 'Class 10-A', email: 'fatima@example.com', phone: '0301-2345678', attendance: '92%', performance: 'A' },
    { id: 3, name: 'Hassan Ahmed', rollNo: '003', class: 'Class 9-B', email: 'hassan@example.com', phone: '0302-3456789', attendance: '88%', performance: 'B' },
    { id: 4, name: 'Ayesha Malik', rollNo: '004', class: 'Class 10-A', email: 'ayesha@example.com', phone: '0303-4567890', attendance: '97%', performance: 'A+' },
    { id: 5, name: 'Usman Tariq', rollNo: '005', class: 'Class 9-B', email: 'usman@example.com', phone: '0304-5678901', attendance: '90%', performance: 'A' },
  ];

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         student.rollNo.includes(searchQuery);
    const matchesClass = !selectedClass || student.class === selectedClass;
    return matchesSearch && matchesClass;
  });

  return (
    <div className="p-6 md:p-8">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900">My Students</h1>
        <p className="text-gray-600 mt-2">View and manage your assigned students</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
          <p className="text-gray-600 text-sm">Total Students</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{students.length}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
          <p className="text-gray-600 text-sm">Avg Attendance</p>
          <p className="text-3xl font-bold text-emerald-600 mt-1">92%</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
          <p className="text-gray-600 text-sm">Top Performers</p>
          <p className="text-3xl font-bold text-blue-600 mt-1">3</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
          <p className="text-gray-600 text-sm">Classes</p>
          <p className="text-3xl font-bold text-purple-600 mt-1">{currentUser?.assignedClasses?.length || 0}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or roll number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <div>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="">All Classes</option>
              {currentUser?.assignedClasses?.map((cls, idx) => (
                <option key={idx} value={cls.sclassName}>{cls.sclassName}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Students Table */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-linear-to-r from-emerald-50 to-emerald-100 border-b border-gray-200">
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">Roll No</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">Name</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">Class</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">Contact</th>
                <th className="px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase">Attendance</th>
                <th className="px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase">Performance</th>
                <th className="px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredStudents.map((student) => (
                <tr key={student.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4 text-sm font-600 text-gray-900">{student.rollNo}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{student.name}</td>
                  <td className="px-6 py-4 text-sm">
                    <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-600">
                      {student.class}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-1">
                        <Mail className="w-3 h-3" />
                        <span className="text-xs">{student.email}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Phone className="w-3 h-3" />
                        <span className="text-xs">{student.phone}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="inline-block px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-600">
                      {student.attendance}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="inline-block px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-600">
                      Grade {student.performance}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button className="inline-flex items-center px-3 py-1.5 bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200 transition text-xs font-600">
                      <Eye className="w-4 h-4 mr-1" />
                      View Details
                    </button>
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

export default TeacherStudentsPage;
