import React, { useState, useRef, useEffect } from 'react';
import { formatDateTime } from '../../utils/formatDateTime';
import Draggable from 'react-draggable';
import axios from 'axios';
import {
    Maximize2, Minimize2, Upload, Save, X,
    Plus, Image as ImageIcon, LayoutTemplate, Printer,
    Trash2, Edit, Type, Grid3X3,
    Settings2, Palette, Layers, MousePointer2,
    Undo2, Loader2, Search, ArrowRight, MoreHorizontal, Copy, Check, AlertCircle,
    ZoomIn, ZoomOut, RotateCcw
} from 'lucide-react';
import API_URL from '../../config/api';
import { useToast } from '../../context/ToastContext';
import ColorPicker from '../../components/ui/ColorPicker';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

// --- Draggable Element Component ---
const DraggableElement = ({ element, isSelected, onSelect, onUpdate, scale }) => {
    const nodeRef = useRef(null);
    return (
        <Draggable
            nodeRef={nodeRef}
            bounds="parent"
            scale={scale}
            position={{ x: element.x, y: element.y }}
            onStop={(e, data) => onUpdate(element.id, { x: data.x, y: data.y })}
        >
            <div
                ref={nodeRef}
                onClick={(e) => {
                    e.stopPropagation();
                    onSelect(element.id);
                }}
                className={`absolute cursor-move group ${isSelected ? 'z-50' : 'z-10'}`}
                style={{
                    width: element.width,
                    height: element.height
                }}
            >
                {/* Visual Feedback on Hover/Selection */}
                <div className={`absolute inset-0 transition-all duration-200 pointer-events-none ${isSelected
                    ? 'border-[1.5px] border-primary ring-primary/10 z-50'
                    : 'border border-dashed border-gray-400/50 group-hover:border-primary/40'
                    }`} />

                {/* Content Rendering */}
                <div
                    className="w-full h-full overflow-hidden select-none"
                    style={{
                        fontSize: `${element.fontSize}px`,
                        fontWeight: element.fontWeight,
                        color: element.color,
                        fontFamily: 'Inter, sans-serif',
                        textAlign: element.textAlign || 'left',
                        display: 'flex',
                        alignItems: element.type === 'text' ? 'center' : 'flex-start',
                        justifyContent: element.textAlign === 'center' ? 'center' : element.textAlign === 'right' ? 'flex-end' : 'flex-start',
                        pointerEvents: 'none' // Ensure drags work smoothly
                    }}
                >
                    {element.type === 'image' ? (
                        <div className="w-full h-full bg-muted/30 flex flex-col items-center justify-center text-[10px] text-muted-foreground p-1 text-center">
                            <ImageIcon className="w-4 h-4 mb-1 opacity-50" />
                            <span className="truncate w-full font-medium">{element.label}</span>
                        </div>
                    ) : element.type === 'marksTable' ? (
                            <div className="w-full h-full bg-background border border-border text-[8px] flex flex-col shadow-sm rounded-sm">
                                <div className="bg-muted/50 border-b border-border font-semibold p-1 text-center uppercase tracking-wider">Marks Sheet</div>
                                <div className="flex-1 p-1">
                                    <div className="grid grid-cols-3 gap-1 mb-1 border-b pb-0.5 font-medium text-muted-foreground">
                                        <span>Sub</span><span>Max</span><span>Obt</span>
                                    </div>
                                    <div className="space-y-0.5 opacity-70">
                                        <div className="grid grid-cols-3 gap-1"><span>Eng</span><span>100</span><span>85</span></div>
                                        <div className="grid grid-cols-3 gap-1"><span>Math</span><span>100</span><span>92</span></div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                        <span className="whitespace-nowrap px-0.5">{`{${element.label}}`}</span>
                    )}
                </div>


            </div>
        </Draggable>
    );
};

