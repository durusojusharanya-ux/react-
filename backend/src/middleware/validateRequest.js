import { validationResult } from 'express-validator';

/**
 * Middleware to check express-validator results.
 * Place this AFTER your validator arrays in routes.
 * Returns 400 with a structured errors array if any validations fail.
 */
export function validateRequest(req, res, next) {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed. Please check the errors below.',
      errors: errors.array().map((e) => ({
        field: e.path,
        message: e.msg,
      })),
    });
  }

  next();
}
