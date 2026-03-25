const express = require('express');
const router = express.Router();
const Designation = require('../models/designationSchema');

// Create a new designation
router.post('/', async (req, res) => {
    try {
        const { school, name, description } = req.body;
        const designation = new Designation({ school, name, description });
        const result = await designation.save();
        res.status(201).json(result);
    } catch (err) {
        if (err.code === 11000) {
            return res.status(400).json({ message: "Designation with this name already exists." });
        }
        res.status(500).json({ message: err.message });
    }
});

// Get all designations for a school
router.get('/:schoolId', async (req, res) => {
    try {
        const designations = await Designation.find({ school: req.params.schoolId, isActive: 'active' });
        res.send(designations);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Update a designation
router.put('/:id', async (req, res) => {
    try {
        const updated = await Designation.findByIdAndUpdate(
            req.params.id,
            { $set: req.body },
            { new: true, runValidators: true }
        );
        res.send(updated);
    } catch (err) {
        if (err.code === 11000) {
            return res.status(400).json({ message: "Designation with this name already exists." });
        }
        res.status(500).json({ message: err.message });
    }
});

// Delete (soft delete) a designation
router.delete('/:id', async (req, res) => {
    try {
        const deleted = await Designation.findByIdAndUpdate(
            req.params.id,
            { isActive: 'inactive' },
            { new: true }
        );
        res.send(deleted);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
