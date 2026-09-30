/**
 * Verification Test for Citizen 5-Field Login and 2FA OTP Security Access Gate
 */

const BASE_URL = 'http://localhost:3000';

async function testOtpAndSecurity() {
  console.log("================================================================================");
  console.log("TESTING CITIZEN 5-FIELD LOGIN & 2FA OTP SECURITY ACCESS");
  console.log("================================================================================");

  let passed = 0;
  let total = 0;
  function assert(cond, name) {
    total++;
    if (cond) {
      console.log(`✓ [PASS] ${name}`);
      passed++;
    } else {
      console.error(`✗ [FAIL] ${name}`);
    }
  }

  // 1. Send OTP for Citizen Vehicle RJ54CK4706
  const resSend = await fetch(`${BASE_URL}/api/auth/send-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ vehicleNumber: 'RJ54CK4706', role: 'CITIZEN' })
  });
  const dataSend = await resSend.json();
  assert(dataSend.success && dataSend.otp && dataSend.otp.length === 6, "1. POST /api/auth/send-otp dispatches 6-digit OTP");
  const citizenOtp = dataSend.otp;

  // 2. Verify OTP
  const resVerify = await fetch(`${BASE_URL}/api/auth/verify-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifier: 'RJ54CK4706', otp: citizenOtp })
  });
  const dataVerify = await resVerify.json();
  assert(dataVerify.success && dataVerify.verified === true, "2. POST /api/auth/verify-otp verifies valid 6-digit OTP");

  // 3. Reject invalid OTP
  const resBadOtp = await fetch(`${BASE_URL}/api/auth/verify-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifier: 'RJ54CK4706', otp: '000000' })
  });
  const dataBadOtp = await resBadOtp.json();
  assert(resBadOtp.status === 400 && dataBadOtp.verified === false, "3. POST /api/auth/verify-otp rejects counterfeit OTP with HTTP 400");

  // 4. Citizen Login with Vehicle Number, Password, Email, and OTP
  const resCitLogin = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      vehicleNumber: 'RJ54CK4706',
      password: 'Citizen@2026',
      email: 'citizen@trafix.gov.in',
      otp: citizenOtp,
      role: 'CITIZEN'
    })
  });
  const dataCitLogin = await resCitLogin.json();
  assert(
    dataCitLogin.success && 
    dataCitLogin.user.role === 'CITIZEN' && 
    dataCitLogin.user.linkedVehicle === 'RJ54CK4706', 
    "4. Citizen Login succeeds with 1. Vehicle No RJ54CK4706, 2. Pass, 3. Email, 4. OTP, 5. Verified"
  );

  // 5. Police Login with 2FA OTP
  const resPolOtp = await fetch(`${BASE_URL}/api/auth/send-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ badgeNumber: 'TR-INSP-5501', role: 'POLICE' })
  });
  const dataPolOtp = await resPolOtp.json();
  assert(dataPolOtp.success && dataPolOtp.otp, "5. POST /api/auth/send-otp dispatches Police 2FA Security OTP");

  const resPolLogin = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      badgeNumber: 'TR-INSP-5501',
      password: 'INSP@2026',
      pin: '5050',
      otp: dataPolOtp.otp,
      role: 'POLICE'
    })
  });
  const dataPolLogin = await resPolLogin.json();
  assert(dataPolLogin.success && dataPolLogin.user.role === 'TRAFFIC_POLICE_OFFICER', "6. Police Login succeeds with 2FA Security OTP verification");

  // 7. Verify DOM contains all 5 required elements
  const resHtml = await fetch(`${BASE_URL}/`);
  const html = await resHtml.text();
  assert(html.includes('inCitizenVehicleNo'), "7. DOM contains '1. user id Vehile no. for citizen' (#inCitizenVehicleNo)");
  assert(html.includes('inCitizenLoginPass'), "8. DOM contains '2. pass' (#inCitizenLoginPass)");
  assert(html.includes('inCitizenEmail'), "9. DOM contains '3. email id' (#inCitizenEmail)");
  assert(html.includes('inCitizenOtp') && html.includes('btnSendCitizenOtp'), "10. DOM contains '4. otp' (#inCitizenOtp & #btnSendCitizenOtp)");
  assert(html.includes('citizenVerifiedStatus'), "11. DOM contains '5. verified' status card (#citizenVerifiedStatus)");
  assert(html.includes('badgeLockPolice') && html.includes('badgeLockRto') && html.includes('badgeLockAdmin'), "12. DOM contains security lock 2FA OTP badges for Police, RTO, and Admin");

  console.log("================================================================================");
  console.log(`RESULTS: ${passed} / ${total} Tests Passed (${Math.round((passed/total)*100)}%)`);
  console.log("================================================================================");
}

testOtpAndSecurity().catch(console.error);
