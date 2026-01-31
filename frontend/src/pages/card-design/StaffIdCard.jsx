import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useReactToPrint } from 'react-to-print';
import { Printer, Loader2, Search, Filter, Briefcase, Building2 } from 'lucide-react';
import API_URL from '../../config/api';

const StaffIdCard = () => {
    const [loading, setLoading] = useState(false);
    const [staffType, setStaffType] = useState('all');
    const [staffList, setStaffList] = useState([]);
    const [schoolInfo, setSchoolInfo] = useState(null);
    
    const user = JSON.parse(localStorage.getItem('currentUser'));
    const schoolId = user?.schoolName ? user._id : user?.school; 

    const componentRef = useRef();

    const fetchStaff = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${API_URL}/Card/Staff/${schoolId}/${staffType}`);
            setSchoolInfo(response.data.school);
            setStaffList(response.data.staffList);
        } catch (error) {
            console.error("Error fetching staff:", error);
        } finally {
            setLoading(false);
        }
    };

    const handlePrint = useReactToPrint({
        content: () => componentRef.current,
        documentTitle: `Staff_ID_Cards`,
    });

    return (
        <div className="min-h-screen bg-gray-50/50 pb-12">
            {/* Header */}
            <div className="bg-white rounded-xl shadow-md sticky top-4 z-10">
                <div className="mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between py-4 gap-4">
                        <div className="flex items-center gap-3">
                            <div className="bg-emerald-100 p-2.5 rounded-lg">
                                <Briefcase className="w-6 h-6 text-emerald-600" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-gray-900">Staff ID Cards</h1>
                                <p className="text-sm text-gray-500">Generate IDs for teaching and non-teaching staff</p>
                            </div>
                        </div>

                        {/* Toolbar */}
                        <div className="flex items-center gap-3 bg-gray-50 p-1.5 rounded-lg border border-gray-200">
                            <div className="relative">
                                <Filter className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                                <select 
                                    value={staffType} 
                                    onChange={(e) => setStaffType(e.target.value)}
                                    className="pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-md text-sm focus:ring-2 focus:ring-emerald-500 outline-none w-48 shadow-sm"
                                >
                                    <option value="all">All Staff</option>
                                    <option value="teacher">Teachers</option>
                                    <option value="staff">Non-Teaching Staff</option>
                                </select>
                            </div>

                            <button 
                                onClick={fetchStaff}
                                disabled={loading}
                                className="bg-emerald-600 text-white px-4 py-2 rounded-md hover:bg-emerald-700 disabled:opacity-50 flex items-center gap-2 text-sm font-medium transition-all shadow-sm active:scale-95"
                            >
                                {loading ? <Loader2 className="animate-spin w-4 h-4" /> : <Search className="w-4 h-4" />}
                                Generate
                            </button>

                            {staffList.length > 0 && (
                                <div className="h-6 w-px bg-gray-300 mx-1"></div>
                            )}

                            {staffList.length > 0 && (
                                <button 
                                    onClick={handlePrint}
                                    className="bg-gray-900 text-white px-4 py-2 rounded-md hover:bg-gray-800 flex items-center gap-2 text-sm font-medium transition-all shadow-sm active:scale-95"
                                >
                                    <Printer className="w-4 h-4" /> Print
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {staffList.length > 0 ? (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between text-sm text-gray-500 bg-emerald-50 px-4 py-2 rounded-lg border border-emerald-100">
                            <span className="flex items-center gap-2">
                                <Building2 className="w-4 h-4" />
                                Found {staffList.length} staff members
                            </span>
                        </div>

                        <div className="bg-gray-200/80 p-8 rounded-xl border border-gray-300 overflow-auto shadow-inner">
                            <div ref={componentRef} className="bg-white mx-auto p-8 shadow-2xl max-w-[210mm] min-h-[297mm]">
                                <div className="grid grid-cols-2 lg:grid-cols-3 gap-6 print:grid-cols-2 print:gap-4">
                                {staffList.map((staff) => (
                                    <div key={staff._id} className="border-[1.5px] border-gray-300 rounded-xl overflow-hidden w-full max-w-[350px] aspect-[1.586/1] flex flex-col relative bg-white page-break-inside-avoid shadow-sm print:shadow-none print:border-black group hover:shadow-md transition-shadow">
                                        
                                        {/* Header / School Info */}
                                        <div className="bg-linear-to-r from-emerald-800 to-emerald-900 text-white p-2.5 flex items-center gap-3 h-[28%] relative overflow-hidden">
                                            <div className="absolute -left-4 -bottom-8 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>

                                            {schoolInfo?.schoolLogo && (
                                                <div className="w-11 h-11 bg-white p-0.5 rounded-full shrink-0 shadow-lg z-10">
                                                    <img 
                                                        src={schoolInfo.schoolLogo.startsWith('http') ? schoolInfo.schoolLogo : `${API_URL}/${schoolInfo.schoolLogo}`} 
                                                        alt="Logo" 
                                                        className="w-full h-full rounded-full object-cover"
                                                    />
                                                </div>
                                            )}
                                            <div className="flex-1 text-center leading-tight z-10 flex flex-col justify-center">
                                                <h3 className="text-[11px] font-bold uppercase tracking-wider text-white/95">{schoolInfo?.schoolName}</h3>
                                                <p className="text-[9px] text-emerald-100/90 truncate max-w-[180px] mx-auto mt-0.5">{schoolInfo?.address}</p>
                                            </div>
                                        </div>

                                        {/* Stripe */}
                                        <div className="h-1 bg-gray-900 w-full"></div>

                                        {/* Body */}
                                        <div className="flex-1 p-3 flex gap-3.5 items-center bg-white relative">
                                            {/* Watermark */}
                                            {schoolInfo?.schoolLogo && (
                                                <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none">
                                                    <img src={schoolInfo.schoolLogo.startsWith('http') ? schoolInfo.schoolLogo : `${API_URL}/${schoolInfo.schoolLogo}`} className="w-32 h-32 grayscale" />
                                                </div>
                                            )}

                                            {/* Staff Photo */}
                                            <div className="w-20 h-24 border border-gray-200 bg-gray-50 shrink-0 rounded-sm shadow-sm p-0.5 relative z-10">
                                                {staff.profilePicture ? (
                                                     <img 
                                                        src={staff.profilePicture.startsWith('http') ? staff.profilePicture : `${API_URL}/${staff.profilePicture}`} 
                                                        className="w-full h-full object-cover rounded-sm"
                                                        alt={staff.name} 
                                                     />
                                                ) : (
                                                    <div className="w-full h-full flex flex-col items-center justify-center text-gray-300">
                                                        <Briefcase className="w-6 h-6 mb-1" />
                                                        <span className="text-[8px]">No Photo</span>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Details */}
                                            <div className="text-[10px] space-y-2 flex-1 z-10 pr-1">
                                                <div className="flex flex-col">
                                                    <span className="text-[11px] font-bold text-gray-900 leading-tight uppercase">{staff.name}</span>
                                                    <span className="text-emerald-700 font-semibold text-[10px] uppercase mt-0.5">{staff.designation?.title || staff.role || 'Staff'}</span>
                                                </div>
                                                <div className="space-y-1.5 mt-2 pt-2 border-t border-dashed border-gray-200">
                                                    <div className="flex gap-2">
                                                        <span className="font-semibold text-gray-500 w-10">Phone:</span>
                                                        <span className="text-gray-900 font-medium">{staff.phone || '-'}</span>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <span className="font-semibold text-gray-500 w-10">Email:</span>
                                                        <span className="text-gray-900 font-medium truncate">{staff.email || '-'}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Footer */}
                                        <div className="bg-emerald-50/50 border-t border-gray-200 p-1.5 px-3 flex justify-between items-center h-[12%]">
                                            <span className="text-[9px] font-medium text-gray-500">
                                                Ph: {schoolInfo?.phoneNumber || '-'}
                                            </span>
                                            <span className="text-[9px] uppercase font-bold text-emerald-900 tracking-wider">Staff ID</span>
                                        </div>
                                    </div>
                                ))}
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                   <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8 bg-white rounded-2xl border border-dashed border-gray-300 shadow-xs">
                        <div className="bg-emerald-50 p-6 rounded-full mb-4">
                            <Briefcase className="w-12 h-12 text-emerald-400 opacity-80" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900">Generate Staff ID Cards</h3>
                        <p className="text-gray-500 max-w-sm mt-2 mb-8">Generate professional Identity cards for your teaching and non-teaching staff.</p>
                        <div className="h-1 w-24 bg-emerald-100 rounded-full"></div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StaffIdCard;
