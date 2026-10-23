/**
 * Centralized error-handling middleware.
 * Must have four parameters so Express recognises it as an error handler.
 */
// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  const isDev = process.env.NODE_ENV === 'development';

  // Log to server console (safe — not exposed to client)
  console.error(`[ERROR] ${req.method} ${req.path} →`, err.message);
  if (isDev) {
    console.error(err.stack);
  }

  // SQLite unique-constraint violation  (SQLITE_CONSTRAINT_UNIQUE)
  if (err.code === 'SQLITE_CONSTRAINT_UNIQUE' || err.message?.includes('UNIQUE constraint failed')) {
    return res.status(409).json({
      success: false,
      message: 'A record with this value already exists.',
    });
  }

  // SQLite foreign-key constraint violation
  if (err.code === 'SQLITE_CONSTRAINT_FOREIGNKEY' || err.message?.includes('FOREIGN KEY constraint failed')) {
    return res.status(400).json({
      success: false,
      message: 'Invalid reference: related record does not exist.',
    });
  }

  // Default: 500 Internal Server Error
  const statusCode = err.statusCode || 500;
  return res.status(statusCode).json({
    success: false,
    message: isDev ? err.message : 'An unexpected error occurred. Please try again.',
    // Never expose stack traces or database internals to the client
  });
}

/**
 * 404 handler for routes that do not match any defined route.
 */
export function notFound(req, res) {
  return res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
}
