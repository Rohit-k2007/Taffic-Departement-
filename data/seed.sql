-- ============================================================================
-- GOVERNMENT TRAFFIC POLICE & RTO MANAGEMENT SYSTEM (NATDAMS)
-- Seed SQL Script (Fictional Demo Data for all 4 Roles & 15 Tables)
-- ============================================================================

-- 1. DEPARTMENTS
INSERT INTO departments (id, name, type, district, state, office_address, contact_number, status)
VALUES
('DEP-TP-DEL-01', 'Delhi Traffic Police Headquarters', 'TRAFFIC_POLICE', 'New Delhi', 'DL', 'Police Headquarters, ITO, New Delhi 110002', '011-23010101', 'ACTIVE'),
('DEP-RTO-DEL-01', 'Regional Transport Office (RTO) North Zone', 'RTO', 'North Delhi', 'DL', 'Mall Road Transport Authority, Delhi 110054', '011-23812000', 'ACTIVE'),
('DEP-TP-RJ-01', 'Jaipur City Traffic Police Commissionerate', 'TRAFFIC_POLICE', 'Jaipur', 'RJ', 'Government Hostel Circle, MI Road, Jaipur 302001', '0141-2385100', 'ACTIVE'),
('DEP-RTO-RJ-01', 'Regional Transport Office (RTO) Jaipur Central', 'RTO', 'Jaipur', 'RJ', 'Jhalana Doongri Transport Bhavan, Jaipur 302004', '0141-2706500', 'ACTIVE');

-- 2. USERS (Roles: CITIZEN, POLICE_OFFICER, RTO_OFFICER, ADMIN)
INSERT INTO users (id, full_name, email, phone, password_hash, role, department_id, status)
VALUES
('USR-ADMIN-01', 'Director General A. K. Saxena, IPS', 'admin@natdams.gov.in', '+91 98100 00001', 'Admin@2026', 'ADMIN', 'DEP-TP-DEL-01', 'ACTIVE'),
('USR-POLICE-01', 'Inspector Rajeshwar Nath', 'officer.police@natdams.gov.in', '+91 98110 55001', 'Police@2026', 'POLICE_OFFICER', 'DEP-TP-DEL-01', 'ACTIVE'),
('USR-RTO-01', 'RTO Officer Meenakshi Sundaram', 'officer.rto@natdams.gov.in', '+91 98120 77001', 'Rto@2026', 'RTO_OFFICER', 'DEP-RTO-DEL-01', 'ACTIVE'),
('USR-CITIZEN-01', 'Demo Citizen Vikramaditya', 'citizen@natdams.gov.in', '+91 98101 23456', 'Citizen@2026', 'CITIZEN', NULL, 'ACTIVE'),
('USR-CITIZEN-02', 'Demo Citizen Ananya Sharma', 'ananya.sharma@example.com', '+91 98200 45678', 'Citizen@2026', 'CITIZEN', NULL, 'ACTIVE');

-- 3. OFFICERS
INSERT INTO officers (id, user_id, employee_id, designation, department_id, rank, badge_number, clearance_level, joining_date, status)
VALUES
('OFF-ADMIN-01', 'USR-ADMIN-01', 'EMP-IPS-8801', 'Director General of Police / National Traffic Administrator', 'DEP-TP-DEL-01', 'DGP', 'IPS-8801-CIP', 5, '2015-06-01', 'ACTIVE'),
('OFF-POLICE-01', 'USR-POLICE-01', 'EMP-TR-5501', 'Traffic Inspector & ANPR Rapid Response Lead', 'DEP-TP-DEL-01', 'INSPECTOR', 'TR-INSP-5501', 3, '2018-09-15', 'ACTIVE'),
('OFF-RTO-01', 'USR-RTO-01', 'EMP-RTO-4402', 'Regional Transport Officer & Motor Licensing Authority', 'DEP-RTO-DEL-01', 'RTO_REGIONAL', 'RTO-DL-4402', 4, '2019-02-10', 'ACTIVE');

-- 4. CITIZENS
INSERT INTO citizens (id, user_id, aadhaar_masked, address, city, district, state, pincode, emergency_contact, kyc_status)
VALUES
('CIT-01', 'USR-CITIZEN-01', 'XXXX-XXXX-4921', 'B-42, Vasant Kunj Sector C', 'New Delhi', 'South West Delhi', 'DL', '110070', '+91 98111 22334', 'VERIFIED'),
('CIT-02', 'USR-CITIZEN-02', 'XXXX-XXXX-8820', 'Flat 12, Malabar Hill Crest', 'Mumbai', 'Mumbai South', 'MH', '400006', '+91 98222 33445', 'VERIFIED');