const CardDesigner = () => {
    const { showToast } = useToast();
    const user = JSON.parse(localStorage.getItem('currentUser'));
    const schoolId = user?.schoolName ? user._id : (user?.school?._id || user?.school);

    // --- State ---
    const [view, setView] = useState('list'); // 'list' | 'design'
    const [templates, setTemplates] = useState([]);

    // Editor State
    const [templateName, setTemplateName] = useState('');
    const [cardType, setCardType] = useState('student');
    const [elements, setElements] = useState([]);
    const [selectedElementId, setSelectedElementId] = useState(null);
    const [backgroundImage, setBackgroundImage] = useState(null);
    const [backgroundFile, setBackgroundFile] = useState(null);
    const [saving, setSaving] = useState(false);
    const [focusMode, setFocusMode] = useState(false);
    const [zoom, setZoom] = useState(1.7);

    // Delete Dialog State
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [templateToDelete, setTemplateToDelete] = useState(null);
    const [discardDialogOpen, setDiscardDialogOpen] = useState(false);
    const [isDirty, setIsDirty] = useState(false);

    // Canvas Settings
    const [preset, setPreset] = useState('cr80');
    const [orientation, setOrientation] = useState('horizontal');
    const [customWidth, setCustomWidth] = useState(350);
    const [customHeight, setCustomHeight] = useState(220);

    // --- Config ---
    const CARD_PRESETS = {
        'cr80': { label: 'Standard ID', width: 323, height: 204 },
        'a4': { label: 'A4 Doc', width: 794, height: 1123 },
        'square': { label: 'Square Badge', width: 400, height: 400 },
        'custom': { label: 'Custom Size', width: 0, height: 0 }
    };

    const availableFields = {
        student: [
            { id: 'name', label: 'Name', icon: Type },
            { id: 'rollNum', label: 'Roll No', icon: Type },
            { id: 'class', label: 'Class', icon: Type },
            { id: 'section', label: 'Section', icon: Type },
            { id: 'fatherName', label: 'Father Name', icon: Type },
            { id: 'dob', label: 'DOB', icon: Type },
            { id: 'phone', label: 'Phone', icon: Type },
            { id: 'address', label: 'Address', icon: Type },
            { id: 'photo', label: 'Student Photo', type: 'image', icon: ImageIcon },
            { id: 'logo', label: 'School Logo', type: 'image', icon: ImageIcon },
            { id: 'signature', label: 'Auth. Sig', type: 'image', icon: ImageIcon }
        ],
        staff: [
            { id: 'name', label: 'Name', icon: Type },
            { id: 'role', label: 'Designation', icon: Type },
            { id: 'email', label: 'Email', icon: Type },
            { id: 'phone', label: 'Phone', icon: Type },
            { id: 'joiningDate', label: 'Joined Date', icon: Type },
            { id: 'photo', label: 'Photo', type: 'image', icon: ImageIcon },
            { id: 'logo', label: 'Logo', type: 'image', icon: ImageIcon },
            { id: 'signature', label: 'Auth. Sig', type: 'image', icon: ImageIcon }
        ],
        report: [
            { id: 'name', label: 'Name', icon: Type },
            { id: 'rollNum', label: 'Roll No', icon: Type },
            { id: 'class', label: 'Class', icon: Type },
            { id: 'examName', label: 'Exam', icon: Type },
            { id: 'session', label: 'Session', icon: Type },
            { id: 'marksTable', label: 'Marks Sheet', type: 'marksTable', icon: Grid3X3 },
            { id: 'percentage', label: '% Score', icon: Type },
            { id: 'grade', label: 'Grade', icon: Type },
            { id: 'status', label: 'Status', icon: Type },
            { id: 'remarks', label: 'Remarks', icon: Type },
            { id: 'classTeacherSignature', label: 'Teacher Sig', type: 'image', icon: ImageIcon },
            { id: 'principalSignature', label: 'Principal Sig', type: 'image', icon: ImageIcon },
            { id: 'logo', label: 'School Logo', type: 'image', icon: ImageIcon }
        ]
    };

    useEffect(() => { fetchTemplates(); }, []);

    // --- Keyboard Shortcuts ---
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (!selectedElementId) return;

            // Ignore if typing in an input
            if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;

            const step = e.shiftKey ? 10 : 1;

            switch (e.key) {
                case 'ArrowUp':
                    e.preventDefault();
                    setElements(prev => prev.map(el => el.id === selectedElementId ? { ...el, y: el.y - step } : el));
                    break;
                case 'ArrowDown':
                    e.preventDefault();
                    setElements(prev => prev.map(el => el.id === selectedElementId ? { ...el, y: el.y + step } : el));
                    break;
                case 'ArrowLeft':
                    e.preventDefault();
                    setElements(prev => prev.map(el => el.id === selectedElementId ? { ...el, x: el.x - step } : el));
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    setElements(prev => prev.map(el => el.id === selectedElementId ? { ...el, x: el.x + step } : el));
                    break;
                case 'Delete':
                case 'Backspace':
                    removeElement(selectedElementId);
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [selectedElementId]);

    const fetchTemplates = async () => {
        try {
            const res = await axios.get(`${API_URL}/CardTemplate/${schoolId}`);
            setTemplates(res.data);
        } catch (error) { console.error(error); }
    };

    // --- Canvas Calculation ---
    const getCanvasDimensions = () => {
        let w, h;
        if (preset === 'custom') {
            w = Number(customWidth); h = Number(customHeight);
        } else {
            const p = CARD_PRESETS[preset];
            w = p.width; h = p.height;
        }
        if (orientation === 'horizontal' && preset !== 'custom') return { w: Math.max(w, h), h: Math.min(w, h) };
        if (orientation === 'vertical' && preset !== 'custom') return { w: Math.min(w, h), h: Math.max(w, h) };
        return { w, h };
    };

    const getCanvasStyle = () => {
        const { w, h } = getCanvasDimensions();
        // Adjust scale to fit viewport properly
        const MAX_W = focusMode ? 1000 : 700;
        const MAX_H = focusMode ? 800 : 600;
        const baseScale = Math.min(MAX_W / w, MAX_H / h, 1) * 0.85; // slightly smaller to ensure padding
        return { w, h, scale: baseScale * zoom };
    };

    // --- Actions ---
    const addElement = (field) => {
        setIsDirty(true);
        // Center the new element roughly
        const { w, h } = getCanvasDimensions();

        const newEl = {
            id: Date.now(),
            field: field.id,
            label: field.label,
            type: field.type || 'text',
            x: w / 2 - 40, // rough center
            y: h / 2 - 10,
            fontSize: 12,
            fontWeight: 'normal',
            color: '#000000',
            width: field.type === 'marksTable' ? 250 : field.type === 'image' ? 80 : undefined,
            height: field.type === 'marksTable' ? 150 : field.type === 'image' ? 80 : undefined,
            textAlign: 'left'
        };
        setElements([...elements, newEl]);
        setSelectedElementId(newEl.id);
    };

    const updateElement = (id, updates) => {
        setIsDirty(true);
        setElements(elements.map(el => el.id === id ? { ...el, ...updates } : el));
    };

    const removeElement = (id) => {
        setIsDirty(true);
        setElements(elements.filter(e => e.id !== id));
        if (selectedElementId === id) setSelectedElementId(null);
    }

    const saveDetails = async () => {
        if (!templateName) { showToast('Please name your template', 'error'); return; }
        setSaving(true);
        try {
            const formData = new FormData();
            formData.append('school', schoolId);
            formData.append('name', templateName);
            formData.append('cardType', cardType);
            const dims = getCanvasDimensions();
            formData.append('dimensions', JSON.stringify({ width: dims.w, height: dims.h }));
            formData.append('orientation', orientation);
            formData.append('elements', JSON.stringify(elements));
            if (backgroundFile) formData.append('backgroundImage', backgroundFile);
            else if (backgroundImage && !backgroundImage.startsWith('blob:')) formData.append('backgroundImage', backgroundImage);

            await axios.post(`${API_URL}/CardTemplate/save`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
            showToast('Template Saved Successfully!', 'success');
            setIsDirty(false); // Reset dirty state on save
            fetchTemplates();
            setView('list');
        } catch (error) {
            console.error(error); 
            showToast('Failed to save', 'error');
        } finally {
            setSaving(false); 
        }
    };

    const loadTemplate = (t) => {
        setTemplateName(t.name);
        setCardType(t.cardType);
        const { width, height } = t.dimensions || { width: 323, height: 204 };
        const isStandard = (width === 323 || width === 204);
        setPreset(isStandard ? 'cr80' : 'custom');
        if (!isStandard) { setCustomWidth(width); setCustomHeight(height); }
        setOrientation(width > height ? 'horizontal' : 'vertical');
        setBackgroundImage(t.backgroundImage);
        setElements(t.elements);
        setIsDirty(false); // Reset dirty state after loading
        setView('design');
    };

    const handleBackClick = () => {
        if (isDirty) {
            setDiscardDialogOpen(true);
        } else {
            setView('list');
        }
    };

    const handleDiscard = () => {
        setDiscardDialogOpen(false);
        setIsDirty(false);
        setView('list');
    };

    const confirmDelete = (id) => {
        setTemplateToDelete(id);
        setDeleteDialogOpen(true);
    };

    const handleDelete = async () => {
        if (!templateToDelete) return;
        try {
            await axios.delete(`${API_URL}/CardTemplate/${templateToDelete}`);
            showToast("Template deleted successfully", "success");
            fetchTemplates();
        } catch (error) {
            showToast("Failed to delete template", "error");
        } finally {
            setDeleteDialogOpen(false);
            setTemplateToDelete(null);
        }
    };

    const selectedEl = elements.find(e => e.id === selectedElementId);
    const canvas = getCanvasStyle();

    // --- Render: List View ---
    if (view === 'list') {
    return (
        <div className="flex-1 space-y-6 p-8 pt-6 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
                    <div>
                    <h1 className="text-4xl font-bold tracking-tight text-foreground">Design Studio</h1>
                    <p className="text-muted-foreground mt-2 text-lg">Create bespoke ID cards and certificates</p>
                </div>
                <Button onClick={() => {
                    setTemplateName(''); setElements([]); setBackgroundImage(null); setIsDirty(false); setView('design');
                }} size="lg" className="shadow-lg hover:shadow-primary/25 transition-all">
                    <Plus className="w-5 h-5 mr-2" /> New Template
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {/* Create New Card */}
                <div 
                    onClick={() => { setTemplateName(''); setElements([]); setBackgroundImage(null); setIsDirty(false); setView('design'); }}
                    className="group relative flex flex-col items-center justify-center p-8 border-2 border-dashed border-muted-foreground/20 rounded-2xl cursor-pointer hover:border-primary/50 hover:bg-muted/30 transition-all duration-300 h-[280px]"
                >
                    <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                        <Plus className="w-8 h-8 text-primary" />
                    </div>
                    <h3 className="font-semibold text-xl text-foreground">Start Fresh</h3>
                    <p className="text-sm text-muted-foreground text-center mt-2 px-4">Create a new design from a blank canvas</p>
                </div>

                {templates.map(t => (
                    <Card key={t._id} className="overflow-hidden group border-muted hover:border-primary/20 hover:shadow-xl transition-all duration-300 h-[280px] flex flex-col cursor-pointer" onClick={() => loadTemplate(t)}>
                        <div className="h-40 bg-muted/30 relative overflow-hidden flex items-center justify-center">
                            {t.backgroundImage ? (
                                <img src={t.backgroundImage} alt={t.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                            ) : (
                                <LayoutTemplate className="w-12 h-12 text-muted-foreground/20" />
                            )}
                            <div className="absolute top-3 right-3">
                                <Badge variant="outline" className="bg-background/80 backdrop-blur-sm border-0 shadow-sm uppercase text-[10px] font-bold tracking-wider">
                                    {t.cardType}
                                </Badge>
                            </div>
                            {/* Actions Overlay */}
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3 backdrop-blur-[2px]">
                                <Button size="icon" variant="secondary" className="h-9 w-9 rounded-full shadow-lg" onClick={(e) => { e.stopPropagation(); loadTemplate(t) }} title="Edit">
                                    <Edit className="w-4 h-4" />
                                </Button>
                                <Button size="icon" variant="destructive" className="h-9 w-9 rounded-full shadow-lg" onClick={(e) => { e.stopPropagation(); confirmDelete(t._id); }} title="Delete">
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                        <CardContent className="p-5 flex-1 flex flex-col justify-end">
                            <h3 className="font-semibold text-lg truncate mb-1">{t.name || "Untitled Template"}</h3>
                            <div className="flex items-center justify-between text-xs text-muted-foreground mt-2">
                                <span className="flex items-center gap-1.5">
                                    <Layers className="w-3 h-3" /> {t.elements?.length || 0} Layers
                                </span>
                                <span>{formatDateTime(t.createdAt)}</span>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="col-span-full py-12 text-center text-muted-foreground hidden only:block">
                {/* Fallback if no templates - 'only:block' depends on siblings, logic here is slightly off for React list */}
            </div>

            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the template
                            from your gallery.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                            Delete Template
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
        );
    }

    // --- Render: Design View ---
    return (
        <div className="flex h-screen w-full bg-background overflow-hidden font-sans fixed inset-0 z-50">

            {/* LEFT SIDEBAR: CONFIGURATION */}
            <div className={`w-80 border-r bg-card flex flex-col z-20 shrink-0 transition-transform duration-300 ease-in-out ${focusMode ? '-translate-x-full absolute' : 'translate-x-0'}`}>
                <div className="h-14 border-b flex items-center px-4 shrink-0">
                    <Button variant="ghost" size="sm" onClick={handleBackClick} className="gap-2 text-muted-foreground hover:text-foreground">
                        <Undo2 className="w-4 h-4" /> Back to Gallery
                    </Button>
                </div>

                <AlertDialog open={discardDialogOpen} onOpenChange={setDiscardDialogOpen}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Unsaved Changes</AlertDialogTitle>
                            <AlertDialogDescription>
                                You have unsaved changes. Are you sure you want to leave? Your changes will be lost.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={handleDiscard} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                Discard Changes
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>

                <ScrollArea className="flex-1">
                    <div className="p-5 space-y-6">

                        {/* 1. Project Settings */}
                        <div className="space-y-4">
                            <Label className="text-xs font-semibold uppercase text-muted-foreground">Template Details</Label>
                            <div className="space-y-3">
                                <Input
                                    value={templateName}
                                    onChange={(e) => { setTemplateName(e.target.value); setIsDirty(true); }}
                                    placeholder="Template Name"
                                    className="h-9"
                                />
                                <div className="grid grid-cols-2 gap-2">
                                    <Select value={cardType} onValueChange={(val) => { setCardType(val); setIsDirty(true); }}>
                                        <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="student">Student ID</SelectItem>
                                            <SelectItem value="staff">Staff ID</SelectItem>
                                            <SelectItem value="report">Report Card</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <Select value={preset} onValueChange={(val) => { setPreset(val); setIsDirty(true); }}>
                                        <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            {Object.entries(CARD_PRESETS).map(([k, v]) => (
                                                <SelectItem key={k} value={k}>{v.label}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="flex bg-muted p-1 rounded-md">
                                    <button
                                        onClick={() => setOrientation('horizontal')}
                                        className={`flex-1 py-1 text-xs font-medium rounded-sm transition-all ${orientation === 'horizontal' ? 'bg-background shadow text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                                    >Horizontal</button>
                                    <button
                                        onClick={() => setOrientation('vertical')}
                                        className={`flex-1 py-1 text-xs font-medium rounded-sm transition-all ${orientation === 'vertical' ? 'bg-background shadow text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                                    >Vertical</button>
                                </div>

                                {preset === 'custom' && (
                                    <div className="grid grid-cols-2 gap-2">
                                        <div className="space-y-1"><Label className="text-[10px]">W</Label><Input type="number" className="h-8 text-xs" value={customWidth} onChange={(e) => { setCustomWidth(e.target.value); setIsDirty(true); }} /></div>
                                        <div className="space-y-1"><Label className="text-[10px]">H</Label><Input type="number" className="h-8 text-xs" value={customHeight} onChange={(e) => { setCustomHeight(e.target.value); setIsDirty(true); }} /></div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <Separator />

                        {/* 2. Background */}
                        <div className="space-y-3">
                            <Label className="text-xs font-semibold uppercase text-muted-foreground">Background</Label>
                            <div className="relative group cursor-pointer border-2 border-dashed border-border rounded-lg h-28 bg-muted/20 hover:bg-muted/40 transition-colors overflow-hidden flex flex-col items-center justify-center text-center">
                                <Input
                                    type="file" accept="image/*"
                                    className="absolute inset-0 opacity-0 cursor-pointer z-10"
                                    onChange={(e) => { const file = e.target.files[0]; if (file) { setBackgroundImage(URL.createObjectURL(file)); setBackgroundFile(file); setIsDirty(true); } }}
                                />
                                {backgroundImage ? (
                                    <>
                                        <img src={backgroundImage} className="w-full h-full object-cover opacity-80" />
                                        <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <span className="text-xs text-white font-medium">Change Image</span>
                                        </div>
                                    </>
                                ) : (
                                        <div className="flex flex-col items-center gap-1.5 p-2">
                                            <Upload className="w-5 h-5 text-muted-foreground/70" />
                                            <span className="text-xs text-muted-foreground">Click to upload</span>
                                        </div>
                                )}
                            </div>
                        </div>

                        <Separator />

                        {/* 3. Elements */}
                        <div className="space-y-3">
                            <Label className="text-xs font-semibold uppercase text-muted-foreground">Add Elements</Label>
                            <div className="grid grid-cols-2 gap-2">
                                {availableFields[cardType].map(field => (
                                    <Button key={field.id} variant="outline" size="sm" onClick={() => addElement(field)} className="justify-start h-8 text-xs px-2 font-normal">
                                        <field.icon className="w-3.5 h-3.5 mr-2 opacity-70" />
                                        <span className="truncate">{field.label}</span>
                                    </Button>
                                ))}
                            </div>
                        </div>

                    </div>
                </ScrollArea>

                <div className="p-4 border-t bg-card">
                    <Button onClick={saveDetails} className="w-full" disabled={saving}>
                        {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />} Save Template
                    </Button>
                </div>
            </div>

            {/* MAIN CANVAS AREA */}
            <div className="flex-1 flex flex-col relative bg-muted/10 h-full overflow-hidden">
                {/* Toolbar */}
                <div className="h-14 border-b bg-background flex items-center justify-between px-6 z-10 shrink-0">
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={() => setSelectedElementId(null)} disabled={!selectedElementId} className="h-8 text-xs">
                            Deselect
                        </Button>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="flex items-center gap-2">
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setZoom(z => Math.max(0.5, z - 0.1))} title="Zoom Out">
                                <ZoomOut className="w-4 h-4" />
                            </Button>
                            <span className="text-xs text-muted-foreground min-w-[3rem] text-center select-none">
                                {Math.round(canvas.scale * 100)}%
                            </span>
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setZoom(z => Math.min(3, z + 0.1))} title="Zoom In">
                                <ZoomIn className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground" onClick={() => setZoom(1)} title="Reset Zoom">
                                <RotateCcw className="w-3 h-3" />
                            </Button>
                            <Separator orientation="vertical" className="h-6 mx-1" />
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setFocusMode(!focusMode)} title={focusMode ? "Exit Focus Mode" : "Focus Mode"}>
                                {focusMode ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Canvas Scroll Area */}
                <div className="flex-1 overflow-auto flex items-center justify-center p-10 bg-dot-pattern">
                    <div 
                        className="bg-white shadow-xl relative transition-all duration-300 ring-1 ring-black/5"
                        onClick={() => setSelectedElementId(null)}
                        style={{
                            width: canvas.w,
                            height: canvas.h,
                            transform: `scale(${canvas.scale})`,
                            // Center transformation logic
                            backgroundImage: backgroundImage ? `url(${backgroundImage})` : 'none',
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                        }}
                    >
                        {/* Empty State Hint */}
                        {!backgroundImage && elements.length === 0 && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground/30 pointer-events-none">
                                <LayoutTemplate className="w-16 h-16 mb-2" />
                                <span className="text-sm font-medium uppercase tracking-widest">Canvas Ready</span>
                            </div>
                        )}

                        {elements.map(el => (
                            <DraggableElement
                                key={el.id}
                                element={el}
                                isSelected={selectedElementId === el.id}
                                onSelect={setSelectedElementId}
                                onUpdate={updateElement}
                                scale={canvas.scale}
                            />
                        ))}
                    </div>
                </div>
            </div>

            {/* RIGHT SIDEBAR: PROPERTIES */}
            <div className={`w-72 border-l bg-card flex flex-col z-20 shrink-0 transition-transform duration-300 ease-in-out ${focusMode ? 'translate-x-full absolute right-0' : 'translate-x-0'}`}>
                {selectedElementId && selectedEl ? (
                    <>
                        <div className="h-14 border-b flex items-center justify-between px-4 bg-muted/5 shrink-0">
                            <span className="text-sm font-semibold">Properties</span>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10" onClick={() => removeElement(selectedEl.id)}>
                                <Trash2 className="w-4 h-4" />
                            </Button>
                        </div>

                        <ScrollArea className="flex-1 p-5">
                            <div className="space-y-6">
                                <div className="space-y-1.5">
                                    <Label className="text-xs uppercase text-muted-foreground">Content</Label>
                                    <Input value={selectedEl.label} disabled className="h-8 bg-muted text-xs" />
                                </div>

                                {selectedEl.type === 'text' && (
                                    <>
                                        <Separator />
                                        <div className="space-y-4">
                                            <Label className="text-xs uppercase text-muted-foreground">Typography</Label>

                                            <div className="space-y-2">
                                                <div className="flex justify-between text-xs">
                                                    <span>Size</span>
                                                    <span className="text-muted-foreground">{selectedEl.fontSize}px</span>
                                                </div>
                                                <Slider
                                                    min={8} max={72} step={1}
                                                    value={[selectedEl.fontSize]}
                                                    onValueChange={(val) => updateElement(selectedEl.id, { fontSize: val[0] })}
                                                    className="py-1"
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Button
                                                    size="sm" variant={selectedEl.fontWeight === 'bold' ? 'secondary' : 'outline'}
                                                    onClick={() => updateElement(selectedEl.id, { fontWeight: selectedEl.fontWeight === 'bold' ? 'normal' : 'bold' })}
                                                    className="w-full h-8 text-xs"
                                                >
                                                    Bold
                                                </Button>
                                                <ColorPicker
                                                    value={selectedEl.color}
                                                    onChange={(val) => updateElement(selectedEl.id, { color: val })}
                                                />
                                            </div>

                                            <div className="flex bg-muted p-1 rounded-md">
                                                {['left', 'center', 'right'].map(align => (
                                                    <button key={align} onClick={() => updateElement(selectedEl.id, { textAlign: align })} className={`flex-1 py-1 rounded-sm text-xs capitalize transition-all ${selectedEl.textAlign === align ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
                                                        {align}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </>
                                )}

                                {['image', 'marksTable'].includes(selectedEl.type) && (
                                    <div className="space-y-4">
                                        <Label className="text-xs uppercase text-muted-foreground">Size (px)</Label>
                                        <div className="grid grid-cols-2 gap-2">
                                            <div className="space-y-1"><Label className="text-[10px]">W</Label><Input type="number" className="h-8 text-xs" value={selectedEl.width} onChange={(e) => updateElement(selectedEl.id, { width: parseInt(e.target.value) })} /></div>
                                            <div className="space-y-1"><Label className="text-[10px]">H</Label><Input type="number" className="h-8 text-xs" value={selectedEl.height} onChange={(e) => updateElement(selectedEl.id, { height: parseInt(e.target.value) })} /></div>
                                        </div>
                                    </div>
                                )}

                                <Separator />
                                <div className="space-y-3">
                                    <Label className="text-xs uppercase text-muted-foreground">Position</Label>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div className="relative"><span className="absolute left-2 top-2 text-[10px] text-muted-foreground">X</span><Input type="number" className="h-8 pl-6 text-xs" value={Math.round(selectedEl.x)} onChange={(e) => updateElement(selectedEl.id, { x: parseInt(e.target.value) })} /></div>
                                        <div className="relative"><span className="absolute left-2 top-2 text-[10px] text-muted-foreground">Y</span><Input type="number" className="h-8 pl-6 text-xs" value={Math.round(selectedEl.y)} onChange={(e) => updateElement(selectedEl.id, { y: parseInt(e.target.value) })} /></div>
                                    </div>
                                </div>
                            </div>
                        </ScrollArea>
                    </>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-6 text-center">
                        <MousePointer2 className="w-10 h-10 mb-4 opacity-20" />
                        <p className="text-sm font-medium">No Element Selected</p>
                        <p className="text-xs mt-1 text-muted-foreground/70">Click on any element in the canvas to edit its properties.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CardDesigner;
