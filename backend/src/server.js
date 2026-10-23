import 'dotenv/config';
import app from './app.js';
import { initializeDatabase } from './config/db.js';

const PORT = process.env.PORT || 5000;

// Initialize SQLite (creates data/ dir and tables if they don't exist)
initializeDatabase();

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📋 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});
