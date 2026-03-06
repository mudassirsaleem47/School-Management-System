const express = require('express');
const router = express.Router();
const ItemSupplier = require('../models/itemSupplierSchema');

// Create a new supplier
router.post('/', async (req, res) => {
    try {
        const { school, name, phone, email, address, contactPersonName, contactPersonPhone, contactPersonEmail, description } = req.body;
        const newSupplier = new ItemSupplier({ school, name, phone, email, address, contactPersonName, contactPersonPhone, contactPersonEmail, description });
        const result = await newSupplier.save();
        res.status(201).json(result);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get all suppliers for a school
router.get('/:schoolId', async (req, res) => {
    try {
        const suppliers = await ItemSupplier.find({ school: req.params.schoolId }).sort({ createdAt: -1 });
        res.send(suppliers);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Update supplier
router.put('/:id', async (req, res) => {
    try {
        const updated = await ItemSupplier.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.send(updated);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Delete supplier
router.delete('/:id', async (req, res) => {
    try {
        await ItemSupplier.findByIdAndDelete(req.params.id);
        res.send({ message: "Deleted successfully" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
