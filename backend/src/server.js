import 'dotenv/config';
import app from './app.js';
import { initializeDatabase } from './config/db.js';

const PORT = parseInt(process.env.PORT, 10) || 5000;
const HOST = '0.0.0.0';

// Initialize Database connection & verify tables
try {
  await initializeDatabase();
} catch (error) {
  console.error('⚠️ Warning: Database startup error:', error.message);
}

const server = app.listen(PORT, HOST, () => {
  console.log(`🚀 TaskFlow Backend running on http://${HOST}:${PORT}`);
  console.log(`🩺 Health check available at: http://${HOST}:${PORT}/api/health`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Graceful shutdown handling
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
  });
});

export default server;
