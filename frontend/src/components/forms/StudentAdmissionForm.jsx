import React, { useState, useEffect } from 'react';
import { Upload, Plus, Trash2, User, BookOpen, Users, Bus, Save, X, Check, Calendar as CalendarIcon } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { useCampus } from '../../context/CampusContext';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

const API_BASE = import.meta.env.VITE_API_URL;

const StudentAdmissionForm = ({ onSuccess, onCancel }) => {
    const { currentUser } = useAuth();
    const { campuses, selectedCampus } = useCampus();

    // --- State ---
    const [classesList, setClassesList] = useState([]);
    const [sectionsList, setSectionsList] = useState([]);
    const [loading, setLoading] = useState(false);

    const [guardianType, setGuardianType] = useState('father'); // 'father', 'mother', 'other'

    const initialFormState = {
        name: '', 
        rollNum: '',
        password: '',
        sclassName: '',
        section: '',
        school: currentUser?._id,
        campus: selectedCampus?._id || '',

        firstName: '',
        lastName: '',
        gender: '',
        dateOfBirth: '',
        category: 'General',
        mobileNumber: '',
        email: '',

        admissionDate: new Date().toISOString(),
        bloodGroup: '',
        house: '',
        height: '',
        weight: '',
        measurementDate: new Date().toISOString(),

        religion: '',
        caste: '',

        father: { name: '', phone: '', occupation: '', email: '', address: '' },
        mother: { name: '', phone: '', occupation: '', email: '', address: '' },
        guardian: { name: '', phone: '', occupation: '', email: '', address: '', relation: '' },

        transport: { route: '', pickupPoint: '', feesMonth: '' },
        siblings: []
    };

    const [formData, setFormData] = useState(initialFormState);
    const [photos, setPhotos] = useState({
        studentPhoto: null,
        fatherPhoto: null,
        motherPhoto: null,
        guardianPhoto: null
    });

    const [previews, setPreviews] = useState({
        studentPhoto: null,
        fatherPhoto: null,
        motherPhoto: null,
        guardianPhoto: null
    });

    // --- Effects ---
    useEffect(() => {
        if (currentUser) {
            fetchClasses();
        }
    }, [currentUser]);

    const fetchClasses = async () => {
        try {
            const res = await axios.get(`${API_BASE}/Sclasses/${currentUser._id}`);
            setClassesList(res.data);
        } catch (err) {
            toast.error("Failed to load classes");
        }
    };

    // --- Handlers ---
    const handleInputChange = (e, section = null, index = null) => {
        const { name, value } = e.target;
        updateFormState(name, value, section, index);
    };

    const handleSelectChange = (name, value, section = null, index = null) => {
        updateFormState(name, value, section, index);
    };

    const updateFormState = (name, value, section, index) => {
        if (name === 'sclassName') {
            const selectedClass = classesList.find(c => c._id === value);
            setSectionsList(selectedClass ? selectedClass.sections : []);
            setFormData(prev => ({ ...prev, [name]: value, section: '' }));
        } else if (section === 'siblings' && index !== null) {
            const newSiblings = [...formData.siblings];
            newSiblings[index] = { ...newSiblings[index], [name]: value };
            setFormData(prev => ({ ...prev, siblings: newSiblings }));
        } else if (section) {
            setFormData(prev => ({
                ...prev,
                [section]: { ...prev[section], [name]: value }
            }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleFileChange = (e, type) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setPhotos(prev => ({ ...prev, [type]: file }));

            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviews(prev => ({ ...prev, [type]: reader.result }));
            };
            reader.readAsDataURL(file);
        }
    };

    const addSibling = () => {
        setFormData(prev => ({
            ...prev,
            siblings: [...prev.siblings, { name: '', class: '', section: '', rollNum: '', school: '' }]
        }));
    };

    const removeSibling = (index) => {
        const newSiblings = formData.siblings.filter((_, i) => i !== index);
        setFormData(prev => ({ ...prev, siblings: newSiblings }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        // Required Validations for Guardian
        if (guardianType === 'father' && !formData.father.name) {
            toast.error("Please enter Father's Name");
            setLoading(false);
            return;
        }
        if (guardianType === 'mother' && !formData.mother.name) {
            toast.error("Please enter Mother's Name");
            setLoading(false);
            return;
        }
        if (guardianType === 'other' && !formData.guardian.name) {
            toast.error("Please enter Guardian's Name");
            setLoading(false);
            return;
        }

        const fullName = `${formData.firstName} ${formData.lastName}`.trim();
        
        try {
            const data = new FormData();
            
            Object.keys(formData).forEach(key => {
                if (key === 'name' && !formData[key]) {
                     data.append('name', fullName);
                } else if (['father', 'mother', 'guardian', 'transport', 'siblings'].includes(key)) {
                    data.append(key, JSON.stringify(formData[key]));
                } else if (key === 'campus' && !formData[key]) {
                    // Skip
                } else {
                    data.append(key, formData[key] || '');
                }
            });

            Object.keys(photos).forEach(key => {
                if (photos[key]) data.append(key, photos[key]);
            });

            await axios.post(`${API_BASE}/StudentRegister`, data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            toast.success("Student admitted successfully!");
            if (onSuccess) onSuccess();
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.message || "Error admitting student");
        } finally {
            setLoading(false);
        }
    };

    // --- Components ---

    // Photo Upload Component
    const PhotoUploader = ({ label, type, preview }) => (
        <div className="flex flex-col items-center gap-3 w-full">
            <Label className="text-muted-foreground font-medium">{label}</Label>
            <label
                htmlFor={`file-${type}`}
                className={`
                    relative flex flex-col items-center justify-center w-32 h-32 md:w-40 md:h-40 
                    border-2 border-dashed rounded-full cursor-pointer 
                    transition-all overflow-hidden bg-muted/30
                    ${preview ? 'border-primary' : 'border-muted-foreground/30 hover:border-primary/50 hover:bg-primary/5'}
                `}
            >
                {preview ? (
                    <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                    <div className="flex flex-col items-center justify-center text-muted-foreground">
                        <User className="w-8 h-8 mb-1" />
                        <span className="text-[10px] uppercase font-bold tracking-wider">Upload</span>
                    </div>
                )}

                {preview && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                        <Upload className="w-6 h-6 text-white" />
                    </div>
                )}
                <input type="file" hidden id={`file-${type}`} onChange={(e) => handleFileChange(e, type)} accept="image/*" />
            </label>
        </div>
    );

    return (
        <form onSubmit={handleSubmit} className="space-y-8 animate-in fade-in-50 duration-500">
            
            {/* 1. Student Identity (Photo & Basic) */}
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <User className="h-5 w-5 text-indigo-600" />
                        <CardTitle>Student Identity</CardTitle>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col md:flex-row gap-8 items-start">
                        {/* Photo Column */}
                        <div className="w-full md:w-auto flex justify-center md:justify-start shrink-0">
                            <PhotoUploader label="Student Photo" type="studentPhoto" preview={previews.studentPhoto} />
                        </div>

                        {/* Basic Info Column */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
                            <div className="space-y-2">
                                <Label htmlFor="firstName">First Name <span className="text-destructive">*</span></Label>
                                <Input id="firstName" name="firstName" value={formData.firstName} onChange={handleInputChange} required placeholder="John" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="lastName">Last Name</Label>
                                <Input id="lastName" name="lastName" value={formData.lastName} onChange={handleInputChange} placeholder="Doe" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="rollNum">Roll Number <span className="text-destructive">*</span></Label>
                                <Input id="rollNum" name="rollNum" value={formData.rollNum} type="number" onChange={handleInputChange} required placeholder="e.g. 101" />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="sclassName">Class <span className="text-destructive">*</span></Label>
                                <Select value={formData.sclassName} onValueChange={(val) => handleSelectChange('sclassName', val)} required>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Class" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {classesList.map(cls => (
                                            <SelectItem key={cls._id} value={cls._id}>{cls.sclassName}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="section">Section <span className="text-destructive">*</span></Label>
                                <Select value={formData.section} onValueChange={(val) => handleSelectChange('section', val)} required disabled={!formData.sclassName}>
                                    <SelectTrigger>
                                        <SelectValue placeholder={formData.sclassName ? "Select Section" : "Select Class First"} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {sectionsList.map(sec => (
                                            <SelectItem key={sec.sectionName || sec} value={sec.sectionName || sec}>
                                                {sec.sectionName || sec}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="campus">Campus</Label>
                                <Select value={formData.campus} onValueChange={(val) => handleSelectChange('campus', val)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Campus" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {campuses.map(c => (
                                            <SelectItem key={c._id} value={c._id}>{c.campusName}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* 2. Personal Information Detail */}
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <BookOpen className="h-5 w-5 text-emerald-600" />
                        <CardTitle>Personal Information</CardTitle>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div className="space-y-2">
                            <Label>Gender</Label>
                            <Select value={formData.gender} onValueChange={(val) => handleSelectChange('gender', val)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Gender" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Male">Male</SelectItem>
                                    <SelectItem value="Female">Female</SelectItem>
                                    <SelectItem value="Other">Other</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="dateOfBirth">Date of Birth</Label>
                            <Input id="dateOfBirth" name="dateOfBirth" type="date" value={formData.dateOfBirth} onChange={handleInputChange} />
                        </div>

                        <div className="space-y-2">
                            <Label>Category</Label>
                            <Select value={formData.category} onValueChange={(val) => handleSelectChange('category', val)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Category" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="General">General</SelectItem>
                                    <SelectItem value="OBC">OBC</SelectItem>
                                    <SelectItem value="SC">SC</SelectItem>
                                    <SelectItem value="ST">ST</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="mobileNumber">Mobile Number</Label>
                            <Input id="mobileNumber" name="mobileNumber" value={formData.mobileNumber} onChange={handleInputChange} placeholder="e.g. +1234567890" />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email">Email Address</Label>
                            <Input id="email" name="email" type="email" value={formData.email} onChange={handleInputChange} placeholder="student@example.com" />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="admissionDate">Admission Date</Label>
                            <Input id="admissionDate" name="admissionDate" type="date" value={formData.admissionDate} onChange={handleInputChange} />
                        </div>

                        <div className="space-y-2">
                            <Label>Blood Group</Label>
                            <Select value={formData.bloodGroup} onValueChange={(val) => handleSelectChange('bloodGroup', val)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Blood Group" />
                                </SelectTrigger>
                                <SelectContent>
                                    {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map(bg => (
                                        <SelectItem key={bg} value={bg}>{bg}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>House</Label>
                            <Select value={formData.house} onValueChange={(val) => handleSelectChange('house', val)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Selct House" />
                                </SelectTrigger>
                                <SelectContent>
                                    {['Red', 'Green', 'Blue', 'Yellow'].map(h => (
                                        <SelectItem key={h} value={h}>{h}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <Separator className="my-6" />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                            <Label>Religion <span className="text-destructive">*</span></Label>
                            <RadioGroup value={formData.religion} onValueChange={(val) => handleSelectChange('religion', val)} className="flex flex-wrap gap-4">
                                {['Muslim', 'Christian', 'Hindu', 'Other'].map(rel => (
                                    <div className="flex items-center space-x-2" key={rel}>
                                        <RadioGroupItem value={rel} id={`r-${rel}`} />
                                        <Label htmlFor={`r-${rel}`} className="cursor-pointer font-normal text-muted-foreground">{rel}</Label>
                                    </div>
                                ))}
                            </RadioGroup>
                        </div>

                        <div className="space-y-3">
                            <Label>Caste</Label>
                            <RadioGroup value={formData.caste} onValueChange={(val) => handleSelectChange('caste', val)} className="flex flex-wrap gap-4">
                                {['General', 'Arain', 'Ansari', 'Jutt', 'Other'].map(cst => (
                                    <div className="flex items-center space-x-2" key={cst}>
                                        <RadioGroupItem value={cst} id={`c-${cst}`} />
                                        <Label htmlFor={`c-${cst}`} className="cursor-pointer font-normal text-muted-foreground">{cst}</Label>
                                    </div>
                                ))}
                            </RadioGroup>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* 3. Account Details */}
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <Check className="h-5 w-5 text-gray-600" />
                        <CardTitle>Login Credentials</CardTitle>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                        Set a password for the student to access the dashboard. Parents will also use this password for the Parent Portal.
                    </p>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="password">Login Password (for Student & Parent Portal) <span className="text-destructive">*</span></Label>
                            <Input id="password" name="password" type="password" value={formData.password} onChange={handleInputChange} required placeholder="Set a strong password for login" />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* 4. Parent/Guardian */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-6">
                    <div className="flex items-center gap-2">
                        <Users className="h-5 w-5 text-purple-600" />
                        <CardTitle>Guardian Details</CardTitle>
                    </div>

                    <div className="flex p-1 bg-muted rounded-lg">
                        {['father', 'mother', 'other'].map(type => (
                            <button
                                key={type}
                                type="button"
                                onClick={() => setGuardianType(type)}
                                className={`
                                    px-4 py-1.5 text-sm font-medium rounded-md transition-all capitalize
                                    ${guardianType === type ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}
                                `}
                            >
                                {type === 'other' ? 'Guardian' : type}
                            </button>
                        ))}
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                        {guardianType === 'father' && (
                            <div className="flex flex-col md:flex-row gap-8">
                                <div className="shrink-0 flex justify-center">
                                    <PhotoUploader label="Father's Photo" type="fatherPhoto" preview={previews.fatherPhoto} />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
                                    <div className="space-y-2">
                                        <Label>Father Name <span className="text-destructive">*</span></Label>
                                        <Input name="name" value={formData.father.name} onChange={(e) => handleInputChange(e, 'father')} required />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Phone</Label>
                                        <Input name="phone" value={formData.father.phone} onChange={(e) => handleInputChange(e, 'father')} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Occupation</Label>
                                        <Input name="occupation" value={formData.father.occupation} onChange={(e) => handleInputChange(e, 'father')} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Email</Label>
                                        <Input name="email" value={formData.father.email} onChange={(e) => handleInputChange(e, 'father')} />
                                    </div>
                                    <div className="col-span-1 md:col-span-2 space-y-2">
                                        <Label>Address</Label>
                                        <Textarea name="address" value={formData.father.address} onChange={(e) => handleInputChange(e, 'father')} rows={2} />
                                    </div>
                                </div>
                            </div>
                        )}

                        {guardianType === 'mother' && (
                            <div className="flex flex-col md:flex-row gap-8">
                                <div className="shrink-0 flex justify-center">
                                    <PhotoUploader label="Mother's Photo" type="motherPhoto" preview={previews.motherPhoto} />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
                                    <div className="space-y-2">
                                        <Label>Mother Name <span className="text-destructive">*</span></Label>
                                        <Input name="name" value={formData.mother.name} onChange={(e) => handleInputChange(e, 'mother')} required />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Phone</Label>
                                        <Input name="phone" value={formData.mother.phone} onChange={(e) => handleInputChange(e, 'mother')} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Occupation</Label>
                                        <Input name="occupation" value={formData.mother.occupation} onChange={(e) => handleInputChange(e, 'mother')} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Email</Label>
                                        <Input name="email" value={formData.mother.email} onChange={(e) => handleInputChange(e, 'mother')} />
                                    </div>
                                    <div className="col-span-1 md:col-span-2 space-y-2">
                                        <Label>Address</Label>
                                        <Textarea name="address" value={formData.mother.address} onChange={(e) => handleInputChange(e, 'mother')} rows={2} />
                                    </div>
                                </div>
                            </div>
                        )}

                        {guardianType === 'other' && (
                            <div className="flex flex-col md:flex-row gap-8">
                                <div className="shrink-0 flex justify-center">
                                    <PhotoUploader label="Guardian's Photo" type="guardianPhoto" preview={previews.guardianPhoto} />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
                                    <div className="space-y-2">
                                        <Label>Guardian Name <span className="text-destructive">*</span></Label>
                                        <Input name="name" value={formData.guardian.name} onChange={(e) => handleInputChange(e, 'guardian')} required />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Relation <span className="text-destructive">*</span></Label>
                                        <Input name="relation" value={formData.guardian.relation} onChange={(e) => handleInputChange(e, 'guardian')} required placeholder="e.g. Uncle" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Phone</Label>
                                        <Input name="phone" value={formData.guardian.phone} onChange={(e) => handleInputChange(e, 'guardian')} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Occupation</Label>
                                        <Input name="occupation" value={formData.guardian.occupation} onChange={(e) => handleInputChange(e, 'guardian')} />
                                    </div>
                                    <div className="col-span-1 md:col-span-2 space-y-2">
                                        <Label>Address</Label>
                                        <Textarea name="address" value={formData.guardian.address} onChange={(e) => handleInputChange(e, 'guardian')} rows={2} />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* 5. Transport */}
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <Bus className="h-5 w-5 text-orange-600" />
                        <CardTitle>Transport</CardTitle>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-2">
                            <Label>Route</Label>
                            <Input name="route" value={formData.transport.route} onChange={(e) => handleInputChange(e, 'transport')} />
                        </div>
                        <div className="space-y-2">
                            <Label>Pickup Point</Label>
                            <Input name="pickupPoint" value={formData.transport.pickupPoint} onChange={(e) => handleInputChange(e, 'transport')} />
                        </div>
                        <div className="space-y-2">
                            <Label>Fees Month</Label>
                            <Select value={formData.transport.feesMonth} onValueChange={(val) => handleSelectChange('feesMonth', val, 'transport')}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Month" />
                                </SelectTrigger>
                                <SelectContent>
                                    {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map(m => (
                                        <SelectItem key={m} value={m}>{m}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* 6. Siblings */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Users className="h-5 w-5 text-cyan-600" />
                        <CardTitle>Sibling Information</CardTitle>
                    </div>
                    <Button type="button" variant="outline" size="sm" onClick={addSibling} className="gap-2">
                        <Plus className="h-4 w-4" /> Add Sibling
                    </Button>
                </CardHeader>
                <CardContent>
                    {formData.siblings.length === 0 ? (
                        <div className="text-center py-8 border-2 border-dashed rounded-lg">
                            <p className="text-muted-foreground text-sm">No siblings added yet.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {formData.siblings.map((sibling, index) => (
                                <div key={index} className="bg-muted/30 p-4 rounded-lg border relative group">
                                    <Button type="button" variant="ghost" size="icon" className="absolute top-2 right-2 text-muted-foreground hover:text-destructive" onClick={() => removeSibling(index)}>
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div className="space-y-2">
                                            <Label>Sibling Name</Label>
                                            <Input name="name" value={sibling.name} onChange={(e) => handleInputChange(e, 'siblings', index)} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Class</Label>
                                            <Input name="class" value={sibling.class} onChange={(e) => handleInputChange(e, 'siblings', index)} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Roll No</Label>
                                            <Input name="rollNum" value={sibling.rollNum} onChange={(e) => handleInputChange(e, 'siblings', index)} />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex justify-end gap-4 pt-4">
                {onCancel && (
                    <Button type="button" variant="outline" size="lg" onClick={onCancel}>
                        Cancel
                    </Button>
                )}
                <Button type="submit" size="lg" disabled={loading} className="min-w-[150px]">
                    {loading ? "Processing..." : (
                        <>
                            <Save className="h-4 w-4 mr-2" /> Admit Student
                        </>
                    )}
                </Button>
            </div>
        </form>
    );
};

export default StudentAdmissionForm;
