import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

const SyllabusStatus = () => {
    const { currentUser } = useAuth();
    const API_BASE = import.meta.env.VITE_API_URL;

    // Filters
    const [classes, setClasses] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [selectedClass, setSelectedClass] = useState('');
    const [selectedSubject, setSelectedSubject] = useState('');

    // Data
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (currentUser) {
            fetchClasses();
        }
    }, [currentUser]);

    const fetchClasses = async () => {
        try {
            const res = await axios.get(`${API_BASE}/Sclasses/${currentUser._id}`);
            setClasses(res.data);
        } catch (err) { }
    };

    useEffect(() => {
        if (selectedClass) {
            fetchSubjects(selectedClass);
        } else {
            setSubjects([]);
        }
    }, [selectedClass]);

    const fetchSubjects = async (classId) => {
        try {
            const res = await axios.get(`${API_BASE}/AllSubjects/${currentUser._id}`);
            setSubjects(res.data);
        } catch (err) { }
    };

    useEffect(() => {
        if (selectedClass && selectedSubject) {
            fetchSyllabusStats();
        }
    }, [selectedClass, selectedSubject]);

    const fetchSyllabusStats = async () => {
        try {
            setLoading(true);
            // We need to fetch ALL lessons for this class/subject and compare with COMPLETED plans
            // This is a bit complex. Let's simplify:
            // 1. Get all TOPICS for class/subject (Total Syllabus)
            // 2. Get all COMPLETED PLANS for class/subject (Completed Syllabus)
            
            // Fetch Lessons first to get all topics
            const lessonRes = await axios.post(`${API_BASE}/LessonPlan/Lesson/List`, {
                school: currentUser._id,
                sclass: selectedClass,
                subject: selectedSubject
            });
            
            let totalTopics = 0;
            const topicIds = [];
            
            // For each lesson, fetch topics (or if we had a better endpoint, get all topics by subject)
             // Optimization: Add an endpoint to get topic count or list by subject/class directly
            // For now, iterate
            for (const lesson of lessonRes.data) {
                const topicRes = await axios.get(`${API_BASE}/LessonPlan/Topic/${lesson._id}`);
                totalTopics += topicRes.data.length;
                topicRes.data.forEach(t => topicIds.push(t._id));
            }

            // Fetch Plans
            const planRes = await axios.post(`${API_BASE}/LessonPlan/Plan/List`, {
                school: currentUser._id,
                sclass: selectedClass,
                subject: selectedSubject
            });
            
            // Count completed unique topics
            const completedPlans = planRes.data.filter(p => p.status === 'Completed' && topicIds.includes(p.topic?._id));
            // Use Set to ensure unique topics counted
            const completedTopicIds = new Set(completedPlans.map(p => p.topic?._id));
            const completedCount = completedTopicIds.size;

            setStats({
                total: totalTopics,
                completed: completedCount,
                percentage: totalTopics > 0 ? Math.round((completedCount / totalTopics) * 100) : 0
            });

        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Syllabus Tracker</CardTitle>
                    <CardDescription>View completion status by subject.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex gap-4 mb-6">
                        <div className="w-full md:w-1/3">
                            <label className="text-sm font-medium mb-1.5 block">Select Class</label>
                            <Select value={selectedClass} onValueChange={setSelectedClass}>
                                <SelectTrigger><SelectValue placeholder="Class" /></SelectTrigger>
                                <SelectContent>
                                    {classes.map(c => <SelectItem key={c._id} value={c._id}>{c.sclassName}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="w-full md:w-1/3">
                            <label className="text-sm font-medium mb-1.5 block">Select Subject</label>
                            <Select value={selectedSubject} onValueChange={setSelectedSubject} disabled={!selectedClass}>
                                <SelectTrigger><SelectValue placeholder="Subject" /></SelectTrigger>
                                <SelectContent>
                                    {subjects.map(s => <SelectItem key={s._id} value={s._id}>{s.subName}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {!selectedClass || !selectedSubject ? (
                         <div className="text-center p-12 bg-muted/20 rounded-xl border-2 border-dashed">
                             <p className="text-muted-foreground">Select Class and Subject to view status.</p>
                         </div>
                    ) : loading ? (
                        <div className="flex justify-center p-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
                    ) : stats ? (
                        <div className="grid gap-6 md:grid-cols-2">
                            <div className="p-6 border rounded-xl bg-card shadow-sm flex flex-col items-center justify-center text-center space-y-4">
                                <div className="relative h-32 w-32 flex items-center justify-center rounded-full border-8 border-muted">
                                    <div className="absolute inset-0 flex items-center justify-center font-bold text-3xl">
                                        {stats.percentage}%
                                    </div>
                                    <svg className="absolute inset-0 h-full w-full -rotate-90" viewBox="0 0 100 100">
                                        <circle
                                            className="text-primary stroke-current"
                                            strokeWidth="8"
                                            fill="transparent"
                                            r="46"
                                            cx="50"
                                            cy="50"
                                            strokeDasharray={`${stats.percentage * 2.89} 289`}
                                            strokeLinecap="round"
                                        />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-lg">Overall Completion</h3>
                                    <p className="text-sm text-muted-foreground">Based on covered topics</p>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="font-medium">Total Topics</span>
                                        <span className="font-bold">{stats.total}</span>
                                    </div>
                                    <Progress value={100} className="h-2 bg-muted" />
                                </div>
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="font-medium text-green-600">Completed Topics</span>
                                        <span className="font-bold text-green-600">{stats.completed}</span>
                                    </div>
                                    <Progress value={stats.percentage} className="h-2 bg-green-100 [&>div]:bg-green-600" />
                                </div>
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="font-medium text-red-500">Pending Topics</span>
                                        <span className="font-bold text-red-500">{stats.total - stats.completed}</span>
                                    </div>
                                    <Progress value={100 - stats.percentage} className="h-2 bg-red-100 [&>div]:bg-red-500" />
                                </div>
                            </div>
                        </div>
                    ) : null}
                </CardContent>
            </Card>
        </div>
    );
};

export default SyllabusStatus;
