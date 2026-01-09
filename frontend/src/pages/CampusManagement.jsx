import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import API_URL from '../config/api.js';
import { Building2, Plus, Edit, Trash2, MapPin, Phone, Mail, Users, TrendingUp, CheckCircle2, XCircle } from 'lucide-react';
import CampusModal from '../components/form-popup/CampusModal';
import ConfirmationModal from '../components/ConfirmationModal';

const CampusManagement = () => {
    const { currentUser } = useAuth();
    const { showToast } = useToast();
    const [campuses, setCampuses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [selectedCampus, setSelectedCampus] = useState(null);
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [campusToDelete, setCampusToDelete] = useState(null);
    const [campusStats, setCampusStats] = useState({});

    // Fetch campuses
    useEffect(() => {
        if (currentUser && currentUser._id) {
            fetchCampuses();
        }
    }, [currentUser]);

    const fetchCampuses = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${API_URL}/Campuses/${currentUser._id}`);
            if (response.data.success) {
                setCampuses(response.data.campuses);
                // Fetch stats for each campus
                response.data.campuses.forEach(campus => {
                    fetchCampusStats(campus._id);
                });
            }
        } catch (error) {
            console.error('Error fetching campuses:', error);
            showToast('Failed to load campuses', 'error');
        } finally {
            setLoading(false);
        }
    };

    const fetchCampusStats = async (campusId) => {
        try {
            const response = await axios.get(`${API_URL}/CampusStats/${campusId}`);
            if (response.data.success) {
                setCampusStats(prev => ({
                    ...prev,
                    [campusId]: response.data.stats
                }));
            }
        } catch (error) {
            console.error('Error fetching campus stats:', error);
        }
    };

    const handleAddCampus = () => {
        setSelectedCampus(null);
        setShowModal(true);
    };

    const handleEditCampus = (campus) => {
        setSelectedCampus(campus);
        setShowModal(true);
    };

    const handleDeleteClick = (campus) => {
        setCampusToDelete(campus);
        setShowConfirmation(true);
    };

    const handleDeleteConfirm = async () => {
        try {
            const response = await axios.delete(`${API_URL}/Campus/${campusToDelete._id}`);
            if (response.data.success) {
                showToast('Campus deleted successfully', 'success');
                fetchCampuses();
            }
        } catch (error) {
            const errorMsg = error.response?.data?.message || 'Failed to delete campus';
            showToast(errorMsg, 'error');
        } finally {
            setShowConfirmation(false);
            setCampusToDelete(null);
        }
    };

    const handleModalClose = (refresh = false) => {
        setShowModal(false);
        setSelectedCampus(null);
        if (refresh) {
            fetchCampuses();
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="mx-auto">
                {/* Header */}
                <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                                <Building2 className="w-8 h-8 text-indigo-600" />
                                Campus Management
                            </h1>
                            <p className="text-gray-600 mt-1">Manage your school's campuses and branches</p>
                        </div>
                        <button
                            onClick={handleAddCampus}
                            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition flex items-center gap-2"
                        >
                            <Plus className="w-5 h-5" />
                            Add Campus
                        </button>
                    </div>
                </div>

                {/* Campuses Grid */}
                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                    </div>
                ) : campuses.length === 0 ? (
                    <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                        <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-xl font-600 text-gray-900 mb-2">No Campuses Found</h3>
                        <p className="text-gray-600 mb-4">Start by adding your first campus</p>
                        <button
                            onClick={handleAddCampus}
                            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                        >
                            Add Campus
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {campuses.map(campus => {
                            const stats = campusStats[campus._id] || {};
                            return (
                                <div key={campus._id} className="bg-white rounded-lg shadow-sm hover:shadow-md transition">
                                    {/* Campus Header */}
                                    <div className={`p-4 rounded-t-lg ${campus.isMain ? 'bg-linear-to-r from-indigo-600 to-indigo-700' : 'bg-gray-100'}`}>
                                        <div className="flex justify-between items-start">
                                            <div className="flex-1">
                                                <h3 className={`text-lg font-bold ${campus.isMain ? 'text-white' : 'text-gray-900'}`}>
                                                    {campus.campusName}
                                                </h3>
                                                <p className={`text-sm ${campus.isMain ? 'text-indigo-100' : 'text-gray-600'}`}>
                                                    {campus.campusCode}
                                                </p>
                                            </div>
                                            {campus.isMain && (
                                                <span className="px-2 py-1 bg-yellow-400 text-yellow-900 text-xs font-600 rounded-full">
                                                    Main
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Campus Details */}
                                    <div className="p-4 space-y-3">
                                        {campus.address && (
                                            <div className="flex items-start gap-2 text-sm">
                                                <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                                                <span className="text-gray-700">{campus.address}{campus.city && `, ${campus.city}`}</span>
                                            </div>
                                        )}
                                        {campus.phoneNumber && (
                                            <div className="flex items-center gap-2 text-sm">
                                                <Phone className="w-4 h-4 text-gray-400" />
                                                <span className="text-gray-700">{campus.phoneNumber}</span>
                                            </div>
                                        )}
                                        {campus.email && (
                                            <div className="flex items-center gap-2 text-sm">
                                                <Mail className="w-4 h-4 text-gray-400" />
                                                <span className="text-gray-700">{campus.email}</span>
                                            </div>
                                        )}

                                        {/* Stats */}
                                        {stats && (
                                            <div className="pt-3 border-t border-gray-200 grid grid-cols-3 gap-2">
                                                <div className="text-center">
                                                    <div className="text-xs text-gray-500">Students</div>
                                                    <div className="text-lg font-bold text-indigo-600">{stats.totalStudents || 0}</div>
                                                </div>
                                                <div className="text-center">
                                                    <div className="text-xs text-gray-500">Teachers</div>
                                                    <div className="text-lg font-bold text-green-600">{stats.totalTeachers || 0}</div>
                                                </div>
                                                <div className="text-center">
                                                    <div className="text-xs text-gray-500">Classes</div>
                                                    <div className="text-lg font-bold text-purple-600">{stats.totalClasses || 0}</div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Status */}
                                        <div className="flex items-center justify-between pt-2">
                                            <span className={`flex items-center gap-1 text-sm ${campus.status === 'Active' ? 'text-green-600' : 'text-red-600'}`}>
                                                {campus.status === 'Active' ? (
                                                    <CheckCircle2 className="w-4 h-4" />
                                                ) : (
                                                    <XCircle className="w-4 h-4" />
                                                )}
                                                {campus.status}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="p-4 border-t border-gray-200 flex gap-2">
                                        <button
                                            onClick={() => handleEditCampus(campus)}
                                            className="flex-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition flex items-center justify-center gap-2"
                                        >
                                            <Edit className="w-4 h-4" />
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDeleteClick(campus)}
                                            className="flex-1 px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition flex items-center justify-center gap-2"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Campus Modal */}
            {showModal && (
                <CampusModal
                    campus={selectedCampus}
                    onClose={handleModalClose}
                />
            )}

            {/* Confirmation Modal */}
            {showConfirmation && (
                <ConfirmationModal
                    isOpen={showConfirmation}
                    onClose={() => setShowConfirmation(false)}
                    onConfirm={handleDeleteConfirm}
                    title="Delete Campus"
                    message={`Are you sure you want to delete ${campusToDelete?.campusName}? This action cannot be undone.`}
                />
            )}
        </div>
    );
};

export default CampusManagement;
