import { Router } from 'express';
import { register, login, getMe } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';
import { validateRequest } from '../middleware/validateRequest.js';
import { registerValidators, loginValidators } from '../validators/authValidators.js';

const router = Router();

// POST /api/auth/register
router.post('/register', registerValidators, validateRequest, register);

// POST /api/auth/login
router.post('/login', loginValidators, validateRequest, login);

// GET /api/auth/me  — protected
router.get('/me', protect, getMe);

export default router;
