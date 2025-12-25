const FeeStructure = require('../models/feeStructureSchema.js');
const Fee = require('../models/feeSchema.js');
const FeeTransaction = require('../models/feeTransactionSchema.js');
const Student = require('../models/studentSchema.js');
const Sclass = require('../models/sclassSchema.js');
const mongoose = require('mongoose');

// 1. Create Fee Structure
const createFeeStructure = async (req, res) => {
    try {
        const { feeName, feeType, class: classId, section, amount, academicYear, dueDate, description, school } = req.body;

        // Verify class exists
        const sclass = await Sclass.findById(classId);
        if (!sclass) {
            return res.status(404).json({ message: "Class not found." });
        }

        const newFeeStructure = new FeeStructure({
            school,
            feeName,
            feeType,
            class: classId,
            section,
            amount,
            academicYear,
            dueDate,
            description: description || ""
        });

        const result = await newFeeStructure.save();
        res.status(201).json({ 
            message: "Fee structure created successfully!",
            feeStructure: result
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Error creating fee structure.", error: err.message });
    }
};

// 2. Get all fee structures for a school
const getFeeStructuresBySchool = async (req, res) => {
    try {
        const { schoolId } = req.params;
        
        const feeStructures = await FeeStructure.find({ school: schoolId, status: 'Active' })
            .populate('class', 'sclassName')
            .sort({ createdAt: -1 });

        res.status(200).json(feeStructures);

    } catch (err) {
        res.status(500).json({ message: "Error fetching fee structures.", error: err.message });
    }
};

// 3. Update Fee Structure
const updateFeeStructure = async (req, res) => {
    try {
        const { id } = req.params;
        
        const updatedFeeStructure = await FeeStructure.findByIdAndUpdate(
            id,
            req.body,
            { new: true }
        ).populate('class', 'sclassName');

        if (!updatedFeeStructure) {
            return res.status(404).json({ message: "Fee structure not found." });
        }

        res.status(200).json({ 
            message: "Fee structure updated successfully!",
            feeStructure: updatedFeeStructure
        });

    } catch (err) {
        res.status(500).json({ message: "Error updating fee structure.", error: err.message });
    }
};

// 4. Delete Fee Structure
const deleteFeeStructure = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Check if any fees are assigned using this structure
        const assignedFees = await Fee.findOne({ feeStructure: id });
        if (assignedFees) {
            return res.status(400).json({ 
                message: "Cannot delete fee structure. Fees are already assigned to students." 
            });
        }

        await FeeStructure.findByIdAndDelete(id);
        res.status(200).json({ message: "Fee structure deleted successfully!" });

    } catch (err) {
        res.status(500).json({ message: "Error deleting fee structure.", error: err.message });
    }
};

// 5. Assign Fee to Student(s)
const assignFeeToStudents = async (req, res) => {
    try {
        const { feeStructureId, studentIds, school } = req.body;

        console.log('📌 Assign Fee Request:', {
            feeStructureId,
            studentIds,
            school,
            studentCount: studentIds?.length
        });

        // Get fee structure
        const feeStructure = await FeeStructure.findById(feeStructureId);
        if (!feeStructure) {
            console.log('❌ Fee structure not found:', feeStructureId);
            return res.status(404).json({ message: "Fee structure not found." });
        }

        console.log('✅ Fee structure found:', feeStructure.feeName);

        const assignedFees = [];
        const errors = [];

        for (const studentId of studentIds) {
            try {
                // Check if fee already assigned
                const existingFee = await Fee.findOne({
                    student: studentId,
                    feeStructure: feeStructureId,
                    academicYear: feeStructure.academicYear
                });

                if (existingFee) {
                    console.log('⚠️ Fee already assigned to student:', studentId);
                    errors.push({ studentId, message: "Fee already assigned" });
                    continue;
                }

                const newFee = new Fee({
                    student: studentId,
                    school,
                    feeStructure: feeStructureId,
                    totalAmount: feeStructure.amount,
                    paidAmount: 0,
                    pendingAmount: feeStructure.amount,
                    dueDate: feeStructure.dueDate,
                    academicYear: feeStructure.academicYear
                });

                const savedFee = await newFee.save();
                console.log('✅ Fee assigned to student:', studentId);
                assignedFees.push(savedFee);

            } catch (err) {
                console.log('❌ Error assigning to student:', studentId, err.message);
                errors.push({ studentId, message: err.message });
            }
        }

        console.log(`🎉 Assignment complete: ${assignedFees.length} success, ${errors.length} errors`);

        res.status(201).json({
            message: `Fees assigned successfully to ${assignedFees.length} student(s)`,
            assignedFees,
            errors: errors.length > 0 ? errors : undefined
        });

    } catch (err) {
        console.log('❌ Error in assignFeeToStudents:', err.message);
        res.status(500).json({ message: "Error assigning fees.", error: err.message });
    }
};

