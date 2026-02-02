import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Calendar, Loader2 } from 'lucide-react';

const API_BASE = "http://localhost:5000";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const TeacherSchedule = () => {
    const { currentUser } = useAuth();
    
    const [teachers, setTeachers] = useState([]);
    const [selectedTeacher, setSelectedTeacher] = useState("");
    const [schedule, setSchedule] = useState([]); // Array of days with periods
    const [loading, setLoading] = useState(false);

    // Fetch Teachers
    useEffect(() => {
        const fetchTeachers = async () => {
             if (currentUser?._id) {
                try {
                    const res = await axios.get(`${API_BASE}/Teachers/${currentUser._id}`);
                    setTeachers(Array.isArray(res.data) ? res.data : []);
                } catch(err) { console.error(err); }
             }
        };
        fetchTeachers();
    }, [currentUser]);

    // Fetch Schedule
    useEffect(() => {
        const fetchSchedule = async () => {
            if (!selectedTeacher) return;
            
            setLoading(true);
            try {
                const res = await axios.get(`${API_BASE}/TeacherSchedule/${selectedTeacher}`);
                const rawSchedules = Array.isArray(res.data) ? res.data : [];
                
                // Process raw schedules into a weekly format for the teacher
                // rawSchedules contains multiple class schedules where this teacher appears
                const weeklySchedule = DAYS.map(day => ({ day, periods: [] }));

                rawSchedules.forEach(classSched => {
                    const className = classSched.sclass?.sclassName || "Unknown Class";
                    classSched.days.forEach(dayPlan => {
                        const dayIndex = weeklySchedule.findIndex(d => d.day === dayPlan.day);
                        if (dayIndex !== -1) {
                            dayPlan.periods.forEach(p => {
                                if (p.teacher === selectedTeacher) {
                                    weeklySchedule[dayIndex].periods.push({
                                        ...p,
                                        className,
                                        sectionId: classSched.section // Store section ID if we had name
                                    });
                                }
                            });
                        }
                    });
                });

                // Sort periods by time (simple string sort works for HH:MM usually)
                weeklySchedule.forEach(day => {
                   day.periods.sort((a, b) => a.startTime.localeCompare(b.startTime));
                });

                setSchedule(weeklySchedule);

            } catch (err) {
                console.error(err);
                setSchedule(DAYS.map(day => ({ day, periods: [] })));
            } finally {
                setLoading(false);
            }
        };
        fetchSchedule();
    }, [selectedTeacher]);

    return (
         <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 p-6 md:p-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Teacher Schedule</h1>
                    <p className="text-gray-600 mt-2">View weekly timetable for teachers</p>
                </div>
            </div>

            {/* Selection Bar */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Teacher</label>
                <select
                    className="w-full md:w-1/3 p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={selectedTeacher}
                    onChange={(e) => setSelectedTeacher(e.target.value)}
                >
                    <option value="">-- Select Teacher --</option>
                    {teachers.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
                </select>
            </div>

             {/* Timetable Grid */}
             {loading ? (
                 <div className="flex justify-center py-12">
                     <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
                 </div>
             ) : (!selectedTeacher) ? (
                 <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-300">
                     <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                     <p className="text-gray-500 text-lg">Please select a teacher to view their schedule.</p>
                 </div>
             ) : (
                 <div className="space-y-6">
                     {schedule.map((dayPlan, index) => (
                         <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                             <div className="bg-emerald-50 px-6 py-3 border-b border-emerald-100">
                                 <h3 className="font-bold text-emerald-900">{dayPlan.day}</h3>
                             </div>
                             <div className="p-4 flex flex-wrap gap-4 min-h-[40px]">
                                 {dayPlan.periods.length === 0 ? (
                                     <p className="text-gray-400 text-sm italic">No classes scheduled</p>
                                 ) : (
                                     dayPlan.periods.map((period, pIndex) => (
                                         <div key={pIndex} className="bg-white border border-gray-200 rounded-lg p-3 w-64 shadow-xs relative hover:border-emerald-300 transition">
                                             <div className="flex items-center gap-2 mb-2 text-emerald-600 font-semibold bg-emerald-50 inline-block px-2 rounded text-sm">
                                                 {period.startTime} - {period.endTime}
                                             </div>
                                             <div className="text-gray-900 font-bold mb-1">{period.subject?.subName || "Subject"}</div>
                                             <div className="text-gray-500 text-sm">Class: <span className="font-medium text-gray-800">{period.className}</span></div>
                                         </div>
                                     ))
                                 )}
                             </div>
                         </div>
                     ))}
                 </div>
             )}
         </div>
    );
};

export default TeacherSchedule;
