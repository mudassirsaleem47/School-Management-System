const Admin = require('../models/adminSchema');
const bcrypt = require('bcryptjs'); // Password secure karne ke liye

const adminRegister = async (req, res) => {
    try {
        console.log("AdminReg request received:", req.body);

        // User se data lena
        const { name, email, schoolName, password } = req.body;

        // Check karna ke pehle se toh exist nahi karta
        const existingAdmin = await Admin.findOne({ email });
        const existingSchool = await Admin.findOne({ schoolName });

        if (existingAdmin || existingSchool) {
            console.log("Conflict: Admin or School already exists");
            return res.status(400).json({ message: "Admin or School already exists" });
        }

        // Password ko encrypt karna (Security)
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Naya Admin banana
        const admin = new Admin({
            name,
            email,
            schoolName,
            password: hashedPassword
        });

        // Save karna
        const result = await admin.save();
        console.log("Admin registered successfully:", result._id);
        
        // Password wapis nahi bhejna response mein
        result.password = undefined;

        res.status(200).json(result);
    } catch (err) {
        console.error("Error in adminRegister:", err);
        res.status(500).json({ message: "Internal Server Error", error: err.message });
    }
};

const adminLogin = async (req, res) => {
    try {
        const { email, password } = req.body;

        const admin = await Admin.findOne({ email });
        if (!admin) {
            return res.status(404).json({ message: "User not found" });
        }

        // Password match karna
        const isPasswordValid = await bcrypt.compare(password, admin.password);
        if (!isPasswordValid) {
            return res.status(400).json({ message: "Invalid Password" });
        }
        
        // Admin data bhejna (Login successful)
        admin.password = undefined;
        res.status(200).json(admin);
    } catch (err) {
        res.status(500).json(err);
    }
};

const getAdminDetail = async (req, res) => {
    try {
        let admin = await Admin.findById(req.params.id);
        if (admin) {
            admin.password = undefined;
            res.send(admin);
        } else {
            res.send({ message: "No admin found" });
        }
    } catch (err) {
        res.status(500).json(err);
    }
}

const updateAdmin = async (req, res) => {
    try {
        const { name, email, schoolName, address, phoneNumber, website } = req.body;
        const updateData = { name, email, schoolName, address, phoneNumber, website };

        if (req.files) {
            if (req.files.schoolLogo && req.files.schoolLogo[0]) {
                console.log("School Logo uploaded:", req.files.schoolLogo[0]);
                updateData.schoolLogo = req.files.schoolLogo[0].path;
            }
            if (req.files.favicon && req.files.favicon[0]) {
                console.log("Favicon uploaded:", req.files.favicon[0]);
                updateData.favicon = req.files.favicon[0].path;
            }
        }

        const result = await Admin.findByIdAndUpdate(req.params.id, { $set: updateData }, { new: true });
        result.password = undefined;
        res.send(result);
    } catch (err) {
        res.status(500).json(err);
    }
};

const updateAdminSettings = async (req, res) => {
    try {
        const { settings, currentPassword, newPassword } = req.body;
        const admin = await Admin.findById(req.params.id);

        if (!admin) {
            return res.status(404).json({ message: "Admin not found" });
        }

        if (settings && typeof settings === 'object') {
            admin.settings = { ...(admin.settings || {}), ...settings };
        }

        if (newPassword !== undefined) {
            if (!currentPassword) {
                return res.status(400).json({ message: "Current password is required" });
            }

            const isPasswordValid = await bcrypt.compare(currentPassword, admin.password);
            if (!isPasswordValid) {
                return res.status(400).json({ message: "Current password is incorrect" });
            }

            if (typeof newPassword !== 'string' || newPassword.length < 6) {
                return res.status(400).json({ message: "New password must be at least 6 characters" });
            }

            const salt = await bcrypt.genSalt(10);
            admin.password = await bcrypt.hash(newPassword, salt);
        }

        await admin.save();
        const safeAdmin = admin.toObject();
        delete safeAdmin.password;
        res.send(safeAdmin);
    } catch (err) {
        res.status(500).json(err);
    }
};

module.exports = { adminRegister, adminLogin, getAdminDetail, updateAdmin, updateAdminSettings };