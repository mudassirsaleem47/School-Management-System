import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import EventFormModal from './form-popup/EventFormModal';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useModalAnimation } from '../hooks/useModalAnimation';

const API_BASE = "http://localhost:5000";

const CalendarModal = ({ isOpen, onClose }) => {
    const { currentUser } = useAuth();
    const { isVisible, isClosing, handleClose } = useModalAnimation(isOpen, onClose);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [events, setEvents] = useState([]);
    const [showEventForm, setShowEventForm] = useState(false);
    const [selectedDate, setSelectedDate] = useState(null);
    const [selectedEvent, setSelectedEvent] = useState(null);

    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    // Fetch events
    useEffect(() => {
        if (isOpen && currentUser?._id) {
            fetchEvents();
        }
    }, [isOpen, currentUser]);

    const fetchEvents = async () => {
        try {
            const response = await axios.get(`${API_BASE}/Events/${currentUser._id}`);
            setEvents(response.data);
        } catch (error) {
            console.error('Error fetching events:', error);
        }
    };

    const getDaysInMonth = (date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDayOfWeek = firstDay.getDay();

        return { daysInMonth, startingDayOfWeek };
    };

    const getEventsForDate = (date) => {
        return events.filter(event => {
            const eventStart = new Date(event.eventFrom);
            const eventEnd = new Date(event.eventTo);
            const checkDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), date);
            
            return checkDate >= new Date(eventStart.toDateString()) && 
                   checkDate <= new Date(eventEnd.toDateString());
        });
    };

    const handlePreviousMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
    };

    const handleNextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
    };

    const handleDateClick = (date) => {
        const clickedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), date);
        setSelectedDate(clickedDate);
        setSelectedEvent(null);
        setShowEventForm(true);
    };

    const handleEventClick = (event, e) => {
        e.stopPropagation();
        setSelectedEvent(event);
        setSelectedDate(null);
        setShowEventForm(true);
    };

    const handleEventFormClose = () => {
        setShowEventForm(false);
        setSelectedDate(null);
        setSelectedEvent(null);
        fetchEvents(); // Refresh events
    };

    const renderCalendar = () => {
        const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentDate);
        const days = [];

        // Empty cells for days before month starts
        for (let i = 0; i < startingDayOfWeek; i++) {
            days.push(<div key={`empty-${i}`} className="h-24 bg-gray-50 border border-gray-200"></div>);
        }

        // Days of the month
        for (let day = 1; day <= daysInMonth; day++) {
            const dayEvents = getEventsForDate(day);
            const isToday = new Date().toDateString() === new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toDateString();

            days.push(
                <div
                    key={day}
                    onClick={() => handleDateClick(day)}
                    className={`h-24 border border-gray-200 p-2 cursor-pointer hover:bg-blue-50 transition ${isToday ? 'bg-blue-100' : 'bg-white'}`}
                >
                    <div className={`text-sm font-600 mb-1 ${isToday ? 'text-blue-600' : 'text-gray-700'}`}>
                        {day}
                    </div>
                    <div className="space-y-1 overflow-y-auto max-h-16">
                        {dayEvents.slice(0, 2).map((event, idx) => (
                            <div
                                key={idx}
                                onClick={(e) => handleEventClick(event, e)}
                                className="text-xs px-1 py-0.5 rounded truncate"
                                style={{ backgroundColor: event.eventColor + '20', color: event.eventColor, borderLeft: `3px solid ${event.eventColor}` }}
                            >
                                {event.eventTitle}
                            </div>
                        ))}
                        {dayEvents.length > 2 && (
                            <div className="text-xs text-gray-500 px-1">+{dayEvents.length - 2} more</div>
                        )}
                    </div>
                </div>
            );
        }

        return days;
    };

    if (!isVisible) return null;

    return (
        <>
            <div className={`fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 ${isClosing ? 'animate-fade-out' : 'animate-fade-in'}`} onClick={handleClose}>
                <div className={`bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden ${isClosing ? 'animate-scale-down' : 'animate-scale-up'}`} onClick={(e) => e.stopPropagation()}>
                    {/* Header */}
                    <div className="bg-linear-to-r from-indigo-600 to-blue-600 text-white px-6 py-4 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <h2 className="text-2xl font-bold">School Calendar</h2>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={handlePreviousMonth}
                                    className="p-2 hover:bg-white/20 rounded-lg transition"
                                >
                                    <ChevronLeft className="w-5 h-5" />
                                </button>
                                <span className="text-lg font-600 min-w-[200px] text-center">
                                    {months[currentDate.getMonth()]} {currentDate.getFullYear()}
                                </span>
                                <button
                                    onClick={handleNextMonth}
                                    className="p-2 hover:bg-white/20 rounded-lg transition"
                                >
                                    <ChevronRight className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                        <button
                            onClick={handleClose}
                            className="p-2 hover:bg-white/20 rounded-lg transition"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    {/* Calendar Grid */}
                    <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
                        {/* Days of week header */}
                        <div className="grid grid-cols-7 gap-0 mb-2">
                            {daysOfWeek.map(day => (
                                <div key={day} className="text-center font-600 text-gray-700 py-2 bg-gray-100 border border-gray-200">
                                    {day}
                                </div>
                            ))}
                        </div>

                        {/* Calendar days */}
                        <div className="grid grid-cols-7 gap-0">
                            {renderCalendar()}
                        </div>

                        {/* Legend */}
                        <div className="mt-6 flex flex-wrap gap-4 text-sm">
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 bg-blue-100 border-l-4 border-blue-600"></div>
                                <span className="text-gray-600">Today</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 bg-green-100 border-l-4 border-green-600"></div>
                                <span className="text-gray-600">Holiday</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 bg-purple-100 border-l-4 border-purple-600"></div>
                                <span className="text-gray-600">Exam</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 bg-orange-100 border-l-4 border-orange-600"></div>
                                <span className="text-gray-600">Meeting</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Event Form Modal */}
            {showEventForm && (
                <EventFormModal
                    isOpen={showEventForm}
                    onClose={handleEventFormClose}
                    selectedDate={selectedDate}
                    event={selectedEvent}
                />
            )}
        </>
    );
};

export default CalendarModal;