-- 5. VEHICLES
INSERT INTO vehicles (id, registration_number, owner_id, owner_name, vehicle_type, make, model, fuel_type, color, manufacture_year, registration_date, registration_expiry, fitness_expiry, insurance_expiry, insurance_policy_no, puc_expiry, rto_code, status)
VALUES
('VEH-01', 'DL-01-AB-4921', 'CIT-01', 'Demo Citizen Vikramaditya', '4_WHEELER', 'Tata Motors', 'Nexon EV', 'ELECTRIC', 'Pristine White', 2023, '2023-04-12', '2038-04-11', '2038-04-11', '2027-04-10', 'NEW-IND-884210', '2027-04-10', 'DL-01', 'ACTIVE'),
('VEH-02', 'HR-26-DK-2004', 'CIT-01', 'Demo Citizen Vikramaditya', '2_WHEELER', 'Bajaj Auto', 'Pulsar NS 200', 'PETROL', 'Matte Black', 2022, '2022-08-19', '2037-08-18', '2037-08-18', '2026-08-15', 'BAJ-ALL-110294', '2026-08-15', 'HR-26', 'ACTIVE'),
('VEH-03', 'MH-02-CP-8802', 'CIT-02', 'Demo Citizen Ananya Sharma', '4_WHEELER', 'Hyundai', 'Creta 1.5 SX', 'DIESEL', 'Titan Grey', 2021, '2021-11-05', '2036-11-04', '2036-11-04', '2026-11-01', 'ICICI-LOM-99201', '2026-11-01', 'MH-02', 'ACTIVE');

-- 6. DRIVING LICENCES
INSERT INTO driving_licences (id, citizen_id, licence_number, holder_name, issue_date, expiry_date, licence_type, blood_group, issuing_rto, status)
VALUES
('DL-01', 'CIT-01', 'DL-0420190089211', 'Demo Citizen Vikramaditya', '2019-05-10', '2039-05-09', 'LMV / MCWG', 'O+VE', 'RTO North Delhi (DL-01)', 'ACTIVE'),
('DL-02', 'CIT-02', 'MH-0120200055412', 'Demo Citizen Ananya Sharma', '2020-02-14', '2040-02-13', 'LMV', 'B+VE', 'RTO Mumbai Central (MH-01)', 'ACTIVE');

-- 7. COMPLAINTS
INSERT INTO complaints (id, complaint_number, citizen_id, category, description, priority, status, location_lat, location_lng, location_address, submitted_at, assigned_officer_id, investigation_notes, resolved_at, feedback_rating, feedback_comment)
VALUES
('CMP-801', 'CASE-2026-801', 'CIT-01', 'TRAFFIC_VIOLATION', 'Commercial truck jumped signal at Gantry 04 intersection at 85 km/h, tailgating passenger cars.', 'HIGH', 'ACTION_TAKEN', 28.6250, 77.2100, 'Ring Road Expressway Gantry 04 near Barapullah Flyover', '2026-09-30 08:30:00', 'OFF-POLICE-01', 'Radar speed log confirmed. Section 183(2) e-Challan issued to offending vehicle.', NULL, NULL, NULL),
('CMP-802', 'CASE-2026-802', 'CIT-02', 'ROAD_OBSTRUCTION', 'Damaged construction barricade obstructing central carriageway with unlit hazard signs.', 'MEDIUM', 'INVESTIGATION', 28.5830, 77.2450, 'Sarai Kale Khan Ring Road Loop KM 2.1', '2026-09-30 07:15:00', 'OFF-POLICE-01', 'Highway patrol unit dispatched to realign retro-reflective safety cones.', NULL, NULL, NULL),
('CMP-803', 'CASE-2026-803', 'CIT-01', 'ILLEGAL_PARKING', 'Three multi-axle freight carriers parked illegally on expressway fast lane blocking emergency bay.', 'MEDIUM', 'CLOSED', 28.5412, 77.0125, 'Dwarka Expressway Link KM 4.5', '2026-09-29 16:20:00', 'OFF-POLICE-01', 'Vehicles towed to designated municipal holding yard. ₹4,500 fine levied.', '2026-09-29 18:45:00', 5, 'Prompt resolution by traffic police patrol!');

