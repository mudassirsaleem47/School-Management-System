import React from 'react';
import { formatDateTime } from '../../utils/formatDateTime';
import API_URL from '../../config/api';

const CardRenderer = ({ template, data, schoolData }) => {
    // 1. Unpack dimensions or use default CR80
    const dims = template.dimensions || (template.orientation === 'vertical' ? { width: 204, height: 323 } : { width: 323, height: 204 });
    const width = dims.width;
    const height = dims.height;

    // 2. Helper to resolve field values
    const getValue = (fieldId) => {
        switch (fieldId) {
            // Common
            case 'name': return data.name;
            case 'phone': return data.phone || '-';
            case 'address': return data.address || '-';
            case 'email': return data.email || '-';

            // Staff specific
            case 'role': return data.designation?.title || data.role || 'Staff';
            case 'joiningDate': return data.joiningDate ? formatDateTime(data.joiningDate, { dateOnly: true }) : '-';
            
            // Student specific
            case 'rollNum': return data.rollNum || '-';
            case 'class': return data.studentClass?.name || data.class || '-';
            case 'section': return data.section?.name || data.section || '-';
            case 'fatherName': return data.fatherName || '-';
            case 'admissionId': return data.admissionId || '-';
            case 'dob': return data.dob ? formatDateTime(data.dob, { dateOnly: true }) : '-';
            case 'examGroup': return data.examGroup || '-';
            case 'examCenter': return data.examCenter || '-';

            // Images
            case 'photo': return data.profilePicture || data.photo; // Handle both keys
            case 'logo': return schoolData?.schoolLogo;
            case 'signature': return schoolData?.signature; // Assuming signature is in schoolData

            default: return '';
        }
    };

    // 3. Resolve Image URL
    const getImageUrl = (path) => {
        if (!path) return null;
        return path.startsWith('http') ? path : `${API_URL}/${path}`;
    };

    return (
        <div 
            className="relative bg-white shadow-sm overflow-hidden text-gray-900 border border-gray-200"
            style={{
                width: `${width}px`,
                height: `${height}px`,
                backgroundImage: template.backgroundImage ? `url(${template.backgroundImage})` : 'none',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                printColorAdjust: 'exact', // For printing background images
                WebkitPrintColorAdjust: 'exact'
            }}
        >
            {template.elements.map(el => {
                const value = getValue(el.field);

                // --- Image Rendering ---
                if (el.type === 'image') {
                    const src = getImageUrl(value);
                    return (
                        <div
                            key={el.id}
                            className="absolute"
                            style={{
                                left: `${el.x}px`,
                                top: `${el.y}px`,
                                width: `${el.width}px`,
                                height: `${el.height}px`,
                                zIndex: 10
                            }}
                        >
                            {src ? (
                                <img src={src} alt={el.label} className="w-full h-full object-contain" />
                            ) : (
                                <div className="w-full h-full bg-gray-100 flex items-center justify-center border border-dashed border-gray-300 text-[8px] text-gray-400">
                                    {el.label}
                                </div>
                            )}
                        </div>
                    );
                }

                // --- Exam Table Rendering ---
                if (el.type === 'examTable') {
                    const scheduleList = data.examScheduleList || [];
                    return (
                        <div
                            key={el.id}
                            className="absolute bg-white overflow-hidden"
                            style={{
                                left: `${el.x}px`,
                                top: `${el.y}px`,
                                width: `${el.width}px`,
                                height: `${el.height}px`,
                                zIndex: 10
                            }}
                        >
                            <table className="exam-table-print" style={{ width: '100%', fontSize: `${el.fontSize || 10}px`, borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr>
                                        <th style={{ border: '1px solid #000', padding: '4px', backgroundColor: '#f3f4f6' }}>Date</th>
                                        <th style={{ border: '1px solid #000', padding: '4px', backgroundColor: '#f3f4f6' }}>Subject</th>
                                        <th style={{ border: '1px solid #000', padding: '4px', backgroundColor: '#f3f4f6' }}>Time</th>
                                        <th style={{ border: '1px solid #000', padding: '4px', backgroundColor: '#f3f4f6' }}>Duration</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {scheduleList.length > 0 ? scheduleList.map((exam, idx) => (
                                        <tr key={idx}>
                                            <td style={{ border: '1px solid #000', padding: '4px' }}>{exam.examDate ? formatDateTime(exam.examDate, { dateOnly: true }) : '-'}</td>
                                            <td style={{ border: '1px solid #000', padding: '4px' }}>{exam.subject || '-'}</td>
                                            <td style={{ border: '1px solid #000', padding: '4px' }}>{exam.startTime || '-'}</td>
                                            <td style={{ border: '1px solid #000', padding: '4px' }}>{exam.duration ? `${exam.duration}m` : '-'}</td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan="4" style={{ border: '1px solid #000', padding: '4px', textAlign: 'center' }}>No schedule available</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    );
                }

                // --- Text Rendering ---
                return (
                    <div
                        key={el.id}
                        className="absolute whitespace-nowrap"
                        style={{
                            left: `${el.x}px`,
                            top: `${el.y}px`,
                            fontSize: `${el.fontSize}px`,
                            fontWeight: el.fontWeight,
                            color: el.color,
                            zIndex: 10,
                            fontFamily: 'Arial, sans-serif'
                        }}
                    >
                        {el.label.startsWith('{') ? el.label : value} 
                    </div>
                );
            })}
        </div>
    );
};

export default CardRenderer;
