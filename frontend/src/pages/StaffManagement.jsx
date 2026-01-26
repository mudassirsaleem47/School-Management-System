import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useNavigate } from 'react-router-dom';
import API_URL from '../config/api.js';
import { Users, Plus, Edit, Trash2, UserCheck, UserX, Building2, Briefcase, Mail, Phone, Check } from 'lucide-react';
import StaffModal from '../components/form-popup/StaffModal';


const StaffManagement = () => {
    const { currentUser } = useAuth();
    const { showToast } = useToast();
    const navigate = useNavigate();
    const [staff, setStaff] = useState([]);
    const [designations, setDesignations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [selectedStaff, setSelectedStaff] = useState(null);
    const [selectedDeleteId, setSelectedDeleteId] = useState(null);
    const [activeTab, setActiveTab] = useState('all');

    // Fetch staff and designations
    useEffect(() => {
        if (currentUser && currentUser._id) {
            fetchStaff();
            fetchDesignations();
        }
    }, [currentUser]);

    const fetchStaff = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${API_URL}/Staff/${currentUser._id}`);
            if (response.data.success) {
                setStaff(response.data.staff);
            }
        } catch (error) {
            console.error('Error fetching staff:', error);
            showToast('Failed to load staff', 'error');
        } finally {
            setLoading(false);
        }
    };

    const fetchDesignations = async () => {
        try {
            const response = await axios.get(`${API_URL}/Designations/${currentUser._id}`);
            if (response.data.success) {
                setDesignations(response.data.designations.filter(d => d.isActive === 'active'));
            }
        } catch (error) {
            console.error('Error fetching designations:', error);
        }
    };

    const handleAddStaff = () => {
        setSelectedStaff(null);
        setShowModal(true);
    };

    const handleEditStaff = (staffMember) => {
        setSelectedStaff(staffMember);
        setShowModal(true);
    };

    const handleDeleteClick = (id) => {
        if (selectedDeleteId === id) {
            handleDeleteConfirm();
        } else {
            setSelectedDeleteId(id);
            setTimeout(() => {
                setSelectedDeleteId(prev => prev === id ? null : prev);
            }, 3000);
        }
    };

    const handleDeleteConfirm = async () => {
        if (!selectedDeleteId) return;
        try {
            const response = await axios.delete(`${API_URL}/Staff/${selectedDeleteId}`);
            if (response.data.success) {
                showToast('Staff member deleted successfully', 'success');
                fetchStaff();
            }
        } catch (error) {
            const errorMsg = error.response?.data?.message || 'Failed to delete staff member';
            showToast(errorMsg, 'error');
        } finally {
            setSelectedDeleteId(null);
        }
    };

    const handleModalClose = (refresh = false) => {
        setShowModal(false);
        setSelectedStaff(null);
        if (refresh) {
            fetchStaff();
        }
    };

    // Calculate stats
    const totalStaff = staff.length;
    const activeStaff = staff.filter(s => s.status === 'active').length;
    const inactiveStaff = staff.filter(s => s.status === 'inactive').length;

    // Filter staff based on active tab
    const filteredStaff = activeTab === 'all'
        ? staff
        : staff.filter(s => s.designation?._id === activeTab);

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="mx-auto">
                {/* Header with Add Designation Button */}
                <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                                <Users className="w-8 h-8 text-indigo-600" />
                                Staff Management
                            </h1>
                            <p className="text-gray-600 mt-1">Manage your staff members and designations</p>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => navigate('/admin/designations')}
                                className="px-4 py-2 bg-white border-2 border-indigo-600 text-indigo-600 rounded-lg hover:bg-indigo-50 transition flex items-center gap-2"
                            >
                                <Briefcase className="w-5 h-5" />
                                Add Designation
                            </button>
                            <button
                                onClick={handleAddStaff}
                                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition flex items-center gap-2"
                            >
                                <Plus className="w-5 h-5" />
                                Add Staff
                            </button>
                        </div>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-500 text-blue-600">Total Staff</p>
                                    <p className="text-3xl font-bold text-blue-700 mt-1">{totalStaff}</p>
                                </div>
                                <Users className="w-12 h-12 text-blue-400" />
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-500 text-green-600">Active Staff</p>
                                    <p className="text-3xl font-bold text-green-700 mt-1">{activeStaff}</p>
                                </div>
                                <UserCheck className="w-12 h-12 text-green-400" />
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-4 border border-red-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-500 text-red-600">Inactive Staff</p>
                                    <p className="text-3xl font-bold text-red-700 mt-1">{inactiveStaff}</p>
                                </div>
                                <UserX className="w-12 h-12 text-red-400" />
                            </div>
                        </div>
                    </div>

                    {/* Designation Tabs */}
                    <div className="mt-6">
                        <div className="flex gap-2 overflow-x-auto">
                            <button
                                onClick={() => setActiveTab('all')}
                                className={`px-5 py-2.5 rounded-lg font-medium transition whitespace-nowrap ${activeTab === 'all'
                                    ? 'bg-indigo-600 text-white shadow-md'
                                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                                    }`}
                            >
                                All Staff ({totalStaff})
                            </button>
                            {designations.map(designation => {
                                const count = staff.filter(s => s.designation?._id === designation._id).length;
                                return (
                                    <button
                                        key={designation._id}
                                        onClick={() => setActiveTab(designation._id)}
                                        className={`px-5 py-2.5 rounded-lg font-medium transition whitespace-nowrap flex items-center gap-2 ${activeTab === designation._id
                                            ? 'bg-indigo-600 text-white shadow-md'
                                            : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                                            }`}
                                    >
                                        <Briefcase className="w-4 h-4" />
                                        {designation.name} ({count})
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Staff Table */}
                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                    </div>
                ) : filteredStaff.length === 0 ? (
                    <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                        <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-xl font-600 text-gray-900 mb-2">No Staff Members Found</h3>
                            <p className="text-gray-600 mb-4">
                                {activeTab === 'all'
                                    ? 'Start by adding your first staff member'
                                    : 'No staff members found for this designation'}
                            </p>
                            {activeTab === 'all' && (
                                <button
                                    onClick={handleAddStaff}
                                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                                >
                                    Add Staff
                                </button>
                            )}
                    </div>
                ) : (
                            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-gray-50 border-b border-gray-200">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-600 text-gray-700 uppercase tracking-wider">
                                                    Staff Member
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-600 text-gray-700 uppercase tracking-wider">
                                                    Designation
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-600 text-gray-700 uppercase tracking-wider">
                                                    Contact
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-600 text-gray-700 uppercase tracking-wider">
                                                    Campus
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-600 text-gray-700 uppercase tracking-wider">
                                                    Status
                                                </th>
                                                <th className="px-6 py-3 text-right text-xs font-600 text-gray-700 uppercase tracking-wider">
                                                    Actions
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {filteredStaff.map((staffMember) => (
                                                <tr key={staffMember._id} className="hover:bg-gray-50 transition">
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex items-center">
                                                            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
                                                                {staffMember.name.charAt(0).toUpperCase()}
                                                            </div>
                                                    <div className="ml-4">
                                                        <div className="text-sm font-600 text-gray-900">{staffMember.name}</div>
                                                        <div className="text-sm text-gray-500 flex items-center gap-1">
                                                            <Mail className="w-3 h-3" />
                                                            {staffMember.email}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {staffMember.designation ? (
                                                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-600 bg-indigo-100 text-indigo-700">
                                                        <Briefcase className="w-3 h-3" />
                                                        {staffMember.designation.name}
                                                    </span>
                                                ) : (
                                                    <span className="text-sm text-gray-400">Not assigned</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {staffMember.phone ? (
                                                    <div className="text-sm text-gray-900 flex items-center gap-1">
                                                        <Phone className="w-3 h-3 text-gray-400" />
                                                        {staffMember.phone}
                                                    </div>
                                                ) : (
                                                    <span className="text-sm text-gray-400">N/A</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {staffMember.campus ? (
                                                    <div className="text-sm text-gray-900 flex items-center gap-1">
                                                        <Building2 className="w-3 h-3 text-gray-400" />
                                                        {staffMember.campus.campusName}
                                                    </div>
                                                ) : (
                                                    <span className="text-sm text-gray-400">N/A</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {staffMember.status === 'active' ? (
                                                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-600 bg-green-100 text-green-700">
                                                        <UserCheck className="w-3 h-3" />
                                                        Active
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-600 bg-red-100 text-red-700">
                                                        <UserX className="w-3 h-3" />
                                                        Inactive
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-500">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => handleEditStaff(staffMember)}
                                                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                                        title="Edit"
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                                onClick={() => handleDeleteClick(staffMember._id)}
                                                                className={`p-2 rounded-lg transition inline-flex items-center justify-center h-9 w-9 ${selectedDeleteId === staffMember._id
                                                                    ? "bg-red-600 text-white hover:bg-red-700"
                                                                    : "text-red-600 hover:bg-red-50"
                                                                    }`}
                                                        title="Delete"
                                                    >
                                                                {selectedDeleteId === staffMember._id ? <Check className="w-4 h-4" /> : <Trash2 className="w-4 h-4" />}
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
            </div>

            {/* Staff Modal */}
            {showModal && (
                <StaffModal
                    staff={selectedStaff}
                    onClose={handleModalClose}
                />
            )}


        </div>
    );
};

export default StaffManagement;