-- 8. ACCIDENTS
INSERT INTO accidents (id, accident_number, reported_by, location_lat, location_lng, location_address, accident_type, severity, description, casualties, vehicles_involved, status, reported_at, assigned_officer_id, investigation_findings, green_corridor_active)
VALUES
('ACC-101', 'ACC-2026-01', 'USR-CITIZEN-01', 28.5412, 77.0125, 'Dwarka Expressway Link KM 4.5', 'COLLISION', 'SERIOUS', 'Two commercial freight carriers collided due to abrupt braking in dense morning fog.', 1, 2, 'INVESTIGATION', '2026-09-30 08:52:10', 'OFF-POLICE-01', 'CCTV footage retrieved. Interceptor PCR 04 coordinated ambulance transfer to Safdarjung Hospital.', FALSE),
('ACC-102', 'ACC-2026-02', 'USR-CITIZEN-02', 28.5833, 77.2500, 'Sarai Kale Khan to AIIMS Trauma Centre Corridor', 'COLLISION', 'CRITICAL', 'Emergency green corridor escort needed for critical patient transfer.', 0, 1, 'RESOLVED', '2026-09-30 08:58:00', 'OFF-POLICE-01', 'Green corridor successfully created. Transit completed in 8.5 minutes across 11 junctions.', TRUE);

-- 9. VIOLATIONS
INSERT INTO violations (id, violation_number, vehicle_id, officer_id, violation_type, violation_code, description, location, violation_date, evidence_id, status)
VALUES
('VIO-01', 'VIO-2026-901', 'VEH-01', 'OFF-POLICE-01', 'SPEED_VIOLATION', 'SEC-183(2) MV ACT', 'Radar speed breach: 82 km/h in designated 60 km/h urban corridor', 'Ring Road Expressway Flyover Gantry 04', '2026-09-28 14:22:10', 'EVD-01', 'CHALLAN_ISSUED'),
('VIO-02', 'VIO-2026-902', 'VEH-02', 'OFF-POLICE-01', 'HELMET_VIOLATION', 'SEC-129 MV ACT', 'Pillion rider traveling without certified safety headgear', 'Connaught Place Outer Circle Entry Gate 03', '2026-09-27 11:05:40', 'EVD-02', 'CHALLAN_ISSUED');

-- 10. CHALLANS
INSERT INTO challans (id, challan_number, vehicle_id, driver_id, officer_id, violation_id, amount, issue_date, due_date, payment_status, payment_reference, payment_mode, paid_at)
VALUES
('CH-1001', 'CH-2026-90124', 'VEH-01', 'CIT-01', 'OFF-POLICE-01', 'VIO-01', 2000.00, '2026-09-28 14:25:00', '2026-10-28 23:59:59', 'PENDING', NULL, NULL, NULL),
('CH-1002', 'CH-2026-88190', 'VEH-02', 'CIT-01', 'OFF-POLICE-01', 'VIO-02', 1000.00, '2026-09-27 11:10:00', '2026-10-27 23:59:59', 'PAID', 'PAY-UPI-992140', 'UPI_DIGITAL', '2026-09-27 12:30:00');

-- 11. RISK_ZONES
INSERT INTO risk_zones (id, zone_name, location, latitude, longitude, risk_level, risk_type, incident_count, last_incident, assigned_officer_id, recommended_action, status)
VALUES
('RZ-01', 'NH-48 Jaipur Highway Blind Curve', 'NH-48 Delhi-Jaipur Corridor KM 42.8', 28.3842, 76.9421, 'CRITICAL', 'ACCIDENT_HOTSPOT', 28, '2026-09-29 22:15:00', 'OFF-POLICE-01', 'Install rumble strips, high-lumen solar blinkers & calibrate automatic ANPR radar', 'ACTIVE'),
('RZ-02', 'Barapullah Elevated Gantry Loop', 'Ring Road Flyover Approach Gate 04', 28.5862, 77.2410, 'HIGH', 'SPEED_VIOLATION', 44, '2026-09-30 08:10:00', 'OFF-POLICE-01', 'Deploy stationary speed interceptor unit during peak hours (08:00 - 11:00)', 'ACTIVE'),
('RZ-03', 'Dwarka Expressway Metro Pier Crossing', 'Dwarka Sector 21 Junction', 28.5521, 77.0583, 'MEDIUM', 'CONGESTION', 19, '2026-09-30 09:00:00', 'OFF-POLICE-01', 'Optimize traffic signal cycle time to 90 seconds during evening rush', 'ACTIVE'),
('RZ-04', 'Dhaula Kuan Central Roundabout', 'Dhaula Kuan Army Public School Zone', 28.5912, 77.1601, 'LOW', 'SCHOOL_ZONE', 6, '2026-09-25 14:15:00', 'OFF-POLICE-01', 'Traffic warden deployment for pedestrian crossing safety during school hours', 'ACTIVE');

