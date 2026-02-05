import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import axios from 'axios';
import { Search, Filter, Eye, Mail, Phone, Calendar, Users } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL;

const TeacherStudentsPage = () => {
  const { currentUser } = useAuth();
  const { showToast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentUser) {
      fetchStudents();
    }
  }, [currentUser]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const schoolId = currentUser.school?._id || currentUser.school;
      const response = await axios.get(`${API_BASE}/Students/${schoolId}`);

      // Filter students by teacher's assigned classes
      let teacherStudents = response.data || [];
      if (currentUser.assignedClasses && currentUser.assignedClasses.length > 0) {
        const assignedClassIds = currentUser.assignedClasses.map(cls => cls._id);
        teacherStudents = teacherStudents.filter(student =>
          assignedClassIds.includes(student.sclassName?._id)
        );
      }

      setStudents(teacherStudents);
      setLoading(false);
    } catch (error) {
      showToast(error.response?.data?.message || 'Error fetching students', 'error');
      setLoading(false);
    }
  };

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.rollNum.toString().includes(searchQuery);
    const matchesClass = !selectedClass || student.sclassName?._id === selectedClass;
    return matchesSearch && matchesClass;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900">My Students</h1>
        <p className="text-gray-600 mt-2">View and manage your assigned students</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
          <p className="text-gray-600 text-sm">Total Students</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{students.length}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
          <p className="text-gray-600 text-sm">Assigned Classes</p>
          <p className="text-3xl font-bold text-emerald-600 mt-1">{currentUser?.assignedClasses?.length || 0}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
          <p className="text-gray-600 text-sm">Avg Students/Class</p>
          <p className="text-3xl font-bold text-blue-600 mt-1">
            {currentUser?.assignedClasses?.length > 0
              ? Math.round(students.length / currentUser.assignedClasses.length)
              : 0}
          </p>
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
              {currentUser?.assignedClasses?.map((cls) => (
                <option key={cls._id} value={cls._id}>{cls.sclassName}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Students Table */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
        {filteredStudents.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">
              {searchQuery || selectedClass ? 'No students found matching your filters' : 'No students assigned to your classes'}
            </p>
          </div>
        ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-linear-to-r from-emerald-50 to-emerald-100 border-b border-gray-200">
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">Roll No</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">Name</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">Class</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">Father Name</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">Contact</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredStudents.map((student) => (
                  <tr key={student._id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 text-sm font-600 text-gray-900">{student.rollNum}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{student.name}</td>
                    <td className="px-6 py-4 text-sm">
                      <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-600">
                        {student.sclassName?.sclassName || 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{student.fatherName || 'N/A'}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      <div className="flex flex-col gap-1">
                        {student.fatherPhone && (
                          <div className="flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            <span className="text-xs">{student.fatherPhone}</span>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                </tbody>
              </table>
            </div>
        )}
      </div>
    </div>
  );
};

export default TeacherStudentsPage;
