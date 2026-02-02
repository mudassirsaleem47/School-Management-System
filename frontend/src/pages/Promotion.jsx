import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { ArrowRight, CheckSquare, Square, Users, Loader2 } from 'lucide-react';

const API_BASE = "http://localhost:5000";

const Promotion = () => {
    const { currentUser } = useAuth();
    const { showToast } = useToast();
    
    const [classes, setClasses] = useState([]);
    const [sourceClass, setSourceClass] = useState("");
    const [targetClass, setTargetClass] = useState("");
    
    const [students, setStudents] = useState([]);
    const [selectedStudents, setSelectedStudents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [promoting, setPromoting] = useState(false);

    // Fetch Classes
    useEffect(() => {
        const fetchClasses = async () => {
            try {
                if (currentUser?._id) {
                    const result = await axios.get(`${API_BASE}/Sclasses/${currentUser._id}`);
                    setClasses(result.data);
                }
            } catch (err) {
                console.error(err);
            }
        };
        fetchClasses();
    }, [currentUser]);

    // Fetch Students when Source Class changes
    useEffect(() => {
        const fetchStudents = async () => {
            if (!sourceClass) {
                setStudents([]);
                return;
            }
            setLoading(true);
            try {
                // We need to fetch students for specific class, but API is getStudentsBySchool.
                // We will fetch all and filter, or ideally backend should support class filter.
                // Current backend: getStudentsBySchool returns all attached to school.
                // We'll filter client-side for now as per existing patterns unless I added a filter (I didn't).
                const res = await axios.get(`${API_BASE}/Students/${currentUser._id}`);
                const allStudents = Array.isArray(res.data) ? res.data : [];
                const classStudents = allStudents.filter(s => s.sclassName?._id === sourceClass);
                setStudents(classStudents);
                setSelectedStudents([]); // Reset selection
            } catch (err) {
                console.error(err);
                setStudents([]);
            } finally {
                setLoading(false);
            }
        };
        fetchStudents();
    }, [sourceClass, currentUser]);

    const toggleSelectAll = () => {
        if (selectedStudents.length === students.length) {
            setSelectedStudents([]);
        } else {
            setSelectedStudents(students.map(s => s._id));
        }
    };

    const toggleStudent = (id) => {
        if (selectedStudents.includes(id)) {
            setSelectedStudents(selectedStudents.filter(sid => sid !== id));
        } else {
            setSelectedStudents([...selectedStudents, id]);
        }
    };

    const handlePromote = async () => {
        if (!sourceClass || !targetClass) {
            showToast("Please select both source and target classes", "error");
            return;
        }
        if (sourceClass === targetClass) {
            showToast("Source and Target classes cannot be the same", "error");
            return;
        }
        if (selectedStudents.length === 0) {
            showToast("Please select students to promote", "error");
            return;
        }

        if(!window.confirm(`Are you sure you want to promote ${selectedStudents.length} students to the next class?`)) return;

        setPromoting(true);
        try {
            await axios.put(`${API_BASE}/Students/Promote`, {
                studentIds: selectedStudents,
                nextClassId: targetClass
            });
            showToast("Students promoted successfully!", "success");
            
            // Refresh list
            const remaining = students.filter(s => !selectedStudents.includes(s._id));
            setStudents(remaining);
            setSelectedStudents([]);
        } catch (err) {
            showToast("Error promoting students", "error");
        } finally {
            setPromoting(false);
        }
    };

    return (
         <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 p-6 md:p-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Promote Students</h1>
                <p className="text-gray-600 mt-2">Move students from one class to another</p>
            </div>

            {/* Config Panel */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
                <div className="flex flex-col md:flex-row items-end gap-6">
                    <div className="flex-1 w-full">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Current Class</label>
                        <select
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                            value={sourceClass}
                            onChange={(e) => setSourceClass(e.target.value)}
                        >
                            <option value="">-- Select Source Class --</option>
                            {classes.map(c => <option key={c._id} value={c._id}>{c.sclassName}</option>)}
                        </select>
                    </div>
                    
                    <div className="hidden md:flex items-center justify-center p-2 text-gray-400">
                        <ArrowRight className="w-8 h-8" />
                    </div>
                    
                    <div className="flex-1 w-full">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Promote To</label>
                        <select
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                            value={targetClass}
                            onChange={(e) => setTargetClass(e.target.value)}
                            disabled={!sourceClass}
                        >
                            <option value="">-- Select Target Class --</option>
                            {classes.map(c => (
                                <option key={c._id} value={c._id} disabled={c._id === sourceClass}>
                                    {c.sclassName}
                                </option>
                            ))}
                        </select>
                    </div>

                    <button 
                        onClick={handlePromote}
                        disabled={!sourceClass || !targetClass || selectedStudents.length === 0 || promoting}
                        className="px-8 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 shadow-lg hover:shadow-xl transition duration-200 font-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                    >
                        {promoting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Promote"}
                    </button>
                </div>
            </div>

            {/* Students List */}
            {sourceClass && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                        <div className="flex items-center gap-2">
                             <Users className="w-5 h-5 text-gray-500" />
                             <h3 className="font-semibold text-gray-800">Students ({students.length})</h3>
                        </div>
                        <div className="text-sm text-gray-500">
                            {selectedStudents.length} selected
                        </div>
                    </div>
                    
                    {loading ? (
                        <div className="flex justify-center py-12">
                            <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
                        </div>
                    ) : students.length === 0 ? (
                        <div className="p-8 text-center text-gray-500 italic">No students found in this class</div>
                    ) : (
                        <div>
                            <div className="p-3 border-b border-gray-100 flex items-center bg-gray-50/50">
                                <button onClick={toggleSelectAll} className="flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-800 ml-3">
                                    {selectedStudents.length === students.length ? <CheckSquare className="w-5 h-5 mr-2" /> : <Square className="w-5 h-5 mr-2" />}
                                    Select All
                                </button>
                            </div>
                            <div className="divide-y divide-gray-100">
                                {students.map((student) => (
                                    <div 
                                        key={student._id} 
                                        className={`flex items-center p-4 hover:bg-indigo-50 transition cursor-pointer ${selectedStudents.includes(student._id) ? 'bg-indigo-50/50' : ''}`}
                                        onClick={() => toggleStudent(student._id)}
                                    >
                                        <div className="text-indigo-600 mr-4">
                                            {selectedStudents.includes(student._id) ? <CheckSquare className="w-5 h-5" /> : <Square className="w-5 h-5 text-gray-300" />}
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-900">{student.name}</p>
                                            <p className="text-sm text-gray-500">Roll: {student.rollNum}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
         </div>
    );
};

export default Promotion;
