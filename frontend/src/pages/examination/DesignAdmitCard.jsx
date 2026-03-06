import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
    Save, X, Image as ImageIcon, Plus, Check, Loader2, LayoutTemplate
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import AdmitCardLayout from '../../components/card-templates/AdmitCardLayout';
import ConfirmDeleteModal from '../../components/form-popup/ConfirmDeleteModal';
import { useToast } from '../../context/ToastContext';
import API_URL from '../../config/api';

const DesignAdmitCard = () => {
    const { showToast } = useToast();
    const [loading, setLoading] = useState(false);
    const [templates, setTemplates] = useState([]);
    const [selectedTemplate, setSelectedTemplate] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [templateToDelete, setTemplateToDelete] = useState(null);

    // Form State
    const [config, setConfig] = useState({
        templateName: '',
        schoolName: '',
        heading: '',
        examName: '',
        examCenter: '',
        footerText: '',
        headerLogo: '',
        signaturePrincipal: '',
        signatureClassIncharge: '',
        campus1Name: '',
        campus1Address: '',
        campus2Name: '',
        campus2Address: '',
        phone1: '',
        phone2: '',
        facebook: '',
        website: ''
    });

    const user = JSON.parse(localStorage.getItem('currentUser'));
    const schoolId = user?.schoolName ? user._id : user?.school;

    useEffect(() => {
        fetchTemplates();
    }, []);

    const fetchTemplates = async () => {
        try {
            const res = await axios.get(`${API_URL}/CardTemplate/${schoolId}`);
            setTemplates(res.data.filter(t => t.cardType === 'admit_card'));
        } catch (error) {
            console.error("Error fetching templates:", error);
        }
    };

    const handleSelectTemplate = (template) => {
        setSelectedTemplate(template);
        try {
            // Configuration is saved as a JSON string in the 'elements' field
            const parsedConfig = JSON.parse(template.elements);
            setConfig({
                templateName: template.name,
                ...parsedConfig
            });
        } catch (e) {
            console.error("Failed to parse template config", e);
            setConfig({
                templateName: template.name,
                schoolName: '',
                heading: '',
                examName: '',
                examCenter: '',
                footerText: '',
                headerLogo: '',
                signaturePrincipal: '',
                signatureClassIncharge: '',
                campus1Name: '',
                campus1Address: '',
                campus2Name: '',
                campus2Address: '',
                phone1: '',
                phone2: '',
                facebook: '',
                website: ''
            });
        }
    };

    const handleCreateNew = () => {
        setSelectedTemplate(null);
        setConfig({
            templateName: 'New Admit Card Template',
            schoolName: 'SCHOOL OF ILM-O-HIKMAT',
            heading: 'EXAM DATE SHEET',
            examName: 'FINAL TERM',
            examCenter: 'SOIH',
            footerText: '• School timing during exams will be 10:00 to 12:00 <br> • Send your child in complete uniform <br> • Fee defaulters will not be allowed to sit in exams.',
            headerLogo: '',
            signaturePrincipal: '',
            signatureClassIncharge: '',
            campus1Name: 'Main Campus',
            campus1Address: 'Kot Elahi Bakhsh, Main Depalpur Road,\nOpposite Atock Pump, Talwandi Bus Stop',
            campus2Name: 'Ayesha Campus',
            campus2Address: 'Al Noor City, Talwandi',
            phone1: '+92 300 8875374',
            phone2: '+92 313 8875374',
            facebook: 'ilmohikmat.edu.pk',
            website: 'www.soih.pk'
        });
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setConfig(prev => ({ ...prev, [name]: value }));
    };

    const handleImageUpload = (e, field) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setConfig(prev => ({ ...prev, [field]: reader.result }));
            };
            reader.readAsDataURL(file);
        }
    };

    const removeImage = (field) => {
        setConfig(prev => ({ ...prev, [field]: '' }));
    };

    const handleSaveTemplate = async () => {
        if (!config.templateName) {
            alert("Please provide a Template Name.");
            return;
        }

        setIsSaving(true);
        try {
            const templateData = {
                name: config.templateName,
                school: schoolId,
                cardType: 'admit_card',
                // We stringify the config and store it in elements since backend expects string
                elements: JSON.stringify({
                    schoolName: config.schoolName,
                    heading: config.heading,
                    examName: config.examName,
                    examCenter: config.examCenter,
                    footerText: config.footerText,
                    headerLogo: config.headerLogo,
                    signaturePrincipal: config.signaturePrincipal,
                    signatureClassIncharge: config.signatureClassIncharge,
                    campus1Name: config.campus1Name,
                    campus1Address: config.campus1Address,
                    campus2Name: config.campus2Name,
                    campus2Address: config.campus2Address,
                    phone1: config.phone1,
                    phone2: config.phone2,
                    facebook: config.facebook,
                    website: config.website
                }),
                width: 800,
                height: 1100,
                // The remaining fields are required by schema but we don't need them for this layout type
                backgroundImage: ''
            };

            await axios.post(`${API_URL}/CardTemplate/save`, templateData);
            showToast("Template saved successfully!", "success");
            fetchTemplates();
        } catch (error) {
            console.error("Error saving template:", error);
            showToast("Failed to save template", "error");
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteClick = (e, templateId) => {
        e.stopPropagation();
        setTemplateToDelete(templateId);
        setIsDeleteModalOpen(true);
    };

    const confirmDeleteTemplate = async () => {
        if (!templateToDelete) return;
        try {
            await axios.delete(`${API_URL}/CardTemplate/${templateToDelete}`);
            showToast("Template deleted.", "success");
            if (selectedTemplate && selectedTemplate._id === templateToDelete) {
                setSelectedTemplate(null);
                handleCreateNew();
            }
            fetchTemplates();
        } catch (error) {
            console.error("Error deleting template:", error);
            showToast("Failed to delete template", "error");
        } finally {
            setIsDeleteModalOpen(false);
            setTemplateToDelete(null);
        }
    };

    // Dummy data for Preview
    const dummyStudent = {
        name: 'KASHAF RAFIQUE',
        rollNum: '100004',
        admissionId: 'SOIH00013',
        sclassName: { sclassName: 'GRADE NINE (COMBINE)' },
        dateOfBirth: '2010-02-17T00:00:00.000Z',
        gender: 'FEMALE',
        fatherName: 'MOHAMMAD RAFIQUE',
        motherName: 'ROBINA BIBI',
        address: 'KOT ELAHI BAKHSH, TALWANDI, P/O SAME, TEHSIL CHUNIAN'
    };

    const dummySchedule = [
        { examDate: '2025-01-08T00:00:00.000Z', startTime: '10:00:00', subject: 'MATHEMATICS' },
        { examDate: '2025-01-09T00:00:00.000Z', startTime: '10:00:00', subject: 'TARJUMAT-UL-QURAN' },
        { examDate: '2025-01-10T00:00:00.000Z', startTime: '10:00:00', subject: 'PHYSICS' }
    ];

    return (
        <div className="flex h-[calc(100vh-theme(spacing.16))] gap-6 p-6">
            
            {/* Left Sidebar: Templates & Form */}
            <div className="w-[400px] flex flex-col gap-6">
                
                {/* Templates List */}
                <Card className="flex-shrink-0">
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-sm font-medium">Saved Templates</CardTitle>
                            <Button size="sm" variant="outline" onClick={handleCreateNew} className="h-8">
                                <Plus className="w-4 h-4 mr-1" /> New
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <ScrollArea className="h-32">
                            <div className="space-y-2">
                                {templates.length === 0 ? (
                                    <p className="text-sm text-muted-foreground text-center py-4">No templates found.</p>
                                ) : (
                                    templates.map(t => (
                                        <div 
                                            key={t._id} 
                                            className={`flex items-center justify-between p-2 rounded-md border cursor-pointer transition-colors ${selectedTemplate?._id === t._id ? 'border-primary bg-primary/5' : 'hover:bg-muted'}`}
                                            onClick={() => handleSelectTemplate(t)}
                                        >
                                            <div className="flex items-center gap-2">
                                                <LayoutTemplate className="w-4 h-4 text-muted-foreground" />
                                                <span className="text-sm font-medium">{t.name}</span>
                                            </div>
                                            <Button 
                                                variant="ghost" 
                                                size="icon" 
                                                className="h-6 w-6 text-destructive hover:bg-destructive/10"
                                                onClick={(e) => handleDeleteClick(e, t._id)}
                                            >
                                                <X className="w-3 h-3" />
                                            </Button>
                                        </div>
                                    ))
                                )}
                            </div>
                        </ScrollArea>
                    </CardContent>
                </Card>

                {/* Configuration Form */}
                <Card className="flex-1 flex flex-col min-h-0">
                    <CardHeader className="pb-3 flex-shrink-0">
                        <CardTitle className="text-lg">Template Configuration</CardTitle>
                        <CardDescription>Fill the actual details or leave blank</CardDescription>
                    </CardHeader>
                    <ScrollArea className="flex-1 px-6 pb-6 pt-0">
                        <div className="space-y-4">
                            <div className="space-y-1.5">
                                <Label>Template Name <span className="text-destructive">*</span></Label>
                                <Input name="templateName" value={config.templateName} onChange={handleChange} placeholder="e.g. Final Term Admissions" />
                            </div>

                            <div className="space-y-1.5">
                                <Label>School Name</Label>
                                <Input name="schoolName" value={config.schoolName} onChange={handleChange} />
                            </div>

                            <div className="space-y-1.5">
                                <Label>Heading</Label>
                                <Input name="heading" value={config.heading} onChange={handleChange} placeholder="e.g. EXAM DATE SHEET" />
                            </div>

                            <div className="space-y-1.5">
                                <Label>Title / Term Name</Label>
                                <Input name="examName" value={config.examName} onChange={handleChange} placeholder="e.g. FINAL TERM" />
                            </div>

                            <div className="space-y-1.5">
                                <Label>Exam Center</Label>
                                <Input name="examCenter" value={config.examCenter} onChange={handleChange} />
                            </div>

                            <div className="space-y-1.5">
                                <Label>Footer Text / Instructions</Label>
                                <Textarea 
                                    name="footerText" 
                                    value={config.footerText} 
                                    onChange={handleChange} 
                                    rows={4}
                                    className="text-sm"
                                    placeholder="Enter instructions, use \n for new lines..."
                                />
                            </div>

                            <div className="space-y-1.5 pt-2">
                                <Label>Header Logo</Label>
                                {config.headerLogo ? (
                                    <div className="relative w-24 h-24 border rounded-md overflow-hidden group">
                                        <img src={config.headerLogo} alt="Logo preview" className="w-full h-full object-contain" />
                                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                            <Button size="icon" variant="destructive" className="h-8 w-8" onClick={() => removeImage('headerLogo')}>
                                                <X className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2">
                                        <Input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'headerLogo')} className="cursor-pointer" />
                                    </div>
                                )}
                            </div>

                            {/* Signatures */}
                            <div className="space-y-3 pt-2 border-t mt-4">
                                <h4 className="font-semibold text-sm">Signatures</h4>
                                {['signaturePrincipal', 'signatureClassIncharge'].map((sigField) => (
                                    <div key={sigField} className="space-y-1.5 pt-2">
                                        <Label>{sigField.replace('signature', '')} Signature</Label>
                                        {config[sigField] ? (
                                            <div className="relative w-24 h-12 border rounded-md overflow-hidden group">
                                                <img src={config[sigField]} alt="Signature preview" className="w-full h-full object-contain" />
                                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                                    <Button size="icon" variant="destructive" className="h-6 w-6" onClick={() => removeImage(sigField)}>
                                                        <X className="w-3 h-3" />
                                                    </Button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-2">
                                                <Input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, sigField)} className="cursor-pointer text-xs" />
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                            
                            {/* Footer Contacts */}
                            <div className="space-y-3 pt-4 border-t mt-4">
                                <h4 className="font-semibold text-sm">Footer Contacts & Campuses</h4>
                                
                                <div className="space-y-1.5">
                                    <Label>Campus 1 Name</Label>
                                    <Input name="campus1Name" value={config.campus1Name} onChange={handleChange} placeholder="e.g. Main Campus" />
                                </div>
                                <div className="space-y-1.5">
                                    <Label>Campus 1 Address</Label>
                                    <Textarea name="campus1Address" value={config.campus1Address} onChange={handleChange} rows={2} className="text-sm" />
                                </div>
                                <div className="space-y-1.5">
                                    <Label>Campus 2 Name</Label>
                                    <Input name="campus2Name" value={config.campus2Name} onChange={handleChange} placeholder="e.g. Ayesha Campus" />
                                </div>
                                <div className="space-y-1.5">
                                    <Label>Campus 2 Address</Label>
                                    <Textarea name="campus2Address" value={config.campus2Address} onChange={handleChange} rows={2} className="text-sm" />
                                </div>
                                <div className="space-y-1.5">
                                    <Label>Phone 1</Label>
                                    <Input name="phone1" value={config.phone1} onChange={handleChange} />
                                </div>
                                <div className="space-y-1.5">
                                    <Label>Phone 2</Label>
                                    <Input name="phone2" value={config.phone2} onChange={handleChange} />
                                </div>
                                <div className="space-y-1.5">
                                    <Label>Facebook / Social</Label>
                                    <Input name="facebook" value={config.facebook} onChange={handleChange} />
                                </div>
                                <div className="space-y-1.5">
                                    <Label>Website</Label>
                                    <Input name="website" value={config.website} onChange={handleChange} />
                                </div>
                            </div>
                        </div>
                    </ScrollArea>
                    <div className="p-4 border-t bg-muted/20">
                        <Button className="w-full" onClick={handleSaveTemplate} disabled={isSaving}>
                            {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                            Save Template
                        </Button>
                    </div>
                </Card>
            </div>

            {/* Right Side: Live Preview Container */}
            <div className="flex-1 bg-muted/30 border border-dashed rounded-xl flex flex-col overflow-hidden">
                <div className="bg-background border-b px-6 py-3 flex items-center justify-between shadow-sm z-10">
                    <h3 className="font-semibold text-sm flex items-center gap-2">
                        <ImageIcon className="w-4 h-4 text-primary" /> Live Preview
                    </h3>
                    <div className="text-xs text-muted-foreground">Showing with dummy student data</div>
                </div>
                
                <div className="flex-1 overflow-auto p-8 flex justify-center items-start bg-gray-50/50">
                    {/* The Preview Component */}
                    <div className="shadow-2xl ring-1 ring-border" style={{ transform: 'scale(0.95)', transformOrigin: 'top center' }}>
                        <AdmitCardLayout 
                            config={config} 
                            student={dummyStudent} 
                            examSchedule={dummySchedule} 
                        />
                    </div>
                </div>
            </div>

            <ConfirmDeleteModal 
                isOpen={isDeleteModalOpen}
                onClose={() => {
                    setIsDeleteModalOpen(false);
                    setTemplateToDelete(null);
                }}
                onConfirm={confirmDeleteTemplate}
                title="Delete Template"
                description="Are you sure you want to delete this admit card template? This action cannot be undone."
            />
        </div>
    );
};

export default DesignAdmitCard;
