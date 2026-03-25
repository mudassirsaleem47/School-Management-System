const Enquiry = require('../models/enquirySchema');

// 1. Create Enquiry (Form submit hone par chalega)
const enquiryCreate = async (req, res) => {
    try {
        // Frontend se data aa raha hai
        const enquiry = new Enquiry(req.body);
        
        // Database mein save karna
        const result = await enquiry.save();
        res.status(200).json(result);
    } catch (err) {
        res.status(500).json(err);
    }
};

// 2. List Enquiries (School ID ke hisab se)
const enquiryList = async (req, res) => {
    try {
        // URL se school ID li
        const { id } = req.params;
        
        // Database se dhoondna aur 'populate' use karna taake 
        // Class aur Teacher ka sirf ID nahi, balki Naam bhi aaye
        const enquiries = await Enquiry.find({ school: id })
            .populate('class', 'sclassName') // Class ka naam layega
            .populate('assigned', 'name');   // Teacher ka naam layega

        if (enquiries.length > 0) {
            res.send(enquiries);
        } else {
            res.send({ message: "No enquiries found" });
        }
    } catch (err) {
        res.status(500).json(err);
    }
};

// 3. Delete Enquiry
const enquiryDelete = async (req, res) => {
    try {
        // ID ke base par delete karna
        const result = await Enquiry.findByIdAndDelete(req.params.id);
        res.send(result);
    } catch (err) {
        res.status(500).json(err);
    }
};

// 4. Edit/Update Enquiry
const enquiryUpdate = async (req, res) => {
    try {
        // Pehle ID se dhoondo, phir naye data ($set) se update karo
        const result = await Enquiry.findByIdAndUpdate(
            req.params.id, 
            { $set: req.body }, 
            { new: true } // Return the updated document
        );
        res.send(result);
    } catch (err) {
        res.status(500).json(err);
    }
};

module.exports = { enquiryCreate, enquiryList, enquiryDelete, enquiryUpdate };