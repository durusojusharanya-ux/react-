// src/routes/activityRoutes.js
import { Router } from 'express';
import { getActivities } from '../controllers/activityController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = Router();

// GET /api/activities — protected
router.get('/', protect, getActivities);

export default router;
