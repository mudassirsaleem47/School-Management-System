import React from 'react';
import { MapPin, Phone, Facebook, Globe } from 'lucide-react';

function numberToWords(num) {
    const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
        'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen',
        'Seventeen', 'Eighteen', 'Nineteen'];
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    if (!num || isNaN(num)) return 'Zero';
    num = Math.round(num);
    if (num === 0) return 'Zero';
    if (num < 20) return ones[num];
    if (num < 100) return tens[Math.floor(num / 10)] + (num % 10 ? ' ' + ones[num % 10] : '');
    if (num < 1000) return ones[Math.floor(num / 100)] + ' Hundred' + (num % 100 ? ' ' + numberToWords(num % 100) : '');
    if (num < 10000) return ones[Math.floor(num / 1000)] + ' Thousand' + (num % 1000 ? ' ' + numberToWords(num % 1000) : '');
    return num.toString();
}

/**
 * MarkSheetLayout
 * props:
 *   config: { schoolName, schoolNameUrdu, session, heading, headerLogo,
 *             signaturePrincipal, signatureClassIncharge, signatureParents,
 *             campus1Name, campus1Address, campus2Name, campus2Address,
 *             phone1, phone2, facebook, website }
 *   student: { name, fatherName, rollNum, admissionId/admissionNo, sclassName, gender }
 *   terms: [
 *     {
 *       termName: "1st Term",
 *       resultDate: "2025-06-05",
 *       results: [
 *         { subject, totalMarks, passingMarks, marksObtained, percentage, status }
 *       ]
 *     },
 *     ...
 *   ]
 */

