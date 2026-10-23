import { Router } from 'express';
import {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
} from '../controllers/taskController.js';
import { protect } from '../middleware/authMiddleware.js';
import { validateRequest } from '../middleware/validateRequest.js';
import {
  createTaskValidators,
  updateTaskValidators,
  taskIdValidator,
} from '../validators/taskValidators.js';

const router = Router();

// All task routes require a valid JWT
router.use(protect);

// POST   /api/tasks        — create a task
router.post('/', createTaskValidators, validateRequest, createTask);

// GET    /api/tasks        — list authenticated user's tasks
router.get('/', getTasks);

// GET    /api/tasks/:id    — get one task (owned by current user)
router.get('/:id', taskIdValidator, validateRequest, getTaskById);

// PUT    /api/tasks/:id    — update an owned task
router.put('/:id', updateTaskValidators, validateRequest, updateTask);

// DELETE /api/tasks/:id    — delete an owned task
router.delete('/:id', taskIdValidator, validateRequest, deleteTask);

export default router;
