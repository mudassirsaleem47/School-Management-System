const express = require('express');
const router = express.Router();
const Attendance = require('../models/attendanceSchema');
const Leave = require('../models/leaveSchema');
const Student = require('../models/studentSchema');
const Sclass = require('../models/sclassSchema');

// ==========================================
// Student Attendance Routes
// ==========================================

// Mark Attendance (Bulk or Single)
// Expects: { date: Date, school: Id, sclass: Id, attendance: [{ student: Id, status: "...", remark: "..." }] }
router.post('/Mark', async (req, res) => {
    try {
        const { date, attendance, school, sclass } = req.body;
        
        // This is a bulk upsert operation
        const operations = attendance.map(record => ({
            updateOne: {
                filter: { student: record.student, date: new Date(date) },
                update: { 
                    $set: { 
                        school: school,
                        sclass: sclass,
                        status: record.status, 
                        remark: record.remark 
                    } 
                },
                upsert: true
            }
        }));

        const result = await Attendance.bulkWrite(operations);
        res.send(result);
    } catch (err) {
        res.status(500).json(err);
    }
});

// Get Attendance for a Class on a Specific Date
// Used for "Take Attendance" view to pre-fill if already taken
router.get('/ForClass/:schoolId/:classId/:date', async (req, res) => {
    try {
        const { schoolId, classId, date } = req.params;
        const startOfDay = new Date(date);
        startOfDay.setUTCHours(0,0,0,0);
        const endOfDay = new Date(date);
        endOfDay.setUTCHours(23,59,59,999);
        
        const existingAttendance = await Attendance.find({
            school: schoolId,
            sclass: classId,
            date: { $gte: startOfDay, $lte: endOfDay }
        }).populate('student', 'name rollNum');
        res.send(existingAttendance);
    } catch (err) {
        res.status(500).json(err);
    }
});

// Get Attendance Report (By Date Range for a Class/Section)
router.post('/Report', async (req, res) => {
    try {
        const { schoolId, classId, sectionId, dateFrom, dateTo } = req.body;
        
        let query = { 
            school: schoolId,
            date: { $gte: new Date(dateFrom), $lte: new Date(dateTo) }
        };
        
        if (classId) query.sclass = classId;

        // If filtering by section, we need student IDs first
        if (sectionId) {
             const students = await Student.find({ school: schoolId, sclassName: classId, section: sectionId }); // Assuming section is stored or linkable
             // Note: Depending on schema, section might be just ID or populated. Assuming ID here for simplicity or skip section filter if complex joins needed.
             // Actually Student schema stores section usually.
             const studentIds = students.map(s => s._id);
             query.student = { $in: studentIds };
        }

        const report = await Attendance.find(query)
            .populate('student', 'name rollNum')
            .sort({ date: 1 });
            
        res.send(report);
    } catch (err) {
        res.status(500).json(err);
    }
});


// ==========================================
// Leave Application Routes
// ==========================================

// Apply Leave
router.post('/Leave/Apply', async (req, res) => {
    try {
        const leave = new Leave(req.body);
        const result = await leave.save();
        res.send(result);
    } catch (err) {
        res.status(500).json(err);
    }
});

// List Leave Applications
router.get('/Leave/List/:schoolId', async (req, res) => {
    try {
        const leaves = await Leave.find({ school: req.params.schoolId })
            .populate('student', 'name rollNum')
            .populate('sclass', 'sclassName')
            .sort({ createdAt: -1 });
        res.send(leaves);
    } catch (err) {
        res.status(500).json(err);
    }
});

// Update Leave Status
router.put('/Leave/:id', async (req, res) => {
    try {
        const result = await Leave.findByIdAndUpdate(
            req.params.id, 
            req.body,
            { new: true }
        );
        res.send(result);
    } catch (err) {
        res.status(500).json(err);
    }
});

module.exports = router;
