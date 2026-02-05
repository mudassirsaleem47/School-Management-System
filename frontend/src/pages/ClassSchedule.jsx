import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useModalAnimation } from '../hooks/useModalAnimation';
import { Save, Plus, X, Calendar, Clock, Loader2 } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL;

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const ClassSchedule = () => {
    const { currentUser } = useAuth();
    const { showToast } = useToast();
    
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
    
    const { isVisible, isClosing, handleClose } = useModalAnimation(showPopup, () => setShowPopup(false));

    // Fetch Classes
    useEffect(() => {
        const fetchClasses = async () => {
            try {
                if (currentUser?._id) {
                    const result = await axios.get(`${API_BASE}/Sclasses/${currentUser._id}`);
                    setClasses(result.data);
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
                    const res = await axios.get(`${API_BASE}/Teachers/${currentUser._id}`);
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
            showToast("Please select class and section", "error");
            return;
        }

        try {
            const payload = {
                sclass: selectedClass,
                section: selectedSection,
                school: currentUser._id,
                days: schedule
            };
            
            await axios.post(`${API_BASE}/ScheduleCreate`, payload);
            showToast("Schedule saved successfully!", "success");
        } catch (err) {
            showToast("Error saving schedule", "error");
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
        handleClose();
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
         <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 p-6 md:p-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Class Schedule</h1>
                    <p className="text-gray-600 mt-2">Manage weekly timetable for classes</p>
                </div>
                <button 
                    onClick={handleSaveSchedule}
                    disabled={!selectedClass || !selectedSection}
                    className="flex items-center px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 shadow-lg hover:shadow-xl transition duration-200 font-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <Save className="w-5 h-5 mr-2" /> Save Schedule
                </button>
            </div>

            {/* Selection Bar */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8 flex flex-wrap gap-6 items-end">
                <div className="flex-1 min-w-[200px]">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Select Class</label>
                    <select
                        className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                        value={selectedClass}
                        onChange={(e) => setSelectedClass(e.target.value)}
                    >
                        <option value="">-- Select Class --</option>
                        {classes.map(c => <option key={c._id} value={c._id}>{c.sclassName}</option>)}
                    </select>
                </div>
                <div className="flex-1 min-w-[200px]">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Select Section</label>
                    <select
                        className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                        value={selectedSection}
                        onChange={(e) => setSelectedSection(e.target.value)}
                        disabled={!selectedClass}
                    >
                        <option value="">-- Select Section --</option>
                        {sections.map(s => <option key={s._id} value={s._id}>{s.sectionName}</option>)}
                    </select>
                </div>
            </div>

             {/* Timetable Grid */}
             {loading ? (
                 <div className="flex justify-center py-12">
                     <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
                 </div>
             ) : (!selectedClass || !selectedSection) ? (
                 <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-300">
                     <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                     <p className="text-gray-500 text-lg">Please select a class and section to view/edit the schedule.</p>
                 </div>
             ) : (
                 <div className="space-y-6">
                     {schedule.map((dayPlan, index) => (
                         <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                             <div className="bg-indigo-50 px-6 py-3 border-b border-indigo-100 flex justify-between items-center">
                                 <h3 className="font-bold text-indigo-900">{dayPlan.day}</h3>
                                 <button 
                                    onClick={() => openAddPeriod(dayPlan.day)}
                                    className="text-indigo-600 hover:text-indigo-800 text-sm font-medium flex items-center bg-white px-3 py-1 rounded-full shadow-xs hover:shadow-sm transition"
                                >
                                     <Plus className="w-4 h-4 mr-1" /> Add Period
                                 </button>
                             </div>
                             <div className="p-4 flex flex-wrap gap-4 min-h-[100px]">
                                 {dayPlan.periods.length === 0 ? (
                                     <p className="text-gray-400 text-sm italic w-full text-center py-4">No periods scheduled</p>
                                 ) : (
                                     dayPlan.periods.map((period, pIndex) => (
                                         <div key={pIndex} className="bg-white border border-gray-200 rounded-lg p-3 w-64 shadow-xs relative group hover:border-indigo-300 transition">
                                             <button 
                                                onClick={() => removePeriod(dayPlan.day, pIndex)}
                                                className="absolute top-2 right-2 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition"
                                            >
                                                 <X className="w-4 h-4" />
                                             </button>
                                             <div className="flex items-center gap-2 mb-2 text-indigo-600 font-semibold">
                                                 <Clock className="w-4 h-4" />
                                                 <span className="text-sm">{period.startTime} - {period.endTime}</span>
                                             </div>
                                             <div className="text-gray-900 font-bold mb-1">{getSubjectName(period.subject)}</div>
                                             <div className="text-gray-500 text-sm">{getTeacherName(period.teacher)}</div>
                                         </div>
                                     ))
                                 )}
                             </div>
                         </div>
                     ))}
                 </div>
             )}

             {/* Add Period Modal */}
             {isVisible && (
                <div className={`fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 ${isClosing ? 'animate-fade-out' : 'animate-fade-in'}`}>
                    <div className={`bg-white rounded-2xl shadow-2xl w-full max-w-md relative ${isClosing ? 'animate-scale-down' : 'animate-scale-up'}`}>
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-gray-900">Add Period ({activeDay})</h2>
                            <button onClick={handleClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                                <X className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>
                        
                        <form onSubmit={handleAddPeriod} className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                                    <input 
                                        type="time" 
                                        required
                                        className="w-full p-2 border border-gray-300 rounded-lg"
                                        value={newPeriod.startTime}
                                        onChange={e => setNewPeriod({...newPeriod, startTime: e.target.value})}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                                    <input 
                                        type="time" 
                                        required
                                        className="w-full p-2 border border-gray-300 rounded-lg"
                                        value={newPeriod.endTime}
                                        onChange={e => setNewPeriod({...newPeriod, endTime: e.target.value})}
                                    />
                                </div>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                                <select 
                                    required
                                    className="w-full p-2 border border-gray-300 rounded-lg"
                                    value={newPeriod.subject}
                                    onChange={e => setNewPeriod({...newPeriod, subject: e.target.value})}
                                >
                                    <option value="">-- Select Subject --</option>
                                    {subjects.map(s => <option key={s._id} value={s._id}>{s.subName}</option>)}
                                </select>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Teacher</label>
                                <select 
                                    className="w-full p-2 border border-gray-300 rounded-lg"
                                    value={newPeriod.teacher}
                                    onChange={e => setNewPeriod({...newPeriod, teacher: e.target.value})}
                                >
                                    <option value="">-- Select Teacher (Optional) --</option>
                                    {teachers.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
                                </select>
                            </div>
                            
                            <div className="pt-4 flex justify-end gap-3">
                                <button type="button" onClick={handleClose} className="px-5 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg">Cancel</button>
                                <button type="submit" className="px-5 py-2 text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg">Add</button>
                            </div>
                        </form>
                    </div>
                </div>
             )}
         </div>
    );
};

export default ClassSchedule;
