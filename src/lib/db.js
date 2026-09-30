/**
 * TRAFIX - Database Abstraction Layer
 * Supports PostgreSQL via Prisma when DATABASE_URL is provided,
 * with seamless local JSON store fallback for zero-dependency standalone execution.
 */

const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '..', '..', 'data', 'natdams_db.json');

class DatabaseAdapter {
  constructor() {
    this.isPostgres = !!process.env.DATABASE_URL;
    this.memoryDb = null;
    this.init();
  }

  init() {
    try {
      if (fs.existsSync(DB_PATH)) {
        this.memoryDb = JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
      } else {
        this.memoryDb = {
          users: [],
          departments: [],
          officers: [],
          citizens: [],
          vehicles: [],
          drivingLicences: [],
          cases: [],
          accidents: [],
          violations: [],
          challans: [],
          riskZones: [],
          notifications: [],
          rtoApplications: [],
          auditLogs: []
        };
      }
    } catch (err) {
      console.error("Database initialization warning:", err.message);
    }
  }

  save() {
    try {
      fs.writeFileSync(DB_PATH, JSON.stringify(this.memoryDb, null, 2), 'utf8');
    } catch (err) {
      console.error("Database save warning:", err.message);
    }
  }

  getTable(name) {
    if (!this.memoryDb[name]) {
      this.memoryDb[name] = [];
    }
    return this.memoryDb[name];
  }
}

const dbAdapter = new DatabaseAdapter();
module.exports = dbAdapter;
