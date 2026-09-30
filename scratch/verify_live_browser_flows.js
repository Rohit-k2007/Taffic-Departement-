const http = require('http');

const BASE_URL = 'http://localhost:3000';

async function request(path, options = {}) {
  const url = `${BASE_URL}${path}`;
  const res = await fetch(url, options);
  const text = await res.text();
  let json = null;
  try { json = JSON.parse(text); } catch (e) {}
  return { status: res.status, text, json };
}

async function runLiveVerification() {
  console.log("================================================================================");
  console.log("TRAFIX LIVE BROWSER & SYSTEM VERIFICATION SUITE");
  console.log("================================================================================");

  let passed = 0;
  let total = 0;

  function assert(cond, name) {
    total++;
    if (cond) {
      console.log(`[PASS] ${name}`);
      passed++;
    } else {
      console.error(`[FAIL] ${name}`);
    }
  }

  // 1. Check Homepage and DOM
  const home = await request('/');
  assert(home.status === 200, "1. GET / returns HTTP 200 OK");
  assert(home.text.includes('id="btnDownloadApp"'), "2. Header contains '#btnDownloadApp' button");
  assert(home.text.includes('class="sidebar-app-download-card"'), "3. Sidebar contains '.sidebar-app-download-card' quick install badge");
  assert(home.text.includes('id="downloadAppModal"'), "4. DOM contains '#downloadAppModal' modal");
  assert(home.text.includes('id="btnDownloadTabCitizen"') && home.text.includes('id="btnDownloadTabPolice"'), "5. Download modal has Citizen and Police edition switcher tabs");
  assert(home.text.includes('id="viewDownloadCitizen"') && home.text.includes('id="viewDownloadPolice"'), "6. Download modal contains both Citizen APK and Police MDT views");

  // 2. Central Operations Menu
  assert(home.text.includes('Central Operations Menu'), "7. Sidebar contains 'Central Operations Menu' title");
  assert(home.text.includes('DIV 01 • Citizen Services'), "8. Menu has 'DIV 01 • Citizen Services'");
  assert(home.text.includes('DIV 02 • Police Operations'), "9. Menu has 'DIV 02 • Police Operations'");
  assert(home.text.includes('DIV 03 • RTO &amp; Control Room'), "10. Menu has 'DIV 03 • RTO & Control Room'");
  assert(home.text.includes('DIV 04 • Directorate Command'), "11. Menu has 'DIV 04 • Directorate Command'");
  assert(home.text.includes('National Emergency 112 SOS Dispatch'), "12. Menu has 'National Emergency 112 SOS Dispatch' button");

  // 3. 4-Sector Dashboard Quadrants
  assert(home.text.includes('id="btnSectorAll"'), "13. Quadrant filter has '#btnSectorAll'");
  assert(home.text.includes('id="btnSectorCitizen"'), "14. Quadrant filter has '#btnSectorCitizen'");
  assert(home.text.includes('id="btnSectorPolice"'), "15. Quadrant filter has '#btnSectorPolice'");
  assert(home.text.includes('id="btnSectorRto"'), "16. Quadrant filter has '#btnSectorRto'");
  assert(home.text.includes('id="btnSectorAdmin"'), "17. Quadrant filter has '#btnSectorAdmin'");
  assert(home.text.includes('id="secCitizenPortal"'), "18. Dashboard contains Section 1 '#secCitizenPortal'");
  assert(home.text.includes('id="secPoliceEnforcement"'), "19. Dashboard contains Section 2 '#secPoliceEnforcement'");
  assert(home.text.includes('id="secRtoControl"'), "20. Dashboard contains Section 3 '#secRtoControl'");
  assert(home.text.includes('id="secAdminHighCommand"'), "21. Dashboard contains Section 4 '#secAdminHighCommand'");

  // 4. Driving Licence Application API
  const dlAppRes = await request('/api/licence-applications', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      applicantName: "Vikramaditya Sharma",
      fatherName: "Devendra Sharma",
      dob: "1994-06-15",
      gender: "Male",
      mobile: "+91 98765 43210",
      email: "citizen@trafix.gov.in",
      aadhaarNumber: "7821-4491-0029",
      rtoJurisdiction: "RJ-54 (DTO Pipar City / Jodhpur)",
      applicationType: "LEARNER_LICENCE",
      vehicleClasses: ["MCWG", "LMV"],
      totalFee: 650
    })
  });
  assert(dlAppRes.status === 201 && dlAppRes.json && dlAppRes.json.applicationNumber, "22. POST /api/licence-applications creates application with applicationNumber: " + (dlAppRes.json ? dlAppRes.json.applicationNumber : ''));
  const appNum = dlAppRes.json ? dlAppRes.json.applicationNumber : 'DL-2026-TEST';

  // 5. Driving Licence Slots Query
  const slotsRes = await request('/api/licence-slots?date=2026-10-05');
  assert(slotsRes.status === 200 && slotsRes.json && Array.isArray(slotsRes.json.slots), "23. GET /api/licence-slots returns available ADTT testing batches");

  // 6. Driving Licence Slot Booking API
  const bookRes = await request('/api/licence-slots/book', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      applicationNumber: appNum,
      slotDate: "2026-10-05",
      slotTime: "11:30 AM - 01:00 PM",
      trackName: "Jodhpur Regional ADTT Track No. 2"
    })
  });
  assert(bookRes.status === 201 && bookRes.json && bookRes.json.appointment && bookRes.json.appointment.appointmentId, "24. POST /api/licence-slots/book reserves ADTT slot and generates Admit Card ID");

  // 7. Hall ticket / DL applications list
  const listAppsRes = await request('/api/licence-applications');
  const appList = Array.isArray(listAppsRes.json) ? listAppsRes.json : (listAppsRes.json && listAppsRes.json.applications ? listAppsRes.json.applications : []);
  assert(listAppsRes.status === 200 && appList.length > 0, "25. GET /api/licence-applications returns user submissions");

  console.log("================================================================================");
  console.log(`RESULTS: ${passed} / ${total} Tests Passed (${Math.round((passed/total)*100)}%)`);
  console.log("================================================================================");
}

runLiveVerification().catch(console.error);
