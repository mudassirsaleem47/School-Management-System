const express = require('express');
const router = express.Router();
const ItemCategory = require('../models/itemCategorySchema');

// Create a new category
router.post('/', async (req, res) => {
    try {
        const { school, categoryName, description } = req.body;
        const newCategory = new ItemCategory({ school, categoryName, description });
        const result = await newCategory.save();
        res.status(201).json(result);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get all categories for a school
router.get('/:schoolId', async (req, res) => {
    try {
        const categories = await ItemCategory.find({ school: req.params.schoolId }).sort({ createdAt: -1 });
        res.send(categories);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Update category
router.put('/:id', async (req, res) => {
    try {
        const updated = await ItemCategory.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.send(updated);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Delete category
router.delete('/:id', async (req, res) => {
    try {
        await ItemCategory.findByIdAndDelete(req.params.id);
        res.send({ message: "Deleted successfully" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