const MarkSheetLayout = ({ config, student, terms = [] }) => {

    // Grand totals across all terms
    const allResults = terms.flatMap(t => t.results || []);
    const grandObtained = allResults.reduce((s, r) => s + (parseFloat(r.marksObtained) || 0), 0);
    const grandTotal = allResults.reduce((s, r) => s + (parseFloat(r.totalMarks) || 0), 0);
    const grandPct = grandTotal > 0 ? ((grandObtained / grandTotal) * 100).toFixed(0) : 0;

    const overallResult = allResults.length > 0 && allResults.every(r => r.status === 'Pass') ? 'Pass' : allResults.length > 0 ? 'Fail' : '-';

    return (
        <div className="bg-white text-black flex flex-col"
            style={{ width: '210mm', minHeight: '297mm', padding: '12mm', boxSizing: 'border-box', fontFamily: 'Arial, sans-serif', fontSize: '10px' }}>

            {/* ===== HEADER ===== */}
            <div className="flex items-center gap-4 mb-3">
                <div className="w-16 h-16 flex-shrink-0">
                    {config.headerLogo ? (
                        <img src={config.headerLogo} alt="Logo" className="w-full h-full object-contain" />
                    ) : (
                        <div className="w-full h-full border-2 border-dashed border-gray-400 flex items-center justify-center text-[9px] text-gray-400">Logo</div>
                    )}
                </div>
                <div className="flex-1">
                    <h1 className="text-2xl font-black uppercase tracking-wide leading-tight m-0">
                        {config.schoolName || 'SCHOOL NAME'}
                    </h1>
                    {config.schoolNameUrdu && (
                        <p className="text-sm font-semibold leading-tight m-0" style={{ direction: 'rtl' }}>
                            {config.schoolNameUrdu}
                        </p>
                    )}
                </div>
                <div className="text-right flex-shrink-0">
                    <span className="text-xs font-bold border border-black px-2 py-0.5">Transcript</span>
                </div>
            </div>

            <hr className="border-black mb-2" />

            {/* ===== STUDENT INFO ===== */}
            <div className="mb-2 text-[10px]">
                <div className="grid grid-cols-2 gap-x-4 gap-y-0.5">
                    <div className="flex gap-2">
                        <span className="font-bold w-28 flex-shrink-0">Student Name:</span>
                        <span>{student?.name || 'N/A'}</span>
                    </div>
                    <div className="flex gap-2">
                        <span className="font-bold w-28 flex-shrink-0">Admission Date:</span>
                        <span>{student?.admissionDate ? new Date(student.admissionDate).toLocaleDateString('en-GB') : 'N/A'}</span>
                    </div>
                    <div className="flex gap-2">
                        <span className="font-bold w-28 flex-shrink-0">Reg#:</span>
                        <span>{student?.rollNum || 'N/A'}</span>
                    </div>
                    <div className="flex gap-2">
                        <span className="font-bold w-28 flex-shrink-0">Class / Section:</span>
                        <span>{student?.sclassName?.sclassName || student?.className || 'N/A'} / {student?.gender || 'N/A'}</span>
                    </div>
                    <div className="flex gap-2">
                        <span className="font-bold w-28 flex-shrink-0">B.Form#:</span>
                        <span>{student?.admissionId || student?.admissionNo || 'N/A'}</span>
                    </div>
                    <div className="flex gap-2">
                        <span className="font-bold w-28 flex-shrink-0">Grand Total:</span>
                        <span className="font-bold">{grandTotal}</span>
                    </div>
                    <div className="flex gap-2 col-span-2">
                        <span className="font-bold w-28 flex-shrink-0">Total Obtained:</span>
                        <span className="font-bold">{grandObtained}</span>
                        <span className="mx-4 font-bold">Total Obtained (%):</span>
                        <span className="font-bold">{grandPct}</span>
                    </div>
                </div>
            </div>

            <hr className="border-black mb-2" />

            {/* ===== TERMS ===== */}
            {terms.map((term, tIdx) => {
                const termObtained = (term.results || []).reduce((s, r) => s + (parseFloat(r.marksObtained) || 0), 0);
                const termTotal = (term.results || []).reduce((s, r) => s + (parseFloat(r.totalMarks) || 0), 0);
                const termPct = termTotal > 0 ? ((termObtained / termTotal) * 100).toFixed(0) : 0;

                return (
                    <div key={tIdx} className="mb-3">
                        {/* Term heading row */}
                        <div className="flex items-center justify-between mb-0.5">
                            {term.resultDate && (
                                <span className="text-[9px] text-gray-700 font-medium">
                                    Result On: {new Date(term.resultDate).toLocaleDateString('en-GB').replace(/\//g, '-')}
                                </span>
                            )}
                            <span className="font-bold text-[11px] mx-auto">{term.termName || `Term ${tIdx + 1}`}</span>
                        </div>

                        {/* Term Table */}
                        <table className="w-full text-[9px] border-collapse border border-black">
                            <thead>
                                <tr className="bg-gray-200">
                                    <th className="border border-black py-0.5 px-1.5 text-left font-bold w-36">Subject</th>
                                    <th className="border border-black py-0.5 px-1.5 text-center font-bold">Total Marks</th>
                                    <th className="border border-black py-0.5 px-1.5 text-center font-bold">Passing Marks</th>
                                    <th className="border border-black py-0.5 px-1.5 text-center font-bold">Obtain Marks</th>
                                    <th className="border border-black py-0.5 px-1.5 text-center font-bold">Obt. %</th>
                                </tr>
                            </thead>
                            <tbody>
                                {term.results && term.results.length > 0 ? term.results.map((r, rIdx) => (
                                    <tr key={rIdx} className="even:bg-gray-50">
                                        <td className="border border-black py-0.5 px-1.5">{r.subject || '-'}</td>
                                        <td className="border border-black py-0.5 px-1.5 text-center">{r.totalMarks ?? '-'}</td>
                                        <td className="border border-black py-0.5 px-1.5 text-center">{r.passingMarks != null ? `${r.passingMarks}` : '-'}<span className="text-gray-500 ml-1">{r.passingMarks != null && r.totalMarks ? `${Math.round((r.passingMarks / r.totalMarks) * 100)} %` : ''}</span></td>
                                        <td className="border border-black py-0.5 px-1.5 text-center">{r.marksObtained ?? '-'}</td>
                                        <td className="border border-black py-0.5 px-1.5 text-center">{r.percentage != null ? `${parseFloat(r.percentage).toFixed(0)}%` : '-'}</td>
                                    </tr>
                                )) : (
                                    <tr><td colSpan="5" className="border border-black py-1 text-center text-gray-400 italic">No results entered.</td></tr>
                                )}
                                {/* Term total row */}
                                <tr className="bg-gray-100 font-bold">
                                    <td className="border border-black py-0.5 px-1.5" colSpan="2">Total Of {term.termName || `Term ${tIdx + 1}`}: {termTotal}</td>
                                    <td className="border border-black py-0.5 px-1.5 text-center"></td>
                                    <td className="border border-black py-0.5 px-1.5 text-center">{termObtained}</td>
                                    <td className="border border-black py-0.5 px-1.5 text-center">{termPct}%</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                );
            })}

            {/* ===== GRAND TOTAL SUMMARY ROW ===== */}
            {terms.length > 1 && (
                <div className="mb-3 border border-black">
                    <table className="w-full text-[9px] border-collapse">
                        <tbody>
                            <tr className="bg-gray-100">
                                <td className="border border-black py-0.5 px-2 font-bold w-48">GRAND TOTAL:</td>
                                <td className="border border-black py-0.5 px-2 font-bold">{grandObtained} / {grandTotal} — Average: {grandPct}%</td>
                            </tr>
                            <tr>
                                <td className="border border-black py-0.5 px-2 font-bold">IN WORDS:</td>
                                <td className="border border-black py-0.5 px-2">{numberToWords(grandObtained)} Marks</td>
                            </tr>
                            <tr>
                                <td className="border border-black py-0.5 px-2 font-bold">RESULT:</td>
                                <td className={`border border-black py-0.5 px-2 font-bold ${overallResult === 'Pass' ? 'text-green-700' : 'text-red-700'}`}>{overallResult}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            )}

            {/* ===== SIGNATURES ===== */}
            <div className="flex justify-between items-end mt-auto pt-3 px-2">
                <div className="text-center flex flex-col items-center">
                    <div className="h-8 w-28 border-b border-black mb-0.5 flex items-end justify-center pb-0.5">
                        {config.signaturePrincipal && <img src={config.signaturePrincipal} alt="sig" className="max-h-full object-contain" />}
                    </div>
                    <span className="text-[9px] font-bold underline">Principal Signature</span>
                </div>
                <div className="text-center flex flex-col items-center">
                    <div className="h-8 w-28 border-b border-black mb-0.5 flex items-end justify-center pb-0.5">
                        {config.signatureClassIncharge && <img src={config.signatureClassIncharge} alt="sig" className="max-h-full object-contain" />}
                    </div>
                    <span className="text-[9px] font-bold underline">Class Incharge Signature</span>
                </div>
                <div className="text-center flex flex-col items-center">
                    <div className="h-8 w-28 border-b border-black mb-0.5 flex items-end justify-center pb-0.5">
                        {config.signatureParents && <img src={config.signatureParents} alt="sig" className="max-h-full object-contain" />}
                    </div>
                    <span className="text-[9px] font-bold underline">Parents Signature</span>
                </div>
            </div>

            {/* ===== FOOTER ===== */}
            <div className="mt-3 flex justify-between items-stretch border-t border-black pt-2">
                <div className="flex-1 pr-4 space-y-1.5 text-[9px] flex flex-col justify-center">
                    <div className="flex items-start gap-1.5">
                        <div className="mt-0.5 border border-black rounded-full p-0.5"><MapPin className="w-2.5 h-2.5" /></div>
                        <div className="leading-tight">
                            <span className="font-bold">{config.campus1Name || 'Main Campus'}</span><br />
                            {config.campus1Address || 'Kot Elahi Bakhsh, Main Depalpur Road, Opposite Atock Pump, Talwandi Bus Stop'}
                        </div>
                    </div>
                    <div className="flex items-start gap-1.5">
                        <div className="mt-0.5 border border-black rounded-full p-0.5"><MapPin className="w-2.5 h-2.5" /></div>
                        <div className="leading-tight">
                            <span className="font-bold">{config.campus2Name || 'Ayesha Campus'}</span> | {config.campus2Address || 'Al Noor City, Talwandi'}
                        </div>
                    </div>
                </div>
                <div className="bg-black text-white p-2.5 w-52 flex flex-col justify-center text-[9px] space-y-1.5 shrink-0 rounded">
                    <div className="flex gap-3">
                        <div className="flex items-center gap-1"><Phone className="w-2.5 h-2.5" /><span>{config.phone1 || '+92 300 8875374'}</span></div>
                        <div className="flex items-center gap-1"><Facebook className="w-2.5 h-2.5" /><span>{config.facebook || 'ilmohikmat.edu.pk'}</span></div>
                    </div>
                    <div className="flex gap-3">
                        <div className="flex items-center gap-1"><Phone className="w-2.5 h-2.5" /><span>{config.phone2 || '+92 313 8875374'}</span></div>
                        <div className="flex items-center gap-1"><Globe className="w-2.5 h-2.5" /><span>{config.website || 'www.soih.pk'}</span></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MarkSheetLayout;
