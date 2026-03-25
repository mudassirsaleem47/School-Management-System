const Visitor = require('../models/visitorSchema.js');

// Create new visitor
const visitorCreate = async (req, res) => {
    try {
        console.log('Received visitor data:', req.body);
        const visitor = new Visitor(req.body);
        const result = await visitor.save();
        console.log('Visitor saved successfully:', result);
        res.send(result);
    } catch (err) {
        console.error('Error creating visitor:', err);
        res.status(500).json({ message: err.message });
    }
};

// Get all visitors for a school
const visitorList = async (req, res) => {
    try {
        const visitors = await Visitor.find({ school: req.params.schoolId })
            .populate('staff', 'name')
            .populate('class', 'sclassName')
            .populate('student', 'name')
            .sort({ date: -1, createdAt: -1 });
        
        res.send(Array.isArray(visitors) ? visitors : []);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Update visitor
const visitorUpdate = async (req, res) => {
    try {
        const result = await Visitor.findByIdAndUpdate(
            req.params.id,
            { $set: req.body },
            { new: true }
        );
        res.send(result);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Delete visitor
const visitorDelete = async (req, res) => {
    try {
        const result = await Visitor.findByIdAndDelete(req.params.id);
        res.send(result);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

module.exports = {
    visitorCreate,
    visitorList,
    visitorUpdate,
    visitorDelete
};
