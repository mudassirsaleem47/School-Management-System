const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const InventoryItem = require('../models/inventoryItemSchema');

// Ensure upload directory exists
const uploadDir = 'uploads/inventory';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer Storage Configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// Add new inventory item (with optional document upload)
router.post('/', upload.single('document'), async (req, res) => {
    try {
        const { school, itemCategory, itemName, supplier, store, quantity, purchasePrice, date, description } = req.body;
        
        let documentUrl = null;
        if (req.file) {
            documentUrl = req.file.path.replace(/\\/g, '/'); // Normalize path for Windows
        }

        const inventoryItem = new InventoryItem({
            school,
            itemCategory,
            itemName,
            supplier,
            store,
            quantity: Number(quantity),
            purchasePrice: Number(purchasePrice),
            date,
            documentUrl,
            description
        });

        const result = await inventoryItem.save();
        res.status(201).json(result);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get all inventory items for a school
router.get('/:schoolId', async (req, res) => {
    try {
        const items = await InventoryItem.find({ school: req.params.schoolId })
                                         .sort({ createdAt: -1 });
        res.send(items);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Delete an inventory item
router.delete('/:id', async (req, res) => {
    try {
        const item = await InventoryItem.findById(req.params.id);
        if (!item) return res.status(404).json({ message: "Item not found" });

        // Optionally delete the file if exists
        if (item.documentUrl) {
            const filePath = path.resolve(item.documentUrl);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        }

        await InventoryItem.findByIdAndDelete(req.params.id);
        res.send({ message: "Deleted successfully" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
