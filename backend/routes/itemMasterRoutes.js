const express = require('express');
const router = express.Router();
const ItemMaster = require('../models/itemMasterSchema');

// Create a new item (Master)
router.post('/', async (req, res) => {
    try {
        const { school, itemName, itemCategory, unit, description } = req.body;
        const newItem = new ItemMaster({ school, itemName, itemCategory, unit, description });
        const result = await newItem.save();
        res.status(201).json(result);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get all items for a school
router.get('/:schoolId', async (req, res) => {
    try {
        const items = await ItemMaster.find({ school: req.params.schoolId }).sort({ createdAt: -1 });
        res.send(items);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Update item details
router.put('/:id', async (req, res) => {
    try {
        const updated = await ItemMaster.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.send(updated);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Delete item
router.delete('/:id', async (req, res) => {
    try {
        await ItemMaster.findByIdAndDelete(req.params.id);
        res.send({ message: "Deleted successfully" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
