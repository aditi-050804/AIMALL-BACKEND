export const isAdmin = (req, res, next) => {
    // Check for admin role OR specific hardcoded admin email
    if (req.user && (req.user.role?.toLowerCase() === 'admin' || req.user.email === 'admin@uwo24.com')) {
        next();
    } else {
        console.warn(`[SECURITY] Unauthorized access attempt to ${req.originalUrl} by user ${req.user?.id || 'Unknown'}`);
        res.status(403).json({ error: "Access Denied. Administrator privileges required." });
    }
};
