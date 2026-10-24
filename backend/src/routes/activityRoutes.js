import { Router } from 'express';
import { getRecentActivities } from '../controllers/activityController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = Router();

router.use(requireAuth);
router.get('/', getRecentActivities);

export default router;
