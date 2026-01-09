import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

import TeacherModal from '../components/form-popup/TeacherModal';
import ConfirmationModal from '../components/ConfirmationModal';
import SearchBar from '../components/SearchBar';
import { Edit, Trash2, Plus } from 'lucide-react';

const API_BASE = "http://localhost:5000";

const TeacherList = () => {
    const { currentUser } = useAuth();
    const { showToast } = useToast();
    
    // --- State Management ---
    const [teachers, setTeachers] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentTeacher, setCurrentTeacher] = useState(null);

    // Delete Confirmation State
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedDeleteId, setSelectedDeleteId] = useState(null);

    // Search State
    const [searchQuery, setSearchQuery] = useState("");

    // --- 1. Data Fetching (Load on Page Start) ---
    const fetchData = async () => {
        try {
            setLoading(true);
            const schoolId = currentUser._id;

            setTeachers([]);
            
            const response = await axios.get(`${API_BASE}/Teachers/${schoolId}`);
            setTeachers(Array.isArray(response.data) ? response.data : []);
        } catch (err) {
            showToast("Error loading teachers", "error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (currentUser) fetchData();
    }, [currentUser]);

    // --- 2. Action Handlers ---

    // Add/Edit Submit Logic
    const handleFormSubmit = async (formData) => {
        try {
            const dataToSend = { ...formData, school: currentUser._id };
            
            if (currentTeacher) {
                // UPDATE Existing
                // Don't send password if it's empty (keep existing password)
                if (!dataToSend.password) {
                    delete dataToSend.password;
                }
                await axios.put(`${API_BASE}/Teacher/${currentTeacher._id}`, dataToSend);
            } else {
                // CREATE New
                await axios.post(`${API_BASE}/TeacherRegister`, dataToSend);
            }

            // Close modal and refresh data
            setIsModalOpen(false);
            setCurrentTeacher(null);
            setCurrentTeacher(null);
            fetchData();
            showToast("Teacher saved successfully!", "success");
        } catch (err) {
            showToast("Failed to save teacher.", "error");
        }
    };

    // Delete Logic - Open Modal
    const handleDelete = (id) => {
        setSelectedDeleteId(id);
        setShowDeleteModal(true);
    };

    // Actual Delete Function
    const confirmDelete = async () => {
        if (!selectedDeleteId) return;
        try {
            await axios.delete(`${API_BASE}/Teacher/${selectedDeleteId}`);
            fetchData(); // Refresh list
            showToast("Teacher deleted successfully!", "success");
        } catch (err) {
            showToast("Error deleting teacher", "error");
        }
    };

    // Edit Button Click Logic
    const handleEdit = (teacher) => {
        setCurrentTeacher(teacher);
        setIsModalOpen(true);
    };

    // Add Button Click Logic
    const handleAdd = () => {
        setCurrentTeacher(null);
        setIsModalOpen(true);
    };

    // Filter teachers based on search query
    const filteredTeachers = teachers.filter((teacher) => {
        if (!searchQuery) return true;
        const query = searchQuery.toLowerCase();
        return (
            teacher.name?.toLowerCase().includes(query) ||
            teacher.email?.toLowerCase().includes(query) ||
            teacher.subject?.toLowerCase().includes(query) ||
            teacher.qualification?.toLowerCase().includes(query)
        );
    });

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6 md:p-8">
            
            {/* Header Section */}
            <div>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                    <div>
                        <h1 className="text-4xl font-bold text-gray-900">Teacher Management</h1>
                        <p className="text-gray-600 mt-2">Manage and track all teachers in your school</p>
                    </div>
                    <button onClick={handleAdd} className="flex items-center px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 shadow-lg hover:shadow-xl transition duration-200 font-600">
                        <Plus className="w-5 h-5 mr-2" /> Add Teacher
                    </button>
                </div>

                {/* Search Bar */}
                <div className="mb-6">
                    <SearchBar 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search by name, email, subject, or qualification..."
                        className="max-w-md"
                    />
                </div>

                {/* Table Section */}
                <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="text-center">
                                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
                                <p className="text-gray-600">Loading teachers...</p>
                            </div>
                        </div>
                    ) : teachers.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 px-4">
                            <div onClick={handleAdd} className="w-16 h-16 cursor-pointer bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                <Plus className="w-8 h-8 text-gray-400" />
                            </div>
                            <p className="text-gray-600 text-lg font-500">No teachers yet</p>
                            <p className="text-gray-500 text-sm mt-1">Click "Add Teacher" to create your first teacher</p>
                        </div>
                    ) : filteredTeachers.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 px-4">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                            <p className="text-gray-600 text-lg font-500">No record found</p>
                            <p className="text-gray-500 text-sm mt-1">No teachers match your search criteria</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Name</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Email</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Phone</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Subject</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Qualification</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Experience</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Salary</th>
                                        <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {filteredTeachers.map((teacher) => (
                                        <tr key={teacher._id} className="hover:bg-indigo-50 transition duration-150">
                                            <td className="px-6 py-4 text-sm font-600 text-gray-900">{teacher.name}</td>
                                            <td className="px-6 py-4 text-sm text-gray-600">{teacher.email}</td>
                                            <td className="px-6 py-4 text-sm text-gray-600">{teacher.phone}</td>
                                            <td className="px-6 py-4 text-sm">
                                                <span className="inline-block px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-600">
                                                    {teacher.subject}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600">{teacher.qualification}</td>
                                            <td className="px-6 py-4 text-sm text-gray-600">{teacher.experience} years</td>
                                            <td className="px-6 py-4 text-sm text-gray-900 font-600">Rs. {teacher.salary?.toLocaleString()}</td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex justify-end gap-3">
                                                    <button 
                                                        onClick={() => handleEdit(teacher)} 
                                                        className="inline-flex items-center justify-center w-9 h-9 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition duration-150"
                                                        title="Edit teacher"
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                    </button>
                                                    <button 
                                                        onClick={() => handleDelete(teacher._id)} 
                                                        className="inline-flex items-center justify-center w-9 h-9 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition duration-150"
                                                        title="Delete teacher"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
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

            {/* Popup Modal Component */}
            <TeacherModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleFormSubmit}
                initialData={currentTeacher}
            />

            {/* Delete Confirmation Modal */}
            <ConfirmationModal 
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={confirmDelete}
                title="Delete Teacher"
                message="Are you sure you want to delete this teacher? This action cannot be undone."
            />
        </div>
    );
};

export default TeacherList;