// 6. Get Student Fees (for individual student)
const getStudentFees = async (req, res) => {
    try {
        const { studentId } = req.params;
        
        const fees = await Fee.find({ student: studentId })
            .populate('feeStructure')
            .populate('student', 'name rollNum')
            .sort({ dueDate: 1 });

        res.status(200).json(fees);

    } catch (err) {
        res.status(500).json({ message: "Error fetching student fees.", error: err.message });
    }
};

// 7. Get Pending Fees for School
const getPendingFees = async (req, res) => {
    try {
        const { schoolId } = req.params;
        
        const pendingFees = await Fee.find({ 
            school: schoolId,
            status: { $in: ['Pending', 'Partial', 'Overdue'] }
        })
        .populate('student', 'name rollNum sclassName section')
        .populate('feeStructure', 'feeName feeType')
        .populate({
            path: 'student',
            populate: {
                path: 'sclassName',
                select: 'sclassName'
            }
        })
        .sort({ dueDate: 1 });

        res.status(200).json(pendingFees);

    } catch (err) {
        res.status(500).json({ message: "Error fetching pending fees.", error: err.message });
    }
};

// 8. Collect Fee (Process Payment)
const collectFee = async (req, res) => {
    try {
        console.log('💰 Collect Fee Request:', req.body);

        const { 
            feeId, 
            amount, 
            paymentMethod, 
            collectedBy, 
            chequeNumber, 
            bankName, 
            transactionReference, 
            remarks 
        } = req.body;

        console.log('📋 Payment Details:', { feeId, amount, paymentMethod, collectedBy });

        // Get the fee record
        const fee = await Fee.findById(feeId).populate('student').populate('feeStructure');
        if (!fee) {
            console.log('❌ Fee not found:', feeId);
            return res.status(404).json({ message: "Fee record not found." });
        }

        console.log('✅ Fee found:', fee.feeStructure?.feeName, 'Pending:', fee.pendingAmount);

        // Validate payment amount
        if (amount <= 0 || amount > fee.pendingAmount) {
            console.log('❌ Invalid amount:', amount, 'Pending:', fee.pendingAmount);
            return res.status(400).json({ 
                message: `Invalid payment amount. Pending amount is ${fee.pendingAmount}` 
            });
        }

        console.log('💳 Creating transaction...');

        // Create transaction record
        const transaction = new FeeTransaction({
            student: fee.student._id,
            fee: feeId,
            school: fee.school,
            amount,
            paymentMethod,
            collectedBy,
            chequeNumber: chequeNumber || "",
            bankName: bankName || "",
            transactionReference: transactionReference || "",
            remarks: remarks || ""
        });

        console.log('💾 Saving transaction...');
        await transaction.save();
        console.log('✅ Transaction saved:', transaction.receiptNumber);

        // Update fee record
        fee.paidAmount += amount;
        fee.pendingAmount = fee.totalAmount - fee.paidAmount;
        
        if (fee.paidAmount >= fee.totalAmount) {
            fee.status = 'Paid';
        } else {
            fee.status = 'Partial';
        }

        console.log('💾 Updating fee record...');
        await fee.save();
        console.log('✅ Fee updated. New status:', fee.status);

        res.status(201).json({
            message: "Payment collected successfully!",
            transaction,
            updatedFee: fee
        });

    } catch (err) {
        console.error('❌ Collect Fee Error:', err);
        console.error('Error stack:', err.stack);
        res.status(500).json({ message: "Error processing payment.", error: err.message });
    }
};

