import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { BarChart3, Users, BookOpen, FileText, LogOut } from 'lucide-react';

const AdminDashboard = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/admin');
  };

  const stats = [
    { icon: Users, label: 'Students', count: '0', color: 'bg-blue-50', iconColor: 'text-blue-600' },
    { icon: BookOpen, label: 'Classes', count: '0', color: 'bg-indigo-50', iconColor: 'text-indigo-600' },
    { icon: FileText, label: 'Enquiries', count: '0', color: 'bg-green-50', iconColor: 'text-green-600' },
    { icon: BarChart3, label: 'Analytics', count: '0', color: 'bg-purple-50', iconColor: 'text-purple-600' },
  ];

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 p-4 md:p-6 lg:p-8">
      <div>
        
        {/* Header */}
        <div className="flex flex-col gap-4 mb-8">
          {/* Top Row - Title and Logout */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-sm md:text-base text-gray-600 mt-2">Welcome back, {currentUser ? currentUser.name : 'Admin'}!</p>
            </div>
            <button
              onClick={handleLogout}
              className="w-full md:w-auto flex items-center justify-center px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 shadow-lg hover:shadow-xl transition duration-200 font-600 text-sm md:text-base"
            >
              <LogOut className="w-4 md:w-5 h-4 md:h-5 mr-2" /> Logout
            </button>
          </div>

        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div key={idx} className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition duration-200 border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-600">Total {stat.label}</p>
                    <p className="text-4xl font-bold text-gray-900 mt-2">{stat.count}</p>
                  </div>
                  <div className={`${stat.color} p-4 rounded-lg`}>
                    <Icon className={`w-8 h-8 ${stat.iconColor}`} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          


          {/* Quick Access Card */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Quick Access</h3>
            <div className="space-y-2">
              <button
                onClick={() => navigate('/admin/classes')}
                className="w-full px-4 py-3 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 font-600 transition text-left"
              >
                Manage Classes
              </button>
              <button
                onClick={() => navigate('/admin/admissions')}
                className="w-full px-4 py-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 font-600 transition text-left"
              >
                Student Admission
              </button>
              <button
                onClick={() => navigate('/admin/enquiry')}
                className="w-full px-4 py-3 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 font-600 transition text-left"
              >
                View Enquiries
              </button>
              <button
                onClick={() => navigate('/admin/students')}
                className="w-full px-4 py-3 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 font-600 transition text-left"
              >
                View Students
              </button>
              <button
                onClick={() => navigate('/admin/subjects')}
                className="w-full px-4 py-3 bg-teal-50 text-teal-700 rounded-lg hover:bg-teal-100 font-600 transition text-left"
              >
                Manage Subjects
              </button>
              <button
                onClick={() => navigate('/admin/class-schedule')}
                className="w-full px-4 py-3 bg-orange-50 text-orange-700 rounded-lg hover:bg-orange-100 font-600 transition text-left"
              >
                Class Schedule
              </button>
              <button
                onClick={() => navigate('/admin/teacher-schedule')}
                className="w-full px-4 py-3 bg-pink-50 text-pink-700 rounded-lg hover:bg-pink-100 font-600 transition text-left"
              >
                Teacher Schedule
              </button>
              <button
                onClick={() => navigate('/admin/promote')}
                className="w-full px-4 py-3 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 font-600 transition text-left"
              >
                Promote Students
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;