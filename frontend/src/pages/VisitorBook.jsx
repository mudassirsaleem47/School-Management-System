import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import VisitorModal from '../components/form-popup/VisitorModal';

import SearchBar from '../components/SearchBar';
import { Edit, Trash2, Plus, Eye, Check } from 'lucide-react';

const API_BASE = "http://localhost:5000";

const VisitorBook = () => {
    const { currentUser } = useAuth();
    const { showToast } = useToast();
    
    // --- State Management ---
    const [visitors, setVisitors] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentVisitor, setCurrentVisitor] = useState(null);

    // Delete Confirmation State

    const [selectedDeleteId, setSelectedDeleteId] = useState(null);

    // Search State
    const [searchQuery, setSearchQuery] = useState("");

    // View Mode State
    const [viewMode, setViewMode] = useState(false);

    // --- 1. Data Fetching ---
    const fetchData = async () => {
        try {
            setLoading(true);
            const schoolId = currentUser._id;

            setVisitors([]);
            
            const response = await axios.get(`${API_BASE}/Visitors/${schoolId}`);
            setVisitors(Array.isArray(response.data) ? response.data : []);
        } catch (err) {
            showToast("Error loading visitors", "error");
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
            // Clean up formData: Remove empty strings for ObjectId fields to avoid CastError
            const cleanedData = { ...formData };
            if (!cleanedData.staff) delete cleanedData.staff;
            if (!cleanedData.class) delete cleanedData.class;
            if (!cleanedData.student) delete cleanedData.student;
            
            const dataToSend = { ...cleanedData, school: currentUser._id };
            
            if (currentVisitor) {
                // UPDATE Existing
                await axios.put(`${API_BASE}/Visitor/${currentVisitor._id}`, dataToSend);
            } else {
                // CREATE New
                await axios.post(`${API_BASE}/VisitorCreate`, dataToSend);
            }

            // Close modal and refresh data
            setIsModalOpen(false);
            setCurrentVisitor(null);
            fetchData();
            showToast("Visitor saved successfully!", "success");
        } catch (err) {
            showToast("Failed to save visitor.", "error");
        }
    };

    // Delete Logic - Toggle Confirmation
    const handleDelete = (id) => {
        if (selectedDeleteId === id) {
            confirmDelete();
        } else {
            setSelectedDeleteId(id);
            // Auto-reset after 3 seconds
            setTimeout(() => {
                setSelectedDeleteId(prev => prev === id ? null : prev);
            }, 3000);
        }
    };

    // Actual Delete Function
    const confirmDelete = async () => {
        if (!selectedDeleteId) return;
        try {
            await axios.delete(`${API_BASE}/Visitor/${selectedDeleteId}`);
            fetchData();
            showToast("Visitor record deleted successfully!", "success");
        } catch (err) {
            showToast("Error deleting visitor", "error");
        }
        setSelectedDeleteId(null);
    };

    // View Button Click Logic
    const handleView = (visitor) => {
        setCurrentVisitor(visitor);
        setViewMode(true);
        setIsModalOpen(true);
    };

    // Edit Button Click Logic
    const handleEdit = (visitor) => {
        setCurrentVisitor(visitor);
        setViewMode(false);
        setIsModalOpen(true);
    };

    // Add Button Click Logic
    const handleAdd = () => {
        setCurrentVisitor(null);
        setViewMode(false);
        setIsModalOpen(true);
    };

    // Filter visitors based on search query
    const filteredVisitors = visitors.filter((visitor) => {
        if (!searchQuery) return true;
        const query = searchQuery.toLowerCase();
        return (
            visitor.visitorName?.toLowerCase().includes(query) ||
            visitor.purpose?.toLowerCase().includes(query) ||
            visitor.phone?.toLowerCase().includes(query) ||
            visitor.staff?.name?.toLowerCase().includes(query) ||
            visitor.student?.name?.toLowerCase().includes(query)
        );
    });

    return (
        <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 p-6 md:p-8">
            
            {/* Header Section */}
            <div>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                    <div>
                        <h1 className="text-4xl font-bold text-gray-900">Visitor Book</h1>
                        <p className="text-gray-600 mt-2">Manage and track all visitors to your school</p>
                    </div>
                    <button onClick={handleAdd} className="flex items-center px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 shadow-lg hover:shadow-xl transition duration-200 font-600">
                        <Plus className="w-5 h-5 mr-2" /> Add Visitor
                    </button>
                </div>

                {/* Search Bar */}
                <div className="mb-6">
                    <SearchBar 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search by name, purpose, phone, or meeting with..."
                        className="max-w-md"
                    />
                </div>

                {/* Table Section */}
                <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="text-center">
                                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
                                <p className="text-gray-600">Loading visitors...</p>
                            </div>
                        </div>
                    ) : visitors.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 px-4">
                            <div onClick={handleAdd} className="w-16 h-16 cursor-pointer bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                <Plus className="w-8 h-8 text-gray-400" />
                            </div>
                            <p className="text-gray-600 text-lg font-500">No visitors yet</p>
                            <p className="text-gray-500 text-sm mt-1">Click "Add Visitor" to record your first visitor</p>
                        </div>
                    ) : filteredVisitors.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 px-4">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke Linecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                            <p className="text-gray-600 text-lg font-500">No record found</p>
                            <p className="text-gray-500 text-sm mt-1">No visitors match your search criteria</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                                <tr className="bg-linear-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Visitor Name</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Purpose</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Meeting With</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Phone</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Date</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">In Time</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Out Time</th>
                                        <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {filteredVisitors.map((visitor) => (
                                        <tr key={visitor._id} className="hover:bg-indigo-50 transition duration-150">
                                            <td className="px-6 py-4 text-sm font-600 text-gray-900">{visitor.visitorName}</td>
                                            <td className="px-6 py-4 text-sm text-gray-600">{visitor.purpose}</td>
                                            <td className="px-6 py-4 text-sm">
                                                <span className="inline-block px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-600">
                                                    {visitor.meetingWith === 'Staff' 
                                                        ? `Staff: ${visitor.staff?.name || 'N/A'}`
                                                        : `Student: ${visitor.student?.name || 'N/A'}`
                                                    }
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600">{visitor.phone || 'N/A'}</td>
                                            <td className="px-6 py-4 text-sm text-gray-600">{new Date(visitor.date).toLocaleDateString()}</td>
                                            <td className="px-6 py-4 text-sm text-gray-600">{visitor.inTime}</td>
                                            <td className="px-6 py-4 text-sm text-gray-600">{visitor.outTime || '-'}</td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex justify-end gap-3">
                                                    <button 
                                                        onClick={() => handleView(visitor)} 
                                                        className="inline-flex items-center justify-center w-9 h-9 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition duration-150"
                                                        title="View details"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </button>
                                                    <button 
                                                        onClick={() => handleEdit(visitor)} 
                                                        className="inline-flex items-center justify-center w-9 h-9 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition duration-150"
                                                        title="Edit visitor"
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                    </button>
                                                    <button 
                                                        onClick={() => handleDelete(visitor._id)} 
                                                        className={`inline-flex items-center justify-center h-9 w-9 rounded-lg transition duration-150 ${selectedDeleteId === visitor._id
                                                            ? "bg-red-600 text-white hover:bg-red-700"
                                                            : "bg-red-100 text-red-600 hover:bg-red-200"
                                                            }`}
                                                        title="Delete visitor"
                                                    >
                                                        {selectedDeleteId === visitor._id ? <Check className="w-4 h-4" /> : <Trash2 className="w-4 h-4" />}
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
            <VisitorModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleFormSubmit}
                initialData={currentVisitor}
                viewMode={viewMode}
            />


        </div>
    );
};

export default VisitorBook;
