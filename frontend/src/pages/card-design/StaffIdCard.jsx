import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useReactToPrint } from 'react-to-print';
import { IconPrinter, IconLoader2, IconSearch, IconFilter, IconBriefcase, IconBuilding, IconLayoutCards } from '@tabler/icons-react';
import API_URL from '../../config/api';
import CardRenderer from './CardRenderer';

const StaffIdCard = () => {
    const [loading, setLoading] = useState(false);
    const [staffType, setStaffType] = useState('all');
    const [staffList, setStaffList] = useState([]);
    const [schoolInfo, setSchoolInfo] = useState(null);
    
    // Template State
    const [templates, setTemplates] = useState([]);
    const [selectedTemplate, setSelectedTemplate] = useState(null);

    const user = JSON.parse(localStorage.getItem('currentUser'));
    const schoolId = user?.schoolName ? user._id : user?.school; 

    const componentRef = useRef();

    useEffect(() => {
        fetchTemplates();
    }, []);

    const fetchTemplates = async () => {
        try {
            // Filter for 'staff' card type if possible, or filter locally
            const res = await axios.get(`${API_URL}/CardTemplate/${schoolId}`);
            // Filter locally for staff templates
            const staffTemplates = res.data.filter(t => t.cardType === 'staff');
            setTemplates(staffTemplates);
            if (staffTemplates.length > 0) {
                setSelectedTemplate(staffTemplates[0]);
            }
        } catch (error) {
            console.error("Error fetching templates:", error);
        }
    };

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
                                <IconBriefcase className="w-6 h-6 text-emerald-600" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-gray-900">Staff ID Cards</h1>
                                <p className="text-sm text-gray-500">Generate IDs for teaching and non-teaching staff</p>
                            </div>
                        </div>

                        {/* Toolbar */}
                        <div className="flex items-center gap-3 bg-gray-50 p-1.5 rounded-lg border border-gray-200 flex-wrap">

                            {/* Template Selector */}
                            {templates.length > 0 ? (
                                <div className="relative">
                                    <IconLayoutCards className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                                    <select
                                        value={selectedTemplate?._id || ''}
                                        onChange={(e) => {
                                            const t = templates.find(temp => temp._id === e.target.value);
                                            setSelectedTemplate(t);
                                        }}
                                        className="pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-md text-sm focus:ring-2 focus:ring-emerald-500 outline-none w-48 shadow-sm"
                                    >
                                        {templates.map(t => (
                                            <option key={t._id} value={t._id}>{t.name}</option>
                                        ))}
                                    </select>
                                </div>
                            ) : (
                                <div className="text-xs text-red-500 font-medium px-2">
                                    No Templates Found (Create in Designer)
                                </div>
                            )}

                            <div className="h-6 w-px bg-gray-300 mx-1 hidden md:block"></div>

                            <div className="relative">
                                <IconFilter className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                                <select 
                                    value={staffType} 
                                    onChange={(e) => setStaffType(e.target.value)}
                                    className="pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-md text-sm focus:ring-2 focus:ring-emerald-500 outline-none w-40 shadow-sm"
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
                                {loading ? <IconLoader2 className="animate-spin w-4 h-4" /> : <IconSearch className="w-4 h-4" />}
                                Generate
                            </button>

                            {staffList.length > 0 && (
                                <div className="h-6 w-px bg-gray-300 mx-1 hidden md:block"></div>
                            )}

                            {staffList.length > 0 && (
                                <button 
                                    onClick={handlePrint}
                                    className="bg-gray-900 text-white px-4 py-2 rounded-md hover:bg-gray-800 flex items-center gap-2 text-sm font-medium transition-all shadow-sm active:scale-95"
                                >
                                    <IconPrinter className="w-4 h-4" /> Print
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
                                <IconBuilding className="w-4 h-4" />
                                Found {staffList.length} staff members
                            </span>
                            {selectedTemplate && (
                                <span className="font-medium text-emerald-700">
                                    Using template: {selectedTemplate.name}
                                </span>
                            )}
                        </div>

                        <div className="bg-gray-200/80 p-8 rounded-xl border border-gray-300 overflow-auto shadow-inner">
                            <div ref={componentRef} className="bg-white mx-auto p-8 shadow-2xl max-w-[210mm] min-h-[297mm]">
                                <div className="flex flex-wrap gap-4 justify-center print:justify-start">
                                    {selectedTemplate ? (
                                        staffList.map((staff) => (
                                            <div key={staff._id} className="print:break-inside-avoid mb-4">
                                                <CardRenderer
                                                    template={selectedTemplate}
                                                    data={staff}
                                                    schoolData={schoolInfo}
                                                />
                                            </div>
                                        ))
                                    ) : (
                                        <div className="w-full text-center py-12 text-gray-500">
                                            Please select a template to generate cards.
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                   <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8 bg-white rounded-2xl border border-dashed border-gray-300 shadow-xs">
                        <div className="bg-emerald-50 p-6 rounded-full mb-4">
                                <IconBriefcase className="w-12 h-12 text-emerald-400 opacity-80" />
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
