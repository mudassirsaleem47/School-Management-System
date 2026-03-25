// Middleware to check user permissions based on role
const checkPermission = (allowedRoles) => {
    return (req, res, next) => {
        try {
            // User info should be attached by auth middleware
            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    message: 'Authentication required'
                });
            }

            const userRole = req.user.role;

            // Check if user's role is in allowed roles
            if (!allowedRoles.includes(userRole)) {
                return res.status(403).json({
                    success: false,
                    message: `Access denied. This action requires one of these roles: ${allowedRoles.join(', ')}`
                });
            }

            next();
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: 'Permission check failed',
                error: error.message
            });
        }
    };
};

// Predefined role groups for common permissions
const ROLES = {
    SUPER_ADMIN: 'SuperAdmin',
    ADMIN: 'Admin',
    TEACHER: 'Teacher',
    ACCOUNTANT: 'Accountant',
    RECEPTIONIST: 'Receptionist'
};

// Permission groups
const PERMISSIONS = {
    // Can view students
    VIEW_STUDENTS: [ROLES.ADMIN, ROLES.TEACHER, ROLES.ACCOUNTANT, ROLES.RECEPTIONIST],
    
    // Can add/edit students
    MANAGE_STUDENTS: [ROLES.ADMIN, ROLES.RECEPTIONIST],
    
    // Can manage teachers
    MANAGE_TEACHERS: [ROLES.ADMIN],
    
    // Can manage staff (accountant, receptionist)
    MANAGE_STAFF: [ROLES.ADMIN],
    
    // Can manage fees
    MANAGE_FEES: [ROLES.ADMIN, ROLES.ACCOUNTANT, ROLES.RECEPTIONIST],
    
    // Can take attendance
    TAKE_ATTENDANCE: [ROLES.ADMIN, ROLES.TEACHER],
    
    // Can view reports
    VIEW_REPORTS: [ROLES.ADMIN, ROLES.TEACHER, ROLES.ACCOUNTANT],
    
    // Can manage campuses
    MANAGE_CAMPUSES: [ROLES.ADMIN],
    
    // Super admin only
    PLATFORM_ADMIN: [ROLES.SUPER_ADMIN]
};

module.exports = {
    checkPermission,
    ROLES,
    PERMISSIONS
};
