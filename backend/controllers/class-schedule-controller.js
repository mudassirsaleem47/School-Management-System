const ClassSchedule = require('../models/classScheduleSchema.js');

const createSchedule = async (req, res) => {
    try {
        // Check if schedule already exists for this class and section
        const existingSchedule = await ClassSchedule.findOne({
            sclass: req.body.sclass,
            section: req.body.section,
            school: req.body.school
        });

        if (existingSchedule) {
            // Update existing
            existingSchedule.days = req.body.days;
            const result = await existingSchedule.save();
            res.send(result);
        } else {
            // Create new
            const newSchedule = new ClassSchedule(req.body);
            const result = await newSchedule.save();
            res.send(result);
        }
    } catch (err) {
        res.status(500).json(err);
    }
};

const getScheduleByClassSection = async (req, res) => {
    try {
        const schedule = await ClassSchedule.findOne({
            sclass: req.params.classId,
            section: req.params.sectionId
        })
        .populate('days.periods.subject', 'subName subCode')
        .populate('days.periods.teacher', 'name');

        if (schedule) {
            res.send(schedule);
        } else {
            res.send({ message: "No schedule found" });
        }
    } catch (err) {
        res.status(500).json(err);
    }
};

const getTeacherSchedule = async (req, res) => {
    try {
        const teacherId = req.params.teacherId;
        // Find all schedules where this teacher is assigned in any period
        const schedules = await ClassSchedule.find({
            "days.periods.teacher": teacherId
        })
        .populate("sclass", "sclassName")
        .populate("days.periods.subject", "subName");

        // We need to filter and format this so the frontend can easily display it.
        // We want to return an array of periods for this teacher.
        // Or simpler, return the raw schedules and let frontend process logic?
        // Let's return raw for now, but maybe filtered logic is better.
        // Let's just return the schedules that contain the teacher.
        
        if (schedules.length > 0) {
            res.send(schedules);
        } else {
            res.send({ message: "No schedule found for this teacher" });
        }
    } catch (err) {
        res.status(500).json(err);
    }
};

const deleteSchedule = async (req, res) => {
    try {
        const result = await ClassSchedule.findByIdAndDelete(req.params.id);
        res.send(result);
    } catch (err) {
        res.status(500).json(err);
    }
};

module.exports = { createSchedule, getScheduleByClassSection, getTeacherSchedule, deleteSchedule };
