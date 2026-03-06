const express = require('express');
const router = express.Router();
const StaffAttendance = require('../models/staffAttendanceSchema');
const Staff = require('../models/staffSchema');

// POST /StaffAttendance/Mark
// Body: { school, date, attendance: [{ staffId, status, remark }] }
router.post('/Mark', async (req, res) => {
    try {
        const { school, date, attendance } = req.body;
        const ops = attendance.map(record => ({
            updateOne: {
                filter: { staffId: record.staffId, date: new Date(date) },
                update: {
                    $set: {
                        school,
                        status: record.status,
                        remark: record.remark || ''
                    }
                },
                upsert: true
            }
        }));
        const result = await StaffAttendance.bulkWrite(ops);
        res.send(result);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET /StaffAttendance/ForDate/:schoolId/:date
router.get('/ForDate/:schoolId/:date', async (req, res) => {
    try {
        const { schoolId, date } = req.params;
        const start = new Date(date); start.setUTCHours(0, 0, 0, 0);
        const end   = new Date(date); end.setUTCHours(23, 59, 59, 999);

        const allStaff = await Staff.find({ school: schoolId })
            .select('name email phone role designation');

        const records = await StaffAttendance.find({
            school: schoolId,
            date: { $gte: start, $lte: end }
        });

        const recordMap = {};
        records.forEach(r => { recordMap[r.staffId.toString()] = r; });

        const result = allStaff.map(s => ({
            _id: s._id,
            name: s.name,
            email: s.email,
            phone: s.phone,
            role: s.role || s.designation,
            designation: s.designation,
            attendanceStatus: recordMap[s._id.toString()]?.status || null,
            remark: recordMap[s._id.toString()]?.remark || ''
        }));

        res.send(result);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET /StaffAttendance/Summary/:schoolId/:from/:to
router.get('/Summary/:schoolId/:from/:to', async (req, res) => {
    try {
        const { schoolId, from, to } = req.params;
        const records = await StaffAttendance.find({
            school: schoolId,
            date: { $gte: new Date(from), $lte: new Date(to) }
        }).sort({ date: -1 });
        res.send(records);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
