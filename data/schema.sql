-- ============================================================================
-- GOVERNMENT TRAFFIC POLICE & RTO MANAGEMENT SYSTEM (NATDAMS)
-- Relational Database Schema (PostgreSQL / SQLite Compatible DDL)
-- Ministry of Road Transport & Highways (MoRTH) & State Traffic Police
-- ============================================================================

-- 1. DEPARTMENTS
CREATE TABLE IF NOT EXISTS departments (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(64) NOT NULL, -- 'TRAFFIC_POLICE', 'RTO', 'HIGHWAY_PATROL', 'HQ'
    district VARCHAR(128) NOT NULL,
    state VARCHAR(64) NOT NULL,
    office_address TEXT,
    contact_number VARCHAR(32),
    status VARCHAR(32) DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. USERS (Core Authentication & Role Base)
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(64) PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(32) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(32) NOT NULL, -- 'CITIZEN', 'POLICE_OFFICER', 'RTO_OFFICER', 'ADMIN'
    department_id VARCHAR(64) REFERENCES departments(id),
    status VARCHAR(32) DEFAULT 'ACTIVE', -- 'ACTIVE', 'SUSPENDED', 'PENDING'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. OFFICERS (Police & RTO Personnel)
CREATE TABLE IF NOT EXISTS officers (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    employee_id VARCHAR(64) UNIQUE NOT NULL,
    designation VARCHAR(128) NOT NULL,
    department_id VARCHAR(64) REFERENCES departments(id),
    rank VARCHAR(64) NOT NULL, -- 'DGP', 'DCP', 'INSPECTOR', 'SUB_INSPECTOR', 'RTO_REGIONAL', 'WARDEN'
    badge_number VARCHAR(64) UNIQUE NOT NULL,
    clearance_level INTEGER DEFAULT 3, -- 1 to 5
    joining_date DATE,
    status VARCHAR(32) DEFAULT 'ACTIVE'
);

-- 4. CITIZENS (Public Motorists & Applicants)
CREATE TABLE IF NOT EXISTS citizens (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    aadhaar_masked VARCHAR(32),
    address TEXT,
    city VARCHAR(128),
    district VARCHAR(128),
    state VARCHAR(64),
    pincode VARCHAR(16),
    emergency_contact VARCHAR(32),
    kyc_status VARCHAR(32) DEFAULT 'VERIFIED'
);

-- 5. VEHICLES (VAHAN National Vehicle Registry)
CREATE TABLE IF NOT EXISTS vehicles (
    id VARCHAR(64) PRIMARY KEY,
    registration_number VARCHAR(32) UNIQUE NOT NULL,
    owner_id VARCHAR(64) REFERENCES citizens(id),
    owner_name VARCHAR(255) NOT NULL,
    vehicle_type VARCHAR(64) NOT NULL, -- '2_WHEELER', '4_WHEELER', 'COMMERCIAL_TRUCK', 'BUS', 'AUTO_RICKSHAW'
    make VARCHAR(128) NOT NULL,
    model VARCHAR(128) NOT NULL,
    fuel_type VARCHAR(32) DEFAULT 'PETROL',
    color VARCHAR(64),
    manufacture_year INTEGER,
    registration_date DATE,
    registration_expiry DATE,
    fitness_expiry DATE,
    insurance_expiry DATE,
    insurance_policy_no VARCHAR(128),
    puc_expiry DATE,
    rto_code VARCHAR(32),
    status VARCHAR(32) DEFAULT 'ACTIVE', -- 'ACTIVE', 'SUSPENDED', 'BLACKLISTED'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. DRIVING LICENCES (SARATHI National Driving Licence Registry)
CREATE TABLE IF NOT EXISTS driving_licences (
    id VARCHAR(64) PRIMARY KEY,
    citizen_id VARCHAR(64) REFERENCES citizens(id),
    licence_number VARCHAR(64) UNIQUE NOT NULL,
    holder_name VARCHAR(255) NOT NULL,
    issue_date DATE NOT NULL,
    expiry_date DATE NOT NULL,
    licence_type VARCHAR(64) NOT NULL, -- 'MCWG', 'LMV', 'HMV', 'TRANS'
    blood_group VARCHAR(8),
    issuing_rto VARCHAR(128) NOT NULL,
    status VARCHAR(32) DEFAULT 'ACTIVE', -- 'ACTIVE', 'EXPIRED', 'SUSPENDED', 'UNDER_VERIFICATION'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 7. COMPLAINTS (Citizen Incident Reports)
CREATE TABLE IF NOT EXISTS complaints (
    id VARCHAR(64) PRIMARY KEY,
    complaint_number VARCHAR(64) UNIQUE NOT NULL,
    citizen_id VARCHAR(64) REFERENCES citizens(id),
    category VARCHAR(64) NOT NULL, -- 'ACCIDENT', 'TRAFFIC_VIOLATION', 'ROAD_OBSTRUCTION', 'ILLEGAL_PARKING', 'DRUNKEN_DRIVING'
    description TEXT NOT NULL,
    priority VARCHAR(32) DEFAULT 'MEDIUM', -- 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'
    status VARCHAR(32) DEFAULT 'SUBMITTED', -- 'SUBMITTED', 'UNDER_REVIEW', 'ASSIGNED', 'INVESTIGATION', 'ACTION_TAKEN', 'RESOLVED', 'CLOSED', 'REJECTED'
    rejection_reason TEXT,
    location_lat DECIMAL(10, 6),
    location_lng DECIMAL(10, 6),
    location_address TEXT NOT NULL,
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    assigned_officer_id VARCHAR(64) REFERENCES officers(id),
    investigation_notes TEXT,
    resolved_at TIMESTAMP,
    feedback_rating INTEGER,
    feedback_comment TEXT
);

-- 8. ACCIDENTS (Accident Forensics & Emergency Dispatch)
CREATE TABLE IF NOT EXISTS accidents (
    id VARCHAR(64) PRIMARY KEY,
    accident_number VARCHAR(64) UNIQUE NOT NULL,
    reported_by VARCHAR(64) REFERENCES users(id),
    location_lat DECIMAL(10, 6),
    location_lng DECIMAL(10, 6),
    location_address TEXT NOT NULL,
    accident_type VARCHAR(64) NOT NULL, -- 'COLLISION', 'ROLLOVER', 'PEDESTRIAN_HIT', 'HIT_AND_RUN'
    severity VARCHAR(32) NOT NULL, -- 'MINOR', 'MODERATE', 'SERIOUS', 'CRITICAL'
    description TEXT NOT NULL,
    casualties INTEGER DEFAULT 0,
    vehicles_involved INTEGER DEFAULT 1,
    status VARCHAR(32) DEFAULT 'REPORTED', -- 'REPORTED', 'PATROL_DISPATCHED', 'INVESTIGATION', 'RESOLVED', 'CLOSED'
    reported_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    assigned_officer_id VARCHAR(64) REFERENCES officers(id),
    investigation_findings TEXT,
    green_corridor_active BOOLEAN DEFAULT FALSE
);

-- 9. VIOLATIONS (Motor Vehicles Act Offences)
CREATE TABLE IF NOT EXISTS violations (
    id VARCHAR(64) PRIMARY KEY,
    violation_number VARCHAR(64) UNIQUE NOT NULL,
    vehicle_id VARCHAR(64) REFERENCES vehicles(id),
    officer_id VARCHAR(64) REFERENCES officers(id),
    violation_type VARCHAR(128) NOT NULL, -- 'SPEED_VIOLATION', 'RED_LIGHT', 'NO_HELMET', 'SEAT_BELT', 'OVERLOADING', 'NO_LICENCE'
    violation_code VARCHAR(64) NOT NULL, -- 'SEC-183(2)', 'SEC-194', 'SEC-129', etc.
    description TEXT,
    location TEXT NOT NULL,
    violation_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    evidence_id VARCHAR(64),
    status VARCHAR(32) DEFAULT 'RECORDED', -- 'RECORDED', 'CHALLAN_ISSUED', 'DISMISSED'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 10. CHALLANS (e-Challan Statutory Fines)
CREATE TABLE IF NOT EXISTS challans (
    id VARCHAR(64) PRIMARY KEY,
    challan_number VARCHAR(64) UNIQUE NOT NULL,
    vehicle_id VARCHAR(64) REFERENCES vehicles(id),
    driver_id VARCHAR(64) REFERENCES citizens(id),
    officer_id VARCHAR(64) REFERENCES officers(id),
    violation_id VARCHAR(64) REFERENCES violations(id),
    amount DECIMAL(10, 2) NOT NULL,
    issue_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    due_date TIMESTAMP,
    payment_status VARCHAR(32) DEFAULT 'PENDING', -- 'PENDING', 'PAID', 'OVERDUE', 'CANCELLED'
    payment_reference VARCHAR(128),
    payment_mode VARCHAR(64),
    paid_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 11. EVIDENCE (Photos, Dashcam, Optical OCR)
CREATE TABLE IF NOT EXISTS evidence (
    id VARCHAR(64) PRIMARY KEY,
    uploaded_by VARCHAR(64) REFERENCES users(id),
    case_type VARCHAR(32) NOT NULL, -- 'COMPLAINT', 'ACCIDENT', 'VIOLATION'
    case_id VARCHAR(64) NOT NULL,
    file_url TEXT NOT NULL,
    file_type VARCHAR(64),
    file_name VARCHAR(255),
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    verified_by VARCHAR(64) REFERENCES officers(id),
    verification_status VARCHAR(32) DEFAULT 'PENDING' -- 'PENDING', 'VERIFIED', 'REJECTED'
);

-- 12. RISK_ZONES (Accident Hotspots & Safety Monitoring)
CREATE TABLE IF NOT EXISTS risk_zones (
    id VARCHAR(64) PRIMARY KEY,
    zone_name VARCHAR(255) NOT NULL,
    location VARCHAR(255) NOT NULL,
    latitude DECIMAL(10, 6) NOT NULL,
    longitude DECIMAL(10, 6) NOT NULL,
    risk_level VARCHAR(32) NOT NULL, -- 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'
    risk_type VARCHAR(64) NOT NULL, -- 'ACCIDENT_HOTSPOT', 'SPEED_VIOLATION', 'CONGESTION', 'INTERSECTION', 'SCHOOL_ZONE', 'POOR_ROAD'
    incident_count INTEGER DEFAULT 0,
    last_incident TIMESTAMP,
    assigned_officer_id VARCHAR(64) REFERENCES officers(id),
    recommended_action TEXT,
    status VARCHAR(32) DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 13. NOTIFICATIONS (System & Statutory SMS/Alerts)
CREATE TABLE IF NOT EXISTS notifications (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    notification_type VARCHAR(64) NOT NULL, -- 'COMPLAINT_UPDATE', 'CHALLAN_ISSUED', 'RTO_UPDATE', 'EMERGENCY_ALERT'
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 14. AUDIT_LOGS (Cryptographic SHA-256 Tamper-Proof Audit Trail)
CREATE TABLE IF NOT EXISTS audit_logs (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64),
    user_name VARCHAR(255),
    role VARCHAR(64),
    action VARCHAR(64) NOT NULL, -- 'LOGIN', 'CREATE_CASE', 'UPDATE_CASE', 'CREATE_CHALLAN', 'VERIFY_DOCUMENT', 'CLOSE_CASE'
    entity_type VARCHAR(64),
    entity_id VARCHAR(64),
    details TEXT,
    old_value TEXT,
    new_value TEXT,
    ip_address VARCHAR(64),
    sha256_hash VARCHAR(128),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 15. RTO_APPLICATIONS (Licence & Vehicle Registrations)
CREATE TABLE IF NOT EXISTS rto_applications (
    id VARCHAR(64) PRIMARY KEY,
    citizen_id VARCHAR(64) REFERENCES citizens(id),
    application_type VARCHAR(64) NOT NULL, -- 'NEW_REGISTRATION', 'TRANSFER_OF_OWNERSHIP', 'LICENCE_ISSUE', 'LICENCE_RENEWAL', 'ADDRESS_CHANGE', 'FITNESS_CERTIFICATE'
    application_number VARCHAR(64) UNIQUE NOT NULL,
    vehicle_id VARCHAR(64) REFERENCES vehicles(id),
    status VARCHAR(32) DEFAULT 'SUBMITTED', -- 'SUBMITTED', 'UNDER_REVIEW', 'DOCUMENTS_VERIFIED', 'APPROVED', 'REJECTED'
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    reviewed_by VARCHAR(64) REFERENCES officers(id),
    reviewed_at TIMESTAMP,
    remarks TEXT
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_vehicles_plate ON vehicles(registration_number);
CREATE INDEX IF NOT EXISTS idx_licences_number ON driving_licences(licence_number);
CREATE INDEX IF NOT EXISTS idx_complaints_status ON complaints(status);
CREATE INDEX IF NOT EXISTS idx_challans_vehicle ON challans(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_challans_status ON challans(payment_status);
CREATE INDEX IF NOT EXISTS idx_risk_level ON risk_zones(risk_level);
