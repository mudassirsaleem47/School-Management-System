import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';
import { Save, Plus, X, Calendar, Clock, Loader2, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Card,
    CardHeader,
    CardTitle,
    CardContent,
} from '@/components/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';

import API_URL from '@/config/api';
const API_BASE = API_URL;

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const ClassSchedule = () => {
    const { currentUser } = useAuth();
    
    // State
    const [classes, setClasses] = useState([]);
    const [selectedClass, setSelectedClass] = useState("");
    const [selectedSection, setSelectedSection] = useState("");
    const [sections, setSections] = useState([]);
    
    const [schedule, setSchedule] = useState([]); // Array of days with periods
    const [loading, setLoading] = useState(false);
    
    const [subjects, setSubjects] = useState([]);
    const [teachers, setTeachers] = useState([]);

    // Period Modal
    const [showPopup, setShowPopup] = useState(false);
    const [activeDay, setActiveDay] = useState("");
    const [newPeriod, setNewPeriod] = useState({
        subject: "",
        teacher: "",
        startTime: "09:00",
        endTime: "10:00"
    });

    // Fetch Classes
    useEffect(() => {
        const fetchClasses = async () => {
            try {
                if (currentUser?._id) {
                    const schoolId = currentUser.school?._id || currentUser.school || currentUser._id;
                    const result = await axios.get(`${API_BASE}/Sclasses/${schoolId}`);
                    
                    let fetchedClasses = Array.isArray(result.data) ? result.data : [];
                    
                    // If teacher, filter classes to only show assigned ones
                    if (currentUser.userType === 'teacher' && currentUser.assignedClasses) {
                        const assignedClassIds = currentUser.assignedClasses.map(c => c._id || c);
                        fetchedClasses = fetchedClasses.filter(c => assignedClassIds.includes(c._id));
                    }
                    
                    setClasses(fetchedClasses);
                }
            } catch (err) {
                console.error("Error fetching classes:", err);
            }
        };
        fetchClasses();
        
        // Fetch Teachers for dropdown
        const fetchTeachers = async () => {
             if (currentUser?._id) {
                try {
                    const schoolId = currentUser.school?._id || currentUser.school || currentUser._id;
                    const res = await axios.get(`${API_BASE}/Teachers/${schoolId}`);
                    setTeachers(Array.isArray(res.data) ? res.data : []);
                } catch(err) { console.error(err); }
             }
        };
        fetchTeachers();

    }, [currentUser]);

    // Handle Class Selection
    useEffect(() => {
        if (selectedClass) {
            const cls = classes.find(c => c._id === selectedClass);
            setSections(cls ? cls.sections : []);
            setSelectedSection("");
            // Fetch subjects for this class
            const fetchSubjects = async () => {
                try {
                    const res = await axios.get(`${API_BASE}/ClassSubjects/${selectedClass}`);
                    setSubjects(Array.isArray(res.data) ? res.data : []);
                } catch(err) { setSubjects([]); }
            };
            fetchSubjects();
        } else {
            setSections([]);
            setSubjects([]);
        }
    }, [selectedClass, classes]);

    // Fetch Schedule
    useEffect(() => {
        const fetchSchedule = async () => {
            if (!selectedClass || !selectedSection || !currentUser) return;
            
            setLoading(true);
            try {
                const res = await axios.get(`${API_BASE}/Schedule/${selectedClass}/${selectedSection}`);
                if (res.data && res.data.days) {
                    setSchedule(res.data.days);
                } else {
                    // Initialize empty structure
                    setSchedule(DAYS.map(day => ({ day, periods: [] })));
                }
            } catch (err) {
                // Not found or error, set empty
                setSchedule(DAYS.map(day => ({ day, periods: [] })));
            } finally {
                setLoading(false);
            }
        };
        fetchSchedule();
    }, [selectedClass, selectedSection, currentUser]);

    const handleSaveSchedule = async () => {
        if (!selectedClass || !selectedSection) {
            toast.error("Please select class and section");
            return;
        }

        try {
            const schoolId = currentUser.school?._id || currentUser.school || currentUser._id;
            const payload = {
                sclass: selectedClass,
                section: selectedSection,
                school: schoolId,
                days: schedule
            };
            
            await axios.post(`${API_BASE}/ScheduleCreate`, payload);
            toast.success("Schedule saved successfully!");
        } catch (err) {
            toast.error("Error saving schedule");
        }
    };

    const openAddPeriod = (day) => {
        setActiveDay(day);
        setNewPeriod({ subject: "", teacher: "", startTime: "09:00", endTime: "10:00" });
        setShowPopup(true);
    };

    const handleAddPeriod = (e) => {
        e.preventDefault();
        
        const updatedSchedule = schedule.map(d => {
            if (d.day === activeDay) {
                return {
                    ...d,
                    periods: [...d.periods, { ...newPeriod }]
                };
            }
            return d;
        });
        
        setSchedule(updatedSchedule);
        setShowPopup(false);
    };

    const removePeriod = (day, index) => {
        const updatedSchedule = schedule.map(d => {
            if (d.day === day) {
                const newPeriods = [...d.periods];
                newPeriods.splice(index, 1);
                return { ...d, periods: newPeriods };
            }
            return d;
        });
        setSchedule(updatedSchedule);
    };

    // Helper to get Subject Name
    const getSubjectName = (id) => {
        if(id && typeof id === 'object') return id.subName || "Unknown"; // populated
        const sub = subjects.find(s => s._id === id);
        return sub ? sub.subName : "Unknown Subject";
    };

    const getTeacherName = (id) => {
        if(id && typeof id === 'object') return id.name || "Unknown";
        const t = teachers.find(t => t._id === id);
        return t ? t.name : "Unknown Teacher";
    };

    return (
        <div className="flex-1 space-y-6 p-8 pt-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Class Schedule</h2>
                    <p className="text-muted-foreground mt-2">Manage weekly timetable for classes</p>
                </div>
                <Button 
                    onClick={handleSaveSchedule}
                    disabled={!selectedClass || !selectedSection}
                    size="lg"
                    className="gap-2"
                >
                    <Save className="w-4 h-4" /> Save Schedule
                </Button>
            </div>

            {/* Selection Bar */}
            <Card>
                <CardContent className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label>Select Class</Label>
                            <Select value={selectedClass} onValueChange={setSelectedClass}>
                                <SelectTrigger>
                                    <SelectValue placeholder="-- Select Class --" />
                                </SelectTrigger>
                                <SelectContent>
                                    {classes.map(c => <SelectItem key={c._id} value={c._id}>{c.sclassName}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Select Section</Label>
                            <Select
                                value={selectedSection} 
                                onValueChange={setSelectedSection}
                                disabled={!selectedClass}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="-- Select Section --" />
                                </SelectTrigger>
                                <SelectContent>
                                    {sections.map(s => <SelectItem key={s._id} value={s._id}>{s.sectionName}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardContent>
            </Card>

             {/* Timetable Grid */}
             {loading ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="w-10 h-10 animate-spin text-primary" />
                 </div>
             ) : (!selectedClass || !selectedSection) ? (
                    <div className="flex flex-col items-center justify-center py-20 border rounded-xl bg-muted/10 border-dashed text-center">
                        <Calendar className="w-16 h-16 text-muted-foreground/50 mb-4" />
                        <h3 className="text-xl font-medium">No Schedule Selected</h3>
                        <p className="text-muted-foreground mt-2">Please select a class and section to view or edit the schedule.</p>
                 </div>
             ) : (
                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                     {schedule.map((dayPlan, index) => (
                         <Card key={index} className="overflow-hidden">
                             <CardHeader className="bg-muted/30 pb-3 border-b flex flex-row items-center justify-between space-y-0">
                                 <CardTitle className="text-base font-semibold text-primary">{dayPlan.day}</CardTitle>
                                 <Button
                                     variant="outline"
                                     size="sm"
                                     className="h-8 gap-1 bg-background"
                                     onClick={() => openAddPeriod(dayPlan.day)}
                                >
                                     <Plus className="w-3.5 h-3.5" /> Add Period
                                 </Button>
                             </CardHeader>
                             <CardContent className="p-4 min-h-[120px]">
                                 <div className="flex flex-wrap gap-3">
                                     {dayPlan.periods.length === 0 ? (
                                         <div className="flex flex-col items-center justify-center w-full py-6 text-muted-foreground border border-dashed rounded-lg bg-muted/5">
                                             <Clock className="w-8 h-8 opacity-20 mb-2" />
                                             <span className="text-sm">No periods scheduled</span>
                                         </div>
                                     ) : (
                                         dayPlan.periods.map((period, pIndex) => (
                                             <div key={pIndex} className="relative group bg-card border rounded-lg p-3 w-56 shadow-sm hover:shadow-md hover:border-primary/30 transition-all">
                                                 <button
                                                     onClick={() => removePeriod(dayPlan.day, pIndex)}
                                                     className="absolute top-2 right-2 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                                                 >
                                                     <X className="w-3.5 h-3.5" />
                                                 </button>
                                                 <Badge variant="secondary" className="mb-2 font-mono text-xs">
                                                     {period.startTime} - {period.endTime}
                                                 </Badge>
                                                 <div className="font-bold text-sm line-clamp-1">{getSubjectName(period.subject)}</div>
                                                 <div className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                                                     <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                                                     {getTeacherName(period.teacher)}
                                                 </div>
                                             </div>
                                         ))
                                     )}
                                 </div>
                             </CardContent>
                         </Card>
                     ))}
                 </div>
             )}

             {/* Add Period Modal */}
            <Dialog open={showPopup} onOpenChange={setShowPopup}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add Period ({activeDay})</DialogTitle>
                    </DialogHeader>

                    <form onSubmit={handleAddPeriod} className="space-y-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Start Time</Label>
                                <Input
                                    type="time"
                                    required
                                    value={newPeriod.startTime}
                                    onChange={e => setNewPeriod({ ...newPeriod, startTime: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>End Time</Label>
                                <Input
                                    type="time"
                                    required
                                    value={newPeriod.endTime}
                                    onChange={e => setNewPeriod({ ...newPeriod, endTime: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Subject</Label>
                            <Select
                                value={newPeriod.subject} 
                                onValueChange={(val) => setNewPeriod({ ...newPeriod, subject: val })}
                                required
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="-- Select Subject --" />
                                </SelectTrigger>
                                <SelectContent>
                                    {subjects.map(s => <SelectItem key={s._id} value={s._id}>{s.subName}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>Teacher (Optional)</Label>
                            <Select
                                value={newPeriod.teacher} 
                                onValueChange={(val) => setNewPeriod({ ...newPeriod, teacher: val })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="-- Select Teacher --" />
                                </SelectTrigger>
                                <SelectContent>
                                    {teachers.map(t => <SelectItem key={t._id} value={t._id}>{t.name}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setShowPopup(false)}>Cancel</Button>
                            <Button type="submit">Add Period</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
         </div>
    );
};

export default ClassSchedule;
