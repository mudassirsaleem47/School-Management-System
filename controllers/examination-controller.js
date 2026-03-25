const ExamGroup = require('../models/examGroupSchema');
const ExamSchedule = require('../models/examScheduleSchema');
const ExamResult = require('../models/examResultSchema');
const MarksGrade = require('../models/marksGradeSchema');
const MarksDivision = require('../models/marksDivisionSchema');

// === EXAM GROUP CONTROLLERS ===
const createExamGroup = async (req, res) => {
    try {
        const examGroup = new ExamGroup(req.body);
        await examGroup.save();
        res.status(201).json({ message: 'Exam group created successfully', examGroup });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getExamGroupsBySchool = async (req, res) => {
    try {
        const groups = await ExamGroup.find({ school: req.params.schoolId }).sort({ createdAt: -1 });
        res.status(200).json(groups);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateExamGroup = async (req, res) => {
    try {
        const group = await ExamGroup.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.status(200).json({ message: 'Updated successfully', group });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deleteExamGroup = async (req, res) => {
    try {
        await ExamGroup.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: 'Deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// === EXAM SCHEDULE CONTROLLERS ===
const createExamSchedule = async (req, res) => {
    try {
        const schedule = new ExamSchedule(req.body);
        await schedule.save();
        res.status(201).json({ message: 'Exam scheduled successfully', schedule });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getExamSchedulesByGroup = async (req, res) => {
    try {
        const schedules = await ExamSchedule.find({ examGroup: req.params.groupId })
            .populate('class', 'sclassName')
            .sort({ examDate: 1 });
        res.status(200).json(schedules);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getExamSchedulesByClass = async (req, res) => {
    try {
        const schedules = await ExamSchedule.find({ class: req.params.classId })
            .populate('examGroup')
            .sort({ examDate: 1 });
        res.status(200).json(schedules);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateExamSchedule = async (req, res) => {
    try {
        const schedule = await ExamSchedule.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.status(200).json({ message: 'Updated successfully', schedule });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deleteExamSchedule = async (req, res) => {
    try {
        await ExamSchedule.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: 'Deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// === EXAM RESULT CONTROLLERS ===
const createExamResult = async (req, res) => {
    try {
        const result = new ExamResult(req.body);
        await result.save();
        res.status(201).json({ message: 'Result added successfully', result });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getResultsByStudent = async (req, res) => {
    try {
        const results = await ExamResult.find({ student: req.params.studentId })
            .populate('examSchedule')
            .sort({ createdAt: -1 });
        res.status(200).json(results);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getResultsByExam = async (req, res) => {
    try {
        const results = await ExamResult.find({ examSchedule: req.params.scheduleId })
            .populate('student', 'name rollNum')
            .sort({ marksObtained: -1 });
        res.status(200).json(results);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateExamResult = async (req, res) => {
    try {
        const result = await ExamResult.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.status(200).json({ message: 'Updated successfully', result });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deleteExamResult = async (req, res) => {
    try {
        await ExamResult.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: 'Deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// === MARKS GRADE CONTROLLERS ===
const createMarksGrade = async (req, res) => {
    try {
        const grade = new MarksGrade(req.body);
        await grade.save();
        res.status(201).json({ message: 'Grade created successfully', grade });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getMarksGradesBySchool = async (req, res) => {
    try {
        const grades = await MarksGrade.find({ school: req.params.schoolId }).sort({ percentageFrom: -1 });
        res.status(200).json(grades);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateMarksGrade = async (req, res) => {
    try {
        const grade = await MarksGrade.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.status(200).json({ message: 'Updated successfully', grade });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deleteMarksGrade = async (req, res) => {
    try {
        await MarksGrade.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: 'Deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// === MARKS DIVISION CONTROLLERS ===
const createMarksDivision = async (req, res) => {
    try {
        const division = new MarksDivision(req.body);
        await division.save();
        res.status(201).json({ message: 'Division created successfully', division });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getMarksDivisionsBySchool = async (req, res) => {
    try {
        const divisions = await MarksDivision.find({ school: req.params.schoolId }).sort({ percentageFrom: -1 });
        res.status(200).json(divisions);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateMarksDivision = async (req, res) => {
    try {
        const division = await MarksDivision.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.status(200).json({ message: 'Updated successfully', division });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deleteMarksDivision = async (req, res) => {
    try {
        await MarksDivision.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: 'Deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    // Exam Groups
    createExamGroup,
    getExamGroupsBySchool,
    updateExamGroup,
    deleteExamGroup,
    // Exam Schedules
    createExamSchedule,
    getExamSchedulesByGroup,
    getExamSchedulesByClass,
    updateExamSchedule,
    deleteExamSchedule,
    // Exam Results
    createExamResult,
    getResultsByStudent,
    getResultsByExam,
    updateExamResult,
    deleteExamResult,
    // Marks Grades
    createMarksGrade,
    getMarksGradesBySchool,
    updateMarksGrade,
    deleteMarksGrade,
    // Marks Divisions
    createMarksDivision,
    getMarksDivisionsBySchool,
    updateMarksDivision,
    deleteMarksDivision
};
