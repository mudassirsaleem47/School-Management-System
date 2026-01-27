import React from 'react';
import { X, User, BookOpen, Users, Bus, Calendar, Phone, Mail, MapPin, Ruler, Activity } from 'lucide-react';
import { useModalAnimation } from '../../hooks/useModalAnimation';

const StudentDetailsModal = ({ isOpen, onClose, student }) => {
    const { isVisible, isClosing, handleClose } = useModalAnimation(isOpen, onClose);

    if (!isVisible || !student) return null;

    const InfoItem = ({ icon: Icon, label, value }) => (
        <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100 hover:border-indigo-100 transition-colors">
            <div className="p-2 bg-white text-indigo-600 rounded-md shadow-sm">
                <Icon size={16} />
            </div>
            <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{label}</p>
                <p className="text-sm font-medium text-gray-900 mt-0.5">{value || 'N/A'}</p>
            </div>
        </div>
    );

    const SectionHeader = ({ icon: Icon, title, colorClass = "text-gray-800" }) => (
        <div className="flex items-center gap-2 mb-4 pb-2 border-b border-gray-100">
            <Icon size={18} className={colorClass} />
            <h3 className={`text-md font-bold ${colorClass}`}>{title}</h3>
        </div>
    );

    return (
        <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 ${isClosing ? 'animate-fade-out' : 'animate-fade-in'}`}>
            <div className={`bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col ${isClosing ? 'animate-scale-down' : 'animate-scale-up'}`}>
                
                {/* Header */}
                <div className="bg-linear-to-r from-indigo-600 to-violet-600 px-6 py-4 flex justify-between items-center shrink-0">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full border-2 border-white/30 overflow-hidden bg-white/10 backdrop-blur-md">
                            {student.studentPhoto ? (
                                <img src={`http://localhost:5000/${student.studentPhoto}`} alt={student.name} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-white font-bold text-xl">
                                    {student.name?.charAt(0)}
                                </div>
                            )}
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">{student.name}</h2>
                            <p className="text-indigo-100 text-sm flex items-center gap-2">
                                <span className="bg-white/20 px-2 py-0.5 rounded text-xs">Roll: {student.rollNum}</span>
                                <span className="bg-white/20 px-2 py-0.5 rounded text-xs">Class: {student.sclassName?.sclassName}</span>
                            </p>
                        </div>
                    </div>
                    <button onClick={handleClose} className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-colors">
                        <X size={24} />
                    </button>
                </div>

                {/* Content - Scrollable */}
                <div className="overflow-y-auto p-6 space-y-8 custom-scrollbar">
                    
                    {/* Personal & Academic Info Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        
                        {/* Personal Information */}
                        <div>
                            <SectionHeader icon={User} title="Personal Information" colorClass="text-indigo-600" />
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <InfoItem icon={User} label="Full Name" value={`${student.firstName || ''} ${student.lastName || ''}`} />
                                <InfoItem icon={Users} label="Gender" value={student.gender} />
                                <InfoItem icon={Calendar} label="Date of Birth" value={student.dateOfBirth ? new Date(student.dateOfBirth).toLocaleDateString() : ''} />
                                <InfoItem icon={Activity} label="Blood Group" value={student.bloodGroup} />
                                <InfoItem icon={Users} label="Category" value={student.category} />
                                <InfoItem icon={BookOpen} label="Religion/Caste" value={`${student.religion || ''} ${student.caste ? `(${student.caste})` : ''}`} />
                            </div>
                        </div>

                        {/* Contact & Physical Info */}
                        <div>
                            <SectionHeader icon={Phone} title="Contact & Physical" colorClass="text-emerald-600" />
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <InfoItem icon={Phone} label="Mobile" value={student.mobileNumber} />
                                <InfoItem icon={Mail} label="Email" value={student.email} />
                                <InfoItem icon={Ruler} label="Height" value={student.height ? `${student.height} cm` : ''} />
                                <InfoItem icon={Activity} label="Weight" value={student.weight ? `${student.weight} kg` : ''} />
                                <InfoItem icon={MapPin} label="House" value={student.house} />
                                <InfoItem icon={Calendar} label="Admission Date" value={student.admissionDate ? new Date(student.admissionDate).toLocaleDateString() : ''} />
                            </div>
                        </div>
                    </div>

                    {/* Parents & Transport/Siblings Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        
                        {/* Parents Information Column */}
                        <div>
                            <SectionHeader icon={Users} title="Parent/Guardian Details" colorClass="text-purple-600" />
                            <div className="space-y-4">
                                {/* Father */}
                                {student.father?.name && (
                                    <div className="bg-blue-50/50 rounded-xl p-4 border border-blue-100">
                                        <h4 className="font-bold text-blue-800 mb-3 flex items-center gap-2">
                                            <span className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-xs">F</span> Father
                                        </h4>
                                        <div className="space-y-2">
                                            <p className="text-sm"><span className="text-gray-500 text-xs uppercase block">Name</span> {student.father.name}</p>
                                            <p className="text-sm"><span className="text-gray-500 text-xs uppercase block">Phone</span> {student.father.phone || 'N/A'}</p>
                                            <p className="text-sm"><span className="text-gray-500 text-xs uppercase block">Occupation</span> {student.father.occupation || 'N/A'}</p>
                                        </div>
                                    </div>
                                )}
                                
                                {/* Mother */}
                                {student.mother?.name && (
                                    <div className="bg-pink-50/50 rounded-xl p-4 border border-pink-100">
                                        <h4 className="font-bold text-pink-800 mb-3 flex items-center gap-2">
                                            <span className="w-6 h-6 rounded-full bg-pink-100 flex items-center justify-center text-xs">M</span> Mother
                                        </h4>
                                        <div className="space-y-2">
                                            <p className="text-sm"><span className="text-gray-500 text-xs uppercase block">Name</span> {student.mother.name}</p>
                                            <p className="text-sm"><span className="text-gray-500 text-xs uppercase block">Phone</span> {student.mother.phone || 'N/A'}</p>
                                            <p className="text-sm"><span className="text-gray-500 text-xs uppercase block">Occupation</span> {student.mother.occupation || 'N/A'}</p>
                                        </div>
                                    </div>
                                )}

                                {/* Guardian */}
                                {student.guardian?.name && (
                                    <div className="bg-purple-50/50 rounded-xl p-4 border border-purple-100">
                                        <h4 className="font-bold text-purple-800 mb-3 flex items-center gap-2">
                                            <span className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center text-xs">G</span> Guardian
                                        </h4>
                                        <div className="space-y-2">
                                            <p className="text-sm"><span className="text-gray-500 text-xs uppercase block">Name</span> {student.guardian.name}</p>
                                            <p className="text-sm"><span className="text-gray-500 text-xs uppercase block">Relation</span> {student.guardian.relation || 'N/A'}</p>
                                            <p className="text-sm"><span className="text-gray-500 text-xs uppercase block">Phone</span> {student.guardian.phone || 'N/A'}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Transport & Siblings Column */}
                        <div className="space-y-8">
                            {/* Transport */}
                            {student.transport && (
                                <div>
                                    <SectionHeader icon={Bus} title="Transport Details" colorClass="text-orange-600" />
                                    <div className="bg-orange-50/30 rounded-xl p-4 border border-orange-100 grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-xs text-gray-500 uppercase">Route</p>
                                            <p className="font-medium text-gray-900">{student.transport.route || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 uppercase">Pickup Point</p>
                                            <p className="font-medium text-gray-900">{student.transport.pickupPoint || 'N/A'}</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Siblings */}
                            {student.siblings && student.siblings.length > 0 && (
                                <div>
                                    <SectionHeader icon={Users} title="Siblings" colorClass="text-cyan-600" />
                                    <div className="space-y-2">
                                        {student.siblings.map((sib, idx) => (
                                            <div key={idx} className="flex items-center justify-between p-3 bg-cyan-50/30 rounded-lg border border-cyan-100">
                                                <span className="font-medium text-gray-800">{sib.name}</span>
                                                <span className="text-xs bg-white px-2 py-1 rounded border border-cyan-100 text-cyan-700">
                                                    Class {sib.class} | Roll {sib.rollNum}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                </div>

                {/* Footer */}
                <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end shrink-0">
                    <button onClick={handleClose} className="px-6 py-2 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors shadow-sm">
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default StudentDetailsModal;
