const crypto = require('crypto');
const bcrypt = require('bcryptjs');

const Admin = require('../models/adminSchema');
const Staff = require('../models/staffSchema');
const EmailService = require('../services/emailService');

const RESET_TOKEN_EXPIRY_MS = 15 * 60 * 1000;
const EMAIL_VERIFICATION_EXPIRY_MS = 24 * 60 * 60 * 1000;

const normalizeEmail = (value = '') => String(value).trim().toLowerCase();

const detectRoleFromStaff = (staff) => {
    const role = (staff?.role || staff?.designation || '').toLowerCase();
    if (role.includes('teacher')) return 'teacher';
    if (role.includes('accountant')) return 'accountant';
    if (role.includes('receptionist')) return 'receptionist';
    return 'staff';
};

const getFrontendBaseUrl = () => {
    const envUrl = process.env.FRONTEND_URL || process.env.CLIENT_URL;
    if (envUrl && /^https?:\/\//i.test(envUrl)) {
        return envUrl.replace(/\/+$/, '');
    }
    return 'http://localhost:5173';
};

const sendAdminVerificationEmail = async (admin, rawToken) => {
    const frontendBase = getFrontendBaseUrl();
    const verifyUrl = `${frontendBase}/verify-email?token=${rawToken}&email=${encodeURIComponent(admin.email)}`;

    return EmailService.sendEmail(admin._id, {
        to: admin.email,
        subject: 'Verify Your Email Address',
        text: `Hello ${admin.name},\n\nPlease verify your email for School Management System using this link (valid for 24 hours):\n${verifyUrl}\n\nIf you did not create this account, ignore this email.`,
        html: `
            <p>Hello ${admin.name},</p>
            <p>Please verify your email for School Management System.</p>
            <p>
                <a href="${verifyUrl}" target="_blank" rel="noopener noreferrer">
                    Verify Email
                </a>
            </p>
            <p>This link is valid for <strong>24 hours</strong>.</p>
            <p>If you did not create this account, ignore this email.</p>
        `
    });
};

