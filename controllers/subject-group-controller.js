const SubjectGroup = require('../models/subjectGroupSchema');

// Create
const createSubjectGroup = async (req, res) => {
    try {
        const { groupName, description, subjects, status, school } = req.body;
        const group = new SubjectGroup({ groupName, description, subjects, status, school });
        const saved = await group.save();
        const populated = await SubjectGroup.findById(saved._id)
            .populate('subjects', 'subName subCode');
        res.status(201).json(populated);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Get all by school
const getSubjectGroupsBySchool = async (req, res) => {
    try {
        const groups = await SubjectGroup.find({ school: req.params.schoolId })
            .populate('subjects', 'subName subCode')
            .sort({ createdAt: -1 });
        res.json(groups);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Update
const updateSubjectGroup = async (req, res) => {
    try {
        const updated = await SubjectGroup.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        )
            .populate('subjects', 'subName subCode');
        if (!updated) return res.status(404).json({ message: 'Subject group not found' });
        res.json(updated);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Delete
const deleteSubjectGroup = async (req, res) => {
    try {
        const deleted = await SubjectGroup.findByIdAndDelete(req.params.id);
        if (!deleted) return res.status(404).json({ message: 'Subject group not found' });
        res.json({ message: 'Subject group deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

module.exports = {
    createSubjectGroup,
    getSubjectGroupsBySchool,
    updateSubjectGroup,
    deleteSubjectGroup
};
