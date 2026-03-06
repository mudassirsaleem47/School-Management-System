const express = require('express');
const router = express.Router();
const Payroll = require('../models/payrollSchema');
const Staff = require('../models/staffSchema');

// GET /Payroll/List/:schoolId/:monthYear
// Fetch all payroll records for a school in a specific month
router.get('/List/:schoolId/:monthYear', async (req, res) => {
    try {
        const { schoolId, monthYear } = req.params;
        const payrolls = await Payroll.find({ school: schoolId, monthYear })
            .populate('staffId', 'name email role designation phone');
        res.send(payrolls);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST /Payroll/Generate
// Generate payroll records for all missing staff for a specific month
router.post('/Generate', async (req, res) => {
    try {
        const { school, monthYear } = req.body;

        // Fetch all active staff
        const allStaff = await Staff.find({ school, status: 'active' });
        
        // Fetch existing payrolls for the month
        const existingPayrolls = await Payroll.find({ school, monthYear });
        const existingStaffIds = existingPayrolls.map(p => p.staffId.toString());

        // Find staff who don't have payroll for this month yet
        const staffWithoutPayroll = allStaff.filter(s => !existingStaffIds.includes(s._id.toString()));

        if (staffWithoutPayroll.length === 0) {
            return res.status(200).json({ message: 'Payroll already generated for all staff for this month.', count: 0 });
        }

        // Create new payroll records
        const newPayrolls = staffWithoutPayroll.map(staff => ({
            school,
            staffId: staff._id,
            monthYear,
            basicSalary: staff.salary || 0, // Fallback to 0 if salary not set
            allowances: 0,
            deductions: 0,
            netSalary: staff.salary || 0,
            status: 'Pending'
        }));

        const result = await Payroll.insertMany(newPayrolls);
        res.status(201).json({ message: 'Payroll generated successfully', count: result.length, data: result });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// PUT /Payroll/Update/:id
// Update allowances and deductions
router.put('/Update/:id', async (req, res) => {
    try {
        const { allowances, deductions } = req.body;
        
        const payroll = await Payroll.findById(req.params.id);
        if (!payroll) return res.status(404).json({ message: 'Payroll not found' });
        
        if (payroll.status === 'Paid') {
            return res.status(400).json({ message: 'Cannot edit an already paid payroll' });
        }

        const newAllowances = Number(allowances) || 0;
        const newDeductions = Number(deductions) || 0;
        
        // Recalculate net salary automatically
        const netSalary = payroll.basicSalary + newAllowances - newDeductions;

        const updated = await Payroll.findByIdAndUpdate(
            req.params.id,
            { allowances: newAllowances, deductions: newDeductions, netSalary },
            { new: true }
        ).populate('staffId', 'name email role designation');

        res.send(updated);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// PUT /Payroll/Pay/:id
// Mark payroll as paid
router.put('/Pay/:id', async (req, res) => {
    try {
        const { paymentMethod } = req.body;
        
        if (!paymentMethod) {
            return res.status(400).json({ message: 'Payment method is required' });
        }

        const updated = await Payroll.findByIdAndUpdate(
            req.params.id,
            { 
                status: 'Paid', 
                paymentMethod, 
                paidDate: new Date() 
            },
            { new: true }
        ).populate('staffId', 'name email role designation');

        res.send(updated);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
