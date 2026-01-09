import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import ConfirmationModal from '../components/ConfirmationModal';
import SearchBar from '../components/SearchBar';
import { CheckCircle, Trash2, Eye, LayoutGrid, List as ListIcon, UserX } from 'lucide-react';
import StudentDetailsModal from '../components/form-popup/StudentDetailsModal';

const API_BASE = "http://localhost:5000";

const DisabledStudents = () => {
    const { currentUser } = useAuth();
    const { showToast } = useToast();
    
    // --- State Management ---
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState('list'); // 'list' or 'grid'
    
    // Modal State
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [currentStudent, setCurrentStudent] = useState(null);

    // Confirmation State
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [selectedStudentId, setSelectedStudentId] = useState(null);
    const [actionType, setActionType] = useState(null); // 'enable' or 'delete'

    // Search State
    const [searchQuery, setSearchQuery] = useState("");

    // --- 1. Data Fetching ---
    const fetchData = async () => {
        try {
            setLoading(true);
            const schoolId = currentUser._id;

            setStudents([]);
            
            const response = await axios.get(`${API_BASE}/Students/Disabled/${schoolId}`);
            setStudents(Array.isArray(response.data) ? response.data : []);
        } catch (err) {
            if (err.response && err.response.status === 404) {
                setStudents([]);
            } else {
                showToast("Error loading disabled students", "error");
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (currentUser) fetchData();
    }, [currentUser]);

    // --- 2. Action Handlers ---

    const handleEnable = (id) => {
        setSelectedStudentId(id);
        setActionType('enable');
        setShowConfirmModal(true);
    };

    const handleDelete = (id) => {
        setSelectedStudentId(id);
        setActionType('delete');
        setShowConfirmModal(true);
    };

    const confirmAction = async () => {
        if (!selectedStudentId) return;
        
        try {
            if (actionType === 'enable') {
                await axios.put(`${API_BASE}/Student/${selectedStudentId}`, { status: 'Active' });
                showToast("Student enabled successfully!", "success");
            } else if (actionType === 'delete') {
                await axios.delete(`${API_BASE}/Student/${selectedStudentId}`);
                showToast("Student deleted permanently!", "success");
            }
            fetchData();
        } catch (err) {
            showToast(`Error ${actionType === 'enable' ? 'enabling' : 'deleting'} student`, "error");
        }
        
        setShowConfirmModal(false);
        setSelectedStudentId(null);
        setActionType(null);
    };

    const handleView = (student) => {
        setCurrentStudent(student);
        setIsDetailsModalOpen(true);
    };

    // Filter students based on search query
    const filteredStudents = students.filter((student) => {
        if (!searchQuery) return true;
        const query = searchQuery.toLowerCase();
        return (
            student.name?.toLowerCase().includes(query) ||
            student.rollNum?.toString().toLowerCase().includes(query) ||
            student.father?.name?.toLowerCase().includes(query) ||
            student.sclassName?.sclassName?.toLowerCase().includes(query)
        );
    });

    return (
        <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 p-6 md:p-8">
            
            {/* Header Section */}
            <div>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                    <div>
                        <h1 className="text-4xl font-bold text-gray-900">Disabled Students</h1>
                        <p className="text-gray-600 mt-2">Manage students who have been disabled or left</p>
                    </div>
                </div>

                {/* Controls Bar */}
                <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
                    {/* Search Bar */}
                    <div className="w-full md:w-auto flex-1 max-w-md">
                        <SearchBar 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search by name, roll, father's name..."
                            className="w-full"
                        />
                    </div>

                    {/* View Toggle */}
                    <div className="flex bg-white rounded-lg shadow-xs p-1 border border-gray-200">
                        <button 
                            onClick={() => setViewMode('list')}
                            className={`p-2 rounded-md transition-all ${viewMode === 'list' ? 'bg-indigo-100 text-indigo-600' : 'text-gray-400 hover:text-gray-600'}`}
                            title="List View"
                        >
                            <ListIcon size={20} />
                        </button>
                        <button 
                            onClick={() => setViewMode('grid')}
                            className={`p-2 rounded-md transition-all ${viewMode === 'grid' ? 'bg-indigo-100 text-indigo-600' : 'text-gray-400 hover:text-gray-600'}`}
                            title="Grid View"
                        >
                            <LayoutGrid size={20} />
                        </button>
                    </div>
                </div>

                {/* Content Section */}
                <div className="min-h-[400px]">
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="text-center">
                                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
                                <p className="text-gray-600">Loading students...</p>
                            </div>
                        </div>
                    ) : students.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 px-4 bg-white rounded-xl shadow-sm border border-gray-200">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                <UserX className="w-8 h-8 text-gray-400" />
                            </div>
                            <p className="text-gray-600 text-lg font-500">No disabled students</p>
                            <p className="text-gray-500 text-sm mt-1">Disabled students will appear here</p>
                        </div>
                    ) : filteredStudents.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 px-4 bg-white rounded-xl shadow-sm border border-gray-200">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                            <p className="text-gray-600 text-lg font-500">No record found</p>
                            <p className="text-gray-500 text-sm mt-1">No students match your search criteria</p>
                        </div>
                    ) : (
                        <>
                            {/* LIST VIEW */}
                            {viewMode === 'list' && (
                                <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead>
                                                <tr className="bg-linear-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Admission No</th>
                                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Student Name</th>
                                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Roll No.</th>
                                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Class</th>
                                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Father Name</th>
                                                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-200">
                                                {filteredStudents.map((student) => (
                                                    <tr key={student._id} className="hover:bg-indigo-50 transition duration-150 group">
                                                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                                                            #{student._id.slice(-6).toUpperCase()}
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div className="flex items-center">
                                                                <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 font-bold mr-3 overflow-hidden border border-gray-200 grayscale">
                                                                    {student.studentPhoto ? (
                                                                        <img src={`http://localhost:5000/${student.studentPhoto}`} alt={student.name} className="w-full h-full object-cover" />
                                                                    ) : (
                                                                        student.name.charAt(0)
                                                                    )}
                                                                </div>
                                                                <div className="text-sm font-600 text-gray-900">{student.name}</div>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 text-sm text-gray-600">{student.rollNum}</td>
                                                        <td className="px-6 py-4 text-sm">
                                                            <span className="inline-block px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-600">
                                                                {student.sclassName?.sclassName || 'N/A'}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 text-sm text-gray-600">{student.father?.name || 'N/A'}</td>
                                                        <td className="px-6 py-4 text-right">
                                                            <div className="flex justify-end gap-2">
                                                                <button 
                                                                    onClick={() => handleView(student)} 
                                                                    className="p-2 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 transition duration-150"
                                                                    title="View Details"
                                                                >
                                                                    <Eye size={16} />
                                                                </button>
                                                                <button 
                                                                    onClick={() => handleEnable(student._id)} 
                                                                    className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition duration-150"
                                                                    title="Enable Student"
                                                                >
                                                                    <CheckCircle size={16} />
                                                                </button>
                                                                <button 
                                                                    onClick={() => handleDelete(student._id)} 
                                                                    className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition duration-150"
                                                                    title="Delete Permanently"
                                                                >
                                                                    <Trash2 size={16} />
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

                            {/* GRID VIEW */}
                            {viewMode === 'grid' && (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                    {filteredStudents.map((student) => (
                                        <div key={student._id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-200 overflow-hidden group flex flex-col items-center p-6 opacity-75 hover:opacity-100">
                                            <div className="h-32 w-32 rounded-full border-4 border-gray-100 bg-white shadow-lg overflow-hidden flex items-center justify-center mb-4 grayscale">
                                                {student.studentPhoto ? (
                                                    <img src={`http://localhost:5000/${student.studentPhoto}`} alt={student.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="text-4xl font-bold text-gray-400">{student.name.charAt(0)}</div>
                                                )}
                                            </div>
                                            <div className="w-full text-center">
                                                <h3 className="text-lg font-bold text-gray-900 truncate">{student.name}</h3>
                                                <p className="text-sm text-gray-500 mb-3">Roll No: {student.rollNum}</p>
                                                
                                                <div className="flex justify-center gap-2 mb-4">
                                                    <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-semibold">
                                                        Class {student.sclassName?.sclassName || 'N/A'}
                                                    </span>
                                                </div>

                                                <div className="flex justify-center gap-3 pt-2 border-t border-gray-100">
                                                    <button 
                                                        onClick={() => handleView(student)}
                                                        className="flex items-center gap-1 text-sm text-emerald-600 hover:text-emerald-700 font-medium px-3 py-1.5 hover:bg-emerald-50 rounded-lg transition-colors"
                                                    >
                                                        <Eye size={16} /> View
                                                    </button>
                                                    <button 
                                                        onClick={() => handleEnable(student._id)}
                                                        className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-medium px-3 py-1.5 hover:bg-blue-50 rounded-lg transition-colors"
                                                    >
                                                        <CheckCircle size={16} /> Enable
                                                    </button>
                                                    <button 
                                                        onClick={() => handleDelete(student._id)}
                                                        className="flex items-center gap-1 text-sm text-red-600 hover:text-red-700 font-medium px-3 py-1.5 hover:bg-red-50 rounded-lg transition-colors"
                                                    >
                                                        <Trash2 size={16} /> Delete
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* Student Details Modal (View) */}
            <StudentDetailsModal 
                isOpen={isDetailsModalOpen}
                onClose={() => setIsDetailsModalOpen(false)}
                student={currentStudent}
            />

            {/* Confirmation Modal */}
            <ConfirmationModal 
                isOpen={showConfirmModal}
                onClose={() => {
                    setShowConfirmModal(false);
                    setSelectedStudentId(null);
                    setActionType(null);
                }}
                onConfirm={confirmAction}
                title={actionType === 'enable' ? "Enable Student" : "Delete Student"}
                message={actionType === 'enable' 
                    ? "Are you sure you want to enable this student? They will appear in the active students list." 
                    : "Are you sure you want to permanently delete this student? This action cannot be undone."}
            />
        </div>
    );
};

export default DisabledStudents;
