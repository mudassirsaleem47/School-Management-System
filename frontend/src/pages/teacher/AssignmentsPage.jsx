import React from 'react';
import { Plus, FileText, Calendar, Download } from 'lucide-react';

const AssignmentsPage = () => {
  const assignments = [
    { id: 1, title: 'Chapter 5 - Algebra Problems', class: 'Class 10-A', dueDate: '2026-01-15', submitted: 25, total: 30, status: 'active' },
    { id: 2, title: 'Geometry Worksheet', class: 'Class 9-B', dueDate: '2026-01-12', submitted: 28, total: 28, status: 'completed' },
    { id: 3, title: 'Trigonometry Practice', class: 'Class 10-C', dueDate: '2026-01-20', submitted: 15, total: 32, status: 'active' },
  ];

  return (
    <div className="p-6 md:p-8">
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Assignments</h1>
          <p className="text-gray-600 mt-2">Create and manage student assignments</p>
        </div>
        <button className="flex items-center px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 shadow-lg font-600">
          <Plus className="w-5 h-5 mr-2" />
          Create Assignment
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
          <p className="text-gray-600 text-sm">Total Assignments</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{assignments.length}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
          <p className="text-gray-600 text-sm">Active</p>
          <p className="text-3xl font-bold text-emerald-600 mt-1">
            {assignments.filter(a => a.status === 'active').length}
          </p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
          <p className="text-gray-600 text-sm">Completed</p>
          <p className="text-3xl font-bold text-blue-600 mt-1">
            {assignments.filter(a => a.status === 'completed').length}
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {assignments.map((assignment) => (
          <div key={assignment.id} className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 hover:shadow-xl transition">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900 mb-2">{assignment.title}</h3>
                <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                  <span className="flex items-center gap-1">
                    <FileText className="w-4 h-4" />
                    {assignment.class}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    Due: {assignment.dueDate}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-xs font-600 ${
                    assignment.status === 'active' 
                      ? 'bg-emerald-100 text-emerald-700' 
                      : 'bg-blue-100 text-blue-700'
                  }`}>
                    {assignment.status === 'active' ? 'Active' : 'Completed'}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-emerald-600">{assignment.submitted}/{assignment.total}</p>
                  <p className="text-xs text-gray-500">Submitted</p>
                </div>
                <button className="px-4 py-2 bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200 transition font-600">
                  View Details
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AssignmentsPage;
