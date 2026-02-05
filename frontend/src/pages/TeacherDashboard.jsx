import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import axios from 'axios';
import { 
  Users, 
  BookOpen, 
  TrendingUp, 
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  ArrowUp,
  ArrowDown
} from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL;

const TeacherDashboard = () => {
  const { currentUser } = useAuth();
  const { showToast } = useToast();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [loading, setLoading] = useState(true);

  // Real data states
  const [students, setStudents] = useState([]);
  const [examSchedules, setExamSchedules] = useState([]);
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalClasses: 0,
    avgAttendance: 0,
    avgPerformance: 0
  });

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (currentUser) {
      fetchDashboardData();
    }
  }, [currentUser]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const schoolId = currentUser.school?._id || currentUser.school;

      if (!schoolId) {
        showToast('School information not found. Please login again.', 'error');
        setLoading(false);
        return;
      }

      // Fetch students
      const studentsRes = await axios.get(`${API_BASE}/Students/${schoolId}`);
      const allStudents = studentsRes.data || [];

      // Filter students by teacher's assigned classes
      let teacherStudents = allStudents;
      if (currentUser.assignedClasses && currentUser.assignedClasses.length > 0) {
        const assignedClassIds = currentUser.assignedClasses.map(cls => cls._id);
        teacherStudents = allStudents.filter(student =>
          assignedClassIds.includes(student.sclassName?._id)
        );
      }

      setStudents(teacherStudents);

      // Fetch exam schedules for today
      if (currentUser.assignedClasses && currentUser.assignedClasses.length > 0) {
        const schedulesPromises = currentUser.assignedClasses.map(cls =>
          axios.get(`${API_BASE}/ExamSchedules/Class/${cls._id}`).catch(() => ({ data: [] }))
        );
        const schedulesResults = await Promise.all(schedulesPromises);
        const allSchedules = schedulesResults.flatMap(res => res.data || []);

        // Filter today's schedules
        const today = new Date().toISOString().split('T')[0];
        const todaySchedules = allSchedules.filter(schedule => {
          const scheduleDate = new Date(schedule.examDate).toISOString().split('T')[0];
          return scheduleDate === today;
        });

        setExamSchedules(todaySchedules.slice(0, 3)); // Show max 3
      }

      // Calculate stats
      setStats({
        totalStudents: teacherStudents.length,
        totalClasses: currentUser.assignedClasses?.length || 0,
        avgAttendance: 0, // Will be calculated from attendance data if available
        avgPerformance: 0 // Will be calculated from exam results if available
      });

      setLoading(false);
    } catch (error) {
      showToast(error.response?.data?.message || 'Error fetching dashboard data', 'error');
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">
            {currentTime.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
      </div>

      {/* Hero Card - Total Students */}
      <div className="bg-linear-to-br from-emerald-600 to-emerald-700 rounded-2xl p-8 mb-6 text-white shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-emerald-100 text-sm mb-2">Total Students</p>
            <h2 className="text-5xl font-bold mb-2">{stats.totalStudents}</h2>
            <p className="text-emerald-100 text-sm">Under your classes</p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {/* Classes Card */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-1">{stats.totalClasses}</h3>
          <p className="text-gray-500 text-sm">Assigned Classes</p>
        </div>

        {/* Students per Class Card */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-1">
            {stats.totalClasses > 0 ? Math.round(stats.totalStudents / stats.totalClasses) : 0}
          </h3>
          <p className="text-gray-500 text-sm">Avg Students/Class</p>
        </div>

        {/* Subject Card */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-orange-600" />
            </div>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-1">{currentUser?.subject || 'N/A'}</h3>
          <p className="text-gray-500 text-sm">Your Subject</p>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Assigned Classes */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <h3 className="text-lg font-bold text-gray-900">Your Assigned Classes</h3>
          </div>
          <div className="p-6">
            {currentUser?.assignedClasses && currentUser.assignedClasses.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {currentUser.assignedClasses.map((cls, index) => {
                  const classStudents = students.filter(s => s.sclassName?._id === cls._id);
                  return (
                    <div key={index} className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-emerald-300 hover:shadow-md transition">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                          <BookOpen className="w-5 h-5 text-emerald-600" />
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900">{cls.sclassName}</h4>
                          <p className="text-xs text-gray-500">{currentUser?.subject || 'Subject'}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600 mt-3">
                        <Users className="w-4 h-4" />
                        <span>{classStudents.length} Students</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No classes assigned yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Today's Exam Schedule */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Today's Exams</h3>
          <div className="space-y-4">
            {examSchedules.length > 0 ? (
              examSchedules.map((schedule, index) => (
                <div key={index} className="flex gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                  <div className="flex flex-col items-center justify-center bg-emerald-100 rounded-lg px-3 py-2">
                    <Clock className="w-4 h-4 text-emerald-600 mb-1" />
                    <span className="text-xs font-medium text-emerald-700">
                      {new Date(schedule.examDate).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 text-sm">{schedule.subject}</p>
                    <p className="text-xs text-gray-500">{schedule.class?.sclassName}</p>
                    <p className="text-xs text-gray-400 mt-1">Total Marks: {schedule.totalMarks}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">No exams scheduled for today</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;
