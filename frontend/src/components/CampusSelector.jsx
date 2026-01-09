import React, { useState, useRef, useEffect } from 'react';
import { useCampus } from '../context/CampusContext';
import { Building2, ChevronDown, Check } from 'lucide-react';

const CampusSelector = () => {
    const { campuses, selectedCampus, changeCampus, clearCampusSelection, loading } = useCampus();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Show placeholder if no campuses yet
    if (loading) {
        return (
            <div className="bg-gray-100 border border-gray-300 rounded-lg px-4 py-2 text-sm text-gray-400 min-w-[200px] animate-pulse">
                Loading campuses...
            </div>
        );
    }

    const handleSelect = (campus) => {
        if (campus === null) {
            clearCampusSelection();
        } else {
            changeCampus(campus);
        }
        setIsOpen(false);
    };

    const displayText = selectedCampus
        ? `${selectedCampus.campusName} ${selectedCampus.isMain ? '(Main)' : ''}`
        : 'All Campuses';

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                disabled={campuses.length === 0}
                className="campus-selector-button"
            >
                <Building2 className="w-4 h-4 text-gray-500" />
                <span className="flex-1 text-left">{displayText}</span>
                <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div className="campus-dropdown">
                    <div
                        onClick={() => handleSelect(null)}
                        className={`campus-option ${!selectedCampus ? 'campus-option-selected' : ''}`}
                    >
                        <span className="flex-1">All Campuses</span>
                        {!selectedCampus && <Check className="w-4 h-4 text-indigo-600" />}
                    </div>

                    {campuses.map(campus => (
                        <div
                            key={campus._id}
                            onClick={() => handleSelect(campus)}
                            className={`campus-option ${selectedCampus?._id === campus._id ? 'campus-option-selected' : ''}`}
                        >
                            <span className="flex-1">
                                {campus.campusName} {campus.isMain && <span className="text-xs text-gray-500">(Main)</span>}
                            </span>
                            {selectedCampus?._id === campus._id && <Check className="w-4 h-4 text-indigo-600" />}
                        </div>
                    ))}
                </div>
            )}

            <style jsx>{`
                .campus-selector-button {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    background: linear-gradient(to bottom, #ffffff, #f9fafb);
                    border: 1px solid #e5e7eb;
                    border-radius: 0.5rem;
                    padding: 0.5rem 0.75rem;
                    min-width: 200px;
                    font-size: 0.875rem;
                    font-weight: 500;
                    color: #374151;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
                }

                .campus-selector-button:hover:not(:disabled) {
                    border-color: #818cf8;
                    box-shadow: 0 4px 6px -1px rgba(99, 102, 241, 0.1), 0 2px 4px -1px rgba(99, 102, 241, 0.06);
                    transform: translateY(-1px);
                }

                .campus-selector-button:active:not(:disabled) {
                    transform: translateY(0);
                    box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
                }

                .campus-selector-button:disabled {
                    background: #f3f4f6;
                    cursor: not-allowed;
                    opacity: 0.6;
                }

                .campus-dropdown {
                    position: absolute;
                    top: calc(100% + 0.5rem);
                    left: 0;
                    right: 0;
                    background: white;
                    border: 1px solid #e5e7eb;
                    border-radius: 0.5rem;
                    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
                    z-index: 50;
                    overflow: hidden;
                    animation: slideDown 0.15s ease;
                    -webkit-animation: slideDown 0.15s ease;
                }

                @keyframes slideDown {
                    from {
                        opacity: 0;
                        transform: translateY(-10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                @-webkit-keyframes slideDown {
                    from {
                        opacity: 0;
                        -webkit-transform: translateY(-10px);
                    }
                    to {
                        opacity: 1;
                        -webkit-transform: translateY(0);
                    }
                }

                .campus-option {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    padding: 0.625rem 0.75rem;
                    font-size: 0.875rem;
                    color: #374151;
                    cursor: pointer;
                    transition: all 0.15s ease;
                    -webkit-transition: all 0.15s ease;
                    position: relative;
                }

                .campus-option::before {
                    content: '';
                    position: absolute;
                    left: 0;
                    top: 0;
                    bottom: 0;
                    width: 3px;
                    background: #6366f1;
                    transform: scaleY(0);
                    -webkit-transform: scaleY(0);
                    transition: transform 0.15s ease;
                    -webkit-transition: -webkit-transform 0.15s ease;
                }

                .campus-option:hover {
                    background: linear-gradient(to right, #eef2ff, #f5f3ff);
                    color: #4f46e5;
                    padding-left: 1rem;
                }

                .campus-option:hover::before {
                    transform: scaleY(1);
                    -webkit-transform: scaleY(1);
                }

                .campus-option-selected {
                    background: linear-gradient(to right, #eef2ff, #ffffff);
                    color: #4f46e5;
                    font-weight: 500;
                }

                .campus-option-selected::before {
                    transform: scaleY(1);
                    -webkit-transform: scaleY(1);
                }

                .campus-option:active {
                    background: #e0e7ff;
                }

                /* Webkit scrollbar styling */
                .campus-dropdown::-webkit-scrollbar {
                    width: 6px;
                }

                .campus-dropdown::-webkit-scrollbar-track {
                    background: #f3f4f6;
                    border-radius: 0 0.5rem 0.5rem 0;
                }

                .campus-dropdown::-webkit-scrollbar-thumb {
                    background: #d1d5db;
                    border-radius: 3px;
                    transition: background 0.15s ease;
                }

                .campus-dropdown::-webkit-scrollbar-thumb:hover {
                    background: #9ca3af;
                }
            `}</style>
        </div>
    );
};

export default CampusSelector;
