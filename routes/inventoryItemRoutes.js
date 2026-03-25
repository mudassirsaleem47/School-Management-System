const express = require('express');
const router = express.Router();
const upload = require('../middleware/uploadMiddleware');
const InventoryItem = require('../models/inventoryItemSchema');


// Add new inventory item (with optional document upload)
router.post('/', upload.single('document'), async (req, res) => {
    try {
        const { school, itemCategory, itemName, supplier, store, quantity, purchasePrice, date, description } = req.body;
        
        let documentUrl = null;
        if (req.file) {
            documentUrl = req.file.path; // Cloudinary automatically gives the full URL
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

        // Deleting from Cloudinary requires extra logic if needed,
        // but for now we remove the failing fs.existsSync/unlinkSync.

        await InventoryItem.findByIdAndDelete(req.params.id);
        res.send({ message: "Deleted successfully" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
