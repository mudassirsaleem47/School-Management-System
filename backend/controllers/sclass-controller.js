const Sclass = require('../models/sclassSchema.js');

// 1. Nayi Class/Section Create karna
const sclassCreate = async (req, res) => {
    try {
        const { sclassName, school, classIncharge, sections } = req.body;
        
        const sclassExists = await Sclass.findOne({ sclassName, school });
        if (sclassExists) {
            return res.status(400).json({ message: "Class already exists in this school." });
        }

        const newSclass = new Sclass({
            sclassName,
            school,
            classIncharge,
            sections: sections || []
        });
        const result = await newSclass.save();

        const populatedClass = await Sclass.findById(result._id)
            .populate('classIncharge', 'name email')
            .populate('sections');

        res.status(201).json({ 
            message: "Class created successfully!",
            classId: result._id,
            class: populatedClass
        });

    } catch (err) {
        res.status(500).json({ message: "Internal Server Error during Class Creation.", error: err.message });
    }
};

const getSclassesBySchool = async (req, res) => {
    try {
        const { schoolId } = req.params;
        const sclasses = await Sclass.find({ school: schoolId })
            .populate('classIncharge', 'name email')
            .populate('sections');

        if (sclasses.length === 0) {
            return res.status(200).json([]);
        }

        res.status(200).json(sclasses);

    } catch (err) {
        res.status(500).json({ message: "Internal Server Error while fetching classes.", error: err.message });
    }
};

// 3. Class Delete karna
const deleteSclass = async (req, res) => {
    try {
        const { id } = req.params;

        // Class delete karne se pehle zaroori hai ke us class ke students, teachers ko bhi handle kiya jaye.
        // Abhi hum sirf Class delete kar rahe hain.
        const deletedClass = await Sclass.findByIdAndDelete(id);

        if (!deletedClass) {
            return res.status(404).json({ message: "Class not found." });
        }

        res.status(200).json({ message: "Class deleted successfully." });

    } catch (err) {
        res.status(500).json({ message: "Internal Server Error during Class Deletion.", error: err.message });
    }
};


const addSection = async (req, res) => {
    try {
        // Class ID URL se milegi, Section Name body se
        const { id } = req.params; 
        const { sectionName } = req.body;

        // Class dhoondo aur section push karo
        const result = await Sclass.findByIdAndUpdate(
            id,
            { $push: { sections: { sectionName: sectionName } } },
            { new: true } // Update hone ke baad wala data wapis karo
        );

        if (!result) return res.status(404).json({ message: "Class not found" });

        res.status(200).json(result);
    } catch (err) {
        res.status(500).json(err);
    }
};

// 5. Section Delete karna
const deleteSection = async (req, res) => {
    try {
        const { id, sectionId } = req.params;

        // Class dhoondo aur specific section ko 'pull' (nikal) do
        const result = await Sclass.findByIdAndUpdate(
            id,
            { $pull: { sections: { _id: sectionId } } },
            { new: true }
        );

        if (!result) return res.status(404).json({ message: "Class not found" });
        res.status(200).json(result);
    } catch (err) {
        res.status(500).json(err);
    }
};

// 6. Class Update karna
const updateSclass = async (req, res) => {
    try {
        const { id } = req.params;
        const { sclassName, classIncharge } = req.body;

        const updatedSclass = await Sclass.findByIdAndUpdate(
            id,
            { sclassName, classIncharge },
            { new: true }
        ).populate('classIncharge', 'name email');

        if (!updatedSclass) {
            return res.status(404).json({ message: "Class not found." });
        }

        res.status(200).json({ message: "Class updated successfully!", class: updatedSclass });
    } catch (err) {
        res.status(500).json({ message: "Internal Server Error during Class Update.", error: err.message });
    }
};

// Export mein naye functions add karna mat bhoolna
module.exports = { sclassCreate, getSclassesBySchool, deleteSclass, addSection, deleteSection, updateSclass };
