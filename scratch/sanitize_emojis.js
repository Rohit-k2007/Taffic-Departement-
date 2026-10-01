const fs = require('fs');

function sanitizeHtml() {
  let html = fs.readFileSync('index.html', 'utf8');

  // Specific high-frequency replacements
  const replacements = [
    // Headings and titles
    ['<span id="satBtnText">🛰️ Connect ISRO Satellite</span>', '<span id="satBtnText"><i data-lucide="satellite" style="width:13px; height:13px;"></i> Connect ISRO Satellite</span>'],
    ['🗺️ Search Area &amp; Route:', 'Search Area &amp; Route:'],
    ['Open Google Maps ↗', 'Open Google Maps (Live)'],
    ['<span style="position:absolute; left:9px; top:8px; font-size:12px; color:#64748b;">🔍</span>', '<span style="position:absolute; left:9px; top:8px; font-size:12px; color:#64748b;"><i data-lucide="search" style="width:14px; height:14px;"></i></span>'],
    ['<span>📡 Live Highway Radar Speed Stream</span>', '<span><i data-lucide="radio" style="width:14px; height:14px;"></i> Live Highway Radar Speed Stream</span>'],
    ['🚨 National Emergency Dispatch Control (Dial 112)', 'National Emergency Dispatch Control (Dial 112)'],
    ['<span style="font-size:26px;">🚗💥</span>', '<span style="font-size:18px; font-weight:800; color:#dc2626;">CRASH</span>'],
    ['<span style="font-size:26px;">🚑</span>', '<span style="font-size:18px; font-weight:800; color:#059669;">MEDIC</span>'],
    ['<span style="font-size:26px;">🔥</span>', '<span style="font-size:18px; font-weight:800; color:#ea580c;">FIRE</span>'],
    ['<span style="font-size:26px;">🚔</span>', '<span style="font-size:18px; font-weight:800; color:#2563eb;">POLICE</span>'],
    ['📢 Citizen Incident Reporting &amp; Evidence Submission', 'Citizen Incident Reporting &amp; Evidence Submission'],
    ['<option value="Accident Report">🚗💥 Traffic Accident / Vehicle Collision</option>', '<option value="Accident Report">Traffic Accident / Vehicle Collision</option>'],
    ['<option value="Traffic Violation">⚠️ Red Light Jump / Reckless Driving</option>', '<option value="Traffic Violation">Red Light Jump / Reckless Driving</option>'],
    ['<option value="Road Obstruction">🚧 Road Damage / Broken Traffic Signal</option>', '<option value="Road Obstruction">Road Damage / Broken Traffic Signal</option>'],
    ['<option value="Illegal Parking">🚫 Illegal Parking / Expressway Obstruction</option>', '<option value="Illegal Parking">Illegal Parking / Expressway Obstruction</option>'],
    ['<option value="Drunken Driving">🍺 Driving Under Influence / Over Speeding</option>', '<option value="Drunken Driving">Driving Under Influence / Over Speeding</option>'],
    ['📍 Auto GPS Pin', 'Auto GPS Pin'],
    ['<span>🤖 AI Pre-Processing Engine Activated:</span>', '<span>AI Pre-Processing Engine Activated:</span>'],
    ['📄 Case Status Tracker &amp; e-Challan Payment Portal', 'Case Status Tracker &amp; e-Challan Payment Portal'],
    ['<div style="font-weight:800; font-size:14px; color:#0f172a;">💳 Pay e-Challan Online (PhonePe / Paytm /', '<div style="font-weight:800; font-size:14px; color:#0f172a;">Pay e-Challan Online (PhonePe / Paytm /'],
    ['🔍 Track Submitted Traffic Complaint or Incident Report', 'Track Submitted Traffic Complaint or Incident Report'],
    ['🚗💥 Report Road Accident Case (Emergency &amp; Police Investigation)', 'Report Road Accident Case (Emergency &amp; Police Investigation)'],
    ['<option value="YES">🚨 YES - Immediate 112 Priority Ambulance Clearance</option>', '<option value="YES">YES - Immediate 112 Priority Ambulance Clearance</option>'],
    ['🚗 VAHAN Vehicle Registry &amp; Sarathi Driving Licence Profile', 'VAHAN Vehicle Registry &amp; Sarathi Driving Licence Profile'],
    ['<span class="trafix-search-icon">🔍</span>', '<span class="trafix-search-icon"><i data-lucide="search" style="width:14px; height:14px;"></i></span>'],
    ['<span>🚘 Vehicle Registration Certificate (RC)</span>', '<span>Vehicle Registration Certificate (RC)</span>'],
    ['<span>🪪 Sarathi Driving Licence Profile</span>', '<span>Sarathi Driving Licence Profile</span>'],
    ['📑 e-Challan History for DL-01-AB-4921', 'e-Challan History for DL-01-AB-4921'],
    ['🏛️ Direct Document &amp; Vehicle Details Upload to RTO Office', 'Direct Document &amp; Vehicle Details Upload to RTO Office'],
    ['<span>📝 Upload Details Directly to RTO</span>', '<span>Upload Details Directly to RTO</span>'],
    ['<i data-lucide="send"></i> 🚀 Submit &amp; Upload Details Directly to RTO Office', '<i data-lucide="send"></i> Submit &amp; Upload Details Directly to RTO Office'],
    ['<span>📋 My Submitted RTO Applications</span>', '<span>My Submitted RTO Applications</span>'],
    ['<span style="font-size:24px;">🪪</span>', '<span style="font-size:16px; font-weight:800; color:#1e40af;">SARATHI</span>'],
    ['⭐ SARATHI 4.0 NATIONAL', 'SARATHI 4.0 NATIONAL'],
    ['<span>📝 New Driving Licence Application (Form 2 / Form 9)</span>', '<span>New Driving Licence Application (Form 2 / Form 9)</span>'],
    ['<div style="font-weight:700; font-size:11px; color:#0f172a;">🏍️ MCWG</div>', '<div style="font-weight:700; font-size:11px; color:#0f172a;">MCWG (Motorcycle)</div>'],
    ['<div style="font-weight:700; font-size:11px; color:#0f172a;">🚗 LMV</div>', '<div style="font-weight:700; font-size:11px; color:#0f172a;">LMV (Car / SUV)</div>'],
    ['<div style="font-weight:700; font-size:11px; color:#0f172a;">🛵 MCWOG</div>', '<div style="font-weight:700; font-size:11px; color:#0f172a;">MCWOG (Scooter)</div>'],
    ['<div style="font-weight:700; font-size:11px; color:#0f172a;">🚛 TRANS</div>', '<div style="font-weight:700; font-size:11px; color:#0f172a;">TRANS (Heavy)</div>'],
    ['⚡ Auto-fill Sample Data', 'Auto-fill Sample Data'],
    ['<span>💰 Statutory Government Fees</span>', '<span>Statutory Government Fees</span>'],
    ['📑 Document Checklist Required', 'Document Checklist Required'],
    ['📅 Jump to Slot Booking ➔', 'Jump to Slot Booking ➔'],
    ['<span>📅 Schedule ADTT Practical Driving Skill Test Slot</span>', '<span>Schedule ADTT Practical Driving Skill Test Slot</span>'],
    ['🔍 Fetch Details', 'Fetch Details'],
    ['🤖 ADTT Sensor Testing Criteria', 'ADTT Sensor Testing Criteria'],
    ['<div class="icon-box">🚗</div>', '<div class="icon-box" style="font-size:11px; font-weight:800; color:#1e40af;">PARK</div>'],
    ['<div class="icon-box">🔄</div>', '<div class="icon-box" style="font-size:11px; font-weight:800; color:#1e40af;">REV-S</div>'],
    ['<div class="icon-box">♾️</div>', '<div class="icon-box" style="font-size:11px; font-weight:800; color:#1e40af;">EIGHT</div>'],
    ['<div class="icon-box">⛰️</div>', '<div class="icon-box" style="font-size:11px; font-weight:800; color:#1e40af;">GRADIENT</div>'],
    ['ℹ️ <strong>Passing Threshold:</strong>', '<strong>Passing Threshold:</strong>'],
    ['⚠️ Mandatory Test Day Rules', 'Mandatory Test Day Rules'],
    ['<span>🪪 My Submitted Driving Licence Applications</span>', '<span>My Submitted Driving Licence Applications</span>'],
    ['<span>📅 Confirmed ADTT Driving Test Appointments &amp; Hall Tickets</span>', '<span>Confirmed ADTT Driving Test Appointments &amp; Hall Tickets</span>'],
    ['👮 Traffic Officer Case Review &amp; Action Verification', 'Traffic Officer Case Review &amp; Action Verification'],
    ['🚨 Traffic Police Accident Investigation &amp; Emergency Corridor Command', 'Traffic Police Accident Investigation &amp; Emergency Corridor Command'],
    ['🏛️ Regional Transport Office (RTO) Command &amp; Verification Desk', 'Regional Transport Office (RTO) Command &amp; Verification Desk'],
    ['<span>📋 Citizen Applications &amp; Statutory Document Verification Queue</span>', '<span>Citizen Applications &amp; Statutory Document Verification Queue</span>'],
    ['🔍 RTO National Registry Quick Search (RC &amp; DL Lookup)', 'RTO National Registry Quick Search (RC &amp; DL Lookup)'],
    ['🛡️ National Traffic Risk &amp; High-Hazard Safety Center', 'National Traffic Risk &amp; High-Hazard Safety Center'],
    ['<strong>⚖️ STATUTORY DECISION-SUPPORT MANDATE:</strong>', '<strong>STATUTORY DECISION-SUPPORT MANDATE:</strong>'],
    ['PANEL 7: ACTIVE ROAD CONSTRUCTION & HIGHWAY MAINTENANCE (🚧)', 'PANEL 7: ACTIVE ROAD CONSTRUCTION & HIGHWAY MAINTENANCE'],
    ['🛠️ National Directorate Administration Command Desk', 'National Directorate Administration Command Desk'],
    ['📢 Broadcast Advisory', 'Broadcast Advisory'],
    ['⚡ Speed Gantry Clamp', 'Speed Gantry Clamp'],
    ['👮 + Commission Officer', '+ Commission Officer'],
    ['🔄 Sync National DB', 'Sync National DB'],
    ['<div style="font-size:10px; color:#b45309;">⚡ Review Cases ➔</div>', '<div style="font-size:10px; color:#2563eb;">Review Cases ➔</div>'],
    ['👥 1. Users (Manage Users)', '1. Users (Manage Users)'],
    ['📋 2. Complaints (Review Cases)', '2. Complaints (Review Cases)'],
    ['👮 3. Officers (Manage Staff)', '3. Officers (Manage Staff)'],
    ['📊 4. Analytics (Traffic Data)', '4. Analytics (Traffic Data)'],
    ['🖥️ 5. System Monitoring', '5. System Monitoring'],
    ['📜 6. Audit Logs (SHA-256)', '6. Audit Logs (SHA-256)'],
    ['👥 Registered Citizen Motorists &amp; Driving', 'Registered Citizen Motorists &amp; Driving'],
    ['📋 Citizen Complaints &amp; Case Review', 'Citizen Complaints &amp; Case Review'],
    ['👮 Commissioned Traffic Police Staff &amp; IPS', 'Commissioned Traffic Police Staff &amp; IPS'],
    ['⚡ High-Frequency Violation Corridors (Pan-India MoRTH Surveillance)', 'High-Frequency Violation Corridors (Pan-India MoRTH Surveillance)'],
    ['🖥️ Real-Time National Traffic Infrastructure Telemetry', 'Real-Time National Traffic Infrastructure Telemetry'],
    ['⬇️ Export Audit Ledger (.CSV)', 'Export Audit Ledger (.CSV)'],
    ['🔐 <strong>Official Sovereign Access Gate:</strong>', '<strong>Official Sovereign Access Gate:</strong>'],
    ['⚡ 1-Click Demo Profiles:', 'Quick Demo Profiles:'],
    ['🚗 Citizen (RJ54CK4706)', 'Citizen (RJ54CK4706)'],
    ['👮 Officer (TR-INSP-5501)', 'Officer (TR-INSP-5501)'],
    ['⭐ Commissioner (IPS-8801-CIP)', 'Commissioner (IPS-8801-CIP)'],
    ['🏛️ Control Room (RTO-DL-4402)', 'Control Room (RTO-DL-4402)'],
    ['📱 Sovereign 2FA Dispatch:', 'Sovereign 2FA Dispatch:'],
    ['🛡️ Citizen', 'Citizen'],
    ['🔒 Police (OTP)', 'Police (OTP)'],
    ['🔒 RTO (OTP)', 'RTO (OTP)'],
    ['🔒 Admin (OTP)', 'Admin (OTP)'],
    ['🛡️ <strong>Citizen Public Services Portal:</strong>', '<strong>Citizen Public Services Portal:</strong>'],
    ['📱 Official SMS/Email Dispatch:', 'Official SMS/Email Dispatch:'],
    ['🚗 RJ54CK4706 (Pipar City / Jodhpur)', 'Plate: RJ54CK4706 (Pipar City / Jodhpur)'],
    ['🚙 DL01AB4921 (Delhi Central)', 'Plate: DL01AB4921 (Delhi Central)'],
    ['👮 <strong>Traffic Police Enforcement Gate (2FA OTP Protected):</strong>', '<strong>Traffic Police Enforcement Gate (2FA OTP Protected):</strong>'],
    ['🔒 Official Encrypted Police Dispatch:', 'Official Encrypted Police Dispatch:'],
    ['⚡ Officer Hierarchy Presets:', 'Officer Hierarchy Presets:'],
    ['👮 <strong>TI Rajeshwar Nath</strong> (5501/5050)', '<strong>TI Rajeshwar Nath</strong> (5501/5050)'],
    ['🚓 <strong>SI Priya Sharma</strong> (4219/3030)', '<strong>SI Priya Sharma</strong> (4219/3030)'],
    ['🏛️ <strong>Regional Transport Office (RTO) Statutory Portal (2FA OTP Protected):</strong>', '<strong>Regional Transport Office (RTO) Statutory Portal (2FA OTP Protected):</strong>'],
    ['🏛️ Official NIC Parivahan Dispatch:', 'Official NIC Parivahan Dispatch:'],
    ['🏛️ Autofill: RTO Meenakshi Sundaram (RTO-DL-4402)', 'Autofill: RTO Meenakshi Sundaram (RTO-DL-4402)'],
    ['⚡ <strong>Directorate Administrator Command (2FA OTP Protected):</strong>', '<strong>Directorate Administrator Command (2FA OTP Protected):</strong>'],
    ['⚡ High-Security CIP Encrypted Dispatch:', 'High-Security CIP Encrypted Dispatch:'],
    ['⭐ Autofill: DG A. K. Saxena, IPS (IPS-8801-CIP)', 'Autofill: DG A. K. Saxena, IPS (IPS-8801-CIP)'],
    ['⚡ Direct 1-Click UPI App Payment:', 'Direct 1-Click UPI App Payment:'],
    ['<span class="upi-app-icon">🟣</span>', '<span class="upi-app-icon" style="background:#6739b6; color:#fff; font-size:10px; font-weight:800; padding:2px 6px; border-radius:4px;">PHONEPE</span>'],
    ['<span class="upi-app-icon">🔵</span>', '<span class="upi-app-icon" style="background:#00b9f5; color:#fff; font-size:10px; font-weight:800; padding:2px 6px; border-radius:4px;">PAYTM</span>'],
    ['<span class="upi-app-icon">🟢</span>', '<span class="upi-app-icon" style="background:#34a853; color:#fff; font-size:10px; font-weight:800; padding:2px 6px; border-radius:4px;">GPAY</span>'],
    ['📲 Or Scan with PhonePe / Paytm / GPay / BHIM App:', 'Or Scan with PhonePe / Paytm / GPay / BHIM App:'],
    ['🔒 <strong>Govt of India NPCI e-Challan Gateway:</strong>', '<strong>Govt of India NPCI e-Challan Gateway:</strong>'],
    ['📞 NHAI 24x7 Roadside Distress Helpline:', 'NHAI 24x7 Roadside Distress Helpline:']
  ];

  for (const [target, replacement] of replacements) {
    if (html.includes(target)) {
      html = html.split(target).join(replacement);
    }
  }

  // Also replace any standalone emoji characters in specs tables
  html = html.replace(/<span style="font-size:16px;">🚗<\/span>/g, '<span style="font-size:11px; font-weight:700; color:#1e40af;">VEH</span>');
  html = html.replace(/<span style="font-size:16px;">📄<\/span>/g, '<span style="font-size:11px; font-weight:700; color:#1e40af;">DOC</span>');
  html = html.replace(/<span style="font-size:16px;">🏛️<\/span>/g, '<span style="font-size:11px; font-weight:700; color:#1e40af;">RTO</span>');
  html = html.replace(/<span style="font-size:16px;">📑<\/span>/g, '<span style="font-size:11px; font-weight:700; color:#1e40af;">FIN</span>');

  fs.writeFileSync('index.html', html, 'utf8');
  console.log('Sanitized index.html emojis.');
}

