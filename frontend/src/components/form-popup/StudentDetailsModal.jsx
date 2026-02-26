import API_URL from '@/config/api';
import React from 'react';
import { formatDateTime } from '../../utils/formatDateTime';
import {
    X, User, BookOpen, Users, Bus, Calendar, Phone, Mail,
    MapPin, Ruler, Activity, School
} from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

const StudentDetailsModal = ({ isOpen, onClose, student }) => {
    if (!student) return null;

    const InfoItem = ({ icon: Icon, label, value }) => (
        <div className="flex items-start gap-3">
            <div className="mt-0.5 p-1.5 bg-muted rounded-md text-muted-foreground">
                <Icon size={14} />
            </div>
            <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}</p>
                <p className="text-sm font-medium text-foreground mt-0.5">{value || 'N/A'}</p>
            </div>
        </div>
    );

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl max-h-[90vh] p-0 gap-0 overflow-hidden flex flex-col">
                <div className="bg-primary px-6 py-6 flex flex-col md:flex-row gap-6 md:items-center relative shrink-0">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onClose}
                        className="absolute right-4 top-4 text-primary-foreground/70 hover:text-white hover:bg-primary-foreground/10"
                    >
                        <X className="h-5 w-5" />
                        <span className="sr-only">Close</span>
                    </Button>

                    <div className="h-24 w-24 rounded-full border-4 border-white/20 overflow-hidden bg-white/10 shrink-0 shadow-xl">
                        {student.studentPhoto ? (
                            <img src={`${API_URL}/${student.studentPhoto}`} alt={student.name} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-white/90 font-bold text-3xl">
                                {student.name?.charAt(0)}
                            </div>
                        )}
                    </div>

                    <div className="space-y-2 text-white">
                        <div>
                            <h2 className="text-2xl font-bold tracking-tight">{student.name}</h2>
                            <p className="text-primary-foreground/80 font-medium">Student Profile</p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            <Badge variant="secondary" className="bg-white/20 text-white hover:bg-white/30 border-0">
                                Class {student.sclassName?.sclassName}
                            </Badge>
                            <Badge variant="secondary" className="bg-white/20 text-white hover:bg-white/30 border-0">
                                Roll No. {student.rollNum}
                            </Badge>
                            <Badge variant={student.status === 'Active' ? 'success' : 'destructive'} className="border-0">
                                {student.status || 'Active'}
                            </Badge>
                        </div>
                    </div>
                </div>

                <ScrollArea className="flex-1 shrink min-h-0 bg-muted/5">
                    <div className="p-6 space-y-6">
                        {/* Personal & Academic Info Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Personal Information */}
                            <Card>
                                <CardHeader className="pb-3">
                                    <div className="flex items-center gap-2">
                                        <User className="h-4 w-4 text-indigo-600" />
                                        <CardTitle className="text-base">Personal Information</CardTitle>
                                    </div>
                                </CardHeader>
                                <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <InfoItem icon={User} label="Full Name" value={`${student.firstName || ''} ${student.lastName || ''}`} />
                                    <InfoItem icon={Users} label="Gender" value={student.gender} />
                                    <InfoItem icon={Calendar} label="Date of Birth" value={student.dateOfBirth ? formatDateTime(student.dateOfBirth, { dateOnly: true }) : ''} />
                                    <InfoItem icon={Activity} label="Blood Group" value={student.bloodGroup} />
                                    <InfoItem icon={Users} label="Category" value={student.category} />
                                    <InfoItem icon={BookOpen} label="Religion/Caste" value={`${student.religion || ''} ${student.caste ? `(${student.caste})` : ''}`} />
                                </CardContent>
                            </Card>

                            {/* Contact & Physical Info */}
                            <Card>
                                <CardHeader className="pb-3">
                                    <div className="flex items-center gap-2">
                                        <Phone className="h-4 w-4 text-emerald-600" />
                                        <CardTitle className="text-base">Contact & Physical</CardTitle>
                                    </div>
                                </CardHeader>
                                <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <InfoItem icon={Phone} label="Mobile" value={student.mobileNumber} />
                                    <InfoItem icon={Mail} label="Email" value={student.email} />
                                    <InfoItem icon={Ruler} label="Height / Weight" value={student.height || student.weight ? `${student.height || '-'} cm / ${student.weight || '-'} kg` : ''} />
                                    <InfoItem icon={MapPin} label="House" value={student.house} />
                                    <InfoItem icon={Calendar} label="Admission Date" value={student.admissionDate ? formatDateTime(student.admissionDate) : ''} />
                                    <InfoItem icon={School} label="Previous School" value={student.previousSchool || 'N/A'} />
                                </CardContent>
                            </Card>
                        </div>

                        {/* Parents & Transport/Siblings Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Parents Information Column */}
                            <div className="space-y-6">
                                <Card className="h-full">
                                    <CardHeader className="pb-3">
                                        <div className="flex items-center gap-2">
                                            <Users className="h-4 w-4 text-purple-600" />
                                            <CardTitle className="text-base">Parent/Guardian Details</CardTitle>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        {/* Father */}
                                        {student.father?.name && (
                                            <div className="space-y-3">
                                                <h4 className="text-sm font-semibold flex items-center gap-2 text-blue-700">
                                                    <span className="h-5 w-5 rounded-full bg-blue-100 flex items-center justify-center text-[10px] font-bold">F</span>
                                                    Father
                                                </h4>
                                                <div className="ml-7 grid grid-cols-2 gap-y-2">
                                                    <div>
                                                        <p className="text-[10px] text-muted-foreground uppercase">Name</p>
                                                        <p className="text-sm font-medium">{student.father.name}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] text-muted-foreground uppercase">Phone</p>
                                                        <p className="text-sm font-medium">{student.father.phone || 'N/A'}</p>
                                                    </div>
                                                    <div className="col-span-2">
                                                        <p className="text-[10px] text-muted-foreground uppercase">Occupation</p>
                                                        <p className="text-sm font-medium">{student.father.occupation || 'N/A'}</p>
                                                    </div>
                                                </div>
                                                <Separator />
                                            </div>
                                        )}

                                        {/* Mother */}
                                        {student.mother?.name && (
                                            <div className="space-y-3">
                                                <h4 className="text-sm font-semibold flex items-center gap-2 text-pink-700">
                                                    <span className="h-5 w-5 rounded-full bg-pink-100 flex items-center justify-center text-[10px] font-bold">M</span>
                                                    Mother
                                                </h4>
                                                <div className="ml-7 grid grid-cols-2 gap-y-2">
                                                    <div>
                                                        <p className="text-[10px] text-muted-foreground uppercase">Name</p>
                                                        <p className="text-sm font-medium">{student.mother.name}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] text-muted-foreground uppercase">Phone</p>
                                                        <p className="text-sm font-medium">{student.mother.phone || 'N/A'}</p>
                                                    </div>
                                                    <div className="col-span-2">
                                                        <p className="text-[10px] text-muted-foreground uppercase">Occupation</p>
                                                        <p className="text-sm font-medium">{student.mother.occupation || 'N/A'}</p>
                                                    </div>
                                                </div>
                                                {student.guardian && <Separator />}
                                            </div>
                                        )}

                                        {/* Guardian */}
                                        {student.guardian?.name && (
                                            <div className="space-y-3">
                                                <h4 className="text-sm font-semibold flex items-center gap-2 text-amber-700">
                                                    <span className="h-5 w-5 rounded-full bg-amber-100 flex items-center justify-center text-[10px] font-bold">G</span>
                                                    Guardian
                                                </h4>
                                                <div className="ml-7 grid grid-cols-2 gap-y-2">
                                                    <div>
                                                        <p className="text-[10px] text-muted-foreground uppercase">Name</p>
                                                        <p className="text-sm font-medium">{student.guardian.name}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] text-muted-foreground uppercase">Relation</p>
                                                        <p className="text-sm font-medium">{student.guardian.relation || 'N/A'}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Transport & Siblings Column */}
                            <div className="space-y-6">
                                {/* Transport */}
                                {student.transport && (
                                    <Card>
                                        <CardHeader className="pb-3">
                                            <div className="flex items-center gap-2">
                                                <Bus className="h-4 w-4 text-orange-600" />
                                                <CardTitle className="text-base">Transport Details</CardTitle>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="grid grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-xs text-muted-foreground uppercase">Route</p>
                                                <p className="font-medium">{student.transport.route || 'N/A'}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-muted-foreground uppercase">Pickup Point</p>
                                                <p className="font-medium">{student.transport.pickupPoint || 'N/A'}</p>
                                            </div>
                                        </CardContent>
                                    </Card>
                                )}

                                {/* Siblings */}
                                {student.siblings && student.siblings.length > 0 && (
                                    <Card>
                                        <CardHeader className="pb-3">
                                            <div className="flex items-center gap-2">
                                                <Users className="h-4 w-4 text-cyan-600" />
                                                <CardTitle className="text-base">Siblings</CardTitle>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="space-y-3">
                                            {student.siblings.map((sib, idx) => (
                                                <div key={idx} className="flex items-center justify-between p-3 bg-muted/40 rounded-lg border">
                                                    <span className="font-medium text-sm">{sib.name}</span>
                                                    <Badge variant="outline" className="text-xs font-normal">
                                                        Class {sib.class} | Roll {sib.rollNum}
                                                    </Badge>
                                                </div>
                                            ))}
                                        </CardContent>
                                    </Card>
                                )}
                            </div>
                        </div>
                    </div>
                </ScrollArea>

                <div className="p-4 border-t bg-muted/20 flex justify-end shrink-0">
                    <Button variant="outline" onClick={onClose}>
                        Close Details
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default StudentDetailsModal;

