const express = require('express');
const router = express.Router();
const ItemStore = require('../models/itemStoreSchema');

// Create a new Store
router.post('/', async (req, res) => {
    try {
        const { school, storeName, storeCode, description } = req.body;
        const newStore = new ItemStore({ school, storeName, storeCode, description });
        const result = await newStore.save();
        res.status(201).json(result);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get all stores for a school
router.get('/:schoolId', async (req, res) => {
    try {
        const stores = await ItemStore.find({ school: req.params.schoolId }).sort({ createdAt: -1 });
        res.send(stores);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Update store details
router.put('/:id', async (req, res) => {
    try {
        const updated = await ItemStore.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.send(updated);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Delete store
router.delete('/:id', async (req, res) => {
    try {
        await ItemStore.findByIdAndDelete(req.params.id);
        res.send({ message: "Deleted successfully" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
