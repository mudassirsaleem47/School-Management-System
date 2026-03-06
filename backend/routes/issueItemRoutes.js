const express = require('express');
const router = express.Router();
const IssueItem = require('../models/issueItemSchema');
const Staff = require('../models/staffSchema');
const Student = require('../models/studentSchema');

// Issue a new item
router.post('/', async (req, res) => {
    try {
        const { school, itemName, category, issuedToRole, issuedToId, issueDate, returnDate, note } = req.body;
        
        const issueItem = new IssueItem({
            school,
            itemName,
            category,
            issuedToRole,
            issuedToId,
            issueDate,
            returnDate,
            note
        });

        const result = await issueItem.save();
        res.status(201).json(result);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get all issued items for a school
router.get('/:schoolId', async (req, res) => {
    try {
        const items = await IssueItem.find({ school: req.params.schoolId })
                                      .sort({ createdAt: -1 });

        // Manually populate issuedTo user details based on role
        const populatedItems = await Promise.all(items.map(async (item) => {
            let user = null;
            if (item.issuedToRole === 'Staff') {
                user = await Staff.findById(item.issuedToId, 'name email role');
            } else if (item.issuedToRole === 'Student') {
                user = await Student.findById(item.issuedToId, 'name rollNum sclassName');
            }
            
            return {
                ...item.toObject(),
                issuedToUser: user || { name: 'Unknown Data' }
            };
        }));

        res.send(populatedItems);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Update an issued item (e.g. Status change, Edit dates)
router.put('/:id', async (req, res) => {
    try {
        const updated = await IssueItem.findByIdAndUpdate(
            req.params.id,
            { $set: req.body },
            { new: true, runValidators: true }
        );
        res.send(updated);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Delete an issued item record
router.delete('/:id', async (req, res) => {
    try {
        const deleted = await IssueItem.findByIdAndDelete(req.params.id);
        if (!deleted) return res.status(404).json({ message: "Record not found" });
        res.send({ message: "Deleted successfully" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
