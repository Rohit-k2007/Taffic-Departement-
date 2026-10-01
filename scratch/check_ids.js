const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');
const neededIds = [
  'officerCasesContainer',
  'badgeCasesCount',
  'rtoApplicationsDeskTableBody',
  'rtoStatPendingVerifications',
  'violationsTableBody',
  'officerAccidentsTableBody',
  'riskZonesTableBody',
  'pillRoleOfficer',
  'pillRoleRto',
  'pillRoleCitizen',
  'pillRoleAdmin',
  'panel-officer-cases',
  'panel-rto-desk',
  'panel-violations',
  'panel-officer-accidents'
];
neededIds.forEach(id => {
  const found = html.includes(`id="${id}"`);
  console.log(`${id}: ${found ? 'FOUND' : 'MISSING'}`);
});
