import React, { useState, useEffect, useMemo } from 'react';
import { formatDateTime } from '../../utils/formatDateTime';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    User,
    Users,
    Clock,
    FileText,
    Calendar,
    Phone,
    CreditCard
} from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { Badge } from "@/components/ui/badge";
import { DatePicker } from "@/components/ui/DatePicker";

import API_URL from '@/config/api';
const API_BASE = API_URL;

const VisitorModal = ({ isOpen, onClose, onSubmit, initialData, viewMode = false }) => {
    const { currentUser } = useAuth();
    
    // Form state
    const [formData, setFormData] = useState({
        purpose: '',
        meetingWith: 'Staff',
        staff: '',
        class: '',
        section: '',
        student: '',
        visitorName: '',
        phone: '',
        idCard: '',
        numberOfPerson: 1,
        date: new Date().toISOString(),
        inTime: '',
        outTime: '',
        note: '',
        document: ''
    });

    const [staffList, setStaffList] = useState([]);
    const [classesList, setClassesList] = useState([]);
    const [studentsList, setStudentsList] = useState([]);
    const [loading, setLoading] = useState(false);
    
    // Fetch staff, classes when modal opens
    useEffect(() => {
        if (isOpen && currentUser) {
            fetchStaff();
            fetchClasses();
        }
    }, [isOpen, currentUser]);

    // Fetch students when class changes
    useEffect(() => {
        if (formData.class && formData.meetingWith === 'Student') {
            fetchStudents(formData.class);
        }
    }, [formData.class, formData.meetingWith]);

    const fetchStaff = async () => {
        try {
            const res = await axios.get(`${API_BASE}/Teachers/${currentUser._id}`);
            setStaffList(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            // Silent fail - staff list will be empty
        }
    };

    const fetchClasses = async () => {
        try {
            const res = await axios.get(`${API_BASE}/Sclasses/${currentUser._id}`);
            setClassesList(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            // Silent fail - classes will be empty
        }
    };

    const fetchStudents = async (classId) => {
        try {
            const res = await axios.get(`${API_BASE}/Students/${currentUser._id}`);
            const studentsData = Array.isArray(res.data) ? res.data : [];
            const filteredStudents = studentsData.filter(student => student.sclassName?._id === classId);
            setStudentsList(filteredStudents);
        } catch (err) {
            // Silent fail - students list will be empty
        }
    };
    
    // When initialData changes (Edit mode)
    useEffect(() => {
        if (initialData) {
            // Safe date handling
            let dateStr = new Date().toISOString();
            try {
                if (initialData.date) {
                    dateStr = initialData.date || new Date().toISOString();
                }
            } catch (e) { }

            const formattedData = {
                purpose: initialData.purpose || '',
                meetingWith: initialData.meetingWith || 'Staff',
                staff: initialData.staff?._id || '',
                class: initialData.class?._id || '',
                section: initialData.section || '',
                student: initialData.student?._id || '',
                visitorName: initialData.visitorName || '',
                phone: initialData.phone || '',
                idCard: initialData.idCard || '',
                numberOfPerson: initialData.numberOfPerson || 1,
                date: dateStr,
                inTime: initialData.inTime || '',
                outTime: initialData.outTime || '',
                note: initialData.note || '',
                document: initialData.document || ''
            };
            setFormData(formattedData);
        } else {
            // Reset form for add mode
            setFormData({
                purpose: '',
                meetingWith: 'Staff',
                staff: '',
                class: '',
                section: '',
                student: '',
                visitorName: '',
                phone: '',
                idCard: '',
                numberOfPerson: 1,
                date: new Date().toISOString(),
                inTime: '',
                outTime: '',
                note: '',
                document: ''
            });
        }
    }, [initialData, isOpen]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSelectChange = (name, value) => {
        setFormData(prev => {
            const newData = { ...prev, [name]: value };

            if (name === 'meetingWith') {
                if (value === 'Staff') {
                    return { ...newData, class: '', section: '', student: '' };
                } else {
                    return { ...newData, staff: '' };
                }
            }
            return newData;
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        await onSubmit(formData);
        setLoading(false);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col p-0 gap-0">
                <DialogHeader className="p-6 pb-2 border-b">
                    <DialogTitle>
                        {viewMode ? 'View Visitor Details' : (initialData ? 'Edit Visitor' : 'Add Visitor')}
                    </DialogTitle>
                    <DialogDescription>
                        {viewMode
                            ? 'Details of the selected visitor record.'
                            : 'Enter the details of the visitor below.'}
                    </DialogDescription>
                </DialogHeader>

                <ScrollArea className="flex-1 p-6">
                    {viewMode ? (
                        /* VIEW MODE */
                        <div className="grid gap-6">
                            {/* Visitor Info */}
                            <div className="space-y-4">
                                <h4 className="flex items-center gap-2 font-semibold text-primary text-sm uppercase tracking-wide">
                                    <User className="h-4 w-4" /> Visitor Information
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 rounded-lg bg-muted/50 p-4 border">
                                    <div className="space-y-1">
                                        <span className="text-xs text-muted-foreground uppercase">Name</span>
                                        <div className="font-medium text-lg">{formData.visitorName}</div>
                                    </div>
                                    <div className="space-y-1">
                                        <span className="text-xs text-muted-foreground uppercase">Purpose</span>
                                        <div className="font-medium">{formData.purpose}</div>
                                    </div>
                                    <div className="space-y-1">
                                        <span className="text-xs text-muted-foreground uppercase">Phone</span>
                                        <div className="font-medium flex items-center gap-2">
                                            <Phone className="h-3 w-3 text-muted-foreground" />
                                            {formData.phone || '-'}
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <span className="text-xs text-muted-foreground uppercase">ID Card</span>
                                        <div className="font-medium flex items-center gap-2">
                                            <CreditCard className="h-3 w-3 text-muted-foreground" />
                                            {formData.idCard || '-'}
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <span className="text-xs text-muted-foreground uppercase">Persons</span>
                                        <div className="font-medium">{formData.numberOfPerson}</div>
                                    </div>
                                </div>
                            </div>

                            {/* Meeting Info */}
                            <div className="space-y-4">
                                <h4 className="flex items-center gap-2 font-semibold text-primary text-sm uppercase tracking-wide">
                                    <Users className="h-4 w-4" /> Meeting Details
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 rounded-lg bg-muted/50 p-4 border">
                                    <div className="space-y-1">
                                        <span className="text-xs text-muted-foreground uppercase">Meeting With</span>
                                        <div><Badge variant="secondary">{formData.meetingWith}</Badge></div>
                                    </div>
                                    {formData.meetingWith === 'Staff' && (
                                        <div className="space-y-1">
                                            <span className="text-xs text-muted-foreground uppercase">Staff Member</span>
                                            <div className="font-medium">
                                                {staffList.find(s => s._id === formData.staff)?.name || '-'}
                                            </div>
                                        </div>
                                    )}
                                    {formData.meetingWith === 'Student' && (
                                        <>
                                            <div className="space-y-1">
                                                <span className="text-xs text-muted-foreground uppercase">Class</span>
                                                <div className="font-medium">
                                                    {classesList.find(c => c._id === formData.class)?.sclassName || '-'}
                                                </div>
                                            </div>
                                            <div className="space-y-1">
                                                <span className="text-xs text-muted-foreground uppercase">Section</span>
                                                <div className="font-medium">{formData.section || '-'}</div>
                                            </div>
                                            <div className="space-y-1">
                                                <span className="text-xs text-muted-foreground uppercase">Student</span>
                                                <div className="font-medium">
                                                    {studentsList.find(s => s._id === formData.student)?.name || '-'}
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Schedule & Notes */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <h4 className="flex items-center gap-2 font-semibold text-primary text-sm uppercase tracking-wide">
                                        <Clock className="h-4 w-4" /> Schedule
                                    </h4>
                                    <div className="space-y-3 rounded-lg bg-muted/50 p-4 border text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Date:</span>
                                            <span className="font-medium">{formatDateTime(formData.date)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">In Time:</span>
                                            <span className="font-medium">{formData.inTime}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Out Time:</span>
                                            <span className="font-medium">{formData.outTime || '-'}</span>
                                        </div>
                                    </div>
                                </div>
                                {formData.note && (
                                    <div className="space-y-4">
                                        <h4 className="flex items-center gap-2 font-semibold text-primary text-sm uppercase tracking-wide">
                                            <FileText className="h-4 w-4" /> Notes
                                        </h4>
                                        <div className="rounded-lg bg-muted/50 p-4 border text-sm italic">
                                            "{formData.note}"
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                            /* EDIT/ADD FORM */
                            <form id="visitor-form" onSubmit={handleSubmit} className="grid gap-5 py-4">
                            
                                {/* Row 1 */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="space-y-2">
                                        <Label>Purpose <span className="text-destructive">*</span></Label>
                                        <Input 
                                            name="purpose" 
                                            value={formData.purpose}
                                            onChange={handleChange} 
                                            placeholder="Reason for visit" 
                                            required 
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Meeting With <span className="text-destructive">*</span></Label>
                                        <Select 
                                            value={formData.meetingWith} 
                                            onValueChange={(val) => handleSelectChange('meetingWith', val)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select type" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Staff">Staff</SelectItem>
                                                <SelectItem value="Student">Student</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {formData.meetingWith === 'Staff' && (
                                        <div className="space-y-2">
                                            <Label>Staff Member <span className="text-destructive">*</span></Label>
                                            <Select 
                                                value={formData.staff} 
                                                onValueChange={(val) => handleSelectChange('staff', val)}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select staff" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {staffList.map((staff) => (
                                                        <SelectItem key={staff._id} value={staff._id}>{staff.name}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    )}

                                    {formData.meetingWith === 'Student' && (
                                        <div className="space-y-2">
                                            <Label>Class <span className="text-destructive">*</span></Label>
                                            <Select 
                                                value={formData.class} 
                                                onValueChange={(val) => handleSelectChange('class', val)}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select class" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {classesList.map((cls) => (
                                                        <SelectItem key={cls._id} value={cls._id}>{cls.sclassName}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    )}
                                </div>

                                {/* Row 2 - Student Specific */}
                                {formData.meetingWith === 'Student' && (
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="space-y-2">
                                            <Label>Section <span className="text-destructive">*</span></Label>
                                            <Select
                                                value={formData.section} 
                                                onValueChange={(val) => handleSelectChange('section', val)}
                                                disabled={!formData.class}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select section" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {classesList.find(c => c._id === formData.class)?.sections?.map((sec) => (
                                                        <SelectItem key={sec._id || sec.sectionName} value={sec.sectionName}>
                                                            {sec.sectionName}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Student <span className="text-destructive">*</span></Label>
                                            <Select 
                                                value={formData.student} 
                                                onValueChange={(val) => handleSelectChange('student', val)}
                                                disabled={!formData.class}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select student" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {studentsList
                                                        .filter(student => !formData.section || student.section === formData.section)
                                                        .map((student) => (
                                                        <SelectItem key={student._id} value={student._id}>{student.name}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Visitor Name <span className="text-destructive">*</span></Label>
                                            <Input 
                                                name="visitorName" 
                                                value={formData.visitorName}
                                                onChange={handleChange} 
                                                placeholder="Visitor Name" 
                                                required 
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* Row 3 */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {formData.meetingWith === 'Staff' && (
                                        <div className="space-y-2">
                                            <Label>Visitor Name <span className="text-destructive">*</span></Label>
                                            <Input 
                                                name="visitorName" 
                                                value={formData.visitorName}
                                                onChange={handleChange} 
                                                placeholder="Visitor Name" 
                                                required 
                                            />
                                        </div>
                                    )}
                                    <div className="space-y-2">
                                        <Label>Phone</Label>
                                        <Input 
                                            name="phone" 
                                            value={formData.phone}
                                            onChange={handleChange} 
                                            placeholder="Phone Number"
                                            type="tel"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>ID Card</Label>
                                        <Input 
                                            name="idCard" 
                                            value={formData.idCard}
                                            onChange={handleChange} 
                                            placeholder="ID Card Number" 
                                        />
                                    </div>
                                </div>

                                {/* Row 4 */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="space-y-2">
                                        <Label>Number of Persons</Label>
                                        <Input 
                                            name="numberOfPerson" 
                                            type="number" 
                                            min="1"
                                            value={formData.numberOfPerson} 
                                            onChange={handleChange} 
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Date <span className="text-destructive">*</span></Label>
                                        <DatePicker
                                            value={formData.date ? formData.date.split('T')[0] : ''}
                                            onChange={(val) => setFormData(prev => ({ ...prev, date: val ? new Date(val).toISOString() : '' }))}
                                            placeholder="Select date"
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Row 5 */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>In Time <span className="text-destructive">*</span></Label>
                                        <Input 
                                            name="inTime" 
                                            type="time" 
                                            value={formData.inTime}
                                            onChange={handleChange} 
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Out Time</Label>
                                        <Input 
                                            name="outTime" 
                                            type="time" 
                                            value={formData.outTime} 
                                            onChange={handleChange} 
                                        />
                                    </div>
                                </div>

                                {/* Row 6 */}
                                <div className="space-y-2">
                                    <Label>Note</Label>
                                    <Textarea 
                                        name="note" 
                                        value={formData.note}
                                        onChange={handleChange}
                                        placeholder="Enter any additional notes..."
                                        className="resize-none"
                                    />
                                </div>
                            </form>
                    )}
                </ScrollArea>

                <DialogFooter className="p-6 border-t bg-muted/40 gap-2 sm:gap-0">
                    <Button variant="outline" onClick={onClose} disabled={loading}>
                        Close
                    </Button>
                    {!viewMode && (
                        <Button type="submit" form="visitor-form" disabled={loading}>
                            {loading && <Clock className="mr-2 h-4 w-4 animate-spin" />}
                            {initialData ? 'Update Visitor' : 'Save Visitor'}
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default VisitorModal;

