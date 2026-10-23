import { body, param } from 'express-validator';

const VALID_STATUSES  = ['pending', 'in-progress', 'completed'];
const VALID_PRIORITIES = ['low', 'medium', 'high'];

export const createTaskValidators = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required.')
    .isLength({ max: 255 })
    .withMessage('Title must not exceed 255 characters.'),

  body('description')
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description must not exceed 1000 characters.'),

  body('status')
    .optional()
    .isIn(VALID_STATUSES)
    .withMessage(`Status must be one of: ${VALID_STATUSES.join(', ')}.`),

  body('priority')
    .optional()
    .isIn(VALID_PRIORITIES)
    .withMessage(`Priority must be one of: ${VALID_PRIORITIES.join(', ')}.`),

  body('dueDate')
    .optional({ nullable: true })
    .isISO8601()
    .withMessage('Due date must be a valid ISO 8601 date (e.g. 2025-12-31).'),
];

export const updateTaskValidators = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Task ID must be a positive integer.'),

  body('title')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Title cannot be empty.')
    .isLength({ max: 255 })
    .withMessage('Title must not exceed 255 characters.'),

  body('description')
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description must not exceed 1000 characters.'),

  body('status')
    .optional()
    .isIn(VALID_STATUSES)
    .withMessage(`Status must be one of: ${VALID_STATUSES.join(', ')}.`),

  body('priority')
    .optional()
    .isIn(VALID_PRIORITIES)
    .withMessage(`Priority must be one of: ${VALID_PRIORITIES.join(', ')}.`),

  body('dueDate')
    .optional({ nullable: true })
    .isISO8601()
    .withMessage('Due date must be a valid ISO 8601 date (e.g. 2025-12-31).'),

  // Prevent clients from changing ownership or IDs
  body('userId')
    .not()
    .exists()
    .withMessage('userId cannot be changed.'),

  body('id')
    .not()
    .exists()
    .withMessage('id cannot be changed.'),
];

export const taskIdValidator = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Task ID must be a positive integer.'),
];
