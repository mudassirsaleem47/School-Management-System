import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  LogOut, 
  BookOpen, 
  Users, 
  Calendar, 
  ClipboardCheck,
  Award,
  TrendingUp,
  Clock,
  Bell,
  FileText,
  BarChart3
} from 'lucide-react';

const TeacherDashboard = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/teacher/login');
  };

  // Stats data
  const stats = [
    { 
      icon: BookOpen, 
      label: 'Assigned Classes', 
      count: currentUser?.assignedClasses?.length || '0', 
      color: 'bg-blue-50', 
      iconColor: 'text-blue-600',
      trend: '+2 this month'
    },
    { 
      icon: Users, 
      label: 'Total Students', 
      count: '156', 
      color: 'bg-emerald-50', 
      iconColor: 'text-emerald-600',
      trend: '+12 new'
    },
    { 
      icon: ClipboardCheck, 
      label: 'Attendance Today', 
      count: '92%', 
      color: 'bg-purple-50', 
      iconColor: 'text-purple-600',
      trend: 'Above average'
    },
    { 
      icon: Award, 
      label: 'Avg Performance', 
      count: '85%', 
      color: 'bg-amber-50', 
      iconColor: 'text-amber-600',
      trend: '+5% from last'
    },
  ];

  // Quick actions
  const quickActions = [
    { label: 'Mark Attendance', icon: ClipboardCheck, color: 'bg-blue-50 text-blue-700 hover:bg-blue-100', path: '/teacher/attendance' },
    { label: 'View Students', icon: Users, color: 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100', path: '/teacher/students' },
    { label: 'Exam Results', icon: Award, color: 'bg-purple-50 text-purple-700 hover:bg-purple-100', path: '/teacher/results' },
    { label: 'My Schedule', icon: Calendar, color: 'bg-amber-50 text-amber-700 hover:bg-amber-100', path: '/teacher/schedule' },
    { label: 'Assignments', icon: FileText, color: 'bg-pink-50 text-pink-700 hover:bg-pink-100', path: '/teacher/assignments' },
    { label: 'Analytics', icon: BarChart3, color: 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100', path: '/teacher/analytics' },
  ];

  // Recent activities
  const recentActivities = [
    { action: 'Marked attendance for Class 10-A', time: '2 hours ago', icon: ClipboardCheck, color: 'text-blue-600' },
    { action: 'Uploaded exam results for Math', time: '5 hours ago', icon: Award, color: 'text-emerald-600' },
    { action: 'Created new assignment', time: '1 day ago', icon: FileText, color: 'text-purple-600' },
    { action: 'Updated student grades', time: '2 days ago', icon: TrendingUp, color: 'text-amber-600' },
  ];

  // Upcoming classes
  const upcomingClasses = [
    { class: 'Class 10-A', subject: 'Mathematics', time: '09:00 AM', room: 'Room 201' },
    { class: 'Class 9-B', subject: 'Mathematics', time: '11:00 AM', room: 'Room 105' },
    { class: 'Class 10-C', subject: 'Mathematics', time: '02:00 PM', room: 'Room 201' },
  ];

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 p-4 md:p-6 lg:p-8">
      <div>
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900">Teacher Dashboard</h1>
            <p className="text-sm md:text-base text-gray-600 mt-2">
              Welcome back, <span className="font-600 text-emerald-600">{currentUser?.name || 'Teacher'}</span>!
            </p>
            <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>{formatDate(currentTime)}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>{formatTime(currentTime)}</span>
              </div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full md:w-auto flex items-center justify-center px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 shadow-lg hover:shadow-xl transition duration-200 font-600 text-sm md:text-base"
          >
            <LogOut className="w-4 md:w-5 h-4 md:h-5 mr-2" /> Logout
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div key={idx} className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition duration-200 border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <div className={`${stat.color} p-3 rounded-lg`}>
                    <Icon className={`w-6 h-6 ${stat.iconColor}`} />
                  </div>
                  <TrendingUp className="w-4 h-4 text-green-500" />
                </div>
                <p className="text-gray-600 text-sm font-600">{stat.label}</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{stat.count}</p>
                <p className="text-xs text-gray-500 mt-2">{stat.trend}</p>
              </div>
            );
          })}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          
          {/* Quick Actions */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-lg p-6 border border-gray-200">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Bell className="w-5 h-5 text-emerald-600" />
              Quick Actions
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {quickActions.map((action, idx) => {
                const Icon = action.icon;
                return (
                  <button
                    key={idx}
                    onClick={() => navigate(action.path)}
                    className={`px-4 py-4 ${action.color} rounded-lg font-600 transition text-left flex flex-col items-center justify-center gap-2 hover:scale-105`}
                  >
                    <Icon className="w-6 h-6" />
                    <span className="text-sm text-center">{action.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Upcoming Classes */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-emerald-600" />
              Today's Schedule
            </h3>
            <div className="space-y-3">
              {upcomingClasses.map((cls, idx) => (
                <div key={idx} className="p-3 bg-gray-50 rounded-lg border border-gray-200 hover:border-emerald-300 transition">
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-600 text-gray-900 text-sm">{cls.class}</p>
                    <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded">{cls.time}</span>
                  </div>
                  <p className="text-xs text-gray-600">{cls.subject}</p>
                  <p className="text-xs text-gray-500 mt-1">{cls.room}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Activity & Assigned Classes */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Recent Activity */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-emerald-600" />
              Recent Activity
            </h3>
            <div className="space-y-3">
              {recentActivities.map((activity, idx) => {
                const Icon = activity.icon;
                return (
                  <div key={idx} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                    <div className="mt-1">
                      <Icon className={`w-5 h-5 ${activity.color}`} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-900 font-500">{activity.action}</p>
                      <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Assigned Classes Details */}
          <div className="bg-linear-to-br from-emerald-600 to-emerald-700 rounded-xl shadow-lg p-6 text-white">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              My Classes
            </h3>
            <div className="space-y-3">
              {currentUser?.assignedClasses && currentUser.assignedClasses.length > 0 ? (
                currentUser.assignedClasses.map((cls, idx) => (
                  <div key={idx} className="p-4 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 hover:bg-white/20 transition">
                    <p className="font-600 text-lg">{cls.sclassName || `Class ${idx + 1}`}</p>
                    <p className="text-emerald-100 text-sm mt-1">Subject: {currentUser.subject}</p>
                  </div>
                ))
              ) : (
                <div className="p-4 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20">
                  <p className="text-emerald-100">No classes assigned yet</p>
                </div>
              )}
            </div>
            <div className="mt-6 pt-4 border-t border-white/20">
              <div className="flex items-center justify-between text-sm">
                <span className="text-emerald-100">Subject Specialization</span>
                <span className="font-600">{currentUser?.subject || 'N/A'}</span>
              </div>
              <div className="flex items-center justify-between text-sm mt-2">
                <span className="text-emerald-100">Experience</span>
                <span className="font-600">{currentUser?.experience || '0'} years</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;
