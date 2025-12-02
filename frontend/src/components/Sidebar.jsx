import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import logo from '../assets/spark-logo.svg';

import { 
    Home, BookOpen, GraduationCap, DollarSign, Briefcase,
    ChevronDown, ChevronRight, Settings, FileText, ChevronsRight
} from 'lucide-react';

const Sidebar = ({ onLogout }) => {
    const location = useLocation();
    const [openMenu, setOpenMenu] = useState(null);

    const toggleMenu = (menuName) => {
        if (openMenu === menuName) {
            setOpenMenu(null);
        } else {
            setOpenMenu(menuName);
        }
    };

    const navItems = [
        { 
            name: 'Front Office', 
            icon: Briefcase,
            type: 'dropdown',
            children: [
                { name: 'Admission Enquiry', path: '/admin/enquiry' },
                { name: 'Visitor Book', path: '/admin/visitor-book' },
                { name: 'Phone Call Log', path: '/admin/phone-calls' },
                { name: 'Complain', path: '/admin/complain' },
            ]
        },
        { 
            name: 'Student Information', 
            icon: GraduationCap, 
            type: 'dropdown',
            children: [
                { name: 'Students Details', path: '/admin/students' },
                { name: 'Student Admission', path: '/admin/admission' },
            ]
        },
        { 
            name: 'Academics', 
            icon: BookOpen, 
            type: 'dropdown',
            children: [
                { name: 'Classes', path: '/admin/classes' },
                { name: 'Teachers', path: '/admin/teachers' },
            ]
        },
        { 
            name: 'Fees Collection', 
            icon: DollarSign, 
            type: 'dropdown',
            children: [
                { name: 'Collect Fees', path: '/admin/fees/collect' },
                { name: 'Fee Structure', path: '/admin/fees/structure' },
            ]
        },
        { name: 'Reports', path: '/admin/reports', icon: FileText, type: 'link' },
        { name: 'Settings', path: '/admin/settings', icon: Settings, type: 'link' },
    ];

    return (
        <div className="w-64 pb-5 flex flex-col border-r overflow-y-auto" style={{ backgroundColor: 'var(--sidebar-bg)', color: '#ffffff' }}>
            
            {/* Logo Section */}
            <div className="p-3 pl-7 border-b flex items-center  gap-3" style={{ borderColor: '#262626' }}>
                <a href="/admin/dashboard">
                <img src={logo}  className="h-15 w-auto" />
                </a>
            </div>
            
            {/* Navigation Links */}
            <nav className="flex-1 px-3 py-4 space-y-1">
                {navItems.map((item, index) => (
                    <div key={index}>
                        
                        {/* CASE 1: Simple Link */}
                        {item.type === 'link' ? (
                            <NavLink
                                to={item.path}
                                className={({ isActive }) => 
                                    `flex items-center px-3 py-2.5 rounded-lg transition duration-200 text-sm font-500
                                    ${isActive 
                                        ? 'text-white' 
                                        : 'text-gray-300 hover:text-white'}`
                                }
                                style={({ isActive }) => ({
                                    backgroundColor: isActive ? 'var(--navitem-bg-hover)' : 'transparent'
                                })}
                            >
                                <item.icon className="w-5 h-5 mr-3" />
                                <span>{item.name}</span>
                            </NavLink>
                        ) : (
                            
                        /* CASE 2: Dropdown Menu */
                            <div>
                                <button
                                    onClick={() => toggleMenu(item.name)}
                                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition duration-200 text-sm font-500
                                        ${(openMenu === item.name || location.pathname.includes(item.name.toLowerCase())) 
                                            ? 'text-white' 
                                            : 'text-gray-300 hover:text-white'}`
                                    }
                                    style={{
                                        backgroundColor: (openMenu === item.name || location.pathname.includes(item.name.toLowerCase())) 
                                            ? 'var(--navitem-bg-hover)' 
                                            : 'transparent'
                                    }}
                                >
                                    <div className="flex items-center">
                                        <item.icon className="w-5 h-5 mr-3" />
                                        <span>{item.name}</span>
                                    </div>
                                    {openMenu === item.name ? (
                                        <ChevronDown className="w-4 h-4" />
                                    ) : (
                                        <ChevronRight className="w-4 h-4 opacity-70" />
                                    )}
                                </button>

                                {/* Sub-menu Items */}
                                {openMenu === item.name && (
                                    <div className="ml-2 space-y-1 rounded-lg  transition-all duration-300">
                                        {item.children.map((child, childIndex) => (
                                            <NavLink
                                                key={childIndex}
                                                to={child.path}
                                                className={({ isActive }) => 
                                                    `flex items-center gap-2 px-3 pt-2 text-sm rounded transition
                                                    ${isActive ? 'font-500 text-white' : 'text-gray-400 hover:text-gray-200'}`
                                                }
                                            >
                                                <ChevronsRight className="w-4 h-4" />
                                                {child.name}
                                            </NavLink>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                ))}
            </nav>
        </div>
    );
};

export default Sidebar;