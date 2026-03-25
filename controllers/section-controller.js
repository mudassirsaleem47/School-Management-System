const Section = require('../models/sectionSchema.js');

const createSection = async (req, res) => {
    try {
        const { sectionName, school } = req.body;
        const sectionExists = await Section.findOne({ sectionName, school });

        if (sectionExists) {
            return res.status(400).json({ message: "Section already exists in this school." });
        }

        const newSection = new Section(req.body);
        const result = await newSection.save();
        res.status(201).json(result);

    } catch (err) {
        res.status(500).json({ message: "Internal Server Error during Section Creation.", error: err.message });
    }
};

const getSectionsBySchool = async (req, res) => {
    try {
        const { schoolId } = req.params;
        const sections = await Section.find({ school: schoolId });
        res.status(200).json(sections);
    } catch (err) {
        res.status(500).json({ message: "Internal Server Error while fetching sections.", error: err.message });
    }
};

const deleteSection = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedSection = await Section.findByIdAndDelete(id);
        if (!deletedSection) {
            return res.status(404).json({ message: "Section not found." });
        }
        res.status(200).json({ message: "Section deleted successfully." });
    } catch (err) {
        res.status(500).json({ message: "Internal Server Error during Section Deletion.", error: err.message });
    }
};

const updateSection = async (req, res) => {
    try {
        const { id } = req.params;
        const { sectionName } = req.body;
        const updatedSection = await Section.findByIdAndUpdate(
            id,
            { sectionName },
            { new: true }
        );
        if (!updatedSection) {
            return res.status(404).json({ message: "Section not found." });
        }
        res.status(200).json(updatedSection);
    } catch (err) {
        res.status(500).json({ message: "Internal Server Error during Section Update.", error: err.message });
    }
};

module.exports = { createSection, getSectionsBySchool, deleteSection, updateSection };
