const FeeGroup = require('../models/feeGroupSchema');
const Sclass = require('../models/sclassSchema');

// Helper to recalculate totalAmount inline (for findByIdAndUpdate path)
const calcTotal = (components = []) =>
    components.reduce((sum, c) => sum + (Number(c.amount) || 0), 0);

// 1. Create Fee Group
const createFeeGroup = async (req, res) => {
    try {
        const { groupName, description, academicYear, class: classId, section, feeComponents, school } = req.body;

        if (!feeComponents || feeComponents.length === 0) {
            return res.status(400).json({ message: "At least one fee component is required." });
        }

        // Validate class if provided
        if (classId) {
            const sclass = await Sclass.findById(classId);
            if (!sclass) return res.status(404).json({ message: "Class not found." });
        }

        const newGroup = new FeeGroup({
            school,
            groupName,
            description: description || "",
            academicYear,
            class: classId || null,
            section: section || 'All',
            feeComponents
        });

        const result = await newGroup.save();

        const populated = await FeeGroup.findById(result._id).populate('class', 'sclassName');

        res.status(201).json({
            message: "Fee group created successfully!",
            feeGroup: populated
        });

    } catch (err) {
        if (err.name === 'ValidationError') {
            return res.status(400).json({ message: err.message });
        }
        res.status(500).json({ message: "Error creating fee group.", error: err.message });
    }
};

// 2. Get all fee groups for a school
const getFeeGroupsBySchool = async (req, res) => {
    try {
        const { schoolId } = req.params;
        const { status } = req.query;

        const query = { school: schoolId };
        if (status) query.status = status;

        const groups = await FeeGroup.find(query)
            .populate('class', 'sclassName')
            .sort({ createdAt: -1 });

        res.status(200).json(groups);

    } catch (err) {
        res.status(500).json({ message: "Error fetching fee groups.", error: err.message });
    }
};

// 3. Get a single fee group by ID
const getFeeGroupById = async (req, res) => {
    try {
        const group = await FeeGroup.findById(req.params.id).populate('class', 'sclassName');
        if (!group) return res.status(404).json({ message: "Fee group not found." });
        res.status(200).json(group);
    } catch (err) {
        res.status(500).json({ message: "Error fetching fee group.", error: err.message });
    }
};

// 4. Update Fee Group
const updateFeeGroup = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = { ...req.body };

        // Remove fields that shouldn't be updated directly
        delete updateData._id;
        delete updateData.school;

        // Recalculate total if components are in the update
        if (updateData.feeComponents) {
            if (updateData.feeComponents.length === 0) {
                return res.status(400).json({ message: "At least one fee component is required." });
            }
            updateData.totalAmount = calcTotal(updateData.feeComponents);
        }

        if (updateData.class === '' || updateData.class === undefined) {
            updateData.class = null;
        }

        const updated = await FeeGroup.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        ).populate('class', 'sclassName');

        if (!updated) return res.status(404).json({ message: "Fee group not found." });

        res.status(200).json({
            message: "Fee group updated successfully!",
            feeGroup: updated
        });

    } catch (err) {
        if (err.name === 'ValidationError') {
            return res.status(400).json({ message: err.message });
        }
        res.status(500).json({ message: "Error updating fee group.", error: err.message });
    }
};

// 5. Delete Fee Group
const deleteFeeGroup = async (req, res) => {
    try {
        const { id } = req.params;

        const deleted = await FeeGroup.findByIdAndDelete(id);
        if (!deleted) return res.status(404).json({ message: "Fee group not found." });

        res.status(200).json({ message: "Fee group deleted successfully!" });

    } catch (err) {
        res.status(500).json({ message: "Error deleting fee group.", error: err.message });
    }
};

// 6. Toggle Active/Inactive status
const toggleFeeGroupStatus = async (req, res) => {
    try {
        const { id } = req.params;

        const group = await FeeGroup.findById(id);
        if (!group) return res.status(404).json({ message: "Fee group not found." });

        group.status = group.status === 'Active' ? 'Inactive' : 'Active';
        await group.save();

        res.status(200).json({
            message: `Fee group ${group.status === 'Active' ? 'activated' : 'deactivated'} successfully!`,
            feeGroup: group
        });

    } catch (err) {
        res.status(500).json({ message: "Error toggling fee group status.", error: err.message });
    }
};

module.exports = {
    createFeeGroup,
    getFeeGroupsBySchool,
    getFeeGroupById,
    updateFeeGroup,
    deleteFeeGroup,
    toggleFeeGroupStatus
};