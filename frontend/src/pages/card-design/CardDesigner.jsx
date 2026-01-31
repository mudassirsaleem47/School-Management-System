import React, { useState, useRef, useEffect } from 'react';
import Draggable from 'react-draggable';
import axios from 'axios';
import { Upload, Save, X, Move, Plus, Image as ImageIcon, LayoutTemplate, Printer } from 'lucide-react';
import API_URL from '../../config/api';
import { useToast } from '../../context/ToastContext';
import ColorPicker from '../../components/ui/ColorPicker';

const DraggableElement = ({ element, isSelected, onSelect, onUpdate }) => {
    const nodeRef = useRef(null);
    return (
        <Draggable
            nodeRef={nodeRef}
            bounds="parent"
            defaultPosition={{ x: element.x, y: element.y }}
            onStop={(e, data) => onUpdate(element.id, { x: data.x, y: data.y })}
            onStart={() => onSelect(element.id)}
        >
            <div
                ref={nodeRef}
                className={`absolute cursor-move hover:outline-1 hover:outline-blue-400 ${isSelected ? 'outline-2 outline-blue-600 z-10' : 'z-0'}`}
                style={{
                    fontSize: `${element.fontSize}px`,
                    fontWeight: element.fontWeight,
                    color: element.color,
                    width: element.width,
                    height: element.height
                }}
            >
                {element.type === 'image' ? (
                    <div className="w-full h-full bg-gray-200 opacity-80 border border-dashed border-gray-400 flex items-center justify-center text-[10px] text-gray-500">
                        {element.label}
                    </div>
                ) : (
                    <span>{`{${element.label}}`}</span>
                )}
            </div>
        </Draggable>
    );
};

