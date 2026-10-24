// scripts/migrate.js
// Database migration & connectivity test script
import 'dotenv/config';
import { initializeDatabase, getDbHealth } from '../src/config/db.js';

async function runMigration() {
  console.log('🔄 Checking database connection and running schema migrations...');
  try {
    await initializeDatabase();
    const health = getDbHealth();
    console.log(`✅ Database migration check completed successfully!`);
    console.log(`📊 Database Engine: ${health.type.toUpperCase()}`);
    console.log(`🟢 Status: ${health.status}`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
}

runMigration();