// 9. Get Fee Transactions for School
const getFeeTransactions = async (req, res) => {
    try {
        const { schoolId } = req.params;
        const { startDate, endDate } = req.query;

        console.log('📊 Get Transactions - School ID:', schoolId);
        console.log('📅 Date Range:', { startDate, endDate });

        let query = { school: schoolId };
        
        // Filter by date range if provided
        if (startDate && endDate) {
            query.paymentDate = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }

        console.log('🔍 Query:', query);

        const transactions = await FeeTransaction.find(query)
            .populate('student', 'name rollNum sclassName section')
            .populate('fee')
            .populate('collectedBy', 'schoolName')
            .populate({
                path: 'student',
                populate: {
                    path: 'sclassName',
                    select: 'sclassName'
                }
            })
            .sort({ paymentDate: -1 });

        console.log('✅ Transactions found:', transactions.length);
        if (transactions.length > 0) {
            console.log('First transaction:', transactions[0]);
        }

        res.status(200).json(transactions);

    } catch (err) {
        console.error('❌ Get Transactions Error:', err);
        res.status(500).json({ message: "Error fetching transactions.", error: err.message });
    }
};

// 10. Get Receipt Details
const getReceiptDetails = async (req, res) => {
    try {
        const { transactionId } = req.params;

        const transaction = await FeeTransaction.findById(transactionId)
            .populate({
                path: 'student',
                populate: {
                    path: 'sclassName',
                    select: 'sclassName'
                }
            })
            .populate({
                path: 'fee',
                populate: {
                    path: 'feeStructure',
                    select: 'feeName feeType'
                }
            })
            .populate({
                path: 'school',
                select: 'schoolName email phone address'
            })
            .populate('collectedBy', 'schoolName');

        if (!transaction) {
            return res.status(404).json({ message: "Transaction not found." });
        }

        res.status(200).json(transaction);

    } catch (err) {
        res.status(500).json({ message: "Error fetching receipt details.", error: err.message });
    }
};

// 11. Get Fee Statistics for Dashboard
const getFeeStatistics = async (req, res) => {
    try {
        const { schoolId } = req.params;

        // Total pending fees
        const pendingFeesData = await Fee.aggregate([
            { 
                $match: { 
                    school: new mongoose.Types.ObjectId(schoolId),
                    status: { $in: ['Pending', 'Partial', 'Overdue'] }
                } 
            },
            { 
                $group: { 
                    _id: null, 
                    totalPending: { $sum: "$pendingAmount" },
                    count: { $sum: 1 }
                } 
            }
        ]);

        // Today's collection
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const todayCollection = await FeeTransaction.aggregate([
            {
                $match: {
                    school: new mongoose.Types.ObjectId(schoolId),
                    paymentDate: { $gte: today, $lt: tomorrow }
                }
            },
            {
                $group: {
                    _id: null,
                    total: { $sum: "$amount" },
                    count: { $sum: 1 }
                }
            }
        ]);

        // Monthly collection
        const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const monthlyCollection = await FeeTransaction.aggregate([
            {
                $match: {
                    school: new mongoose.Types.ObjectId(schoolId),
                    paymentDate: { $gte: firstDayOfMonth }
                }
            },
            {
                $group: {
                    _id: null,
                    total: { $sum: "$amount" },
                    count: { $sum: 1 }
                }
            }
        ]);

        res.status(200).json({
            pendingFees: {
                amount: pendingFeesData[0]?.totalPending || 0,
                count: pendingFeesData[0]?.count || 0
            },
            todayCollection: {
                amount: todayCollection[0]?.total || 0,
                count: todayCollection[0]?.count || 0
            },
            monthlyCollection: {
                amount: monthlyCollection[0]?.total || 0,
                count: monthlyCollection[0]?.count || 0
            }
        });

    } catch (err) {
        res.status(500).json({ message: "Error fetching statistics.", error: err.message });
    }
};

module.exports = {
    createFeeStructure,
    getFeeStructuresBySchool,
    updateFeeStructure,
    deleteFeeStructure,
    assignFeeToStudents,
    getStudentFees,
    getPendingFees,
    collectFee,
    getFeeTransactions,
    getReceiptDetails,
    getFeeStatistics
};
