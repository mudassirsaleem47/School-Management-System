import React, { useState, useEffect } from 'react';
import { Search, Plus, Eye, Pencil, Trash2, AlertCircle, Check } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import ComplainModal from '../components/form-popup/ComplainModal';


const API_BASE = import.meta.env.VITE_API_URL;

const ComplainPage = () => {
    const { currentUser } = useAuth();
    const { showToast } = useToast();
    
    const [complains, setComplains] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedComplain, setSelectedComplain] = useState(null);
    const [viewMode, setViewMode] = useState(false);
    const [selectedDeleteId, setSelectedDeleteId] = useState(null);

    useEffect(() => {
        if (currentUser) {
            fetchComplains();
        }
    }, [currentUser]);

    const fetchComplains = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`${API_BASE}/Complains/${currentUser._id}`);
            setComplains(res.data);
        } catch (error) {
            showToast('Error fetching complains', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = () => {
        setSelectedComplain(null);
        setViewMode(false);
        setIsModalOpen(true);
    };

    const handleView = (complain) => {
        setSelectedComplain(complain);
        setViewMode(true);
        setIsModalOpen(true);
    };

    const handleEdit = (complain) => {
        setSelectedComplain(complain);
        setViewMode(false);
        setIsModalOpen(true);
    };

    const handleDelete = (id) => {
        if (selectedDeleteId === id) {
            confirmDelete();
        } else {
            setSelectedDeleteId(id);
            setTimeout(() => setSelectedDeleteId(prev => prev === id ? null : prev), 3000);
        }
    };

    const confirmDelete = async () => {
        if (!selectedDeleteId) return;
        try {
            await axios.delete(`${API_BASE}/Complain/${selectedDeleteId}`);
            showToast('Complain deleted successfully', 'success');
            fetchComplains();
        } catch (error) {
            showToast('Error deleting complain', 'error');
        }
        setSelectedDeleteId(null);
    };

    const handleSubmit = async (formData) => {
        try {
            const formDataToSend = new FormData();
            formDataToSend.append('school', currentUser._id);
            
            Object.keys(formData).forEach(key => {
                if (formData[key] !== null && formData[key] !== undefined) {
                    // Skip document if it's not a File object (empty string or path from DB)
                    if (key === 'document' && !(formData[key] instanceof File)) {
                        return;
                    }
                    formDataToSend.append(key, formData[key]);
                }
            });
            
            const config = {
                headers: { 'Content-Type': 'multipart/form-data' }
            };

            if (selectedComplain) {
                await axios.put(`${API_BASE}/Complain/${selectedComplain._id}`, formDataToSend, config);
                showToast('Complain updated successfully', 'success');
            } else {
                await axios.post(`${API_BASE}/ComplainCreate`, formDataToSend, config);
                showToast('Complain added successfully', 'success');
            }
            
            setIsModalOpen(false);
            fetchComplains();
        } catch (error) {
            console.error(error);
            showToast('Error saving complain', 'error');
        }
    };

    const filteredComplains = complains.filter(complain =>
        complain.complainBy?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        complain.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        complain.assigned?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Complain</h1>
                    <p className="text-gray-600 mt-1">Manage and track all complaints</p>
                </div>
                <button
                    onClick={handleAdd}
                    className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition shadow-lg hover:shadow-xl font-600"
                >
                    <Plus className="w-5 h-5" />
                    Add Complain
                </button>
            </div>

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                    type="text"
                    placeholder="Search by name, description, or assigned..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                />
            </div>

            {/* Table */}
            {loading ? (
                <div className="flex justify-center items-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                </div>
            ) : filteredComplains.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                    <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 text-lg">No complains found</p>
                    <p className="text-gray-500 text-sm mt-2">Add your first complain to get started</p>
                </div>
            ) : (
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-600 text-gray-700 uppercase tracking-wider">Complain By</th>
                                    <th className="px-6 py-3 text-left text-xs font-600 text-gray-700 uppercase tracking-wider">Phone</th>
                                    <th className="px-6 py-3 text-left text-xs font-600 text-gray-700 uppercase tracking-wider">Date</th>
                                    <th className="px-6 py-3 text-left text-xs font-600 text-gray-700 uppercase tracking-wider">Description</th>
                                    <th className="px-6 py-3 text-left text-xs font-600 text-gray-700 uppercase tracking-wider">Assigned</th>
                                    <th className="px-6 py-3 text-left text-xs font-600 text-gray-700 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredComplains.map((complain) => (
                                    <tr key={complain._id} className="hover:bg-gray-50 transition">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="font-600 text-gray-900">{complain.complainBy}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                                            {complain.phone || '-'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                                            {new Date(complain.date).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-gray-700 line-clamp-2 max-w-xs">
                                                {complain.description}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {complain.assigned ? (
                                                <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-600">
                                                    {complain.assigned}
                                                </span>
                                            ) : (
                                                <span className="text-gray-400">-</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => handleView(complain)}
                                                    className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition"
                                                    title="View"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleEdit(complain)}
                                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                                    title="Edit"
                                                >
                                                    <Pencil className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(complain._id)}
                                                    className={`p-2 rounded-lg transition overflow-hidden ${selectedDeleteId === complain._id
                                                        ? "bg-red-600 text-white hover:bg-red-700"
                                                        : "text-red-600 hover:bg-red-50"
                                                        }`}
                                                    title="Delete"
                                                >
                                                    {selectedDeleteId === complain._id ? (
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
                </div>
            )}

            {/* Modals */}
            <ComplainModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleSubmit}
                initialData={selectedComplain}
                viewMode={viewMode}
            />


        </div>
    );
};

export default ComplainPage;
