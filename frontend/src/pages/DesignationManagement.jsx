import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import API_URL from '../config/api.js';
import { Briefcase, Plus, Edit, Trash2, CheckCircle, XCircle, GripVertical, Search } from 'lucide-react';
import DesignationModal from '../components/form-popup/DesignationModal';

import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    useSortable,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// Sortable Card Component
const SortableCard = ({ designation, onEdit, onDelete, selectedDeleteId }) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: designation._id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className="bg-white rounded-lg shadow-sm hover:shadow-md transition p-5"
        >
            <div className="flex items-center gap-4">
                {/* Drag Handle */}
                <div
                    {...attributes}
                    {...listeners}
                    className="cursor-grab active:cursor-grabbing p-2 hover:bg-gray-100 rounded-lg transition flex-shrink-0"
                >
                    <GripVertical className="w-5 h-5 text-gray-400" />
                </div>

                {/* Icon */}
                <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                    <Briefcase className="w-6 h-6 text-indigo-600" />
                </div>

                {/* Name and Status */}
                <div className="flex-shrink-0 min-w-[150px]">
                    <h3 className="font-bold text-gray-900 text-base">{designation.name}</h3>
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-600 mt-1 ${designation.isActive === 'active'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                        }`}>
                        {designation.isActive === 'active' ? (
                            <>
                                <CheckCircle className="w-3 h-3" />
                                Active
                            </>
                        ) : (
                            <>
                                <XCircle className="w-3 h-3" />
                                Inactive
                            </>
                        )}
                    </span>
                </div>

                {/* Description */}
                <div className="flex-1 min-w-0">
                    {designation.description ? (
                        <p className="text-sm text-gray-600 truncate">{designation.description}</p>
                    ) : (
                        <p className="text-sm text-gray-400 italic">No description provided</p>
                    )}
                </div>

                {/* Actions */}
                <div className="flex gap-2 flex-shrink-0">
                    <button
                        onClick={() => onEdit(designation)}
                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition flex items-center gap-2"
                    >
                        <Edit className="w-4 h-4" />
                        Edit
                    </button>
                    <button
                        onClick={() => onDelete(designation._id)}
                        className={`px-4 py-2 rounded-lg transition flex items-center gap-2 ${selectedDeleteId === designation._id
                            ? "bg-red-600 text-white hover:bg-red-700 font-bold"
                            : "bg-red-50 text-red-600 hover:bg-red-100"
                            }`}
                    >
                        {selectedDeleteId === designation._id ? (
                            <span>Sure?</span>
                        ) : (
                            <>
                                    <Trash2 className="w-4 h-4" />
                                    Delete
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

const DesignationManagement = () => {
    const { currentUser } = useAuth();
    const { showToast } = useToast();
    const [designations, setDesignations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [selectedDesignation, setSelectedDesignation] = useState(null);
    const [selectedDeleteId, setSelectedDeleteId] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');

    // Drag and Drop sensors
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    // Fetch designations
    useEffect(() => {
        if (currentUser && currentUser._id) {
            fetchDesignations();
        }
    }, [currentUser]);

    const fetchDesignations = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${API_URL}/Designations/${currentUser._id}`);
            if (response.data.success) {
                setDesignations(response.data.designations);
            }
        } catch (error) {
            console.error('Error fetching designations:', error);
            showToast('Failed to load designations', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleAddDesignation = () => {
        setSelectedDesignation(null);
        setShowModal(true);
    };

    const handleEditDesignation = (designation) => {
        setSelectedDesignation(designation);
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
            const response = await axios.delete(`${API_URL}/Designation/${selectedDeleteId}`);
            if (response.data.success) {
                showToast('Designation deleted successfully', 'success');
                fetchDesignations();
            }
        } catch (error) {
            const errorMsg = error.response?.data?.message || 'Failed to delete designation';
            showToast(errorMsg, 'error');
        } finally {
            setSelectedDeleteId(null);
        }
    };

    const handleModalClose = (refresh = false) => {
        setShowModal(false);
        setSelectedDesignation(null);
        if (refresh) {
            fetchDesignations();
        }
    };

    const handleDragEnd = (event) => {
        const { active, over } = event;

        if (active.id !== over.id) {
            setDesignations((items) => {
                const oldIndex = items.findIndex((item) => item._id === active.id);
                const newIndex = items.findIndex((item) => item._id === over.id);
                return arrayMove(items, oldIndex, newIndex);
            });
        }
    };

    // Filter designations based on search query
    const filteredDesignations = designations.filter(designation => {
        if (!searchQuery) return true;
        const query = searchQuery.toLowerCase();
        return (
            designation.name.toLowerCase().includes(query) ||
            (designation.description && designation.description.toLowerCase().includes(query))
        );
    });

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="mx-auto">
                {/* Header */}
                <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                    <div className="flex justify-between items-center mb-4">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                                <Briefcase className="w-8 h-8 text-indigo-600" />
                                Designation Management
                            </h1>
                            <p className="text-gray-600 mt-1">Manage staff designations and roles</p>
                        </div>
                        <button
                            onClick={handleAddDesignation}
                            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition flex items-center gap-2"
                        >
                            <Plus className="w-5 h-5" />
                            Add Designation
                        </button>
                    </div>

                    {/* Search Bar */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search designations by name or description..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 border-2 border-indigo-200 rounded-lg focus:outline-none focus:border-indigo-500 transition"
                        />
                    </div>
                </div>

                {/* Designations List */}
                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                    </div>
                ) : filteredDesignations.length === 0 ? (
                    <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                        <Briefcase className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-xl font-600 text-gray-900 mb-2">
                                {searchQuery ? 'No Matching Designations' : 'No Designations Found'}
                            </h3>
                            <p className="text-gray-600 mb-4">
                                {searchQuery
                                    ? `No designations match "${searchQuery}". Try a different search term.`
                                    : 'Start by adding your first designation'}
                            </p>
                            {!searchQuery && (
                                <button
                                    onClick={handleAddDesignation}
                                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                                >
                                    Add Designation
                                </button>
                            )}
                        </div>
                    ) : (
                            <DndContext
                                sensors={sensors}
                                collisionDetection={closestCenter}
                                onDragEnd={handleDragEnd}
                            >
                                <SortableContext
                                    items={filteredDesignations.map(d => d._id)}
                                    strategy={verticalListSortingStrategy}
                                >
                                    <div className="flex flex-col gap-4">
                                        {filteredDesignations.map(designation => (
                                            <SortableCard
                                                key={designation._id}
                                                designation={designation}
                                                onEdit={handleEditDesignation}
                                                onDelete={handleDeleteClick}
                                                selectedDeleteId={selectedDeleteId}
                                            />
                                        ))}
                                    </div>
                                </SortableContext>
                            </DndContext>
                )}
            </div>

            {/* Designation Modal */}
            {showModal && (
                <DesignationModal
                    designation={selectedDesignation}
                    onClose={handleModalClose}
                />
            )}


        </div>
    );
};

export default DesignationManagement;
