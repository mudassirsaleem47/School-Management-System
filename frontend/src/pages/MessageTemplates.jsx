import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import SearchBar from '../components/SearchBar';
import { Plus, Edit, Trash2, Check, FileText, Copy, Clock } from 'lucide-react';
import { createPortal } from 'react-dom';

const API_BASE = import.meta.env.VITE_API_URL;

const MessageTemplates = () => {
    const { currentUser } = useAuth();
    const { showToast } = useToast();
    
    // State Management
    const [templates, setTemplates] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isClosing, setIsClosing] = useState(false);
    const [currentTemplate, setCurrentTemplate] = useState(null);
    
    // Form State
    const [formData, setFormData] = useState({
        name: '',
        category: 'general',
        content: ''
    });
    
    // Delete State
    const [selectedDeleteId, setSelectedDeleteId] = useState(null);
    
    // Search State
    const [searchQuery, setSearchQuery] = useState('');

    // Categories
    const categories = [
        { value: 'general', label: 'General' },
        { value: 'fee', label: 'Fee Related' },
        { value: 'attendance', label: 'Attendance' },
        { value: 'exam', label: 'Exam/Result' },
        { value: 'event', label: 'Events' },
        { value: 'holiday', label: 'Holiday' },
        { value: 'other', label: 'Other' }
    ];

    // Fetch Templates
    const fetchTemplates = async () => {
        try {
            setLoading(true);
            const schoolId = currentUser._id;
            const response = await axios.get(`${API_BASE}/MessageTemplates/${schoolId}`);
            setTemplates(Array.isArray(response.data) ? response.data : []);
        } catch (err) {
            console.error('Error fetching templates:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (currentUser) fetchTemplates();
    }, [currentUser]);

    // Modal Handlers
    const openModal = (template = null) => {
        if (template) {
            setCurrentTemplate(template);
            setFormData({
                name: template.name,
                category: template.category,
                content: template.content
            });
        } else {
            setCurrentTemplate(null);
            setFormData({ name: '', category: 'general', content: '' });
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsClosing(true);
        setTimeout(() => {
            setIsModalOpen(false);
            setIsClosing(false);
            setCurrentTemplate(null);
            setFormData({ name: '', category: 'general', content: '' });
        }, 200);
    };

    // Form Submit
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.name || !formData.content) {
            showToast('All fields are required!', 'error');
            return;
        }

        try {
            const dataToSend = { ...formData, school: currentUser._id };
            
            if (currentTemplate) {
                await axios.put(`${API_BASE}/MessageTemplate/${currentTemplate._id}`, dataToSend);
                showToast('Template updated successfully!', 'success');
            } else {
                await axios.post(`${API_BASE}/MessageTemplateCreate`, dataToSend);
                showToast('New template created!', 'success');
            }
            
            closeModal();
            fetchTemplates();
        } catch (err) {
            showToast('Error saving template!', 'error');
        }
    };

    // Delete Logic
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

    const confirmDelete = async () => {
        if (!selectedDeleteId) return;
        try {
            await axios.delete(`${API_BASE}/MessageTemplate/${selectedDeleteId}`);
            fetchTemplates();
            showToast('Template deleted successfully!', 'success');
        } catch (err) {
            showToast('Error deleting template!', 'error');
        }
        setSelectedDeleteId(null);
    };

    // Copy to Clipboard
    const copyToClipboard = (content) => {
        navigator.clipboard.writeText(content);
        showToast('Message copied to clipboard!', 'success');
    };

    // Filter Templates
    const filteredTemplates = templates.filter(template => {
        if (!searchQuery) return true;
        const query = searchQuery.toLowerCase();
        return (
            template.name?.toLowerCase().includes(query) ||
            template.content?.toLowerCase().includes(query) ||
            template.category?.toLowerCase().includes(query)
        );
    });

    // Get category color
    const getCategoryColor = (category) => {
        const colors = {
            general: 'bg-gray-100 text-gray-700',
            fee: 'bg-green-100 text-green-700',
            attendance: 'bg-blue-100 text-blue-700',
            exam: 'bg-purple-100 text-purple-700',
            event: 'bg-orange-100 text-orange-700',
            holiday: 'bg-pink-100 text-pink-700',
            other: 'bg-yellow-100 text-yellow-700'
        };
        return colors[category] || colors.general;
    };

    return (
        <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 p-6 md:p-8">
            
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-4xl font-bold text-gray-900">Message Templates</h1>
                    <p className="text-gray-600 mt-2">Manage your message templates here</p>
                </div>
                <button 
                    onClick={() => openModal()}
                    className="flex items-center px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 shadow-lg hover:shadow-xl transition duration-200 font-600"
                >
                    <Plus className="w-5 h-5 mr-2" />
                    Add Template
                </button>
            </div>

            {/* Search Bar */}
            <div className="mb-6">
                <SearchBar 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by template name or content..."
                    className="max-w-md"
                />
            </div>

            {/* Templates Grid */}
            {loading ? (
                <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                </div>
            ) : templates.length === 0 ? (
                <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                    <div onClick={() => openModal()} className="w-16 h-16 cursor-pointer bg-gray-100 rounded-full flex items-center justify-center mb-4 mx-auto">
                        <Plus className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-gray-600 text-lg font-500">No templates yet</p>
                    <p className="text-gray-500 text-sm mt-1">Click "Add Template" to create a new template</p>
                </div>
            ) : filteredTemplates.length === 0 ? (
                <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4 mx-auto">
                        <FileText className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-gray-600 text-lg font-500">No templates found</p>
                    <p className="text-gray-500 text-sm mt-1">Try changing your search criteria</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredTemplates.map(template => (
                        <div 
                            key={template._id}
                            className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition"
                        >
                            {/* Card Header */}
                            <div className="p-5 border-b border-gray-100">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <h3 className="font-bold text-lg text-gray-900">{template.name}</h3>
                                        <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-600 ${getCategoryColor(template.category)}`}>
                                            {categories.find(c => c.value === template.category)?.label || template.category}
                                        </span>
                                    </div>
                                    <button
                                        onClick={() => copyToClipboard(template.content)}
                                        className="p-2 hover:bg-gray-100 rounded-lg transition"
                                        title="Copy message"
                                    >
                                        <Copy className="w-4 h-4 text-gray-500" />
                                    </button>
                                </div>
                            </div>
                            
                            {/* Card Body */}
                            <div className="p-5">
                                <p className="text-gray-600 text-sm line-clamp-4">
                                    {template.content}
                                </p>
                            </div>
                            
                            {/* Card Footer */}
                            <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                                <div className="flex items-center text-xs text-gray-500">
                                    <Clock className="w-3.5 h-3.5 mr-1" />
                                    {new Date(template.createdAt).toLocaleDateString()}
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => openModal(template)}
                                        className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition"
                                        title="Edit"
                                    >
                                        <Edit className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(template._id)}
                                        className={`p-2 rounded-lg transition ${
                                            selectedDeleteId === template._id
                                                ? 'bg-red-600 text-white'
                                                : 'bg-red-100 text-red-600 hover:bg-red-200'
                                        }`}
                                        title="Delete"
                                    >
                                        {selectedDeleteId === template._id ? (
                                            <Check className="w-4 h-4" />
                                        ) : (
                                            <Trash2 className="w-4 h-4" />
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Add/Edit Modal */}
            {isModalOpen && createPortal(
                <div className={`fixed inset-0 z-9999 overflow-y-auto bg-black/70 ${isClosing ? 'animate-fade-out' : 'animate-fade-in'}`}>
                    <div className="flex min-h-full items-center justify-center p-4">
                        <div className={`bg-white rounded-2xl shadow-2xl w-full max-w-xl relative ${isClosing ? 'animate-scale-down' : 'animate-scale-up'}`}>
                            
                            {/* Modal Header */}
                            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-linear-to-r from-indigo-600 to-purple-600 rounded-t-2xl">
                                <h3 className="text-xl font-bold text-white">
                                    {currentTemplate ? 'Edit Template' : 'New Template'}
                                </h3>
                                <button
                                    onClick={closeModal}
                                    className="text-white/80 hover:text-white transition"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            {/* Modal Body */}
                            <form onSubmit={handleSubmit} className="p-6 space-y-4">
                                
                                {/* Template Name */}
                                <div>
                                    <label className="block text-sm font-600 text-gray-700 mb-2">
                                        Template Name *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                                        placeholder="e.g., Fee Reminder"
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        required
                                    />
                                </div>

                                {/* Category */}
                                <div>
                                    <label className="block text-sm font-600 text-gray-700 mb-2">
                                        Category
                                    </label>
                                    <select
                                        value={formData.category}
                                        onChange={(e) => setFormData({...formData, category: e.target.value})}
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    >
                                        {categories.map(cat => (
                                            <option key={cat.value} value={cat.value}>{cat.label}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Message Content */}
                                <div>
                                    <label className="block text-sm font-600 text-gray-700 mb-2">
                                        Message Content *
                                    </label>
                                    <textarea
                                        value={formData.content}
                                        onChange={(e) => setFormData({...formData, content: e.target.value})}
                                        placeholder="Write your message here... Use dynamic tags below to personalize"
                                        rows={6}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                                        required
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        {formData.content.length} characters
                                    </p>
                                </div>

                                {/* Dynamic Tags */}
                                <div className="bg-indigo-50 rounded-lg p-4">
                                    <p className="text-sm font-600 text-indigo-700 mb-3">
                                        Dynamic Tags (click to insert):
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                        {[
                                            { tag: '{{name}}', label: 'Student Name' },
                                            { tag: '{{father}}', label: 'Father Name' },
                                            { tag: '{{class}}', label: 'Class' },
                                            { tag: '{{section}}', label: 'Section' },
                                            { tag: '{{phone}}', label: 'Phone' },
                                            { tag: '{{roll}}', label: 'Roll No' },
                                            { tag: '{{fee_amount}}', label: 'Fee Amount' },
                                            { tag: '{{due_date}}', label: 'Due Date' },
                                            { tag: '{{attendance}}', label: 'Attendance %' },
                                            { tag: '{{exam_date}}', label: 'Exam Date' },
                                            { tag: '{{result}}', label: 'Result' },
                                            { tag: '{{school}}', label: 'School Name' }
                                        ].map(item => (
                                            <button
                                                key={item.tag}
                                                type="button"
                                                onClick={() => setFormData({
                                                    ...formData, 
                                                    content: formData.content + item.tag
                                                })}
                                                className="bg-white px-3 py-1.5 rounded-lg text-xs font-mono text-indigo-600 border border-indigo-200 hover:bg-indigo-100 hover:border-indigo-400 transition"
                                                title={`Insert ${item.label}`}
                                            >
                                                {item.tag}
                                            </button>
                                        ))}
                                    </div>
                                    <p className="text-xs text-gray-500 mt-3">
                                        These tags will be replaced with actual student data when sending messages
                                    </p>
                                </div>

                                {/* Submit Button */}
                                <div className="flex gap-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={closeModal}
                                        className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-600"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-600"
                                    >
                                        {currentTemplate ? 'Update Template' : 'Create Template'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
};

export default MessageTemplates;