const CardDesigner = () => {
    const { showToast } = useToast();
    const user = JSON.parse(localStorage.getItem('currentUser'));
    const schoolId = user?.schoolName ? user._id : user?.school;

    // --- State ---
    const [templateName, setTemplateName] = useState('');
    const [cardType, setCardType] = useState('student');
    const [backgroundImage, setBackgroundImage] = useState(null); // Local preview URL
    const [backgroundFile, setBackgroundFile] = useState(null); // Actual file for upload
    const [elements, setElements] = useState([]); // { id, field, label, x, y, fontSize, color, ... }
    const [selectedElementId, setSelectedElementId] = useState(null);
    const [templates, setTemplates] = useState([]);
    const [view, setView] = useState('design'); // 'design' | 'list'
    const [saving, setSaving] = useState(false);

    // New State for Presets
    const [preset, setPreset] = useState('cr80'); // cr80, a4, custom, etc.
    const [orientation, setOrientation] = useState('horizontal'); // horizontal, vertical
    const [customWidth, setCustomWidth] = useState(350);
    const [customHeight, setCustomHeight] = useState(220);

    // --- Constants ---
    const CARD_PRESETS = {
        'cr80': { label: 'Standard ID (CR80)', width: 323, height: 204, unit: 'px', ratio: 1.58 }, // approx px @ 96dpi
        'a4': { label: 'A4 Paper', width: 794, height: 1123, unit: 'px', ratio: 0.707 },
        'letter': { label: 'Letter Paper', width: 816, height: 1056, unit: 'px', ratio: 0.77 },
        'square': { label: 'Square', width: 400, height: 400, unit: 'px', ratio: 1.0 },
        'custom': { label: 'Custom Size', width: 0, height: 0, unit: 'px', ratio: 0 }
    };

    const availableFields = {
        student: [
            { id: 'name', label: 'Student Name' },
            { id: 'rollNum', label: 'Roll Number' },
            { id: 'class', label: 'Class' },
            { id: 'section', label: 'Section' },
            { id: 'fatherName', label: 'Father Name' },
            { id: 'admissionId', label: 'Admission ID' },
            { id: 'dob', label: 'Date of Birth' },
            { id: 'phone', label: 'Phone' },
            { id: 'address', label: 'Address' },
            { id: 'photo', label: 'Student Photo', type: 'image' }
        ],
        staff: [
            { id: 'name', label: 'Staff Name' },
            { id: 'role', label: 'Role/Designation' },
            { id: 'email', label: 'Email' },
            { id: 'phone', label: 'Phone' },
            { id: 'joiningDate', label: 'Joining Date' },
            { id: 'photo', label: 'Staff Photo', type: 'image' }
        ],
        admit: [
            { id: 'name', label: 'Student Name' },
            { id: 'examGroup', label: 'Exam Group' },
            { id: 'rollNum', label: 'Roll Number' },
            { id: 'class', label: 'Class' },
            { id: 'examCenter', label: 'Exam Center' },
            { id: 'photo', label: 'Student Photo', type: 'image' }
        ]
    };

    // Calculate Editor Dimensions based on Preset & Orientation
    const getCanvasDimensions = () => {
        let w, h;
        if (preset === 'custom') {
            w = Number(customWidth);
            h = Number(customHeight);
        } else {
            const p = CARD_PRESETS[preset];
            w = p.width;
            h = p.height;
        }

        if (orientation === 'horizontal' && preset !== 'custom') { // Auto swap for presets only
            return { w: Math.max(w, h), h: Math.min(w, h) };
        } else if (orientation === 'vertical' && preset !== 'custom') {
            return { w: Math.min(w, h), h: Math.max(w, h) };
        }
        return { w, h };
    };

    const getCanvasStyle = () => {
        const { w, h } = getCanvasDimensions();

        // Scale to fit editor
        const MAX_DISPLAY = 450;
        const scale = Math.min(MAX_DISPLAY / w, MAX_DISPLAY / h, 1); // Don't scale up if small

        return {
            width: `${w * scale}px`,
            height: `${h * scale}px`,
            backgroundImage: backgroundImage ? `url(${backgroundImage})` : 'none',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            position: 'relative',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            transition: 'all 0.3s ease'
        };
    };

    // --- Effects ---
    useEffect(() => {
        fetchTemplates();
    }, []);

    // --- Actions ---
    const fetchTemplates = async () => {
        try {
            const res = await axios.get(`${API_URL}/CardTemplate/${schoolId}`);
            setTemplates(res.data);
        } catch (error) {
            console.error(error);
        }
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            setBackgroundImage(URL.createObjectURL(file));
            setBackgroundFile(file);
        }
    };

    const addElement = (field) => {
        const newElement = {
            id: Date.now(),
            field: field.id,
            label: field.label, // Display label
            type: field.type || 'text',
            x: 50,
            y: 50,
            fontSize: 14,
            fontWeight: 'normal',
            color: '#000000',
            width: field.type === 'image' ? 80 : undefined,
            height: field.type === 'image' ? 100 : undefined
        };
        setElements([...elements, newElement]);
        setSelectedElementId(newElement.id);
    };

    const updateElement = (id, updates) => {
        setElements(elements.map(el => el.id === id ? { ...el, ...updates } : el));
    };

    const removeElement = (id) => {
        setElements(elements.filter(el => el.id !== id));
        if (selectedElementId === id) setSelectedElementId(null);
    };

    const saveDetails = async () => {
        if (!templateName || !backgroundImage) {
            showToast('Please provide a name and background image', 'error');
            return;
        }

        setSaving(true);
        try {
            const formData = new FormData();
            formData.append('school', schoolId);
            formData.append('name', templateName);
            formData.append('cardType', cardType);
            
            const dims = getCanvasDimensions();
            // Send as JSON string to handle object structure
            formData.append('dimensions', JSON.stringify({ width: dims.w, height: dims.h }));
            formData.append('orientation', orientation);

            formData.append('elements', JSON.stringify(elements));

            if (backgroundFile) {
                formData.append('backgroundImage', backgroundFile);
            } else if (backgroundImage) {
                formData.append('backgroundImage', backgroundImage);
            }

            await axios.post(`${API_URL}/CardTemplate/save`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            showToast('Template Saved Successfully!', 'success');
            fetchTemplates();
            setView('list');
        } catch (error) {
            console.error(error);
            showToast('Failed to save template: ' + (error.response?.data?.message || error.message), 'error');
        } finally {
            setSaving(false);
        }
    };

    // --- Render Helpers ---
    const renderElementEditor = () => {
        const el = elements.find(e => e.id === selectedElementId);

        if (!el) {
            return (
                <div className="flex flex-col items-center justify-center h-full text-gray-400 p-6 text-center">
                    <Move className="w-12 h-12 mb-3 opacity-20" />
                    <p className="text-sm">Select an element on the canvas to edit its properties</p>
                </div>
            );
        }

        return (
            <div className="space-y-6 animate-fade-in">
                <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                    <h4 className="font-bold text-gray-800">{el.label}</h4>
                    <button
                        onClick={() => removeElement(el.id)}
                        className="text-red-500 hover:text-red-700 p-1.5 hover:bg-red-50 rounded-lg transition"
                        title="Delete Element"
                    >
                        <X size={16} />
                    </button>
                </div>
                
                {el.type === 'text' && (
                    <div className="space-y-4">
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Font Size</label>
                            <div className="flex items-center gap-3">
                                <input 
                                    type="range"
                                    min="8"
                                    max="48"
                                    value={el.fontSize}
                                    onChange={(e) => updateElement(el.id, { fontSize: parseInt(e.target.value) })}
                                    className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                                />
                                <span className="text-sm font-medium w-8 text-right">{el.fontSize}</span>
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <ColorPicker
                                label="Color"
                                value={el.color}
                                onChange={(color) => updateElement(el.id, { color })}
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Font Weight</label>
                            <div className="grid grid-cols-2 gap-2 bg-gray-50 p-1 rounded-lg border border-gray-200">
                                <button
                                    onClick={() => updateElement(el.id, { fontWeight: 'normal' })}
                                    className={`py-1.5 text-sm rounded ${el.fontWeight === 'normal' ? 'bg-white shadow text-gray-900 font-medium' : 'text-gray-500 hover:bg-gray-100'}`}
                                >
                                    Normal
                                </button>
                                <button
                                    onClick={() => updateElement(el.id, { fontWeight: 'bold' })}
                                    className={`py-1.5 text-sm rounded ${el.fontWeight === 'bold' ? 'bg-white shadow text-gray-900 font-bold' : 'text-gray-500 hover:bg-gray-100'}`}
                                >
                                    Bold
                                </button>
                            </div>
                        </div>
                    </div>
                )}
                
                {el.type === 'image' && (
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Width</label>
                                <input 
                                    type="number" 
                                    value={el.width} 
                                    onChange={(e) => updateElement(el.id, { width: parseInt(e.target.value) })}
                                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                                />
                             </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Height</label>
                                <input 
                                    type="number" 
                                    value={el.height} 
                                    onChange={(e) => updateElement(el.id, { height: parseInt(e.target.value) })}
                                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                                />
                             </div>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gray-50/50 flex flex-col h-screen overflow-hidden">

            {/* Header */}
            <div className="h-16 bg-white border-b border-gray-200 px-6 flex items-center justify-between shrink-0 z-20">
                <div className="flex items-center gap-4">
                    <div className="bg-indigo-600 p-2 rounded-lg">
                        <LayoutTemplate className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-gray-900">Card Designer</h1>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="bg-gray-100 rounded-lg p-1 flex">
                        <button 
                             onClick={() => setView('list')}
                            className={`px-4 py-1.5 rounded-md text-sm font-medium transition ${view === 'list' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            My Templates
                        </button>
                        <button 
                            onClick={() => { setView('design'); setBackgroundImage(null); setElements([]); setTemplateName(''); }}
                            className={`px-4 py-1.5 rounded-md text-sm font-medium transition ${view === 'design' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            Create New
                        </button>
                    </div>

                    {view === 'design' && (
                        <>
                            <div className="h-8 w-px bg-gray-200 mx-2"></div>
                            <button
                                onClick={saveDetails}
                                disabled={saving}
                                className="px-5 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 shadow-lg hover:shadow-indigo-500/30 transition flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
                                Save Template
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-hidden relative">
                {view === 'list' ? (
                    <div className="h-full overflow-y-auto p-8">
                        <div className="max-w-7xl mx-auto">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {/* Create New Card */}
                                <div
                                    onClick={() => { setView('design'); setBackgroundImage(null); setElements([]); }}
                                    className="bg-white rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center p-8 cursor-pointer hover:border-indigo-400 hover:bg-indigo-50/50 transition group h-64"
                                >
                                    <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                        <Plus className="w-8 h-8 text-indigo-500" />
                                    </div>
                                    <h3 className="font-bold text-gray-800">Create New</h3>
                                    <p className="text-sm text-gray-500 mt-1">Design from scratch</p>
                                </div>

                                {templates.map(t => (
                                    <div key={t._id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 group flex flex-col h-64">
                                        <div className="h-32 bg-gray-100 relative overflow-hidden">
                                            {t.backgroundImage ? (
                                                <img src={t.backgroundImage} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                    <ImageIcon className="w-8 h-8" />
                                                </div>
                                            )}
                                            <div className="absolute top-2 right-2 flex gap-1">
                                                <span className="bg-black/60 backdrop-blur-md text-white px-2 py-0.5 text-[10px] font-bold rounded uppercase tracking-wide border border-white/10">
                                                    {t.cardType}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="p-4 flex flex-col flex-1">
                                            <h3 className="font-bold text-gray-900 truncate" title={t.name}>{t.name}</h3>
                                            <div className="text-xs text-gray-500 mt-1 flex justify-between items-center">
                                                <span>{new Date(t.createdAt).toLocaleDateString()}</span>
                                                <span className="flex items-center gap-1"><LayoutTemplate size={10} /> {t.elements.length} items</span>
                                            </div>
                                            <div className="mt-auto pt-3 flex gap-2">
                                                <button className="flex-1 bg-indigo-50 text-indigo-700 text-sm font-semibold py-2 rounded-lg hover:bg-indigo-100 transition">Edit</button>
                                                <button className="flex-1 bg-gray-50 text-gray-700 text-sm font-semibold py-2 rounded-lg hover:bg-gray-100 transition">Print</button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {templates.length === 0 && (
                                <div className="text-center py-12">
                                    <p className="text-gray-400">No templates found besides 'Create New'</p>
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="flex h-full">

                            {/* 1. Left Sidebar - Config & Tools */}
                            <div className="w-80 bg-white border-r border-gray-200 flex flex-col shrink-0 z-10">
                                {/* Scrollable Area */}
                                <div className="flex-1 overflow-y-auto p-5 custom-scrollbar">

                                    <div className="mb-8">
                                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></div>
                                            Setup
                                        </h3>
                                        <div className="space-y-4">
                                            <div className="space-y-1.5">
                                                <label className="text-sm font-medium text-gray-700">Template Name</label>
                                                <input
                                                    type="text" 
                                                    placeholder="e.g. Standard ID Card"
                                                    value={templateName}
                                                    onChange={(e) => setTemplateName(e.target.value)}
                                                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                                                />
                                            </div>

                                            <div className="space-y-1.5">
                                                <label className="text-sm font-medium text-gray-700">Card Type</label>
                                                <div className="relative">
                                                    <select
                                                        value={cardType}
                                                        onChange={(e) => setCardType(e.target.value)}
                                                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm appearance-none focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition cursor-pointer"
                                                    >
                                                        <option value="student">Student ID Card</option>
                                                        <option value="staff">Staff ID Card</option>
                                                        <option value="admit">Admit Card</option>
                                                    </select>
                                                    <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                                                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Dimensions/Preset Selection */}
                                            <div className="space-y-1.5">
                                                <label className="text-sm font-medium text-gray-700">Dimensions</label>
                                                <div className="space-y-2">
                                                    <select
                                                        value={preset}
                                                        onChange={(e) => setPreset(e.target.value)}
                                                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm appearance-none focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition cursor-pointer"
                                                    >
                                                        {Object.entries(CARD_PRESETS).map(([key, val]) => (
                                                            <option key={key} value={key}>{val.label} {key !== 'custom' && `(${val.width} x ${val.height} ${val.unit})`}</option>
                                                        ))}
                                                    </select>

                                                    {preset === 'custom' && (
                                                        <div className="grid grid-cols-2 gap-2 animate-fade-in">
                                                            <div>
                                                                <label className="text-xs text-center block text-gray-500 mb-1">W (px)</label>
                                                                <input
                                                                    type="number"
                                                                    value={customWidth}
                                                                    onChange={(e) => setCustomWidth(parseInt(e.target.value) || 0)}
                                                                    className="w-full text-sm border p-1.5 rounded"
                                                                />
                                                            </div>
                                                            <div>
                                                                <label className="text-xs text-center block text-gray-500 mb-1">H (px)</label>
                                                                <input
                                                                    type="number"
                                                                    value={customHeight}
                                                                    onChange={(e) => setCustomHeight(parseInt(e.target.value) || 0)}
                                                                    className="w-full text-sm border p-1.5 rounded"
                                                                />
                                                            </div>
                                                        </div>
                                                    )}

                                                    <div className="grid grid-cols-2 gap-2 bg-gray-50 p-1 rounded-lg border border-gray-200">
                                                        <button
                                                            onClick={() => setOrientation('vertical')}
                                                            className={`flex items-center justify-center gap-1 py-1.5 text-xs rounded transition ${orientation === 'vertical' ? 'bg-white shadow text-indigo-600 font-bold' : 'text-gray-500 hover:bg-gray-100'}`}
                                                        >
                                                            <div className="w-3 h-4 border border-current rounded-sm"></div> Portrait
                                                        </button>
                                                        <button
                                                            onClick={() => setOrientation('horizontal')}
                                                            className={`flex items-center justify-center gap-1 py-1.5 text-xs rounded transition ${orientation === 'horizontal' ? 'bg-white shadow text-indigo-600 font-bold' : 'text-gray-500 hover:bg-gray-100'}`}
                                                        >
                                                            <div className="w-4 h-3 border border-current rounded-sm"></div> Landscape
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="space-y-1.5">
                                                <label className="text-sm font-medium text-gray-700">Background</label>
                                                <div className="relative group cursor-pointer">
                                                    <input type="file" onChange={handleImageUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" accept="image/*" />
                                                    <div className="w-full h-32 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center bg-gray-50 group-hover:bg-indigo-50 group-hover:border-indigo-400 transition-all overflow-hidden relative">
                                                        {backgroundImage ? (
                                                            <>
                                                                <img src={backgroundImage} className="w-full h-full object-cover" />
                                                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                                    <span className="text-white text-xs font-bold flex items-center gap-1"><Upload size={12} /> Change</span>
                                                                </div>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <div className="w-10 h-10 bg-white rounded-full shadow-sm flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                                                                    <Upload className="w-5 h-5 text-gray-400 group-hover:text-indigo-500" />
                                                                </div>
                                                                <span className="text-xs text-gray-500 font-medium group-hover:text-indigo-600">Upload Image</span>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="border-t border-gray-100 pt-6">
                                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                                            Add Elements
                                        </h3>
                                        <div className="grid grid-cols-2 gap-2">
                                            {availableFields[cardType].map(field => (
                                                <button
                                                    key={field.id}
                                                    onClick={() => addElement(field)}
                                                    className="flex flex-col items-center justify-center p-3 bg-white border border-gray-200 rounded-lg hover:border-indigo-500 hover:shadow-md hover:-translate-y-0.5 transition-all group"
                                                >
                                                    <span className="text-xs font-medium text-gray-600 text-center group-hover:text-indigo-600">{field.label}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                </div>
                            </div>

                            {/* 2. Center - Canvas */}
                            <div className="flex-1 bg-gray-100 relative overflow-hidden flex flex-col">
                                {/* Toolbar/Ruler placeholder could go here */}
                                <div className="absolute top-4 left-4 z-10 bg-white/80 backdrop-blur px-3 py-1.5 rounded-full text-xs font-mono text-gray-500 border border-gray-200 shadow-sm">
                                    {elements.length} Elements
                                </div>

                                <div className="flex-1 flex items-center justify-center p-10 overflow-auto">
                                    <div 
                                        className="relative bg-white shadow-2xl transition-all duration-300 ring-1 ring-gray-900/5"
                                        onClick={() => setSelectedElementId(null)}
                                        style={{
                                            width: '450px', 
                                            height: '280px',
                                            backgroundImage: backgroundImage ? `url(${backgroundImage})` : 'none',
                                            backgroundSize: 'cover',
                                            backgroundPosition: 'center'
                                        }}
                                    >
                                        {!backgroundImage && (
                                            <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-300 pointer-events-none">
                                                <ImageIcon className="w-16 h-16 mb-2 opacity-20" />
                                                <span className="text-sm font-medium">Card Preview Area</span>
                                            </div>
                                        )}

                                        {elements.map(el => (
                                            <DraggableElement
                                                key={el.id} 
                                                element={el}
                                                isSelected={selectedElementId === el.id}
                                                onSelect={setSelectedElementId}
                                                onUpdate={updateElement}
                                            />
                                        ))}
                                    </div>
                                </div>
                        </div>

                            {/* 3. Right Sidebar - Properties */}
                            <div className="w-72 bg-white border-l border-gray-200 flex flex-col shrink-0 z-10 transition-all duration-300">
                                <div className="p-5 border-b border-gray-100 bg-gray-50/50">
                                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 bg-orange-500 rounded-full"></div>
                                        Properties
                                    </h3>
                                </div>
                                <div className="p-5 flex-1 overflow-y-auto">
                                    {renderElementEditor()}
                                </div>
                        </div>

                    </div>
                )}
            </div>
        </div>
    );
};

export default CardDesigner;
