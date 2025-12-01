// In C:\Users\Anas\Desktop\emergency-respone\server\middlewares\validateMiddleware.js

import Joi from 'joi'; // <-- Changed to import

// Joi Schema for User Registration
const registerSchema = Joi.object({
    username: Joi.string().trim().min(3).max(30).required(),
    email: Joi.string().trim().email().required(),
    password: Joi.string().min(6).required()
});

// Joi Schema for User Login
const loginSchema = Joi.object({
    email: Joi.string().trim().email().required(),
    password: Joi.string().min(6).required()
});

/**
 * Higher-order function that returns a middleware for validation.
 * @param {Joi.Schema} schema The Joi schema to validate against.
 */
const validate = (schema) => (req, res, next) => {
    const { error } = schema.validate(req.body);

    if (error) {
        // Return a clear 400 Bad Request error if validation fails
        return res.status(400).json({ 
            msg: 'Validation Error', 
            details: error.details.map(d => d.message) 
        });
    }
    next();
};

export {
    validate,
    registerSchema,
    loginSchema
};