const requestPasswordReset = async (req, res) => {
    try {
        const email = normalizeEmail(req.body?.email);
        const requestedRole = String(req.body?.role || '').toLowerCase();

        if (!email) {
            return res.status(400).json({ message: 'Email is required' });
        }

        let user = null;
        let resetRole = null;

        if (requestedRole === 'admin') {
            user = await Admin.findOne({ email });
            resetRole = 'admin';
        } else if (['staff', 'teacher', 'accountant', 'receptionist'].includes(requestedRole)) {
            user = await Staff.findOne({ email });
            resetRole = requestedRole;
        } else {
            user = await Admin.findOne({ email });
            if (user) {
                resetRole = 'admin';
            } else {
                user = await Staff.findOne({ email });
                resetRole = user ? detectRoleFromStaff(user) : 'staff';
            }
        }

        // Always return generic success to avoid user enumeration.
        if (!user) {
            return res.status(200).json({
                success: true,
                message: 'If an account exists for this email, a reset link has been sent.'
            });
        }

        const rawToken = crypto.randomBytes(32).toString('hex');
        const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');

        user.resetPasswordToken = hashedToken;
        user.resetPasswordExpires = new Date(Date.now() + RESET_TOKEN_EXPIRY_MS);
        await user.save();

        const frontendBase = getFrontendBaseUrl();
        const resetUrl = `${frontendBase}/reset-password?token=${rawToken}&email=${encodeURIComponent(email)}&role=${encodeURIComponent(resetRole)}`;

        const schoolId = resetRole === 'admin' ? user._id : user.school;
        const roleTitle = resetRole.charAt(0).toUpperCase() + resetRole.slice(1);

        const emailResult = await EmailService.sendEmail(schoolId, {
            to: email,
            subject: 'Password Reset Request',
            text: `Hello,\n\nA password reset was requested for your ${roleTitle} account.\nUse this link (valid for 15 minutes):\n${resetUrl}\n\nIf you did not request this, you can ignore this email.`,
            html: `
                <p>Hello,</p>
                <p>A password reset was requested for your <strong>${roleTitle}</strong> account.</p>
                <p>
                    <a href="${resetUrl}" target="_blank" rel="noopener noreferrer">
                        Reset Password
                    </a>
                </p>
                <p>This link is valid for <strong>15 minutes</strong>.</p>
                <p>If you did not request this, you can ignore this email.</p>
            `
        });

        if (!emailResult.success) {
            console.error('Password reset email delivery failed:', emailResult.error || 'Unknown error');
        }

        return res.status(200).json({
            success: true,
            message: 'If an account exists for this email, a reset link has been sent.'
        });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

const resetPassword = async (req, res) => {
    try {
        const email = normalizeEmail(req.body?.email);
        const token = String(req.body?.token || '').trim();
        const newPassword = String(req.body?.newPassword || '');
        const role = String(req.body?.role || '').toLowerCase();

        if (!email || !token || !newPassword) {
            return res.status(400).json({ message: 'Email, token and new password are required' });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ message: 'Password must be at least 6 characters' });
        }

        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
        const filter = {
            email,
            resetPasswordToken: hashedToken,
            resetPasswordExpires: { $gt: new Date() }
        };

        let user = null;
        if (role === 'admin') {
            user = await Admin.findOne(filter);
        } else if (['staff', 'teacher', 'accountant', 'receptionist'].includes(role)) {
            user = await Staff.findOne(filter);
        } else {
            user = await Admin.findOne(filter);
            if (!user) user = await Staff.findOne(filter);
        }

        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired reset link' });
        }

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        user.passwordChangedAt = new Date();
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;

        await user.save();

        return res.status(200).json({
            success: true,
            message: 'Password reset successful. Please login with your new password.'
        });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

const verifyEmail = async (req, res) => {
    try {
        const email = normalizeEmail(req.body?.email || req.query?.email);
        const token = String(req.body?.token || req.query?.token || '').trim();

        if (!email || !token) {
            return res.status(400).json({ message: 'Email and token are required' });
        }

        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

        const admin = await Admin.findOne({
            email,
            emailVerificationToken: hashedToken,
            emailVerificationExpires: { $gt: new Date() }
        });

        if (!admin) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired verification link'
            });
        }

        admin.emailVerified = true;
        admin.emailVerificationToken = undefined;
        admin.emailVerificationExpires = undefined;
        await admin.save();

        return res.status(200).json({
            success: true,
            message: 'Email verified successfully. You can now login.'
        });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

const resendVerificationEmail = async (req, res) => {
    try {
        const email = normalizeEmail(req.body?.email);
        if (!email) {
            return res.status(400).json({ message: 'Email is required' });
        }

        const admin = await Admin.findOne({ email });

        // Keep response generic to avoid email enumeration.
        if (!admin) {
            return res.status(200).json({
                success: true,
                message: 'If this email is registered, a verification email has been sent.'
            });
        }

        if (admin.emailVerified) {
            return res.status(200).json({
                success: true,
                message: 'Email is already verified. You can login now.'
            });
        }

        const rawToken = crypto.randomBytes(32).toString('hex');
        const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');

        admin.emailVerificationToken = hashedToken;
        admin.emailVerificationExpires = new Date(Date.now() + EMAIL_VERIFICATION_EXPIRY_MS);
        await admin.save();

        const emailResult = await sendAdminVerificationEmail(admin, rawToken);
        if (!emailResult.success) {
            console.error('Verification email resend failed:', emailResult.error || 'Unknown error');
        }

        return res.status(200).json({
            success: true,
            message: 'If this email is registered, a verification email has been sent.'
        });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

module.exports = {
    requestPasswordReset,
    resetPassword,
    verifyEmail,
    resendVerificationEmail
};