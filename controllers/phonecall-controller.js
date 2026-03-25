const PhoneCall = require('../models/phoneCallSchema');

// Create new phone call record
const createPhoneCall = async (req, res) => {
    try {
        const phoneCall = new PhoneCall(req.body);
        await phoneCall.save();
        res.status(201).json({ message: 'Phone call record created successfully', phoneCall });
    } catch (error) {
        res.status(500).json({ message: 'Error creating phone call record', error: error.message });
    }
};

// Get all phone calls for a school
const getPhoneCalls = async (req, res) => {
    try {
        const { schoolId } = req.params;
        const phoneCalls = await PhoneCall.find({ school: schoolId }).sort({ callDate: -1, callTime: -1 });
        res.status(200).json(phoneCalls);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching phone calls', error: error.message });
    }
};

// Get single phone call by ID
const getPhoneCallById = async (req, res) => {
    try {
        const { id } = req.params;
        const phoneCall = await PhoneCall.findById(id);
        
        if (!phoneCall) {
            return res.status(404).json({ message: 'Phone call record not found' });
        }
        
        res.status(200).json(phoneCall);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching phone call', error: error.message });
    }
};

// Update phone call
const updatePhoneCall = async (req, res) => {
    try {
        const { id } = req.params;
        const updatedPhoneCall = await PhoneCall.findByIdAndUpdate(
            id,
            req.body,
            { new: true, runValidators: true }
        );
        
        if (!updatedPhoneCall) {
            return res.status(404).json({ message: 'Phone call record not found' });
        }
        
        res.status(200).json({ message: 'Phone call record updated successfully', phoneCall: updatedPhoneCall });
    } catch (error) {
        res.status(500).json({ message: 'Error updating phone call', error: error.message });
    }
};

// Delete phone call
const deletePhoneCall = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedPhoneCall = await PhoneCall.findByIdAndDelete(id);
        
        if (!deletedPhoneCall) {
            return res.status(404).json({ message: 'Phone call record not found' });
        }
        
        res.status(200).json({ message: 'Phone call record deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting phone call', error: error.message });
    }
};

module.exports = {
    createPhoneCall,
    getPhoneCalls,
    getPhoneCallById,
    updatePhoneCall,
    deletePhoneCall
};
