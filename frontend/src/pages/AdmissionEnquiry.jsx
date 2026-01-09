import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import EnquiryModal from '../components/form-popup/EnquiryModal';
import ConfirmationModal from '../components/ConfirmationModal';
import SearchBar from '../components/SearchBar';
import { Edit, Trash2, Plus, Eye } from 'lucide-react';

const API_BASE = "http://localhost:5000";

const AdmissionEnquiry = () => {
    const { currentUser } = useAuth();
    const { showToast } = useToast();
    
    // --- State Management ---
    const [enquiries, setEnquiries] = useState([]);
    const [classesList, setClassesList] = useState([]);
    const [teachersList, setTeachersList] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentEnquiry, setCurrentEnquiry] = useState(null);
    
    // Delete Confirmation State
    const [showDeleteModal, setShowDeleteModal] = useState(false);
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

            setEnquiries([]);
            setClassesList([]);
            setTeachersList([]);
            
            const [enqRes, classRes, teachRes] = await Promise.all([
                axios.get(`${API_BASE}/EnquiryList/${schoolId}`),
                axios.get(`${API_BASE}/Sclasses/${schoolId}`),
                axios.get(`${API_BASE}/Teachers/${schoolId}`).catch(() => ({ data: [] }))
            ]);

            setEnquiries(Array.isArray(enqRes.data) ? enqRes.data : []);
            setClassesList(classRes.data);
            setTeachersList(teachRes.data);
        } catch (err) {
            showToast("Error loading data", "error");
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
            
            if (currentEnquiry) {
                await axios.put(`${API_BASE}/EnquiryUpdate/${currentEnquiry._id}`, dataToSend);
            } else {
                await axios.post(`${API_BASE}/EnquiryCreate`, dataToSend);
            }

            setIsModalOpen(false);
            setCurrentEnquiry(null);
            fetchData();
            showToast("Enquiry saved successfully!", "success");
        } catch (err) {
            showToast("Failed to save enquiry.", "error");
        }
    };

    // Delete Logic
    const handleDelete = (id) => {
        setSelectedDeleteId(id);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        if (!selectedDeleteId) return;
        try {
            await axios.delete(`${API_BASE}/EnquiryDelete/${selectedDeleteId}`);
            fetchData();
            showToast("Enquiry deleted successfully!", "success");
            setShowDeleteModal(false);
            setSelectedDeleteId(null);
        } catch (err) {
            showToast("Error deleting enquiry", "error");
            setShowDeleteModal(false);
        }
    };

    // View Button Click Logic
    const handleView = (enquiry) => {
        setCurrentEnquiry(enquiry);
        setViewMode(true);
        setIsModalOpen(true);
    };

    // Edit/Add Logic
    const handleEdit = (enquiry) => {
        setCurrentEnquiry(enquiry);
        setViewMode(false);
        setIsModalOpen(true);
    };

    const handleAdd = () => {
        setCurrentEnquiry(null);
        setViewMode(false);
        setIsModalOpen(true);
    };

    // Filter enquiries based on search query
    const filteredEnquiries = enquiries.filter((enquiry) => {
        if (!searchQuery) return true;
        const query = searchQuery.toLowerCase();
        return (
            enquiry.name?.toLowerCase().includes(query) ||
            enquiry.phone?.toLowerCase().includes(query) ||
            enquiry.class?.sclassName?.toLowerCase().includes(query) ||
            enquiry.assigned?.name?.toLowerCase().includes(query)
        );
    });

    return (
        <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 p-6 md:p-8">
            
            {/* Header Section */}
            <div>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                    <div>
                        <h1 className="text-4xl font-bold text-gray-900">Admission Enquiries</h1>
                        <p className="text-gray-600 mt-2">Manage and track all incoming admission enquiries</p>
                    </div>
                    <button onClick={handleAdd} className="flex items-center px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 shadow-lg hover:shadow-xl transition duration-200 font-600">
                        <Plus className="w-5 h-5 mr-2" /> Add Enquiry
                    </button>
                </div>

                {/* Search Bar */}
                <div className="mb-6">
                    <SearchBar 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search by name, phone, class, or assigned teacher..."
                        className="max-w-md"
                    />
                </div>

                {/* Table Section */}
                <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="text-center">
                                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
                                <p className="text-gray-600">Loading enquiries...</p>
                            </div>
                        </div>
                    ) : enquiries.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 px-4">
                            <div onClick={handleAdd} className="w-16 h-16 cursor-pointer bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                <Plus className="w-8 h-8 text-gray-400" />
                            </div>
                            <p className="text-gray-600 text-lg font-500">No enquiries yet</p>
                            <p className="text-gray-500 text-sm mt-1">Click "Add Enquiry" to create your first enquiry</p>
                        </div>
                    ) : filteredEnquiries.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 px-4">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                            <p className="text-gray-600 text-lg font-500">No record found</p>
                            <p className="text-gray-500 text-sm mt-1">No enquiries match your search criteria</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-linear-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Name</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Phone</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Class</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Assigned To</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Date</th>
                                        <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {filteredEnquiries.map((item) => (
                                        <tr key={item._id} className="hover:bg-indigo-50 transition duration-150">
                                            <td className="px-6 py-4 text-sm font-600 text-gray-900">{item.name}</td>
                                            <td className="px-6 py-4 text-sm text-gray-600">{item.phone}</td>
                                            <td className="px-6 py-4 text-sm">
                                                <span className="inline-block px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-600">
                                                    {item.class?.sclassName || 'N/A'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600">
                                                {item.assigned?.name ? (
                                           <span className="inline-block px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-500">
                                                        {item.assigned.name}
                                                    </span>
                                                ) : (
                                                    <span className="text-gray-400 text-xs">Unassigned</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600">{new Date(item.date).toLocaleDateString()}</td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex justify-end gap-3">
                                                    <button 
                                                        onClick={() => handleView(item)} 
                                                        className="inline-flex items-center justify-center w-9 h-9 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition duration-150"
                                                        title="View details"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </button>
                                                    <button 
                                                        onClick={() => handleEdit(item)} 
                                                        className="inline-flex items-center justify-center w-9 h-9 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition duration-150"
                                                        title="Edit enquiry"
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                    </button>
                                                    <button 
                                                        onClick={() => handleDelete(item._id)} 
                                                        className="inline-flex items-center justify-center w-9 h-9 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition duration-150"
                                                        title="Delete enquiry"
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
            <EnquiryModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleFormSubmit}
                initialData={currentEnquiry}
                classesList={classesList}
                teachersList={teachersList}
                viewMode={viewMode}
            />

            {/* Delete Confirmation Modal */}
            <ConfirmationModal 
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={confirmDelete}
                title="Delete Enquiry"
                message="Are you sure you want to delete this enquiry? This action cannot be undone."
            />
        </div>
    );
};

export default AdmissionEnquiry;