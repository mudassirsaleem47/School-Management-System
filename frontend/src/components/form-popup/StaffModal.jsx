import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { useCampus } from '../../context/CampusContext';
import { useToast } from '../../context/ToastContext';
import { useModalAnimation } from '../../hooks/useModalAnimation';
import API_URL from '../../config/api.js';
import { X, User, Mail, Phone, GraduationCap, Building2, Calendar, Briefcase } from 'lucide-react';

const StaffModal = ({ staff, onClose }) => {
    const { currentUser } = useAuth();
    const { campuses } = useCampus();
    const { showToast } = useToast();
    const [loading, setLoading] = useState(false);
    const [designations, setDesignations] = useState([]);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        phone: '',
        designation: '',
        campus: '',
        salary: '',
        joiningDate: new Date().toISOString().split('T')[0],
        status: 'active'
    });

    const isOpen = true;
    const { isVisible, isClosing, handleClose } = useModalAnimation(isOpen, () => onClose(false));

    // Fetch designations
    useEffect(() => {
        if (currentUser && currentUser._id) {
            fetchDesignations();
        }
    }, [currentUser]);

    const fetchDesignations = async () => {
        try {
            const response = await axios.get(`${API_URL}/Designations/${currentUser._id}`);
            if (response.data.success) {
                setDesignations(response.data.designations.filter(d => d.isActive === 'active'));
            }
        } catch (error) {
            console.error('Error fetching designations:', error);
            showToast('Failed to load designations', 'error');
        }
    };

    useEffect(() => {
        if (staff) {
            // Edit mode
            setFormData({
                name: staff.name || '',
                email: staff.email || '',
                password: '', // Don't populate password
                phone: staff.phone || '',
                designation: staff.designation?._id || '',
                campus: staff.campus?._id || '',
                salary: staff.salary || '',
                joiningDate: staff.joiningDate ? staff.joiningDate.split('T')[0] : new Date().toISOString().split('T')[0],
                status: staff.status || 'active'
            });
        }
    }, [staff]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.name || !formData.email || (!staff && !formData.password) || !formData.designation) {
            showToast('Please fill all required fields', 'error');
            return;
        }

        try {
            setLoading(true);
            const payload = {
                ...formData,
                school: currentUser._id
            };

            // Remove empty fields
            Object.keys(payload).forEach(key => {
                if (!payload[key]) delete payload[key];
            });

            if (staff) {
                // Update
                delete payload.password; // Don't update password through this form
                const response = await axios.put(`${API_URL}/Staff/${staff._id}`, payload);
                if (response.data.success) {
                    showToast('Staff updated successfully', 'success');
                    onClose(true);
                }
            } else {
                // Create
                const response = await axios.post(`${API_URL}/Staff`, payload);
                if (response.data.success) {
                    showToast('Staff added successfully', 'success');
                    onClose(true);
                }
            }
        } catch (error) {
            const errorMsg = error.response?.data?.message || 'Failed to save staff member';
            showToast(errorMsg, 'error');
        } finally {
            setLoading(false);
        }
    };

    if (!isVisible) return null;

    const getDesignationIcon = () => {
        return <Briefcase className="w-6 h-6 text-indigo-600" />;
    };

    return createPortal(
        <div className={`fixed inset-0 z-9999 overflow-y-auto bg-black/70 ${isClosing ? 'animate-fade-out' : 'animate-fade-in'}`}>
            <div className="flex min-h-full items-center justify-center p-4">
                <div className={`bg-white rounded-2xl shadow-2xl w-full max-w-3xl relative ${isClosing ? 'animate-scale-down' : 'animate-scale-up'}`}>
                    
                    {/* Header */}
                    <div className="p-7 rounded-t-2xl flex justify-between items-start gap-4">
                        <div className="flex-1">
                            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-2">
                                {getDesignationIcon()}
                                {staff ? 'Edit Staff Member' : 'Add Staff Member'}
                            </h2>
                            <p className="text-gray-600 text-sm mt-2">
                                {staff ? 'Update staff member details below' : 'Fill in the details to add a new staff member'}
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
                            
                            {/* Row 1: Name, Email */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-sm font-600 text-gray-700 mb-2">
                                        Full Name <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            placeholder="Enter full name"
                                            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-600 text-gray-700 mb-2">
                                        Email <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            placeholder="email@example.com"
                                            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Row 2: Password, Phone */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                {!staff && (
                                    <div>
                                        <label className="block text-sm font-600 text-gray-700 mb-2">
                                            Password <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="password"
                                            name="password"
                                            value={formData.password}
                                            onChange={handleChange}
                                            placeholder="Enter password"
                                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                                            required={!staff}
                                        />
                                    </div>
                                )}

                                <div>
                                    <label className="block text-sm font-600 text-gray-700 mb-2">
                                        Phone Number
                                    </label>
                                    <div className="relative">
                                        <Phone className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                                        <input
                                            type="tel"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleChange}
                                            placeholder="+92 300 1234567"
                                            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Row 3: Designation, Campus */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-sm font-600 text-gray-700 mb-2">
                                        Designation <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <Briefcase className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                                        <select
                                            name="designation"
                                            value={formData.designation}
                                            onChange={handleChange}
                                            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                                            required
                                        >
                                            <option value="">Select designation</option>
                                            {designations.map(designation => (
                                                <option key={designation._id} value={designation._id}>
                                                    {designation.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-600 text-gray-700 mb-2">
                                        Campus
                                    </label>
                                    <div className="relative">
                                        <Building2 className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                                        <select
                                            name="campus"
                                            value={formData.campus}
                                            onChange={handleChange}
                                            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                                        >
                                            <option value="">No campus assigned</option>
                                            {campuses.map(campus => (
                                                <option key={campus._id} value={campus._id}>
                                                    {campus.campusName}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Row 4: Salary, Joining Date, Status */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                                <div>
                                    <label className="block text-sm font-600 text-gray-700 mb-2">
                                        Salary
                                    </label>
                                    <input
                                        type="number"
                                        name="salary"
                                        value={formData.salary}
                                        onChange={handleChange}
                                        placeholder="0"
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                                        min="0"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-600 text-gray-700 mb-2">
                                        Joining Date
                                    </label>
                                    <div className="relative">
                                        <Calendar className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                                        <input
                                            type="date"
                                            name="joiningDate"
                                            value={formData.joiningDate}
                                            onChange={handleChange}
                                            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                                        />
                                    </div>
                                </div>

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
                                        <option value="active">Active</option>
                                        <option value="inactive">Inactive</option>
                                    </select>
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
                                {loading ? 'Saving...' : (staff ? 'Update Staff' : 'Add Staff')}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default StaffModal;
