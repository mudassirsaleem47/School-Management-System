import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import API_URL from '../config/api.js';
import { CreditCard, Plus, Edit, Trash2, Search, Image } from 'lucide-react';
import IdCardTemplateModal from '../components/form-popup/IdCardTemplateModal';
import ConfirmationModal from '../components/ConfirmationModal';

const IdCardTemplateManagement = () => {
    const { currentUser } = useAuth();
    const { showToast } = useToast();
    const [templates, setTemplates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [selectedTemplate, setSelectedTemplate] = useState(null);
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [templateToDelete, setTemplateToDelete] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterType, setFilterType] = useState('all');

    // Fetch templates
    useEffect(() => {
        if (currentUser && currentUser._id) {
            fetchTemplates();
        }
    }, [currentUser]);

    const fetchTemplates = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${API_URL}/IdCardTemplates/${currentUser._id}`);
            if (response.data.success) {
                setTemplates(response.data.templates);
            }
        } catch (error) {
            console.error('Error fetching templates:', error);
            showToast('Failed to load templates', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleAddTemplate = () => {
        setSelectedTemplate(null);
        setShowModal(true);
    };

    const handleEditTemplate = (template) => {
        setSelectedTemplate(template);
        setShowModal(true);
    };

    const handleDeleteClick = (template) => {
        setTemplateToDelete(template);
        setShowConfirmation(true);
    };

    const handleDeleteConfirm = async () => {
        try {
            const response = await axios.delete(`${API_URL}/IdCardTemplate/${templateToDelete._id}`);
            if (response.data.success) {
                showToast('Template deleted successfully', 'success');
                fetchTemplates();
            }
        } catch (error) {
            const errorMsg = error.response?.data?.message || 'Failed to delete template';
            showToast(errorMsg, 'error');
        } finally {
            setShowConfirmation(false);
            setTemplateToDelete(null);
        }
    };

    const handleModalClose = (refresh = false) => {
        setShowModal(false);
        setSelectedTemplate(null);
        if (refresh) {
            fetchTemplates();
        }
    };

    // Filter templates
    const filteredTemplates = templates.filter(template => {
        const matchesSearch = !searchQuery || 
            template.templateName.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesType = filterType === 'all' || template.templateType === filterType;
        return matchesSearch && matchesType;
    });

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="mx-auto">
                {/* Header */}
                <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                    <div className="flex justify-between items-center mb-4">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                                <CreditCard className="w-8 h-8 text-indigo-600" />
                                ID Card Template Management
                            </h1>
                            <p className="text-gray-600 mt-1">Create and manage ID card templates</p>
                        </div>
                        <button
                            onClick={handleAddTemplate}
                            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition flex items-center gap-2"
                        >
                            <Plus className="w-5 h-5" />
                            Create Template
                        </button>
                    </div>

                    {/* Search and Filter */}
                    <div className="flex gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search templates by name..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 border-2 border-indigo-200 rounded-lg focus:outline-none focus:border-indigo-500 transition"
                            />
                        </div>
                        <select
                            value={filterType}
                            onChange={(e) => setFilterType(e.target.value)}
                            className="px-4 py-2.5 border-2 border-indigo-200 rounded-lg focus:outline-none focus:border-indigo-500 transition"
                        >
                            <option value="all">All Types</option>
                            <option value="student">Student</option>
                            <option value="employee">Employee</option>
                        </select>
                    </div>
                </div>

                {/* Templates Grid */}
                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                    </div>
                ) : filteredTemplates.length === 0 ? (
                    <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                        <CreditCard className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-xl font-600 text-gray-900 mb-2">
                            {searchQuery || filterType !== 'all' ? 'No Matching Templates' : 'No Templates Found'}
                        </h3>
                        <p className="text-gray-600 mb-4">
                            {searchQuery || filterType !== 'all'
                                ? 'No templates match your search criteria'
                                : 'Start by creating your first ID card template'}
                        </p>
                        {!searchQuery && filterType === 'all' && (
                            <button
                                onClick={handleAddTemplate}
                                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                            >
                                Create Template
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredTemplates.map(template => (
                            <div key={template._id} className="bg-white rounded-lg shadow-sm hover:shadow-md transition overflow-hidden">
                                {/* Template Preview */}
                                <div className="h-48 bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center relative">
                                    {template.templateFile ? (
                                        <img 
                                            src={`${API_URL}/${template.templateFile}`} 
                                            alt={template.templateName}
                                            className="w-full h-full object-contain p-4"
                                        />
                                    ) : (
                                        <div className="text-center">
                                            <Image className="w-16 h-16 text-gray-400 mx-auto mb-2" />
                                            <p className="text-sm text-gray-500">No preview available</p>
                                        </div>
                                    )}
                                    <div className="absolute top-2 right-2">
                                        <span className={`px-3 py-1 rounded-full text-xs font-600 ${
                                            template.templateType === 'student' 
                                                ? 'bg-blue-100 text-blue-700' 
                                                : 'bg-green-100 text-green-700'
                                        }`}>
                                            {template.templateType === 'student' ? 'Student' : 'Employee'}
                                        </span>
                                    </div>
                                </div>

                                {/* Template Info */}
                                <div className="p-5">
                                    <h3 className="font-bold text-gray-900 text-lg mb-2">{template.templateName}</h3>
                                    <div className="text-sm text-gray-600 space-y-1 mb-4">
                                        <p>Dimensions: {template.dimensions.width} × {template.dimensions.height} mm</p>
                                        <p>Fields: {template.fields.length} configured</p>
                                        <p className="text-xs text-gray-500">
                                            Created: {new Date(template.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleEditTemplate(template)}
                                            className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition flex items-center justify-center gap-2"
                                        >
                                            <Edit className="w-4 h-4" />
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDeleteClick(template)}
                                            className="flex-1 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition flex items-center justify-center gap-2"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Template Modal */}
            {showModal && (
                <IdCardTemplateModal
                    template={selectedTemplate}
                    onClose={handleModalClose}
                />
            )}

            {/* Confirmation Modal */}
            {showConfirmation && (
                <ConfirmationModal
                    isOpen={showConfirmation}
                    onClose={() => setShowConfirmation(false)}
                    onConfirm={handleDeleteConfirm}
                    title="Delete Template"
                    message={`Are you sure you want to delete "${templateToDelete?.templateName}"? This action cannot be undone.`}
                />
            )}
        </div>
    );
};

export default IdCardTemplateManagement;
