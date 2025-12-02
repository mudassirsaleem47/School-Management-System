const Complain = require('../models/complainSchema');

// Create new complain
const createComplain = async (req, res) => {
    try {
        const data = req.body;
        if (req.file) {
            data.document = req.file.path;
        }
        const complain = new Complain(data);
        await complain.save();
        res.status(201).json({ message: 'Complain created successfully', complain });
    } catch (error) {
        res.status(500).json({ message: 'Error creating complain', error: error.message });
    }
};

// Get all complains for a school
const getComplains = async (req, res) => {
    try {
        const { schoolId } = req.params;
        const complains = await Complain.find({ school: schoolId }).sort({ date: -1 });
        res.status(200).json(complains);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching complains', error: error.message });
    }
};

// Get single complain by ID
const getComplainById = async (req, res) => {
    try {
        const { id } = req.params;
        const complain = await Complain.findById(id);
        
        if (!complain) {
            return res.status(404).json({ message: 'Complain not found' });
        }
        
        res.status(200).json(complain);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching complain', error: error.message });
    }
};

// Update complain
const updateComplain = async (req, res) => {
    try {
        const { id } = req.params;
        const data = req.body;
        if (req.file) {
            data.document = req.file.path;
        }
        const updatedComplain = await Complain.findByIdAndUpdate(
            id,
            data,
            { new: true, runValidators: true }
        );
        
        if (!updatedComplain) {
            return res.status(404).json({ message: 'Complain not found' });
        }
        
        res.status(200).json({ message: 'Complain updated successfully', complain: updatedComplain });
    } catch (error) {
        res.status(500).json({ message: 'Error updating complain', error: error.message });
    }
};

// Delete complain
const deleteComplain = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedComplain = await Complain.findByIdAndDelete(id);
        
        if (!deletedComplain) {
            return res.status(404).json({ message: 'Complain not found' });
        }
        
        res.status(200).json({ message: 'Complain deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting complain', error: error.message });
    }
};

module.exports = {
    createComplain,
    getComplains,
    getComplainById,
    updateComplain,
    deleteComplain
};