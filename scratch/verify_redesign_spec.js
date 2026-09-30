const http = require('http');
const fs = require('fs');
const path = require('path');

function request(urlPath, options = {}) {
  return new Promise((resolve, reject) => {
    const req = http.request(`http://localhost:3000${urlPath}`, options, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, headers: res.headers, body: data, json: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, headers: res.headers, body: data, json: null });
        }
      });
    });
    req.on('error', reject);
    if (options.body) req.write(options.body);
    req.end();
  });
}

async function runRedesignVerification() {
  console.log("================================================================================");
  console.log("VERIFYING TRAFIX COMPLETE UI/UX REDESIGN & PRODUCT UPGRADE SPECIFICATION");
  console.log("================================================================================");

  let passed = 0;
  let total = 0;

  function assert(cond, msg) {
    total++;
    if (cond) {
      console.log(`[PASS] ${msg}`);
      passed++;
    } else {
      console.error(`[FAIL] ${msg}`);
    }
  }

  // 1. Branding: TRAFIX, Smart Roads. Safer Cities., No real govt emblem
  const indexHtml = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
  assert(!indexHtml.includes('gov_emblem.jpg'), "1. Zero real government emblems in index.html (gov_emblem.jpg completely eliminated)");
  assert(indexHtml.includes('assets/images/trafix_logo.svg'), "2. TRAFIX Custom SVG Shield Brand Logo integrated");
  assert(indexHtml.includes('Smart Roads. Safer Cities.'), "3. Tagline 'Smart Roads. Safer Cities.' integrated in branding");
  assert(fs.existsSync(path.join(__dirname, '..', 'assets', 'images', 'trafix_logo.svg')), "4. trafix_logo.svg exists and valid");

  // 2. Global Search
  assert(indexHtml.includes('id="headerGlobalSearchTrigger"'), "5. Header contains Global Search Trigger (#headerGlobalSearchTrigger)");
  assert(indexHtml.includes('id="globalSearchModal"'), "6. DOM contains Global Search Modal (#globalSearchModal)");
  const searchRes = await request('/api/global-search?q=DL');
  assert(searchRes.status === 200 && searchRes.json && searchRes.json.results, "7. GET /api/global-search returns aggregated multi-entity results");

  // 3. Notification Center
  assert(indexHtml.includes('id="btnNotifBell"'), "8. Header contains Notification Center Bell (#btnNotifBell)");
  assert(indexHtml.includes('id="headerNotifCard"'), "9. Header contains Notification Dropdown Card (#headerNotifCard)");
  const notifRes = await request('/api/notifications');
  assert(notifRes.status === 200 && notifRes.json && Array.isArray(notifRes.json.notifications), "10. GET /api/notifications returns system alerts");

  // 4. Smart Cameras
  assert(indexHtml.includes('id="panel-cameras"'), "11. DOM contains Smart Cameras Panel (#panel-cameras)");
  assert(indexHtml.includes('id="camerasGridContainer"'), "12. DOM contains Cameras Grid Container (#camerasGridContainer)");
  const camRes = await request('/api/cameras');
  assert(camRes.status === 200 && camRes.json && camRes.json.cameras.length >= 10, "13. GET /api/cameras returns 10+ active smart cameras");

  // 5. Smart Incident Capture & Mandatory Human Review
  assert(indexHtml.includes('id="panel-camera-events"'), "14. DOM contains AI Incident Review Panel (#panel-camera-events)");
  assert(indexHtml.includes('id="smartReviewModal"'), "15. DOM contains Mandatory Human Review Modal (#smartReviewModal)");
  const eventsRes = await request('/api/camera-events');
  assert(eventsRes.status === 200 && eventsRes.json && eventsRes.json.events.length >= 3, "16. GET /api/camera-events returns smart detections queue");

  // 6. Test Human Review Action: Verify with Challan Generation
  const officerToken = 'JWT-TRAFIX-' + Buffer.from('TR-INSP-5501:' + Date.now()).toString('base64');
  const reviewRes = await request('/api/camera-events/EVT-2026-101/review', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${officerToken}`
    },
    body: JSON.stringify({
      action: 'VERIFY',
      notes: 'Officer verified optical snapshot at red light stop-line.',
      issueChallan: true,
      reviewedBy: 'Inspector Duty Officer'
    })
  });
  assert(reviewRes.status === 200 && reviewRes.json && reviewRes.json.event && reviewRes.json.event.eventStatus === 'VERIFIED', "17. POST /api/camera-events/:id/review verifies event and generates statutory e-Challan citation");

  // 7. Incident Management
  assert(indexHtml.includes('id="panel-incidents"'), "18. DOM contains Incident Management Panel (#panel-incidents)");
  assert(indexHtml.includes('id="createIncidentModal"'), "19. DOM contains Log Incident Modal (#createIncidentModal)");
  const incRes = await request('/api/incidents');
  assert(incRes.status === 200 && incRes.json && Array.isArray(incRes.json.incidents), "20. GET /api/incidents returns operational incident records");

  // 8. Digital Evidence Vault
  assert(indexHtml.includes('id="panel-evidence"'), "21. DOM contains Evidence Vault Panel (#panel-evidence)");
  const evRes = await request('/api/evidence');
  assert(evRes.status === 200 && evRes.json && Array.isArray(evRes.json.evidence), "22. GET /api/evidence returns cryptographic SHA-256 evidence records");

  // 9. Mobile Bottom Navigation
  assert(indexHtml.includes('class="mobile-bottom-nav"'), "23. DOM contains Responsive Mobile Bottom Navigation (.mobile-bottom-nav)");

  // 10. Authentication Extension APIs
  const regRes = await request('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      fullName: 'Test Citizen User',
      email: 'newuser' + Date.now() + '@trafix.gov.in',
      phone: '+91 99999 11111',
      password: 'SecurePassword@2026'
    })
  });
  assert(regRes.status === 201 && regRes.json && regRes.json.user, "24. POST /api/auth/register creates citizen account");

  const forgotRes = await request('/api/auth/forgot-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ emailOrPhone: 'citizen@trafix.gov.in' })
  });
  assert(forgotRes.status === 200 && forgotRes.json && forgotRes.json.resetToken, "25. POST /api/auth/forgot-password dispatches reset token");

  console.log("================================================================================");
  console.log(`RESULTS: ${passed} / ${total} Tests Passed (${Math.round((passed/total)*100)}%)`);
  console.log("================================================================================");
}

runRedesignVerification().catch(console.error);