function sanitizeAppJs() {
  let js = fs.readFileSync('assets/js/app.js', 'utf8');

  // Replace emojis in toast messages and dynamic templates
  js = js.replace(/icon: "🚗",/g, 'icon: "car",');
  js = js.replace(/🛰️ /g, '');
  js = js.replace(/🗺️ /g, '');
  js = js.replace(/🔒 /g, '');
  js = js.replace(/📱 /g, '');
  js = js.replace(/📍 /g, '');
  js = js.replace(/📝 /g, '');
  js = js.replace(/🤖 /g, '');
  js = js.replace(/🚨 /g, '');
  js = js.replace(/⚠️ /g, '');
  js = js.replace(/🔍 /g, '');
  js = js.replace(/🚧 /g, '');
  js = js.replace(/🏛️ /g, '');
  js = js.replace(/⚡ /g, '');
  js = js.replace(/↪️ /g, '');
  js = js.replace(/💡 /g, '');
  js = js.replace(/🛡️ /g, '');
  js = js.replace(/🚫 /g, '');
  js = js.replace(/🪪 /g, '');
  js = js.replace(/📢 /g, '');
  js = js.replace(/🔄 /g, '');
  js = js.replace(/⬇️ /g, '');
  js = js.replace(/🚗 /g, '');
  js = js.replace(/📄 /g, '');
  js = js.replace(/📑 /g, '');
  js = js.replace(/💳 /g, '');
  js = js.replace(/🎉 /g, '');
  js = js.replace(/🎟️ /g, '');
  js = js.replace(/📅 /g, '');
  js = js.replace(/⭐ /g, '');
  js = js.replace(/⏳ /g, '');
  js = js.replace(/🚀 /g, '');
  js = js.replace(/✓ /g, '');

  fs.writeFileSync('assets/js/app.js', js, 'utf8');
  console.log('Sanitized app.js emojis.');
}

sanitizeHtml();
sanitizeAppJs();
