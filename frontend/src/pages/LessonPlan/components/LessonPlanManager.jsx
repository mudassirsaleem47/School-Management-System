import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, Calendar, CheckSquare, XSquare, Clock, Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarUI } from '@/components/ui/calendar';
import { format } from 'date-fns';

const LessonPlanManager = () => {
    const { currentUser } = useAuth();
    const { showToast } = useToast();
    const API_BASE = import.meta.env.VITE_API_URL;

    // Filters & Selection
    const [classes, setClasses] = useState([]);
    const [teachers, setTeachers] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [lessons, setLessons] = useState([]);
    const [topics, setTopics] = useState([]);
    
    const [selectedClass, setSelectedClass] = useState('');
    const [selectedTeacher, setSelectedTeacher] = useState('');
    const [selectedSubject, setSelectedSubject] = useState('');
    const [selectedLesson, setSelectedLesson] = useState('');
    const [selectedTopic, setSelectedTopic] = useState('');
    const [selectedDate, setSelectedDate] = useState(new Date());
    
    // Data State
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(false);
    const [adding, setAdding] = useState(false);

    useEffect(() => {
        if (currentUser) {
            fetchClasses();
            fetchTeachers();
        }
    }, [currentUser]);

    const fetchClasses = async () => {
        try {
            const res = await axios.get(`${API_BASE}/Sclasses/${currentUser._id}`);
            setClasses(res.data);
        } catch (err) { }
    };

    const fetchTeachers = async () => {
        try {
            const res = await axios.get(`${API_BASE}/Teachers/${currentUser._id}`);
            setTeachers(res.data);
        } catch (err) { }
    };

    // Cascading Selects
    useEffect(() => {
        if (selectedClass) fetchSubjects(selectedClass);
        else setSubjects([]);
    }, [selectedClass]);

    useEffect(() => {
        if (selectedClass && selectedSubject) fetchLessons(selectedClass, selectedSubject);
        else setLessons([]);
    }, [selectedClass, selectedSubject]);

    useEffect(() => {
        if (selectedLesson) fetchTopics(selectedLesson);
        else setTopics([]);
    }, [selectedLesson]);

    // Data Loaders
    const fetchSubjects = async (classId) => {
        try {
             const res = await axios.get(`${API_BASE}/AllSubjects/${currentUser._id}`);
             setSubjects(res.data);
        } catch (err) { }
    };

    const fetchLessons = async (classId, subjectId) => {
        try {
            const res = await axios.post(`${API_BASE}/LessonPlan/Lesson/List`, {
                school: currentUser._id,
                sclass: classId,
                subject: subjectId
            });
            setLessons(res.data);
        } catch (err) { }
    };

    const fetchTopics = async (lessonId) => {
        try {
            const res = await axios.get(`${API_BASE}/LessonPlan/Topic/${lessonId}`);
            setTopics(res.data);
        } catch (err) { }
    };

    const fetchPlans = async () => {
        try {
            setLoading(true);
            const res = await axios.post(`${API_BASE}/LessonPlan/Plan/List`, {
                school: currentUser._id,
                teacher: selectedTeacher || undefined,
                sclass: selectedClass || undefined,
                subject: selectedSubject || undefined,
                // Add date range logic if needed, currently fetching all matching
                // dateFrom: ... 
            });
            setPlans(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // CRUD
    const handleAddPlan = async () => {
        if (!selectedClass || !selectedSubject || !selectedLesson || !selectedTopic || !selectedTeacher || !selectedDate) {
            showToast('Please fill all fields', 'error');
            return;
        }

        try {
            setAdding(true);
            const payload = {
                school: currentUser._id,
                teacher: selectedTeacher,
                sclass: selectedClass,
                subject: selectedSubject,
                lesson: selectedLesson,
                topic: selectedTopic,
                date: selectedDate,
                status: 'Pending'
            };
            await axios.post(`${API_BASE}/LessonPlan/Plan`, payload);
            showToast('Lesson plan added', 'success');
            fetchPlans();
        } catch (err) {
            showToast('Failed to add plan', 'error');
        } finally {
            setAdding(false);
        }
    };

    const handleStatusUpdate = async (id, status) => {
        try {
            await axios.put(`${API_BASE}/LessonPlan/Plan/${id}`, { 
                status, 
                completionDate: status === 'Completed' ? new Date() : null 
            });
            showToast('Status updated', 'success');
            setPlans(plans.map(p => p._id === id ? { ...p, status } : p));
        } catch (err) {
            showToast('Failed to update status', 'error');
        }
    };

    return (
        <div className="grid gap-6 md:grid-cols-3">
            {/* Planning Form */}
            <Card className="md:col-span-1 h-fit">
                <CardHeader>
                    <CardTitle>Schedule a Lesson</CardTitle>
                    <CardDescription>Plan when a topic will be taught.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Select Class</label>
                        <Select value={selectedClass} onValueChange={setSelectedClass}>
                            <SelectTrigger><SelectValue placeholder="Class" /></SelectTrigger>
                            <SelectContent>
                                {classes.map(c => <SelectItem key={c._id} value={c._id}>{c.sclassName}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                    
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Select Teacher</label>
                        <Select value={selectedTeacher} onValueChange={setSelectedTeacher}>
                            <SelectTrigger><SelectValue placeholder="Teacher" /></SelectTrigger>
                            <SelectContent>
                                {teachers.map(t => <SelectItem key={t._id} value={t._id}>{t.name}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Select Subject</label>
                        <Select value={selectedSubject} onValueChange={setSelectedSubject} disabled={!selectedClass}>
                            <SelectTrigger><SelectValue placeholder="Subject" /></SelectTrigger>
                            <SelectContent>
                                {subjects.map(s => <SelectItem key={s._id} value={s._id}>{s.subName}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Select Lesson</label>
                        <Select value={selectedLesson} onValueChange={setSelectedLesson} disabled={!selectedSubject}>
                            <SelectTrigger><SelectValue placeholder="Lesson" /></SelectTrigger>
                            <SelectContent>
                                {lessons.map(l => <SelectItem key={l._id} value={l._id}>{l.title}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Select Topic</label>
                        <Select value={selectedTopic} onValueChange={setSelectedTopic} disabled={!selectedLesson}>
                            <SelectTrigger><SelectValue placeholder="Topic" /></SelectTrigger>
                            <SelectContent>
                                {topics.map(t => <SelectItem key={t._id} value={t._id}>{t.title}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Planned Date</label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button variant="outline" className="w-full justify-start text-left font-normal">
                                    <Calendar className="mr-2 h-4 w-4" />
                                    {selectedDate ? format(selectedDate, 'PPP') : <span>Pick a date</span>}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                                <CalendarUI
                                    mode="single"
                                    selected={selectedDate}
                                    onSelect={setSelectedDate}
                                    initialFocus
                                />
                            </PopoverContent>
                        </Popover>
                    </div>

                    <Button onClick={handleAddPlan} className="w-full" disabled={adding}>
                        {adding ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
                        Add to Schedule
                    </Button>
                </CardContent>
            </Card>

            {/* Schedule / Plan List */}
            <Card className="md:col-span-2">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Planned Schedule</CardTitle>
                            <CardDescription>Upcoming lessons and syllabus status.</CardDescription>
                        </div>
                        <Button variant="outline" size="sm" onClick={fetchPlans}>
                            Refresh List
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex justify-center p-8"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
                    ) : plans.length === 0 ? (
                        <div className="text-center p-8 text-muted-foreground border-2 border-dashed rounded-xl">
                            No plans found. Use filters or add new plans.
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Class/Subject</TableHead>
                                    <TableHead>Teacher</TableHead>
                                    <TableHead>Topic</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {plans.map(plan => (
                                    <TableRow key={plan._id}>
                                        <TableCell className="font-medium text-xs">
                                            {format(new Date(plan.date), 'dd MMM yyyy')}
                                        </TableCell>
                                        <TableCell>
                                            <div className="text-sm font-semibold">{plan.sclass?.sclassName}</div>
                                            <div className="text-xs text-muted-foreground">{plan.subject?.subName}</div>
                                        </TableCell>
                                        <TableCell className="text-xs text-muted-foreground">
                                            {plan.teacher?.name}
                                        </TableCell>
                                        <TableCell>
                                            <div className="text-sm font-medium">{plan.topic?.title}</div>
                                            <div className="text-xs text-muted-foreground">{plan.lesson?.title}</div>
                                        </TableCell>
                                        <TableCell>
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium 
                                                ${plan.status === 'Completed' ? 'bg-green-100 text-green-800' : 
                                                  plan.status === 'In Progress' ? 'bg-blue-100 text-blue-800' : 
                                                  'bg-yellow-100 text-yellow-800'}`}>
                                                {plan.status}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {plan.status !== 'Completed' && (
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-green-600" onClick={() => handleStatusUpdate(plan._id, 'Completed')}>
                                                    <CheckSquare className="h-4 w-4" />
                                                </Button>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default LessonPlanManager;
