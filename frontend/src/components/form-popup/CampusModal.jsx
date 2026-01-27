import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useModalAnimation } from '../../hooks/useModalAnimation';
import API_URL from '../../config/api.js';
import { X, Building2, MapPin, Phone, Mail, User, Hash, CheckSquare } from 'lucide-react';

const CampusModal = ({ campus, onClose }) => {
    const { currentUser } = useAuth();
    const { showToast } = useToast();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        campusName: '',
        campusCode: '',
        address: '',
        city: '',
        phoneNumber: '',
        email: '',
        principalName: '',
        totalCapacity: '',
        isMain: false,
        status: 'Active'
    });

    const isOpen = true; // Modal is always open when component is rendered
    const { isVisible, isClosing, handleClose } = useModalAnimation(isOpen, () => onClose(false));

    useEffect(() => {
        if (campus) {
            // Edit mode - populate form with existing data
            setFormData({
                campusName: campus.campusName || '',
                campusCode: campus.campusCode || '',
                address: campus.address || '',
                city: campus.city || '',
                phoneNumber: campus.phoneNumber || '',
                email: campus.email || '',
                principalName: campus.principalName || '',
                totalCapacity: campus.totalCapacity || '',
                isMain: campus.isMain || false,
                status: campus.status || 'Active'
            });
        } else {
            // Add mode - generate campus code
            generateCampusCode();
        }
    }, [campus]);

    const generateCampusCode = () => {
        const timestamp = Date.now().toString().slice(-4);
        const randomNum = Math.floor(Math.random() * 100).toString().padStart(2, '0');
        const code = `CMP-${timestamp}${randomNum}`;
        setFormData(prev => ({ ...prev, campusCode: code }));
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validation
        if (!formData.campusName.trim()) {
            showToast('Campus name is required', 'error');
            return;
        }

        try {
            setLoading(true);
            const payload = {
                ...formData,
                school: currentUser._id
            };

            if (campus) {
                // Update existing campus
                const response = await axios.put(`${API_URL}/Campus/${campus._id}`, payload);
                if (response.data.success) {
                    showToast('Campus updated successfully', 'success');
                    onClose(true); // Close with refresh
                }
            } else {
                // Create new campus
                const response = await axios.post(`${API_URL}/Campus`, payload);
                if (response.data.success) {
                    showToast('Campus created successfully', 'success');
                    onClose(true); // Close with refresh
                }
            }
        } catch (error) {
            const errorMsg = error.response?.data?.message || 'Failed to save campus';
            showToast(errorMsg, 'error');
        } finally {
            setLoading(false);
        }
    };

    if (!isVisible) return null;

    return createPortal(
        <div className={`fixed inset-0 z-9999 overflow-y-auto bg-black/70 ${isClosing ? 'animate-fade-out' : 'animate-fade-in'}`}>
            <div className="flex min-h-full items-center justify-center p-4">
                <div className={`bg-white rounded-2xl shadow-2xl w-full max-w-2xl relative ${isClosing ? 'animate-scale-down' : 'animate-scale-up'}`}>
                    
                    {/* Header */}
                    <div className="p-7 rounded-t-2xl flex justify-between items-start gap-4">
                        <div className="flex-1">
                            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-2">
                                <Building2 className="w-7 h-7 text-indigo-600" />
                                {campus ? 'Edit Campus' : 'Add New Campus'}
                            </h2>
                            <p className="text-gray-600 text-sm mt-2">
                                {campus ? 'Update the campus details below' : 'Fill in the details to add a new campus'}
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
                        <div className="space-y-5">
                            
                            {/* Row 1: Campus Name, Campus Code */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-sm font-600 text-gray-700 mb-2">
                                        Campus Name <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <Building2 className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                                        <input
                                            type="text"
                                            name="campusName"
                                            value={formData.campusName}
                                            onChange={handleChange}
                                            placeholder="e.g., Main Campus, North Branch"
                                            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-600 text-gray-700 mb-2">
                                        Campus Code <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <Hash className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                                        <input
                                            type="text"
                                            name="campusCode"
                                            value={formData.campusCode}
                                            onChange={handleChange}
                                            placeholder="CMP-001"
                                            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition uppercase"
                                            required
                                        />
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">Unique identifier for this campus</p>
                                </div>
                            </div>

                            {/* Row 2: Address, City */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-sm font-600 text-gray-700 mb-2">
                                        Address
                                    </label>
                                    <div className="relative">
                                        <MapPin className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                                        <input
                                            type="text"
                                            name="address"
                                            value={formData.address}
                                            onChange={handleChange}
                                            placeholder="Street address"
                                            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-600 text-gray-700 mb-2">
                                        City
                                    </label>
                                    <input
                                        type="text"
                                        name="city"
                                        value={formData.city}
                                        onChange={handleChange}
                                        placeholder="City name"
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                                    />
                                </div>
                            </div>

                            {/* Row 3: Phone, Email */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-sm font-600 text-gray-700 mb-2">
                                        Phone Number
                                    </label>
                                    <div className="relative">
                                        <Phone className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                                        <input
                                            type="tel"
                                            name="phoneNumber"
                                            value={formData.phoneNumber}
                                            onChange={handleChange}
                                            placeholder="+92 300 1234567"
                                            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-600 text-gray-700 mb-2">
                                        Email
                                    </label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            placeholder="campus@school.com"
                                            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Row 4: Principal Name, Capacity */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-sm font-600 text-gray-700 mb-2">
                                        Principal Name
                                    </label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                                        <input
                                            type="text"
                                            name="principalName"
                                            value={formData.principalName}
                                            onChange={handleChange}
                                            placeholder="Principal's name"
                                            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-600 text-gray-700 mb-2">
                                        Total Capacity
                                    </label>
                                    <input
                                        type="number"
                                        name="totalCapacity"
                                        value={formData.totalCapacity}
                                        onChange={handleChange}
                                        placeholder="Maximum students"
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                                        min="0"
                                    />
                                </div>
                            </div>

                            {/* Row 5: Status, Main Campus */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-sm font-600 text-gray-700 mb-2">
                                        Status
                                    </label>
                                    <select
                                        name="status"
                                        value={formData.status}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                                    >
                                        <option value="Active">Active</option>
                                        <option value="Inactive">Inactive</option>
                                    </select>
                                </div>

                                <div className="flex items-center mt-7">
                                    <input
                                        type="checkbox"
                                        id="isMain"
                                        name="isMain"
                                        checked={formData.isMain}
                                        onChange={handleChange}
                                        className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                                    />
                                    <label htmlFor="isMain" className="ml-2 text-sm font-600 text-gray-700 flex items-center gap-2">
                                        <CheckSquare className="w-4 h-4 text-indigo-600" />
                                        Mark as Main Campus
                                    </label>
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
                                {loading ? 'Saving...' : (campus ? 'Update Campus' : 'Create Campus')}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default CampusModal;
