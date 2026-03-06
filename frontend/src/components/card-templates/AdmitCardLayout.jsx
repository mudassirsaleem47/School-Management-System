import React from 'react';
import { formatDateTime } from '../../utils/formatDateTime';
import { MapPin, Phone, Facebook, Globe } from 'lucide-react';

const AdmitCardLayout = ({ config, student, examSchedule }) => {
    // config: { 
    //    schoolName: "SCHOOL OF ILM-O-HIKMAT",
    //    examName: "FINAL TERM",
    //    heading: "EXAM DATE SHEET",
    //    headerLogo: "base64...", 
    //    examCenter: "SOIH",
    //    footerText: "School timing...", 
    //    signature: "base64..." 
    // }
    // student: { rollNum, admissionId, name, sclassName, dateOfBirth, gender, fatherName, motherName, address }
    // examSchedule: [{ subject: "MATHEMATICS", examDate, startTime }]

    return (
        <div className="bg-white text-black p-6 flex flex-col" style={{ width: '210mm', minHeight: '297mm', boxSizing: 'border-box', fontFamily: 'Arial, sans-serif' }}>
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="w-20 h-20 flex-shrink-0">
                    {config.headerLogo ? (
                        <img src={config.headerLogo} alt="Logo" className="w-full h-full object-contain" />
                    ) : (
                        <div className="w-full h-full border-2 border-dashed border-gray-300 flex items-center justify-center text-xs text-gray-400">Logo</div>
                    )}
                </div>
                <div className="flex-1 text-center flex flex-col items-center justify-center">
                    <h1 className="text-2xl font-bold uppercase tracking-wide m-0 leading-tight">
                        {config.schoolName || 'SCHOOL NAME'}
                    </h1>
                    <h2 className="text-lg font-bold uppercase tracking-wider mt-1 underline m-0 leading-tight">
                        {config.heading || 'EXAM DATE SHEET'}
                    </h2>
                    <h3 className="text-sm font-bold uppercase tracking-wide mt-4 m-0 leading-tight">
                        {config.examName || 'TERM NAME'}
                    </h3>
                </div>
                <div className="w-20 h-20 flex-shrink-0">
                    {/* Empty block to balance the flex layout */}
                </div>
            </div>

            {/* Student Details */}
            <div className="mb-4 text-[12px] leading-relaxed">
                <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                    <div className="flex">
                        <span className="w-36 uppercase font-semibold">ROLL NUMBER</span>
                        <span className="font-bold">{student?.rollNum || 'N/A'}</span>
                    </div>
                    <div className="flex">
                        <span className="w-36 uppercase font-semibold">ADMISSION NO</span>
                        <span className="font-bold">{student?.admissionId || student?.admissionNo || 'N/A'}</span>
                    </div>

                    <div className="flex">
                        <span className="w-36 uppercase font-semibold">NAME</span>
                        <span className="font-bold">{student?.name || student?.firstName || 'N/A'}</span>
                    </div>
                    <div className="flex">
                        <span className="w-36 uppercase font-semibold">CLASS</span>
                        <span className="font-bold">{student?.sclassName?.sclassName || student?.className || 'N/A'}</span>
                    </div>

                    <div className="flex">
                        <span className="w-36 uppercase font-semibold">D.O.B</span>
                        <span className="font-bold">
                            {student?.dateOfBirth ? formatDateTime(student.dateOfBirth, { dateOnly: true }) : 'N/A'}
                        </span>
                    </div>
                    <div className="flex">
                        <span className="w-36 uppercase font-semibold">GENDER</span>
                        <span className="font-bold uppercase">{student?.gender || 'N/A'}</span>
                    </div>

                    <div className="flex">
                        <span className="w-36 uppercase font-semibold">FATHER NAME</span>
                        <span className="font-bold">{student?.fatherName || 'N/A'}</span>
                    </div>
                    <div className="flex">
                        <span className="w-36 uppercase font-semibold">MOTHER NAME</span>
                        <span className="font-bold">{student?.motherName || 'N/A'}</span>
                    </div>

                    <div className="flex col-span-2">
                        <span className="w-36 uppercase font-semibold flex-shrink-0">ADDRESS</span>
                        <span className="font-bold">{student?.address || 'N/A'}</span>
                    </div>

                    <div className="flex col-span-2">
                        <span className="w-36 uppercase font-semibold flex-shrink-0">SCHOOL NAME</span>
                        <span className="font-bold">{config.schoolName || 'N/A'}</span>
                    </div>

                    <div className="flex col-span-2">
                        <span className="w-36 uppercase font-semibold flex-shrink-0">EXAM CENTER</span>
                        <span className="font-bold">{config.examCenter || 'N/A'}</span>
                    </div>
                </div>
            </div>

            {/* Exam Table */}
            <div className="mb-4 border border-black">
                <table className="w-full text-[12px] text-center border-collapse">
                    <thead>
                        <tr className="border-b border-black">
                            <th className="py-1.5 px-3.5 border-r border-black font-semibold uppercase">SUBJECT</th>
                            <th className="py-1.5 px-3.5 border-r border-black font-semibold uppercase w-28">DATE</th>
                            <th className="py-1.5 px-3.5 border-r border-black font-semibold uppercase w-28">TIME</th>
                            <th className="py-1.5 px-3.5 border-r border-black font-semibold uppercase w-28">DURATION</th>
                            <th className="py-1.5 px-3.5 font-semibold uppercase w-48">OBTAINED BY STUDENT</th>
                        </tr>
                    </thead>
                    <tbody>
                        {examSchedule && examSchedule.length > 0 ? (
                            examSchedule.map((exam, idx) => (
                                <tr key={idx} className="border-b border-black last:border-b-0">
                                    <td className="py-1.5 px-3.5 border-r border-black font-bold uppercase">
                                        {exam.subject?.subName || exam.subject || '-'}
                                    </td>
                                    <td className="py-1.5 px-3.5 border-r border-black font-bold">
                                        {exam.examDate ? formatDateTime(exam.examDate, { format: 'DD-MM-YYYY' }) : '-'}
                                    </td>
                                    <td className="py-1.5 px-3.5 border-r border-black font-bold">
                                        {exam.startTime ? exam.startTime : '-'}
                                    </td>
                                    <td className="py-1.5 px-3.5 border-r border-black font-bold">
                                        {exam.duration ? `${exam.duration} Min` : '-'}
                                    </td>
                                    <td className="py-1.5 px-3.5 font-bold uppercase">
                                        
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="5" className="py-4 text-gray-500 italic">No exams scheduled for this class.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Footer Text */}
            <div
                className="mb-2 text-[11px] leading-tight text-justify"
                dangerouslySetInnerHTML={{ __html: config.footerText ? config.footerText.replace(/\n/g, '<br />') : '<p class="text-gray-400 italic">Footer instructions will appear here...</p>' }}
            />

            {/* Signatures */}
            <div className="flex justify-between items-end mt-auto pt-2 px-4">

                <div className="text-center flex flex-col items-center">
                    <div className="h-10 w-32 border-b border-black mb-1 flex items-end justify-center pb-1">
                        {config.signatureClassIncharge ? (
                            <img src={config.signatureClassIncharge} alt="Signature" className="max-h-full max-w-full object-contain" />
                        ) : null}
                    </div>
                    <span className="text-[11px] font-bold underline">Class Incharge Signature</span>
                </div>

                <div className="text-center flex flex-col items-center">
                    <div className="h-10 w-32 border-b border-black mb-1 flex items-end justify-center pb-1">
                        {config.signaturePrincipal ? (
                            <img src={config.signaturePrincipal} alt="Signature" className="max-h-full max-w-full object-contain" />
                        ) : null}
                    </div>
                    <span className="text-[11px] font-bold">Principal Signature</span>
                </div>


            </div>

            {/* Footer Contact Details */}
            <div className="mt-2 flex justify-between items-stretch border-t border-black pt-2 break-inside-avoid print:break-inside-avoid">
                <div className="flex-1 pr-4 space-y-2 text-[10px] flex flex-col justify-center">
                    <div className="flex items-start gap-2">
                        <div className="mt-0.5 border border-black rounded-full p-0.5"><MapPin className="w-3.5 h-3.5" /></div>
                        <div className="leading-tight">
                            <span className="font-bold text-[13px]">{config.campus1Name || 'Main Campus'}</span><br />
                            {config.campus1Address || 'Kot Elahi Bakhsh, Main Depalpur Road,\nOpposite Atock Pump, Talwandi Bus Stop'}
                        </div>
                    </div>
                    <div className="flex items-start gap-2">
                        <div className="mt-0.5 border border-black rounded-full p-0.5"><MapPin className="w-3.5 h-3.5" /></div>
                        <div className="leading-tight">
                            <span className="font-bold text-[13px]">{config.campus2Name || 'Ayesha Campus'}</span> | {config.campus2Address || 'Al Noor City, Talwandi'}
                        </div>
                    </div>
                </div>

                <div className="bg-black text-white p-3 w-64 flex flex-col justify-center text-[10px] space-y-2 shrink-0 rounded-md">
                    <div className="flex items-center gap-2">
                        <div className="flex items-center w-1/2 gap-1.5">
                            <Phone className="w-3.5 h-3.5" /> <span className="font-mono">{config.phone1 || '+92 300 8875374'}</span>
                        </div>
                        <div className="flex items-center w-1/2 gap-1.5">
                            <Facebook className="w-3.5 h-3.5" /> <span>{config.facebook || 'ilmohikmat.edu.pk'}</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="flex items-center w-1/2 gap-1.5">
                            <Phone className="w-3.5 h-3.5" /> <span className="font-mono">{config.phone2 || '+92 313 8875374'}</span>
                        </div>
                        <div className="flex items-center w-1/2 gap-1.5">
                            <Globe className="w-3.5 h-3.5" /> <span>{config.website || 'www.soih.pk'}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdmitCardLayout;
