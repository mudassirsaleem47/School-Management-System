import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import API_URL from '../config/api.js';
import { UserX, Search, Eye, CheckCircle, Calendar, User } from 'lucide-react';
import StudentDetailsModal from '../components/form-popup/StudentDetailsModal';
import ConfirmationModal from '../components/ConfirmationModal';

const DisableReasonPage = () => {
    const { currentUser } = useAuth();
    const { showToast } = useToast();
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterReason, setFilterReason] = useState('all');
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [studentToEnable, setStudentToEnable] = useState(null);

    const reasons = ['Left School', 'Transferred', 'Expelled', 'Medical', 'Financial', 'Other'];

    const reasonColors = {
        'Left School': 'bg-blue-100 text-blue-700',
        'Transferred': 'bg-purple-100 text-purple-700',
        'Expelled': 'bg-red-100 text-red-700',
        'Medical': 'bg-green-100 text-green-700',
        'Financial': 'bg-yellow-100 text-yellow-700',
        'Other': 'bg-gray-100 text-gray-700'
    };

    useEffect(() => {
        if (currentUser) fetchData();
    }, [currentUser]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${API_URL}/Students/Disabled/${currentUser._id}`);
            setStudents(Array.isArray(response.data) ? response.data : []);
        } catch (err) {
            showToast("Error loading disabled students", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleEnableStudent = async () => {
        try {
            await axios.put(`${API_URL}/Student/${studentToEnable}`, { status: 'Active' });
            showToast("Student enabled successfully!", "success");
            fetchData();
        } catch (err) {
            showToast("Error enabling student", "error");
        }
        setShowConfirmModal(false);
        setStudentToEnable(null);
    };

    const filteredStudents = students.filter(student => {
        const matchesSearch = !searchQuery || 
            student.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            student.rollNum?.toString().includes(searchQuery);
        const matchesReason = filterReason === 'all' || student.disableInfo?.reason === filterReason;
        return matchesSearch && matchesReason;
    });

    const getReasonStats = () => {
        const stats = {};
        reasons.forEach(reason => {
            stats[reason] = students.filter(s => s.disableInfo?.reason === reason).length;
        });
        return stats;
    };

    const stats = getReasonStats();

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="mx-auto">
                {/* Header */}
                <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                    <div className="flex justify-between items-center mb-4">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                                <UserX className="w-8 h-8 text-indigo-600" />
                                Disable Reasons
                            </h1>
                            <p className="text-gray-600 mt-1">View disabled students with their reasons</p>
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-gray-600">Total Disabled</p>
                            <p className="text-3xl font-bold text-indigo-600">{students.length}</p>
                        </div>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-4">
                        {reasons.map(reason => (
                            <div key={reason} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                                <p className="text-xs text-gray-600 mb-1">{reason}</p>
                                <p className="text-2xl font-bold text-gray-900">{stats[reason] || 0}</p>
                            </div>
                        ))}
                    </div>

                    {/* Filters */}
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search by name or roll number..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 border-2 border-indigo-200 rounded-lg focus:outline-none focus:border-indigo-500 transition"
                            />
                        </div>
                        <select
                            value={filterReason}
                            onChange={(e) => setFilterReason(e.target.value)}
                            className="px-4 py-2.5 border-2 border-indigo-200 rounded-lg focus:outline-none focus:border-indigo-500 transition"
                        >
                            <option value="all">All Reasons</option>
                            {reasons.map(reason => (
                                <option key={reason} value={reason}>{reason}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Students Table */}
                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                    </div>
                ) : filteredStudents.length === 0 ? (
                    <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                        <UserX className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-xl font-600 text-gray-900 mb-2">No Disabled Students</h3>
                        <p className="text-gray-600">
                            {searchQuery || filterReason !== 'all' 
                                ? 'No students match your search criteria'
                                : 'There are no disabled students'}
                        </p>
                    </div>
                ) : (
                    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-gray-50 border-b border-gray-200">
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">Student</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">Roll No</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">Class</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">Reason</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">Description</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">Disabled Date</th>
                                        <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 uppercase">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {filteredStudents.map((student) => (
                                        <tr key={student._id} className="hover:bg-indigo-50 transition">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center">
                                                    <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 font-bold mr-3 overflow-hidden border border-gray-200">
                                                        {student.studentPhoto ? (
                                                            <img src={`${API_URL}/${student.studentPhoto}`} alt={student.name} className="w-full h-full object-cover" />
                                                        ) : (
                                                            student.name.charAt(0)
                                                        )}
                                                    </div>
                                                    <div className="text-sm font-600 text-gray-900">{student.name}</div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600">{student.rollNum}</td>
                                            <td className="px-6 py-4 text-sm">
                                                <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-600">
                                                    {student.sclassName?.sclassName || 'N/A'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-3 py-1 rounded-full text-xs font-600 ${reasonColors[student.disableInfo?.reason] || 'bg-gray-100 text-gray-700'}`}>
                                                    {student.disableInfo?.reason || 'N/A'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">
                                                {student.disableInfo?.description || '-'}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600">
                                                {student.disableInfo?.disabledDate 
                                                    ? new Date(student.disableInfo.disabledDate).toLocaleDateString()
                                                    : '-'}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <button
                                                        onClick={() => {
                                                            setSelectedStudent(student);
                                                            setShowDetailsModal(true);
                                                        }}
                                                        className="p-2 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 transition"
                                                        title="View Details"
                                                    >
                                                        <Eye size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            setStudentToEnable(student._id);
                                                            setShowConfirmModal(true);
                                                        }}
                                                        className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition"
                                                        title="Re-enable Student"
                                                    >
                                                        <CheckCircle size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            {/* Student Details Modal */}
            <StudentDetailsModal
                isOpen={showDetailsModal}
                onClose={() => setShowDetailsModal(false)}
                student={selectedStudent}
            />

            {/* Confirmation Modal */}
            <ConfirmationModal
                isOpen={showConfirmModal}
                onClose={() => setShowConfirmModal(false)}
                onConfirm={handleEnableStudent}
                title="Re-enable Student"
                message="Are you sure you want to re-enable this student? They will be moved back to the active students list."
            />
        </div>
    );
};

export default DisableReasonPage;
