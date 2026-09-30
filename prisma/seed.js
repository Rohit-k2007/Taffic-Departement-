/**
 * TRAFIX - Advanced Traffic Police & RTO Management Platform
 * Database Seeder for PostgreSQL / Prisma and Local Store
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

function sha256(str) {
  return crypto.createHash('sha256').update(str).digest('hex');
}

async function seed() {
  console.log("=================================================");
  console.log("TRAFIX: Seeding Database Records...");
  console.log("=================================================");

  const seedDataPath = path.join(__dirname, '..', 'data', 'natdams_db.json');
  let data = {};
  if (fs.existsSync(seedDataPath)) {
    try {
      data = JSON.parse(fs.readFileSync(seedDataPath, 'utf8'));
    } catch (e) {
      console.error("Error reading existing natdams_db.json:", e.message);
    }
  }

  // Ensure default demo credentials
  const demoUsers = [
    {
      id: "USR-CITIZEN-01",
      fullName: "Demo Citizen (Vikramaditya Sharma)",
      email: "citizen@trafix.gov.in",
      phone: "+91 98112 34567",
      passwordHash: "Citizen@2026",
      role: "CITIZEN",
      status: "ACTIVE"
    },
    {
      id: "USR-POLICE-01",
      fullName: "Inspector Rajeshwar Nath",
      email: "police@trafix.gov.in",
      phone: "+91 98765 43210",
      passwordHash: "Police@2026",
      role: "TRAFFIC_POLICE_OFFICER",
      status: "ACTIVE"
    },
    {
      id: "USR-RTO-01",
      fullName: "Dr. Arvind S. Swaminathan (RTO Regional)",
      email: "rto@trafix.gov.in",
      phone: "+91 98220 11998",
      passwordHash: "Rto@2026",
      role: "RTO_OFFICER",
      status: "ACTIVE"
    },
    {
      id: "USR-ADMIN-01",
      fullName: "Directorate General of Traffic Police HQ",
      email: "admin@trafix.gov.in",
      phone: "+91 99999 11200",
      passwordHash: "Admin@2026",
      role: "ADMINISTRATOR",
      status: "ACTIVE"
    }
  ];

  data.users = demoUsers;
  fs.writeFileSync(seedDataPath, JSON.stringify(data, null, 2), 'utf8');

  console.log("✓ Seed completed successfully.");
  console.log("Demo Accounts:");
  console.log("  1. Citizen: citizen@trafix.gov.in / Citizen@2026");
  console.log("  2. Police:  police@trafix.gov.in / Police@2026 (Badge: TR-INSP-5501, Camera PIN: 5501)");
  console.log("  3. RTO:     rto@trafix.gov.in / Rto@2026 (Badge: RTO-DIR-04, PIN: 7788)");
  console.log("  4. Admin:   admin@trafix.gov.in / Admin@2026 (Badge: POL-DGP-01, PIN: 9001)");
}

seed().catch(err => {
  console.error("Seeding failed:", err);
  process.exit(1);
});
