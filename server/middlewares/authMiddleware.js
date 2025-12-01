const jwt = require('jsonwebtoken');

const protect = (req, res, next) => {
    // 1. Check for token in cookies
    let token = req.cookies.token; // Retrieve token from cookies

    if (!token) {
        // Fallback: Check for token in Authorization header if needed for Postman testing
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }
    }
    
    // 2. If no token, return 401
    if (!token) {
        return res.status(401).json({ msg: 'Not authorized, no token provided' });
    }

    // 3. Verify token (same logic as before)
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = { id: decoded.id, role: decoded.role };
        next();
    } catch (error) {
        console.error(error);
        return res.status(401).json({ msg: 'Not authorized, token failed or expired' });
    }
};
// Middleware to restrict access based on user role
const authorize = (roles = []) => {
    // If roles is a single string, convert it to an array
    if (typeof roles === 'string') {
        roles = [roles];
    }

    return (req, res, next) => {
        // If roles array is not empty AND the user's role is NOT included in the allowed roles
        if (roles.length > 0 && !roles.includes(req.user.role)) {
            return res.status(403).json({ msg: `User role '${req.user.role}' is not authorized to access this route` });
        }
        next();
    };
};

export { protect, authorize };