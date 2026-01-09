import React, { useState, useEffect } from 'react';
import { Upload, Plus, Trash2, User, BookOpen, Users, Bus, Save, X, CheckCircle } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { useCampus } from '../../context/CampusContext';
import { useToast } from '../../context/ToastContext';
import API_URL from '../../config/api.js';

const StudentAdmissionForm = ({ onSuccess, onCancel }) => {
    const { currentUser } = useAuth();
    const { campuses, selectedCampus } = useCampus();
    const { showToast } = useToast();
    const [classesList, setClassesList] = useState([]);
    const [loading, setLoading] = useState(false);
    
    // Guardian Selection State
    const [guardianType, setGuardianType] = useState('father'); // 'father', 'mother', 'other'

    // Initial Form State
    const initialFormState = {
        name: '', 
        rollNum: '',
        password: '',
        sclassName: '',
        section: '', // Added Section
        school: currentUser?._id,
        campus: selectedCampus?._id || '', // Campus field
        
        // Personal Info
        firstName: '',
        lastName: '',
        gender: '',
        dateOfBirth: '',
        category: '',
        mobileNumber: '',
        email: '',
        
        // Admission Details
        admissionDate: new Date().toISOString().split('T')[0],
        bloodGroup: '',
        house: '',
        height: '',
        weight: '',
        measurementDate: new Date().toISOString().split('T')[0],
        
        // Religion/Caste
        religion: '',
        caste: '',
        
        // Parents
        father: { name: '', phone: '', occupation: '', email: '', address: '' },
        mother: { name: '', phone: '', occupation: '', email: '', address: '' },
        guardian: { name: '', phone: '', occupation: '', email: '', address: '', relation: '' },
        
        // Transport
        transport: { route: '', pickupPoint: '', feesMonth: '' },
        
        // Siblings
        siblings: []
    };

    const [formData, setFormData] = useState(initialFormState);
    const [sectionsList, setSectionsList] = useState([]); // State for sections
    const [photos, setPhotos] = useState({
        studentPhoto: null,
        fatherPhoto: null,
        motherPhoto: null,
        guardianPhoto: null
    });
    
    // Preview URLs for photos
    const [previews, setPreviews] = useState({
        studentPhoto: null,
        fatherPhoto: null,
        motherPhoto: null,
        guardianPhoto: null
    });

    // Fetch Classes
    useEffect(() => {
        if (currentUser) {
            fetchClasses();
        }
    }, [currentUser]);

    const fetchClasses = async () => {
        try {
            const res = await axios.get(`${API_URL}/Sclasses/${currentUser._id}`);
            setClassesList(res.data);
        } catch (err) {
            showToast("Failed to load classes", "error");
        }
    };

    const handleChange = (e, section = null, index = null) => {
        const { name, value } = e.target;
        
        if (name === 'sclassName') {
            // Handle Class Change to update Sections
            const selectedClass = classesList.find(c => c._id === value);
            setSectionsList(selectedClass ? selectedClass.sections : []);
            setFormData({ ...formData, [name]: value, section: '' }); // Reset section
        } else if (section === 'siblings' && index !== null) {
            const newSiblings = [...formData.siblings];
            newSiblings[index] = { ...newSiblings[index], [name]: value };
            setFormData({ ...formData, siblings: newSiblings });
        } else if (section) {
            setFormData({
                ...formData,
                [section]: { ...formData[section], [name]: value }
            });
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const handleFileChange = (e, type) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setPhotos({ ...photos, [type]: file });
            
            // Create preview URL
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviews(prev => ({ ...prev, [type]: reader.result }));
            };
            reader.readAsDataURL(file);
        }
    };

    const addSibling = () => {
        setFormData({
            ...formData,
            siblings: [...formData.siblings, { name: '', class: '', section: '', rollNum: '', school: '' }]
        });
    };

    const removeSibling = (index) => {
        const newSiblings = formData.siblings.filter((_, i) => i !== index);
        setFormData({ ...formData, siblings: newSiblings });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        // Validation: Check if selected guardian details are filled
        if (guardianType === 'father' && !formData.father.name) {
            showToast("Please enter Father's Name", "error");
            setLoading(false);
            return;
        }
        if (guardianType === 'mother' && !formData.mother.name) {
            showToast("Please enter Mother's Name", "error");
            setLoading(false);
            return;
        }
        if (guardianType === 'other' && !formData.guardian.name) {
            showToast("Please enter Guardian's Name", "error");
            setLoading(false);
            return;
        }

        const fullName = `${formData.firstName} ${formData.lastName}`.trim();
        
        try {
            const data = new FormData();
            
            Object.keys(formData).forEach(key => {
                if (key === 'name' && !formData[key]) {
                     data.append('name', fullName);
                } else if (['father', 'mother', 'guardian', 'transport', 'siblings'].includes(key)) {
                    data.append(key, JSON.stringify(formData[key]));
                } else {
                    data.append(key, formData[key]);
                }
            });

            Object.keys(photos).forEach(key => {
                if (photos[key]) data.append(key, photos[key]);
            });

            await axios.post(`${API_URL}/StudentRegister`, data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            showToast("Student admitted successfully!", "success");
            if (onSuccess) onSuccess();
        } catch (err) {
            showToast(err.response?.data?.message || "Error admitting student", "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form id="admissionForm" onSubmit={handleSubmit} className="space-y-8">
            
            {/* 1. Personal Information */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="bg-linear-to-r from-indigo-50 to-white px-6 py-4 border-b border-gray-100 flex items-center gap-3">
                    <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
                        <User size={20} />
                    </div>
                    <h3 className="text-lg font-bold text-gray-800">Personal Information</h3>
                </div>
                
                <div className="p-6 md:p-8">
                    <div className="flex flex-col md:flex-row gap-8">
                        {/* Photo Upload Section */}
                        <div className="w-full md:w-1/4 flex flex-col items-center">
                            <PhotoUpload label="Student Photo" type="studentPhoto" preview={previews.studentPhoto} onFileChange={handleFileChange} />
                        </div>

                        {/* Fields Section */}
                        <div className="w-full md:w-3/4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <InputField label="Roll Number" name="rollNum" type="number" value={formData.rollNum} onChange={handleChange} required />
                            <SelectField 
                                label="Class" 
                                name="sclassName" 
                                value={formData.sclassName} 
                                onChange={handleChange} 
                                required
                                options={classesList.map(cls => ({ value: cls._id, label: cls.sclassName }))}
                            />
                            <SelectField 
                                label="Section" 
                                name="section" 
                                value={formData.section} 
                                onChange={handleChange} 
                                required
                                options={sectionsList.map(sec => ({ value: sec.sectionName, label: sec.sectionName }))}
                            />
                            <SelectField
                                label="Campus"
                                name="campus"
                                value={formData.campus}
                                onChange={handleChange}
                                options={campuses.map(campus => ({ value: campus._id, label: campus.campusName }))}
                            />

                            <InputField label="First Name" name="firstName" value={formData.firstName} onChange={handleChange} required />
                            <InputField label="Last Name" name="lastName" value={formData.lastName} onChange={handleChange} />
                            <SelectField 
                                label="Gender" 
                                name="gender" 
                                value={formData.gender} 
                                onChange={handleChange} 
                                options={[
                                    { value: 'Male', label: 'Male' },
                                    { value: 'Female', label: 'Female' },
                                    { value: 'Other', label: 'Other' }
                                ]} 
                            />
                            <InputField label="Date of Birth" name="dateOfBirth" type="date" value={formData.dateOfBirth} onChange={handleChange} />
                            <SelectField 
                                label="Category" 
                                name="category" 
                                value={formData.category} 
                                onChange={handleChange} 
                                options={[
                                    { value: 'General', label: 'General' },
                                    { value: 'OBC', label: 'OBC' },
                                    { value: 'SC', label: 'SC' },
                                    { value: 'ST', label: 'ST' }
                                ]} 
                            />
                            <InputField label="Mobile Number" name="mobileNumber" value={formData.mobileNumber} onChange={handleChange} />
                            <InputField label="Email" name="email" type="email" value={formData.email} onChange={handleChange} />
                            
                            <InputField label="Admission Date" name="admissionDate" type="date" value={formData.admissionDate} onChange={handleChange} />
                            <SelectField 
                                label="Blood Group" 
                                name="bloodGroup" 
                                value={formData.bloodGroup} 
                                onChange={handleChange} 
                                options={[
                                    { value: 'A+', label: 'A+' }, { value: 'A-', label: 'A-' },
                                    { value: 'B+', label: 'B+' }, { value: 'B-', label: 'B-' },
                                    { value: 'O+', label: 'O+' }, { value: 'O-', label: 'O-' },
                                    { value: 'AB+', label: 'AB+' }, { value: 'AB-', label: 'AB-' }
                                ]} 
                            />
                            <SelectField 
                                label="House" 
                                name="house" 
                                value={formData.house} 
                                onChange={handleChange} 
                                options={[
                                    { value: 'Red', label: 'Red' }, { value: 'Green', label: 'Green' },
                                    { value: 'Blue', label: 'Blue' }, { value: 'Yellow', label: 'Yellow' }
                                ]} 
                            />
                            <InputField label="Height (cm)" name="height" type="number" value={formData.height} onChange={handleChange} />
                            <InputField label="Weight (kg)" name="weight" type="number" value={formData.weight} onChange={handleChange} />
                            <InputField label="Measurement Date" name="measurementDate" type="date" value={formData.measurementDate} onChange={handleChange} />
                            
                            {/* Religion Checkboxes */}
                            <div className="col-span-full">
                                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Religion <span className="text-red-500">*</span></label>
                                <div className="flex gap-4 flex-wrap">
                                    {['Muslim', 'Christian', 'Other'].map(rel => (
                                        <label key={rel} className="flex items-center gap-2 cursor-pointer">
                                            <input 
                                                type="radio" 
                                                name="religion" 
                                                value={rel} 
                                                checked={formData.religion === rel} 
                                                onChange={handleChange}
                                                className="w-4 h-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                                            />
                                            <span className="text-sm text-gray-700">{rel}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Caste Checkboxes */}
                            <div className="col-span-full">
                                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Caste</label>
                                <div className="flex gap-4 flex-wrap">
                                    {['Arain', 'Ansari', 'Comboh', 'Dogar', 'Jutt', 'Meo', 'Rahmani', 'Malik', 'Other'].map(cst => (
                                        <label key={cst} className="flex items-center gap-2 cursor-pointer">
                                            <input 
                                                type="radio" 
                                                name="caste" 
                                                value={cst} 
                                                checked={formData.caste === cst} 
                                                onChange={handleChange}
                                                className="w-4 h-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                                            />
                                            <span className="text-sm text-gray-700">{cst}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            </div>

            {/* 2. Academic Details (Removed as merged into Personal Info or simplified) */}
            {/* Keeping Password here as it's not in Personal Info in the image, but usually it is required. 
                The image doesn't show Password. I'll keep it in a separate small section or add it to Personal Info if needed.
                Actually, let's keep a small "Account Details" section for Password if not visible in image, or just hide it if auto-generated?
                The user's image doesn't show password. I will keep it but maybe at the bottom or separate.
                For now, I'll keep the "Academic Details" block but only for Password since others are moved.
            */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                 <div className="bg-linear-to-r from-emerald-50 to-white px-6 py-4 border-b border-gray-100 flex items-center gap-3">
                    <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg">
                        <BookOpen size={20} />
                    </div>
                    <h3 className="text-lg font-bold text-gray-800">Account Details</h3>
                </div>
                <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <InputField label="Password" name="password" type="password" value={formData.password} onChange={handleChange} required />
                </div>
            </div>

            {/* 3. Parent/Guardian Details */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="bg-linear-to-r from-purple-50 to-white px-6 py-4 border-b border-gray-100 flex items-center justify-between flex-wrap gap-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-100 text-purple-600 rounded-lg">
                            <Users size={20} />
                        </div>
                        <h3 className="text-lg font-bold text-gray-800">Parent/Guardian Details</h3>
                    </div>
                    
                    {/* Guardian Type Selection Toggle */}
                    <div className="flex bg-gray-100 p-1 rounded-lg">
                        {['father', 'mother', 'other'].map((type) => (
                            <button
                                key={type}
                                type="button"
                                onClick={() => setGuardianType(type)}
                                className={`px-4 py-1.5 rounded-md text-sm font-semibold transition-all capitalize ${
                                    guardianType === type 
                                    ? 'bg-white text-indigo-600 shadow-xs' 
                                    : 'text-gray-500 hover:text-gray-700'
                                }`}
                            >
                                {type === 'other' ? 'Guardian' : type}
                            </button>
                        ))}
                    </div>
                </div>
                
                <div className="p-6 md:p-8 space-y-8">
                    
                    {/* Father Form */}
                    {guardianType === 'father' && (
                        <div className="bg-gray-50/50 p-6 rounded-xl border border-gray-100 animate-fade-in">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">F</div>
                                <h4 className="text-md font-bold text-gray-700">Father's Information</h4>
                            </div>
                            <div className="flex flex-col md:flex-row gap-6">
                                <div className="w-full md:w-1/5">
                                    <PhotoUpload label="Father's Photo" type="fatherPhoto" preview={previews.fatherPhoto} onFileChange={handleFileChange} />
                                </div>
                                <div className="w-full md:w-4/5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    <InputField label="Name" name="name" value={formData.father.name} onChange={(e) => handleChange(e, 'father')} required />
                                    <InputField label="Phone" name="phone" value={formData.father.phone} onChange={(e) => handleChange(e, 'father')} />
                                    <InputField label="Occupation" name="occupation" value={formData.father.occupation} onChange={(e) => handleChange(e, 'father')} />
                                    <InputField label="Email" name="email" value={formData.father.email} onChange={(e) => handleChange(e, 'father')} />
                                    <div className="md:col-span-2">
                                        <InputField label="Address" name="address" value={formData.father.address} onChange={(e) => handleChange(e, 'father')} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Mother Form */}
                    {guardianType === 'mother' && (
                        <div className="bg-gray-50/50 p-6 rounded-xl border border-gray-100 animate-fade-in">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center text-pink-600 font-bold">M</div>
                                <h4 className="text-md font-bold text-gray-700">Mother's Information</h4>
                            </div>
                            <div className="flex flex-col md:flex-row gap-6">
                                <div className="w-full md:w-1/5">
                                    <PhotoUpload label="Mother's Photo" type="motherPhoto" preview={previews.motherPhoto} onFileChange={handleFileChange} />
                                </div>
                                <div className="w-full md:w-4/5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    <InputField label="Name" name="name" value={formData.mother.name} onChange={(e) => handleChange(e, 'mother')} required />
                                    <InputField label="Phone" name="phone" value={formData.mother.phone} onChange={(e) => handleChange(e, 'mother')} />
                                    <InputField label="Occupation" name="occupation" value={formData.mother.occupation} onChange={(e) => handleChange(e, 'mother')} />
                                    <InputField label="Email" name="email" value={formData.mother.email} onChange={(e) => handleChange(e, 'mother')} />
                                    <div className="md:col-span-2">
                                        <InputField label="Address" name="address" value={formData.mother.address} onChange={(e) => handleChange(e, 'mother')} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Guardian Form */}
                    {guardianType === 'other' && (
                        <div className="bg-gray-50/50 p-6 rounded-xl border border-gray-100 animate-fade-in">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-bold">G</div>
                                <h4 className="text-md font-bold text-gray-700">Guardian's Information</h4>
                            </div>
                            <div className="flex flex-col md:flex-row gap-6">
                                <div className="w-full md:w-1/5">
                                    <PhotoUpload label="Guardian's Photo" type="guardianPhoto" preview={previews.guardianPhoto} onFileChange={handleFileChange} />
                                </div>
                                <div className="w-full md:w-4/5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    <InputField label="Name" name="name" value={formData.guardian.name} onChange={(e) => handleChange(e, 'guardian')} required />
                                    <InputField label="Relation" name="relation" value={formData.guardian.relation} onChange={(e) => handleChange(e, 'guardian')} required />
                                    <InputField label="Phone" name="phone" value={formData.guardian.phone} onChange={(e) => handleChange(e, 'guardian')} />
                                    <InputField label="Occupation" name="occupation" value={formData.guardian.occupation} onChange={(e) => handleChange(e, 'guardian')} />
                                    <InputField label="Email" name="email" value={formData.guardian.email} onChange={(e) => handleChange(e, 'guardian')} />
                                    <div className="md:col-span-2">
                                        <InputField label="Address" name="address" value={formData.guardian.address} onChange={(e) => handleChange(e, 'guardian')} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                </div>
            </div>

            {/* 4. Transport Details */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="bg-linear-to-r from-orange-50 to-white px-6 py-4 border-b border-gray-100 flex items-center gap-3">
                    <div className="p-2 bg-orange-100 text-orange-600 rounded-lg">
                        <Bus size={20} />
                    </div>
                    <h3 className="text-lg font-bold text-gray-800">Transport Details</h3>
                </div>
                <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                    <InputField label="Route" name="route" value={formData.transport.route} onChange={(e) => handleChange(e, 'transport')} />
                    <InputField label="Pickup Point" name="pickupPoint" value={formData.transport.pickupPoint} onChange={(e) => handleChange(e, 'transport')} />
                    <InputField label="Fees Month" name="feesMonth" value={formData.transport.feesMonth} onChange={(e) => handleChange(e, 'transport')} />
                </div>
            </div>

            {/* 5. Siblings */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="bg-linear-to-r from-cyan-50 to-white px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-cyan-100 text-cyan-600 rounded-lg">
                            <Users size={20} />
                        </div>
                        <h3 className="text-lg font-bold text-gray-800">Sibling Information</h3>
                    </div>
                    <button type="button" onClick={addSibling} className="flex items-center px-4 py-2 bg-cyan-50 text-cyan-700 rounded-lg hover:bg-cyan-100 transition-colors text-sm font-semibold">
                        <Plus size={16} className="mr-2" /> Add Sibling
                    </button>
                </div>
                
                <div className="p-6 md:p-8">
                    {formData.siblings.length === 0 ? (
                        <div className="text-center py-8 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                            <p className="text-gray-400 text-sm">No siblings added yet. Click "Add Sibling" to add one.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {formData.siblings.map((sibling, index) => (
                                <div key={index} className="bg-gray-50 p-6 rounded-xl border border-gray-200 relative group hover:border-cyan-200 transition-colors">
                                    <button type="button" onClick={() => removeSibling(index)} className="absolute top-4 right-4 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100">
                                        <Trash2 size={18} />
                                    </button>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <InputField label="Sibling Name" name="name" value={sibling.name} onChange={(e) => handleChange(e, 'siblings', index)} />
                                        <InputField label="Class" name="class" value={sibling.class} onChange={(e) => handleChange(e, 'siblings', index)} />
                                        <InputField label="Roll Number" name="rollNum" value={sibling.rollNum} onChange={(e) => handleChange(e, 'siblings', index)} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Footer Actions */}
            <div className="flex justify-end gap-4 pt-4 pb-8">
                {onCancel && (
                    <button type="button" onClick={onCancel} className="px-8 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 font-semibold transition-all shadow-sm hover:shadow-md flex items-center">
                        <X size={18} className="mr-2" /> Cancel
                    </button>
                )}
                <button 
                    type="submit" 
                    disabled={loading}
                    className="px-8 py-3 bg-linear-to-r from-indigo-600 to-violet-600 text-white rounded-xl hover:from-indigo-700 hover:to-violet-700 font-semibold transition-all shadow-lg hover:shadow-indigo-500/30 flex items-center disabled:opacity-70 disabled:cursor-not-allowed transform hover:-translate-y-0.5"
                >
                    {loading ? (
                        <span className="flex items-center"><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div> Processing...</span>
                    ) : (
                        <span className="flex items-center"><Save size={18} className="mr-2" /> Admit Student</span>
                    )}
                </button>
            </div>
        </form>
    );
};

// Reusable Input Component (Moved Outside)
const InputField = ({ label, name, value, onChange, type = "text", required = false, placeholder = "" }) => (
    <div className="group">
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 ml-1">{label} {required && <span className="text-red-500">*</span>}</label>
        <input 
            type={type} 
            name={name} 
            value={value} 
            onChange={onChange} 
            required={required}
            placeholder={placeholder}
            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-700 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all duration-200 outline-none placeholder:text-gray-400"
        />
    </div>
);

// Reusable Select Component (Moved Outside)
const SelectField = ({ label, name, value, onChange, options, required = false }) => (
    <div className="group">
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 ml-1">{label} {required && <span className="text-red-500">*</span>}</label>
        <div className="relative">
            <select 
                name={name} 
                value={value} 
                onChange={onChange} 
                required={required}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-700 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all duration-200 outline-none appearance-none cursor-pointer"
            >
                <option value="">Select {label}</option>
                {options.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-gray-500">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" fillRule="evenodd"></path></svg>
            </div>
        </div>
    </div>
);

// Photo Upload Component (Moved Outside)
const PhotoUpload = ({ label, type, preview, onFileChange }) => (
    <div className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-xl hover:border-indigo-400 hover:bg-indigo-50/30 transition-all duration-200 group cursor-pointer relative overflow-hidden w-full h-full min-h-[280px]">
        <input type="file" hidden onChange={(e) => onFileChange(e, type)} accept="image/*" id={`file-${type}`} />
        <label htmlFor={`file-${type}`} className="cursor-pointer w-full h-full flex flex-col items-center justify-center">
            {preview ? (
                <div className="relative w-40 h-40 mb-4">
                    <img src={preview} alt="Preview" className="w-full h-full object-cover rounded-full shadow-md border-4 border-white" />
                    <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Upload className="text-white w-8 h-8" />
                    </div>
                </div>
            ) : (
                <div className="w-32 h-32 bg-indigo-100 text-indigo-500 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <User className="w-16 h-16" />
                </div>
            )}
            <span className="text-lg font-medium text-gray-600 group-hover:text-indigo-600 transition-colors">{label}</span>
            <span className="text-sm text-gray-400 mt-1">Click to upload</span>
        </label>
    </div>
);

export default StudentAdmissionForm;
