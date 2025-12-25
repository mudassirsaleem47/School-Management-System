const Expense = require('../models/expenseSchema.js');
const mongoose = require('mongoose');

// 1. Create Expense Entry
const createExpense = async (req, res) => {
    try {
        const { amount, category, description, date, paymentMethod, reference, school, createdBy } = req.body;

        const newExpense = new Expense({
            amount,
            category,
            description,
            date: date || Date.now(),
            paymentMethod: paymentMethod || 'Cash',
            reference: reference || '',
            school,
            createdBy
        });

        const result = await newExpense.save();
        res.status(201).json({ 
            message: "Expense entry created successfully!",
            expense: result
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Error creating expense entry.", error: err.message });
    }
};

// 2. Get all expense entries for a school
const getExpenseBySchool = async (req, res) => {
    try {
        const { schoolId } = req.params;
        
        const expenseEntries = await Expense.find({ school: schoolId })
            .sort({ date: -1 });

        res.status(200).json(expenseEntries);

    } catch (err) {
        res.status(500).json({ message: "Error fetching expense entries.", error: err.message });
    }
};

// 3. Update Expense Entry
const updateExpense = async (req, res) => {
    try {
        const { id } = req.params;
        
        const updatedExpense = await Expense.findByIdAndUpdate(
            id,
            req.body,
            { new: true }
        );

        if (!updatedExpense) {
            return res.status(404).json({ message: "Expense entry not found." });
        }

        res.status(200).json({ 
            message: "Expense entry updated successfully!",
            expense: updatedExpense
        });

    } catch (err) {
        res.status(500).json({ message: "Error updating expense entry.", error: err.message });
    }
};

// 4. Delete Expense Entry
const deleteExpense = async (req, res) => {
    try {
        const { id } = req.params;
        
        await Expense.findByIdAndDelete(id);
        res.status(200).json({ message: "Expense entry deleted successfully!" });

    } catch (err) {
        res.status(500).json({ message: "Error deleting expense entry.", error: err.message });
    }
};

// 5. Get Expense Statistics
const getExpenseStatistics = async (req, res) => {
    try {
        const { schoolId } = req.params;

        // Total expense
        const totalExpenseData = await Expense.aggregate([
            { $match: { school: new mongoose.Types.ObjectId(schoolId) } },
            { $group: { _id: null, total: { $sum: "$amount" }, count: { $sum: 1 } } }
        ]);

        // Today's expense
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const todayExpense = await Expense.aggregate([
            {
                $match: {
                    school: new mongoose.Types.ObjectId(schoolId),
                    date: { $gte: today, $lt: tomorrow }
                }
            },
            { $group: { _id: null, total: { $sum: "$amount" }, count: { $sum: 1 } } }
        ]);

        // Monthly expense
        const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const monthlyExpense = await Expense.aggregate([
            {
                $match: {
                    school: new mongoose.Types.ObjectId(schoolId),
                    date: { $gte: firstDayOfMonth }
                }
            },
            { $group: { _id: null, total: { $sum: "$amount" }, count: { $sum: 1 } } }
        ]);

        // Category-wise breakdown
        const categoryBreakdown = await Expense.aggregate([
            { $match: { school: new mongoose.Types.ObjectId(schoolId) } },
            { $group: { _id: "$category", total: { $sum: "$amount" }, count: { $sum: 1 } } }
        ]);

        res.status(200).json({
            totalExpense: {
                amount: totalExpenseData[0]?.total || 0,
                count: totalExpenseData[0]?.count || 0
            },
            todayExpense: {
                amount: todayExpense[0]?.total || 0,
                count: todayExpense[0]?.count || 0
            },
            monthlyExpense: {
                amount: monthlyExpense[0]?.total || 0,
                count: monthlyExpense[0]?.count || 0
            },
            categoryBreakdown
        });

    } catch (err) {
        res.status(500).json({ message: "Error fetching expense statistics.", error: err.message });
    }
};

module.exports = {
    createExpense,
    getExpenseBySchool,
    updateExpense,
    deleteExpense,
    getExpenseStatistics
};
