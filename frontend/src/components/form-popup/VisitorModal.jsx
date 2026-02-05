import React, { useState, useEffect } from 'react';
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
    IconUser,
    IconUsers,
    IconCalendar,
    IconClock,
    IconFileText
} from '@tabler/icons-react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

const API_BASE = import.meta.env.VITE_API_URL;

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
        date: new Date().toISOString().split('T')[0],
        inTime: '',
        outTime: '',
        note: '',
        document: ''
    });

    const [staffList, setStaffList] = useState([]);
    const [classesList, setClassesList] = useState([]);
    const [studentsList, setStudentsList] = useState([]);
    
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
            setClassesList(res.data);
        } catch (err) {
            // Silent fail - classes will be empty
        }
    };

    const fetchStudents = async (classId) => {
        try {
            const res = await axios.get(`${API_BASE}/Students/${currentUser._id}`);
            const filteredStudents = res.data.filter(student => student.sclassName?._id === classId);
            setStudentsList(filteredStudents);
        } catch (err) {
            // Silent fail - students list will be empty
        }
    };
    
    // When initialData changes (Edit mode)
    useEffect(() => {
        if (initialData) {
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
                date: initialData.date ? initialData.date.split('T')[0] : new Date().toISOString().split('T')[0],
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
                date: new Date().toISOString().split('T')[0],
                inTime: '',
                outTime: '',
                note: '',
                document: ''
            });
        }
    }, [initialData, isOpen]);
    
    // Updated handleChange to work with regular inputs
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // Custom handler for Shadcn Select components
    const handleSelectChange = (name, value) => {
        setFormData(prev => {
            const newData = { ...prev, [name]: value };

            // Logic handled here instead of handleChange
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

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col p-0 gap-0">
                <DialogHeader className="p-6 pb-2">
                    <DialogTitle>
                        {viewMode ? 'View Visitor Details' : (initialData ? 'Edit Visitor' : 'Add Visitor')}
                    </DialogTitle>
                    <DialogDescription>
                        {viewMode
                            ? 'Details of the selected visitor record.'
                            : 'Enter the details of the visitor below.'}
                    </DialogDescription>
                </DialogHeader>

                <ScrollArea className="flex-1 p-6 pt-2">
                    {viewMode ? (
                        /* VIEW MODE */
                        <div className="grid gap-6">
                            {/* Visitor Info */}
                            <div className="space-y-4 rounded-lg border p-4 bg-muted/40">
                                <h4 className="flex items-center gap-2 font-semibold text-primary">
                                    <IconUser size={18} /> Visitor Information
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                    <div><span className="text-muted-foreground">Name:</span> <span className="font-medium">{formData.visitorName}</span></div>
                                    <div><span className="text-muted-foreground">Purpose:</span> <span className="font-medium">{formData.purpose}</span></div>
                                    <div><span className="text-muted-foreground">Phone:</span> <span className="font-medium">{formData.phone || '-'}</span></div>
                                    <div><span className="text-muted-foreground">ID Card:</span> <span className="font-medium">{formData.idCard || '-'}</span></div>
                                    <div><span className="text-muted-foreground">Persons:</span> <span className="font-medium">{formData.numberOfPerson}</span></div>
                                </div>
                            </div>

                            {/* Meeting Info */}
                            <div className="space-y-4 rounded-lg border p-4 bg-muted/40">
                                <h4 className="flex items-center gap-2 font-semibold text-primary">
                                    <IconUsers size={18} /> Meeting Details
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                    <div><span className="text-muted-foreground">Meeting With:</span> <Badge>{formData.meetingWith}</Badge></div>
                                    {formData.meetingWith === 'Staff' && (
                                        <div>
                                            <span className="text-muted-foreground">Staff Member:</span>
                                            <span className="font-medium ml-2">
                                                {staffList.find(s => s._id === formData.staff)?.name || '-'}
                                            </span>
                                        </div>
                                    )}
                                    {formData.meetingWith === 'Student' && (
                                        <>
                                            <div>
                                                <span className="text-muted-foreground">Class:</span>
                                                <span className="font-medium ml-2">
                                                    {classesList.find(c => c._id === formData.class)?.sclassName || '-'}
                                                </span>
                                            </div>
                                            <div><span className="text-muted-foreground">Section:</span> <span className="font-medium ml-2">{formData.section || '-'}</span></div>
                                            <div>
                                                <span className="text-muted-foreground">Student:</span>
                                                <span className="font-medium ml-2">
                                                    {studentsList.find(s => s._id === formData.student)?.name || '-'}
                                                </span>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Schedule & Notes */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4 rounded-lg border p-4 bg-muted/40">
                                    <h4 className="flex items-center gap-2 font-semibold text-primary">
                                        <IconClock size={18} /> Schedule
                                    </h4>
                                    <div className="space-y-2 text-sm">
                                        <div><span className="text-muted-foreground">Date:</span> <span className="font-medium">{new Date(formData.date).toLocaleDateString()}</span></div>
                                        <div><span className="text-muted-foreground">In Time:</span> <span className="font-medium">{formData.inTime}</span></div>
                                        <div><span className="text-muted-foreground">Out Time:</span> <span className="font-medium">{formData.outTime || '-'}</span></div>
                                    </div>
                                </div>
                                {formData.note && (
                                    <div className="space-y-4 rounded-lg border p-4 bg-muted/40">
                                        <h4 className="flex items-center gap-2 font-semibold text-primary">
                                            <IconFileText size={18} /> Notes
                                        </h4>
                                        <p className="text-sm">{formData.note}</p>
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
                                        <Label>Purpose *</Label>
                                        <Input 
                                            name="purpose" 
                                        value={formData.purpose} 
                                        onChange={handleChange} 
                                            placeholder="Reason for visit" 
                                            required 
                                    />
                                </div>

                                    <div className="space-y-2">
                                        <Label>Meeting With *</Label>
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
                                            <Label>Staff Member *</Label>
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
                                            <Label>Class *</Label>
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
                                            <Label>Section *</Label>
                                            <Input 
                                                name="section" 
                                            value={formData.section} 
                                            onChange={handleChange} 
                                                placeholder="Section" 
                                                required 
                                        />
                                    </div>
                                        <div className="space-y-2">
                                            <Label>Student *</Label>
                                            <Select 
                                            value={formData.student} 
                                                onValueChange={(val) => handleSelectChange('student', val)}
                                        >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select student" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {studentsList.map((student) => (
                                                    <SelectItem key={student._id} value={student._id}>{student.name}</SelectItem>
                                                ))}
                                                </SelectContent>
                                            </Select>
                                    </div>
                                        <div className="space-y-2">
                                            <Label>Visitor Name *</Label>
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
                                            <Label>Visitor Name *</Label>
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
                                        <Label>Date *</Label>
                                        <Input 
                                        name="date" 
                                            type="date" 
                                        value={formData.date} 
                                        onChange={handleChange} 
                                            required
                                    />
                                </div>
                            </div>

                                {/* Row 5 */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>In Time *</Label>
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

                <DialogFooter className="p-6 border-t bg-gray-50/50">
                    <Button variant="outline" onClick={onClose}>
                        Close
                    </Button>
                    {!viewMode && (
                        <Button type="submit" form="visitor-form">
                            {initialData ? 'Update Visitor' : 'Save Visitor'}
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

// Simple Badge component for View Mode
const Badge = ({ children }) => (
    <span className="inline-flex items-center rounded-full border border-gray-200 px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-gray-950 focus:ring-offset-2 bg-gray-100 text-gray-900">
        {children}
    </span>
);

export default VisitorModal;
