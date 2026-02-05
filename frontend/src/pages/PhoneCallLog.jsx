import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import PhoneCallModal from '../components/form-popup/PhoneCallModal';

import SearchBar from '../components/SearchBar';
import { Edit, Trash2, Plus, Eye, PhoneIncoming, PhoneOutgoing, Check } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL;

const PhoneCallLog = () => {
    const { currentUser } = useAuth();
    const { showToast } = useToast();
    
    // --- State Management ---
    const [phoneCalls, setPhoneCalls] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentCall, setCurrentCall] = useState(null);

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

            setPhoneCalls([]);
            
            const response = await axios.get(`${API_BASE}/PhoneCalls/${schoolId}`);
            setPhoneCalls(Array.isArray(response.data) ? response.data : []);
        } catch (err) {
            showToast("Error loading phone calls", "error");
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
            
            if (currentCall) {
                // UPDATE Existing
                await axios.put(`${API_BASE}/PhoneCall/${currentCall._id}`, dataToSend);
            } else {
                // CREATE New
                await axios.post(`${API_BASE}/PhoneCallCreate`, dataToSend);
            }

            // Close modal and refresh data
            setIsModalOpen(false);
            setCurrentCall(null);
            fetchData();
            showToast("Phone call saved successfully!", "success");
        } catch (err) {
            showToast("Failed to save phone call.", "error");
        }
    };

    // Delete Logic - Toggle Confirmation
    const handleDelete = (id) => {
        if (selectedDeleteId === id) {
            confirmDelete();
        } else {
            setSelectedDeleteId(id);
            setTimeout(() => {
                setSelectedDeleteId(prev => prev === id ? null : prev);
            }, 3000);
        }
    };

    // Actual Delete Function
    const confirmDelete = async () => {
        if (!selectedDeleteId) return;
        try {
            await axios.delete(`${API_BASE}/PhoneCall/${selectedDeleteId}`);
            fetchData();
            showToast("Phone call deleted successfully!", "success");
        } catch (err) {
            showToast("Error deleting phone call", "error");
        }
        setSelectedDeleteId(null);
    };

    // View Button Click Logic
    const handleView = (call) => {
        setCurrentCall(call);
        setViewMode(true);
        setIsModalOpen(true);
    };

    // Edit Button Click Logic
    const handleEdit = (call) => {
        setCurrentCall(call);
        setViewMode(false);
        setIsModalOpen(true);
    };

    // Add Button Click Logic
    const handleAdd = () => {
        setCurrentCall(null);
        setViewMode(false);
        setIsModalOpen(true);
    };

    // Filter phone calls based on search query
    const filteredCalls = phoneCalls.filter((call) => {
        if (!searchQuery) return true;
        const query = searchQuery.toLowerCase();
        return (
            call.callerName?.toLowerCase().includes(query) ||
            call.phone?.toLowerCase().includes(query) ||
            call.purpose?.toLowerCase().includes(query) ||
            call.callType?.toLowerCase().includes(query)
        );
    });

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6 md:p-8">
            
            {/* Header Section */}
            <div>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                    <div>
                        <h1 className="text-4xl font-bold text-gray-900">Phone Call Log</h1>
                        <p className="text-gray-600 mt-2">Track and manage all phone calls</p>
                    </div>
                    <button onClick={handleAdd} className="flex items-center px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 shadow-lg hover:shadow-xl transition duration-200 font-600">
                        <Plus className="w-5 h-5 mr-2" /> Add Call
                    </button>
                </div>

                {/* Search Bar */}
                <div className="mb-6">
                    <SearchBar 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search by caller name, phone, purpose, or call type..."
                        className="max-w-md"
                    />
                </div>

                {/* Table Section */}
                <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="text-center">
                                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
                                <p className="text-gray-600">Loading phone calls...</p>
                            </div>
                        </div>
                    ) : phoneCalls.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 px-4">
                            <div onClick={handleAdd} className="w-16 h-16 cursor-pointer bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                <Plus className="w-8 h-8 text-gray-400" />
                            </div>
                            <p className="text-gray-600 text-lg font-500">No phone calls yet</p>
                            <p className="text-gray-500 text-sm mt-1">Click "Add Call" to record your first phone call</p>
                        </div>
                    ) : filteredCalls.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 px-4">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                            <p className="text-gray-600 text-lg font-500">No calls found</p>
                            <p className="text-gray-500 text-sm mt-1">No phone calls match your search criteria</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Caller Name</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Phone</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Type</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Date & Time</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Purpose</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Duration</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Follow-up</th>
                                        <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {filteredCalls.map((call) => (
                                        <tr key={call._id} className="hover:bg-indigo-50 transition duration-150">
                                            <td className="px-6 py-4 text-sm font-600 text-gray-900">{call.callerName}</td>
                                            <td className="px-6 py-4 text-sm text-gray-600">{call.phone}</td>
                                            <td className="px-6 py-4 text-sm">
                                                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-600 ${
                                                    call.callType === 'Incoming' 
                                                        ? 'bg-green-100 text-green-700' 
                                                        : 'bg-blue-100 text-blue-700'
                                                }`}>
                                                    {call.callType === 'Incoming' ? (
                                                        <PhoneIncoming className="w-3.5 h-3.5" />
                                                    ) : (
                                                        <PhoneOutgoing className="w-3.5 h-3.5" />
                                                    )}
                                                    {call.callType}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600">
                                                <div>{new Date(call.callDate).toLocaleDateString()}</div>
                                                <div className="text-xs text-gray-500">{call.callTime}</div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600">
                                                <div className="max-w-xs truncate">{call.purpose || '-'}</div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600">{call.callDuration || '-'}</td>
                                            <td className="px-6 py-4 text-sm">
                                                {call.followUpRequired ? (
                                                    <span className="inline-block px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-600">
                                                        Required
                                                    </span>
                                                ) : (
                                                    <span className="text-gray-400">-</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex justify-end gap-3">
                                                    <button 
                                                        onClick={() => handleView(call)} 
                                                        className="inline-flex items-center justify-center w-9 h-9 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition duration-150"
                                                        title="View details"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </button>
                                                    <button 
                                                        onClick={() => handleEdit(call)} 
                                                        className="inline-flex items-center justify-center w-9 h-9 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition duration-150"
                                                        title="Edit call"
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                    </button>
                                                    <button 
                                                        onClick={() => handleDelete(call._id)} 
                                                        className={`inline-flex items-center justify-center h-9 w-9 rounded-lg transition duration-150 ${selectedDeleteId === call._id
                                                            ? "bg-red-600 text-white hover:bg-red-700"
                                                            : "bg-red-100 text-red-600 hover:bg-red-200"
                                                            }`}
                                                        title="Delete call"
                                                    >
                                                        {selectedDeleteId === call._id ? (
                                                            <Check className="w-4 h-4" />
                                                        ) : (
                                                                <Trash2 className="w-4 h-4" />
                                                        )}
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
            <PhoneCallModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleFormSubmit}
                initialData={currentCall}
                viewMode={viewMode}
            />


        </div>
    );
};

export default PhoneCallLog;
