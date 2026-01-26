import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useModalAnimation } from '../../hooks/useModalAnimation';
import API_URL from '../../config/api.js';
import { X, Upload, CreditCard, Plus, Trash2, Move } from 'lucide-react';

const IdCardTemplateModal = ({ template, onClose }) => {
    const { currentUser } = useAuth();
    const { showToast } = useToast();
    const [loading, setLoading] = useState(false);
    const [previewImage, setPreviewImage] = useState(null);
    const [formData, setFormData] = useState({
        templateName: '',
        templateType: 'student',
        dimensions: {
            width: 85.6,
            height: 53.98
        },
        backgroundColor: '#ffffff',
        fields: [],
        logoPosition: { x: 10, y: 10, width: 30, height: 30 },
        photoPosition: { x: 10, y: 50, width: 25, height: 30 }
    });
    const [templateFile, setTemplateFile] = useState(null);

    const isOpen = true;
    const { isVisible, isClosing, handleClose } = useModalAnimation(isOpen, () => onClose(false));

    // Default fields for student and employee
    const defaultFields = {
        student: [
            { fieldName: 'studentName', label: 'Student Name', position: { x: 40, y: 15 }, fontSize: 14, fontColor: '#000000', fontWeight: 'bold', alignment: 'left' },
            { fieldName: 'class', label: 'Class', position: { x: 40, y: 25 }, fontSize: 12, fontColor: '#000000', fontWeight: 'normal', alignment: 'left' },
            { fieldName: 'rollNumber', label: 'Roll Number', position: { x: 40, y: 35 }, fontSize: 12, fontColor: '#000000', fontWeight: 'normal', alignment: 'left' },
            { fieldName: 'schoolName', label: 'School Name', position: { x: 10, y: 5 }, fontSize: 16, fontColor: '#000000', fontWeight: 'bold', alignment: 'center' }
        ],
        employee: [
            { fieldName: 'employeeName', label: 'Employee Name', position: { x: 40, y: 15 }, fontSize: 14, fontColor: '#000000', fontWeight: 'bold', alignment: 'left' },
            { fieldName: 'designation', label: 'Designation', position: { x: 40, y: 25 }, fontSize: 12, fontColor: '#000000', fontWeight: 'normal', alignment: 'left' },
            { fieldName: 'employeeId', label: 'Employee ID', position: { x: 40, y: 35 }, fontSize: 12, fontColor: '#000000', fontWeight: 'normal', alignment: 'left' },
            { fieldName: 'schoolName', label: 'School Name', position: { x: 10, y: 5 }, fontSize: 16, fontColor: '#000000', fontWeight: 'bold', alignment: 'center' }
        ]
    };

    useEffect(() => {
        if (template) {
            // Edit mode
            setFormData({
                templateName: template.templateName || '',
                templateType: template.templateType || 'student',
                dimensions: template.dimensions || { width: 85.6, height: 53.98 },
                backgroundColor: template.backgroundColor || '#ffffff',
                fields: template.fields || [],
                logoPosition: template.logoPosition || { x: 10, y: 10, width: 30, height: 30 },
                photoPosition: template.photoPosition || { x: 10, y: 50, width: 25, height: 30 }
            });
            if (template.templateFile) {
                setPreviewImage(`${API_URL}/${template.templateFile}`);
            }
        } else {
            // New template - set default fields
            setFormData(prev => ({
                ...prev,
                fields: defaultFields.student
            }));
        }
    }, [template]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name.includes('.')) {
            const [parent, child] = name.split('.');
            setFormData(prev => ({
                ...prev,
                [parent]: {
                    ...prev[parent],
                    [child]: parseFloat(value) || value
                }
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const handleTypeChange = (e) => {
        const newType = e.target.value;
        setFormData(prev => ({
            ...prev,
            templateType: newType,
            fields: defaultFields[newType]
        }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Validate file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                showToast('File size must be less than 5MB', 'error');
                return;
            }
            
            // Validate file type
            const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
            if (!validTypes.includes(file.type)) {
                showToast('Only JPG, PNG, and PDF files are allowed', 'error');
                return;
            }

            setTemplateFile(file);
            
            // Preview image
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewImage(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleFieldChange = (index, field, value) => {
        const updatedFields = [...formData.fields];
        if (field.includes('.')) {
            const [parent, child] = field.split('.');
            updatedFields[index][parent][child] = parseFloat(value) || value;
        } else {
            updatedFields[index][field] = value;
        }
        setFormData(prev => ({ ...prev, fields: updatedFields }));
    };

    const addField = () => {
        const newField = {
            fieldName: '',
            label: '',
            position: { x: 0, y: 0 },
            fontSize: 12,
            fontColor: '#000000',
            fontWeight: 'normal',
            alignment: 'left'
        };
        setFormData(prev => ({
            ...prev,
            fields: [...prev.fields, newField]
        }));
    };

    const removeField = (index) => {
        const updatedFields = formData.fields.filter((_, i) => i !== index);
        setFormData(prev => ({ ...prev, fields: updatedFields }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.templateName) {
            showToast('Please enter template name', 'error');
            return;
        }

        try {
            setLoading(true);
            const formDataToSend = new FormData();
            
            formDataToSend.append('school', currentUser._id);
            formDataToSend.append('templateName', formData.templateName);
            formDataToSend.append('templateType', formData.templateType);
            formDataToSend.append('dimensions', JSON.stringify(formData.dimensions));
            formDataToSend.append('backgroundColor', formData.backgroundColor);
            formDataToSend.append('fields', JSON.stringify(formData.fields));
            formDataToSend.append('logoPosition', JSON.stringify(formData.logoPosition));
            formDataToSend.append('photoPosition', JSON.stringify(formData.photoPosition));
            
            if (templateFile) {
                formDataToSend.append('templateFile', templateFile);
            }

            if (template) {
                // Update
                const response = await axios.put(`${API_URL}/IdCardTemplate/${template._id}`, formDataToSend, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                if (response.data.success) {
                    showToast('Template updated successfully', 'success');
                    onClose(true);
                }
            } else {
                // Create
                const response = await axios.post(`${API_URL}/IdCardTemplate`, formDataToSend, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                if (response.data.success) {
                    showToast('Template created successfully', 'success');
                    onClose(true);
                }
            }
        } catch (error) {
            const errorMsg = error.response?.data?.message || 'Failed to save template';
            showToast(errorMsg, 'error');
        } finally {
            setLoading(false);
        }
    };

    if (!isVisible) return null;

    return createPortal(
        <div className={`fixed inset-0 z-9999 overflow-y-auto bg-black/70 backdrop-blur-sm ${isClosing ? 'animate-fade-out' : 'animate-fade-in'}`}>
            <div className="flex min-h-full items-center justify-center p-4">
                <div className={`bg-white rounded-2xl shadow-2xl w-full max-w-6xl relative ${isClosing ? 'animate-scale-down' : 'animate-scale-up'}`}>
                    
                    {/* Header */}
                    <div className="p-7 rounded-t-2xl flex justify-between items-start gap-4 border-b border-gray-200">
                        <div className="flex-1">
                            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-2">
                                <CreditCard className="w-7 h-7 text-indigo-600" />
                                {template ? 'Edit ID Card Template' : 'Create ID Card Template'}
                            </h2>
                            <p className="text-gray-600 text-sm mt-2">
                                {template ? 'Update template details and field positions' : 'Design your ID card template with customizable fields'}
                            </p>
                        </div>
                        <button
                            onClick={handleClose}
                            className="text-red-600 bg-gray-50 cursor-pointer hover:bg-gray-100 p-2 rounded-lg transition duration-150 shrink-0"
                        >
                            <X size={24} />
                        </button>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="p-6 md:p-8">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            
                            {/* Left Panel: Basic Info & Upload */}
                            <div className="space-y-5">
                                <h3 className="text-lg font-bold text-gray-800 border-b pb-2">Template Information</h3>
                                
                                {/* Template Name */}
                                <div>
                                    <label className="block text-sm font-600 text-gray-700 mb-2">
                                        Template Name <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="templateName"
                                        value={formData.templateName}
                                        onChange={handleChange}
                                        placeholder="e.g., Student ID Card 2024"
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                                        required
                                    />
                                </div>

                                {/* Template Type */}
                                <div>
                                    <label className="block text-sm font-600 text-gray-700 mb-2">
                                        Template Type <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        name="templateType"
                                        value={formData.templateType}
                                        onChange={handleTypeChange}
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                                    >
                                        <option value="student">Student ID Card</option>
                                        <option value="employee">Employee ID Card</option>
                                    </select>
                                </div>

                                {/* Dimensions */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-600 text-gray-700 mb-2">
                                            Width (mm)
                                        </label>
                                        <input
                                            type="number"
                                            name="dimensions.width"
                                            value={formData.dimensions.width}
                                            onChange={handleChange}
                                            step="0.1"
                                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-600 text-gray-700 mb-2">
                                            Height (mm)
                                        </label>
                                        <input
                                            type="number"
                                            name="dimensions.height"
                                            value={formData.dimensions.height}
                                            onChange={handleChange}
                                            step="0.1"
                                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                                        />
                                    </div>
                                </div>

                                {/* Background Color */}
                                <div>
                                    <label className="block text-sm font-600 text-gray-700 mb-2">
                                        Background Color
                                    </label>
                                    <div className="flex gap-2">
                                        <input
                                            type="color"
                                            name="backgroundColor"
                                            value={formData.backgroundColor}
                                            onChange={handleChange}
                                            className="w-16 h-10 border border-gray-300 rounded-lg cursor-pointer"
                                        />
                                        <input
                                            type="text"
                                            value={formData.backgroundColor}
                                            onChange={(e) => setFormData(prev => ({ ...prev, backgroundColor: e.target.value }))}
                                            className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                                        />
                                    </div>
                                </div>

                                {/* Template Upload */}
                                <div>
                                    <label className="block text-sm font-600 text-gray-700 mb-2">
                                        Upload Template Background
                                    </label>
                                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-indigo-500 transition">
                                        <input
                                            type="file"
                                            accept="image/jpeg,image/jpg,image/png,application/pdf"
                                            onChange={handleFileChange}
                                            className="hidden"
                                            id="templateFile"
                                        />
                                        <label htmlFor="templateFile" className="cursor-pointer">
                                            <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                            <p className="text-sm text-gray-600">Click to upload or drag and drop</p>
                                            <p className="text-xs text-gray-500 mt-1">JPG, PNG, PDF (max 5MB)</p>
                                        </label>
                                    </div>
                                    {previewImage && (
                                        <div className="mt-3">
                                            <img src={previewImage} alt="Preview" className="w-full h-40 object-contain border rounded-lg" />
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Right Panel: Field Configuration */}
                            <div className="space-y-5">
                                <div className="flex justify-between items-center border-b pb-2">
                                    <h3 className="text-lg font-bold text-gray-800">Field Positions</h3>
                                    <button
                                        type="button"
                                        onClick={addField}
                                        className="flex items-center gap-1 px-3 py-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition text-sm"
                                    >
                                        <Plus size={16} />
                                        Add Field
                                    </button>
                                </div>

                                <div className="max-h-130 overflow-y-auto space-y-4 pr-2">
                                    {formData.fields.map((field, index) => (
                                        <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                                            <div className="flex justify-between items-start mb-3">
                                                <Move className="w-5 h-5 text-gray-400" />
                                                <button
                                                    type="button"
                                                    onClick={() => removeField(index)}
                                                    className="text-red-500 hover:text-red-700 transition"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                            
                                            <div className="grid grid-cols-2 gap-3">
                                                <div className="col-span-2">
                                                    <label className="block text-xs font-600 text-gray-600 mb-1">Field Name</label>
                                                    <input
                                                        type="text"
                                                        value={field.fieldName}
                                                        onChange={(e) => handleFieldChange(index, 'fieldName', e.target.value)}
                                                        placeholder="e.g., studentName"
                                                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                                    />
                                                </div>
                                                <div className="col-span-2">
                                                    <label className="block text-xs font-600 text-gray-600 mb-1">Label</label>
                                                    <input
                                                        type="text"
                                                        value={field.label}
                                                        onChange={(e) => handleFieldChange(index, 'label', e.target.value)}
                                                        placeholder="e.g., Student Name"
                                                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-600 text-gray-600 mb-1">X Position (mm)</label>
                                                    <input
                                                        type="number"
                                                        value={field.position.x}
                                                        onChange={(e) => handleFieldChange(index, 'position.x', e.target.value)}
                                                        step="0.1"
                                                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-600 text-gray-600 mb-1">Y Position (mm)</label>
                                                    <input
                                                        type="number"
                                                        value={field.position.y}
                                                        onChange={(e) => handleFieldChange(index, 'position.y', e.target.value)}
                                                        step="0.1"
                                                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-600 text-gray-600 mb-1">Font Size</label>
                                                    <input
                                                        type="number"
                                                        value={field.fontSize}
                                                        onChange={(e) => handleFieldChange(index, 'fontSize', e.target.value)}
                                                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-600 text-gray-600 mb-1">Font Color</label>
                                                    <input
                                                        type="color"
                                                        value={field.fontColor}
                                                        onChange={(e) => handleFieldChange(index, 'fontColor', e.target.value)}
                                                        className="w-full h-10 border border-gray-300 rounded-lg cursor-pointer"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-600 text-gray-600 mb-1">Font Weight</label>
                                                    <select
                                                        value={field.fontWeight}
                                                        onChange={(e) => handleFieldChange(index, 'fontWeight', e.target.value)}
                                                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                                    >
                                                        <option value="normal">Normal</option>
                                                        <option value="bold">Bold</option>
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-600 text-gray-600 mb-1">Alignment</label>
                                                    <select
                                                        value={field.alignment}
                                                        onChange={(e) => handleFieldChange(index, 'alignment', e.target.value)}
                                                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                                    >
                                                        <option value="left">Left</option>
                                                        <option value="center">Center</option>
                                                        <option value="right">Right</option>
                                                    </select>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Buttons */}
                        <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-200">
                            <button
                                type="button"
                                onClick={handleClose}
                                className="cursor-pointer px-6 py-2.5 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 font-600 transition duration-150"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="cursor-pointer px-6 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-600 transition duration-150 shadow-lg hover:shadow-xl disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Saving...' : (template ? 'Update Template' : 'Create Template')}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default IdCardTemplateModal;