-- 12. RTO_APPLICATIONS
INSERT INTO rto_applications (id, citizen_id, application_type, application_number, vehicle_id, status, submitted_at, reviewed_by, reviewed_at, remarks)
VALUES
('RTO-APP-01', 'CIT-01', 'LICENCE_RENEWAL', 'RTO-DL-2026-90412', NULL, 'UNDER_REVIEW', '2026-09-28 10:15:00', 'OFF-RTO-01', '2026-09-29 11:30:00', 'Medical fitness form-1A verified. Biometric scheduled.'),
('RTO-APP-02', 'CIT-01', 'TRANSFER_OF_OWNERSHIP', 'RTO-DL-2026-88120', 'VEH-01', 'DOCUMENTS_VERIFIED', '2026-09-26 15:40:00', 'OFF-RTO-01', '2026-09-28 16:00:00', 'Form 29 and 30 uploaded with bank NOC. Ready for final endorsement.'),
('RTO-APP-03', 'CIT-02', 'NEW_REGISTRATION', 'RTO-MH-2026-77319', 'VEH-03', 'APPROVED', '2026-09-24 09:20:00', 'OFF-RTO-01', '2026-09-25 14:10:00', 'High Security Registration Plate (HSRP) issued and fitted.');

-- 13. NOTIFICATIONS
INSERT INTO notifications (id, user_id, title, message, notification_type, is_read, created_at)
VALUES
('NOTIF-01', 'USR-CITIZEN-01', 'Complaint Status Updated', 'Your complaint CASE-2026-801 is now under active officer investigation.', 'COMPLAINT_UPDATE', FALSE, '2026-09-30 08:35:00'),
('NOTIF-02', 'USR-CITIZEN-01', 'e-Challan Notice Issued', 'e-Challan #CH-2026-90124 of ₹2,000 issued for vehicle DL-01-AB-4921 under Section 183(2).', 'CHALLAN_ISSUED', FALSE, '2026-09-28 14:25:00'),
('NOTIF-03', 'USR-CITIZEN-01', 'RTO Application Verified', 'Your Licence Renewal Application RTO-DL-2026-90412 has been verified by the RTO Authority.', 'RTO_UPDATE', TRUE, '2026-09-29 11:30:00'),
('NOTIF-04', 'USR-POLICE-01', 'New Priority Incident Assigned', 'Accident Case ACC-2026-01 on Dwarka Expressway assigned to your unit.', 'EMERGENCY_ALERT', FALSE, '2026-09-30 08:52:10');

-- 14. AUDIT_LOGS
INSERT INTO audit_logs (id, user_id, user_name, role, action, entity_type, entity_id, details, ip_address, sha256_hash, created_at)
VALUES
('LOG-01', 'USR-ADMIN-01', 'Director General A. K. Saxena', 'ADMIN', 'LOGIN', 'USER', 'USR-ADMIN-01', 'Root Administrator login from National Command Headquarters', '10.42.11.2', 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855', '2026-09-30 08:00:00'),
('LOG-02', 'USR-POLICE-01', 'Inspector Rajeshwar Nath', 'POLICE_OFFICER', 'CREATE_CHALLAN', 'CHALLAN', 'CH-1001', 'e-Challan ₹2,000 issued under Sec 183(2) MV Act to DL-01-AB-4921', '10.42.18.9', '3a7cf44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855', '2026-09-28 14:25:00'),
('LOG-03', 'USR-RTO-01', 'RTO Officer Meenakshi Sundaram', 'RTO_OFFICER', 'VERIFY_DOCUMENT', 'RTO_APPLICATION', 'RTO-APP-02', 'Form 29/30 & Bank NOC verified for ownership transfer', '10.42.22.14', '7b9ef44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855', '2026-09-28 16:00:00');
