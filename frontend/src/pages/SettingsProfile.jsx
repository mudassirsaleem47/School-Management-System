import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Upload, Save, Building, Mail, Phone, MapPin, Globe, User } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL;

const SettingsProfile = () => {
    const { currentUser, setCurrentUser } = useAuth(); 
    const { showToast } = useToast();
    const [loading, setLoading] = useState(false);
    
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        schoolName: '',
        address: '',
        phoneNumber: '',
        website: ''
    });

    const [logo, setLogo] = useState(null);
    const [logoPreview, setLogoPreview] = useState(null);

    useEffect(() => {
        if (currentUser) {
            fetchSettings();
        }
    }, [currentUser]);

    const fetchSettings = async () => {
        try {
            const res = await axios.get(`${API_BASE}/Admin/${currentUser._id}`);
            const data = res.data;
            setFormData({
                name: data.name || '',
                email: data.email || '',
                schoolName: data.schoolName || '',
                address: data.address || '',
                phoneNumber: data.phoneNumber || '',
                website: data.website || ''
            });
            if (data.schoolLogo) {
                setLogoPreview(data.schoolLogo.startsWith('http') ? data.schoolLogo : `${API_BASE}/${data.schoolLogo}`);
            }
        } catch (err) {
            console.error("Error fetching settings:", err);
            showToast("Failed to load settings", "error");
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleLogoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setLogo(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setLogoPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const data = new FormData();
            Object.keys(formData).forEach(key => {
                data.append(key, formData[key]);
            });
            if (logo) {
                data.append('schoolLogo', logo);
            }

            const res = await axios.put(`${API_BASE}/Admin/${currentUser._id}`, data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            // Update local storage/context
            setCurrentUser(res.data); 

            showToast("Settings updated successfully!", "success");
        } catch (err) {
            console.error("Error updating settings:", err);
            showToast("Failed to update settings", "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50/50 p-6 md:p-8">
            <div className="mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
                    <p className="text-gray-600 mt-2">Manage your school profile and account settings</p>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="border-b border-gray-200">
                        <nav className="flex gap-6 px-6">
                            <button className="py-4 text-sm font-medium text-indigo-600 border-b-2 border-indigo-600">
                                General Profile
                            </button>
                            {/* Add more tabs here if needed like Security, Notifications etc */}
                        </nav>
                    </div>

                    <div className="p-6 md:p-8">
                        <form onSubmit={handleSubmit} className="space-y-8">
                            
                            {/* School Logo Section */}
                            <div className="flex flex-col md:flex-row gap-8 items-start">
                                <div className="w-full md:w-1/3">
                                    <label className="block text-sm font-medium text-gray-700 mb-4">School Logo</label>
                                    <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-300 rounded-xl hover:border-indigo-400 hover:bg-indigo-50/30 transition-all group cursor-pointer relative">
                                        <input type="file" hidden onChange={handleLogoChange} accept="image/*" id="logo-upload" />
                                        <label htmlFor="logo-upload" className="cursor-pointer w-full flex flex-col items-center">
                                            {logoPreview ? (
                                                <div className="relative w-32 h-32 mb-4">
                                                    <img src={logoPreview} alt="Logo Preview" className="w-full h-full object-contain rounded-lg" />
                                                    <div className="absolute inset-0 bg-black/40 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <Upload className="text-white w-8 h-8" />
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="w-32 h-32 bg-indigo-50 text-indigo-200 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                                    <Building className="w-12 h-12" />
                                                </div>
                                            )}
                                            <span className="text-sm font-medium text-gray-600 group-hover:text-indigo-600">Click to upload logo</span>
                                            <span className="text-xs text-gray-400 mt-1">PNG, JPG up to 5MB</span>
                                        </label>
                                    </div>
                                </div>

                                <div className="w-full md:w-2/3 space-y-6">
                                    <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                                        <Building size={20} className="text-indigo-500" />
                                        School Information
                                    </h3>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <InputField 
                                            label="School Name" 
                                            name="schoolName" 
                                            value={formData.schoolName} 
                                            onChange={handleChange} 
                                            icon={Building}
                                            required
                                        />
                                        <InputField 
                                            label="Website" 
                                            name="website" 
                                            value={formData.website} 
                                            onChange={handleChange} 
                                            icon={Globe}
                                            placeholder="https://example.com"
                                        />
                                        <InputField 
                                            label="Phone Number" 
                                            name="phoneNumber" 
                                            value={formData.phoneNumber} 
                                            onChange={handleChange} 
                                            icon={Phone}
                                        />
                                        <InputField 
                                            label="Email Address" 
                                            name="email" 
                                            value={formData.email} 
                                            onChange={handleChange} 
                                            icon={Mail}
                                            type="email"
                                            required
                                        />
                                    </div>
                                    
                                    <div className="col-span-full">
                                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Address</label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                                <MapPin size={18} />
                                            </div>
                                            <textarea 
                                                name="address"
                                                value={formData.address}
                                                onChange={handleChange}
                                                rows="3"
                                                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all resize-none"
                                                placeholder="Enter school address..."
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <hr className="border-gray-100" />

                            {/* Admin Profile Section */}
                            <div className="space-y-6">
                                <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                                    <User size={20} className="text-indigo-500" />
                                    Admin Profile
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <InputField 
                                        label="Admin Name" 
                                        name="name" 
                                        value={formData.name} 
                                        onChange={handleChange} 
                                        icon={User}
                                        required
                                    />
                                    {/* Password change could be a separate modal or section */}
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex justify-end gap-4 pt-4">
                                <button 
                                    type="button" 
                                    onClick={() => fetchSettings()} // Reset to last saved
                                    className="px-6 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit" 
                                    disabled={loading}
                                    className="px-6 py-2.5 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-500/20 transition-all flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                                >
                                    {loading ? (
                                        <>Processing...</>
                                    ) : (
                                        <>
                                            <Save size={18} /> Save Changes
                                        </>
                                    )}
                                </button>
                            </div>

                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

const InputField = ({ label, name, value, onChange, type = "text", required = false, placeholder = "", icon: Icon }) => (
    <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
            {label} {required && <span className="text-red-500">*</span>}
        </label>
        <div className="relative">
            {Icon && (
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <Icon size={18} />
                </div>
            )}
            <input 
                type={type} 
                name={name} 
                value={value} 
                onChange={onChange} 
                required={required}
                placeholder={placeholder}
                className={`w-full ${Icon ? 'pl-10' : 'pl-4'} pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all text-gray-700`}
            />
        </div>
    </div>
);

export default SettingsProfile;
