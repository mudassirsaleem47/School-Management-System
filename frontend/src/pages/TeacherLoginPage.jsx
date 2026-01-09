import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GraduationCap, Mail, Lock, AlertCircle, BookOpen } from 'lucide-react';

const TeacherLoginPage = () => {
  const navigate = useNavigate();
  const { teacherLogin, loading, error } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError(null);

    const credentials = { email, password };

    try {
      await teacherLogin(credentials);
      navigate('/teacher/dashboard');
    } catch (err) {
      setLocalError(error || "Invalid credentials or Server error.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-linear-to-br from-gray-50 to-gray-100">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl w-full">
        
        {/* Left Side - Branding */}
        <div className="hidden md:flex flex-col justify-center items-start text-white bg-linear-to-br from-emerald-600 to-emerald-700 p-12 rounded-2xl shadow-2xl">
          <div className="mb-8">
            <div className="w-16 h-16 bg-white rounded-lg flex items-center justify-center mb-4">
              <GraduationCap className="w-8 h-8 text-emerald-600" />
            </div>
            <h1 className="text-4xl font-bold">Teacher Portal</h1>
            <p className="text-emerald-100 text-lg mt-2">School Management System</p>
          </div>
          
          <div className="space-y-4 mt-8">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-white rounded-full mt-2"></div>
              <div>
                <p className="font-600">Manage Classes</p>
                <p className="text-emerald-100 text-sm">View and manage your assigned classes</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-white rounded-full mt-2"></div>
              <div>
                <p className="font-600">Track Students</p>
                <p className="text-emerald-100 text-sm">Monitor student progress and attendance</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-white rounded-full mt-2"></div>
              <div>
                <p className="font-600">Exam Management</p>
                <p className="text-emerald-100 text-sm">Create and manage exams and results</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="flex flex-col justify-center">
          <div className="bg-white p-8 md:p-10 rounded-2xl shadow-2xl">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 rounded-full mb-4">
                <BookOpen className="w-8 h-8 text-emerald-600" />
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Teacher Login</h2>
              <p className="text-gray-600 mt-2">Access your teaching dashboard</p>
            </div>

            {/* Error Message */}
            {localError && (
              <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                <span className="text-red-700 text-sm">{localError}</span>
              </div>
            )}
            
            <form className="space-y-5" onSubmit={handleSubmit}>
              {/* Email Input */}
              <div>
                <label className="block text-sm font-600 text-gray-700 mb-2">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    placeholder="teacher@school.com"
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Password Input */}
              <div>
                <label className="block text-sm font-600 text-gray-700 mb-2">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
                  <input
                    type="password"
                    placeholder="Enter your password"
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Remember & Forgot */}
              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 rounded border-gray-300" />
                  <span className="text-gray-700">Remember me</span>
                </label>
                <a href="#" className="text-emerald-600 hover:text-emerald-700 font-600">Forgot password?</a>
              </div>

              {/* Login Button */}
              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3 px-4 rounded-lg font-600 text-white transition duration-200 flex items-center justify-center gap-2 shadow-lg ${
                  loading 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-emerald-600 hover:bg-emerald-700 active:scale-95'
                }`}
              >
                <GraduationCap className="w-5 h-5" />
                {loading ? 'Logging In...' : 'Login'}
              </button>
            </form>

            {/* Divider */}
            <div className="mt-6 mb-6 flex items-center gap-3">
              <div className="flex-1 border-t border-gray-300"></div>
              <span className="text-gray-500 text-sm">Or</span>
              <div className="flex-1 border-t border-gray-300"></div>
            </div>

            {/* Admin Link */}
            <div className="text-center">
              <p className="text-gray-600">Are you an admin? 
                <Link to="/AdminLogin" className="ml-1 text-emerald-600 hover:text-emerald-700 font-600 underline">
                  Login here
                </Link>
              </p>
            </div>

            {/* Support */}
            <div className="mt-6 pt-6 border-t border-gray-200 text-center">
              <p className="text-gray-500 text-sm">
                Need help? <a href="#" className="text-emerald-600 hover:text-emerald-700 font-600">Contact support</a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherLoginPage;
