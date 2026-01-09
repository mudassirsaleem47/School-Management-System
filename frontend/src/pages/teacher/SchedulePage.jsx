import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Calendar, Clock, MapPin, BookOpen } from 'lucide-react';

const SchedulePage = () => {
  const { currentUser } = useAuth();

  const schedule = [
    { day: 'Monday', classes: [
      { time: '08:00 - 09:00', subject: 'Mathematics', class: 'Class 10-A', room: 'Room 201' },
      { time: '09:00 - 10:00', subject: 'Mathematics', class: 'Class 9-B', room: 'Room 105' },
      { time: '11:00 - 12:00', subject: 'Mathematics', class: 'Class 10-C', room: 'Room 201' },
    ]},
    { day: 'Tuesday', classes: [
      { time: '08:00 - 09:00', subject: 'Mathematics', class: 'Class 10-A', room: 'Room 201' },
      { time: '10:00 - 11:00', subject: 'Mathematics', class: 'Class 9-B', room: 'Room 105' },
    ]},
    { day: 'Wednesday', classes: [
      { time: '09:00 - 10:00', subject: 'Mathematics', class: 'Class 10-C', room: 'Room 201' },
      { time: '11:00 - 12:00', subject: 'Mathematics', class: 'Class 10-A', room: 'Room 201' },
      { time: '02:00 - 03:00', subject: 'Mathematics', class: 'Class 9-B', room: 'Room 105' },
    ]},
    { day: 'Thursday', classes: [
      { time: '08:00 - 09:00', subject: 'Mathematics', class: 'Class 9-B', room: 'Room 105' },
      { time: '10:00 - 11:00', subject: 'Mathematics', class: 'Class 10-A', room: 'Room 201' },
    ]},
    { day: 'Friday', classes: [
      { time: '08:00 - 09:00', subject: 'Mathematics', class: 'Class 10-C', room: 'Room 201' },
      { time: '09:00 - 10:00', subject: 'Mathematics', class: 'Class 10-A', room: 'Room 201' },
    ]},
  ];

  const totalClasses = schedule.reduce((acc, day) => acc + day.classes.length, 0);

  return (
    <div className="p-6 md:p-8">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900">My Schedule</h1>
        <p className="text-gray-600 mt-2">View your weekly teaching schedule</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Classes/Week</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{totalClasses}</p>
            </div>
            <BookOpen className="w-10 h-10 text-blue-600" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Working Days</p>
              <p className="text-3xl font-bold text-emerald-600 mt-1">5</p>
            </div>
            <Calendar className="w-10 h-10 text-emerald-600" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Subject</p>
              <p className="text-xl font-bold text-purple-600 mt-1">{currentUser?.subject || 'N/A'}</p>
            </div>
            <BookOpen className="w-10 h-10 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Weekly Schedule */}
      <div className="space-y-6">
        {schedule.map((day, idx) => (
          <div key={idx} className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="bg-linear-to-r from-emerald-600 to-emerald-700 px-6 py-4">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                {day.day}
              </h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {day.classes.map((cls, clsIdx) => (
                  <div key={clsIdx} className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-emerald-300 hover:shadow-md transition">
                    <div className="flex items-center gap-2 text-emerald-600 mb-2">
                      <Clock className="w-4 h-4" />
                      <span className="text-sm font-600">{cls.time}</span>
                    </div>
                    <h4 className="font-bold text-gray-900 mb-1">{cls.subject}</h4>
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                      <BookOpen className="w-4 h-4" />
                      <span>{cls.class}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin className="w-4 h-4" />
                      <span>{cls.room}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SchedulePage;
