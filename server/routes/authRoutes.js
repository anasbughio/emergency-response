// In C:\Users\Anas\Desktop\emergency-respone\server\routes\authRoutes.js

import express from 'express';
import { registerUser, loginUser } from '../controllers/authController.js';
// Combine all imports into one line, using the correct filename:
import { validate, registerSchema, loginSchema } from '../middlewares/validation.js'; 

const router = express.Router();

router.post('/register', validate(registerSchema), registerUser);
router.post('/login', validate(loginSchema), loginUser);

export default router;