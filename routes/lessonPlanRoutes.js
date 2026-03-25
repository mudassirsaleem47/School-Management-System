const express = require('express');
const router = express.Router();
const Lesson = require('../models/lessonSchema');
const Topic = require('../models/topicSchema');
const LessonPlan = require('../models/lessonPlanSchema');

// ==========================================
// Lesson Routes (Curriculum)
// ==========================================
// Create Lesson
router.post('/Lesson', async (req, res) => {
    try {
        const lesson = new Lesson(req.body);
        const result = await lesson.save();
        res.send(result);
    } catch (err) {
        res.status(500).json(err);
    }
});

// List Lessons
// Often need filtering by Class & Subject
router.post('/Lesson/List', async (req, res) => {
    try {
        const { school, sclass, subject } = req.body;
        const lessons = await Lesson.find({ school, sclass, subject });
        res.send(lessons);
    } catch (err) {
        res.status(500).json(err);
    }
});

// Update Lesson
router.put('/Lesson/:id', async (req, res) => {
    try {
        const result = await Lesson.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.send(result);
    } catch (err) {
        res.status(500).json(err);
    }
});

// Delete Lesson
router.delete('/Lesson/:id', async (req, res) => {
    try {
        // Also delete associated topics
        await Topic.deleteMany({ lesson: req.params.id });
        const result = await Lesson.findByIdAndDelete(req.params.id);
        res.send(result);
    } catch (err) {
        res.status(500).json(err);
    }
});

// ==========================================
// Topic Routes
// ==========================================
// Create Topic
router.post('/Topic', async (req, res) => {
    try {
        const topic = new Topic(req.body);
        const result = await topic.save();
        res.send(result);
    } catch (err) {
        res.status(500).json(err);
    }
});

// List Topics by Lesson
router.get('/Topic/:lessonId', async (req, res) => {
    try {
        const topics = await Topic.find({ lesson: req.params.lessonId });
        res.send(topics);
    } catch (err) {
        res.status(500).json(err);
    }
});

// Delete Topic
router.delete('/Topic/:id', async (req, res) => {
    try {
        const result = await Topic.findByIdAndDelete(req.params.id);
        res.send(result);
    } catch (err) {
        res.status(500).json(err);
    }
});


// ==========================================
// Lesson Plan Routes
// ==========================================
// Create Plan
// Note: Can be multi-day or multi-section but usually single entry per teacher-class-subject-topic-date
router.post('/Plan', async (req, res) => {
    try {
        const plan = new LessonPlan(req.body);
        const result = await plan.save();
        res.send(result);
    } catch (err) {
        res.status(500).json(err);
    }
});

// Get Plan (Calendar/List View)
router.post('/Plan/List', async (req, res) => {
    try {
        // Filter by teacher, class, date range etc.
        const { school, teacher, sclass, subject, dateFrom, dateTo } = req.body;
        let query = { school };
        if (teacher) query.teacher = teacher;
        if (sclass) query.sclass = sclass;
        if (subject) query.subject = subject;
        if (dateFrom && dateTo) {
            query.date = { $gte: new Date(dateFrom), $lte: new Date(dateTo) };
        }
        
        const plans = await LessonPlan.find(query)
            .populate('sclass', 'sclassName')
            .populate('subject', 'subName')
            .populate('lesson', 'title')
            .populate('topic', 'title')
            .populate('teacher', 'name');
            
        res.send(plans);
    } catch (err) {
        res.status(500).json(err);
    }
});

// Update Plan (Status, Notes)
router.put('/Plan/:id', async (req, res) => {
    try {
        const result = await LessonPlan.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.send(result);
    } catch (err) {
        res.status(500).json(err);
    }
});

// Delete Plan
router.delete('/Plan/:id', async (req, res) => {
    try {
        const result = await LessonPlan.findByIdAndDelete(req.params.id);
        res.send(result);
    } catch (err) {
        res.status(500).json(err);
    }
});

module.exports = router;
