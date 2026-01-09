import React from 'react';
import { BarChart3, TrendingUp, Users, Award } from 'lucide-react';

const AnalyticsPage = () => {
  return (
    <div className="p-6 md:p-8">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Analytics & Reports</h1>
        <p className="text-gray-600 mt-2">Track student performance and class statistics</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <TrendingUp className="w-5 h-5 text-green-500" />
          </div>
          <p className="text-gray-600 text-sm">Avg Attendance</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">92.5%</p>
          <p className="text-xs text-green-600 mt-2">+2.5% from last month</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
              <Award className="w-6 h-6 text-emerald-600" />
            </div>
            <TrendingUp className="w-5 h-5 text-green-500" />
          </div>
          <p className="text-gray-600 text-sm">Avg Performance</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">85%</p>
          <p className="text-xs text-green-600 mt-2">+5% from last month</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-purple-600" />
            </div>
            <TrendingUp className="w-5 h-5 text-green-500" />
          </div>
          <p className="text-gray-600 text-sm">Pass Rate</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">94%</p>
          <p className="text-xs text-green-600 mt-2">+3% from last month</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
              <Award className="w-6 h-6 text-amber-600" />
            </div>
            <TrendingUp className="w-5 h-5 text-green-500" />
          </div>
          <p className="text-gray-600 text-sm">Top Scorers</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">12</p>
          <p className="text-xs text-green-600 mt-2">Above 90%</p>
        </div>
      </div>

      {/* Charts Placeholder */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Class Performance Trend</h3>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
            <p className="text-gray-500">Chart will be displayed here</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Attendance Overview</h3>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
            <p className="text-gray-500">Chart will be displayed here</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
