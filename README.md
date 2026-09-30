# National Automated Traffic & RTO Management System (NATDAMS)
### Ministry of Road Transport & Highways • Government of India

A centralized, enterprise-grade digital platform integrating **Traffic Police Enforcement**, **Regional Transport Offices (RTO)**, **Department Administrators**, and **Citizens / Motorists**.

---

## 1. System Architecture Overview

```
                               ┌────────────────────────────────────────────────────────┐
                               │                    CITIZEN & PORTAL                    │
                               │  - Incident Reporting • e-Challan Payment (Bharat UPI) │
                               │  - VAHAN RC & Sarathi DL Locker • RTO Applications     │
                               └──────────────────────────┬─────────────────────────────┘
                                                          │
                               ┌──────────────────────────▼─────────────────────────────┐
                               │       ROLE-BASED ACCESS CONTROL & SECURITY GATEWAY     │
                               │  [Citizen | Police Officer | RTO Officer | Admin]      │
                               │  - 2FA PIN • SHA-256 Audit Trail • Session Vault       │
                               └──────────────────────────┬─────────────────────────────┘
                                                          │
                       ┌──────────────────────────────────┼──────────────────────────────────┐
                       │                                  │                                  │
         ┌─────────────▼────────────┐       ┌─────────────▼────────────┐       ┌─────────────▼────────────┐
         │   TRAFFIC POLICE DESK    │       │     RTO COMMAND DESK     │       │    DIRECTORATE ADMIN     │
         │ - Assigned Cases & Review│       │ - VAHAN RC & DL Registry │       │ - User & Officer Mgt     │
         │ - Optical ANPR & Radar   │       │ - Document Verification  │       │ - Departments & Fleet    │
         │ - Accident Investigation │       │ - Approval / Rejection   │       │ - Risk Hotspots Center   │
         │ - 112 Green Corridor SOS │       │ - Fitness & Compliance   │       │ - Immutable Audit Trail  │
         └──────────────────────────┘       └──────────────────────────┘       └──────────────────────────┘
                                                          │
                               ┌──────────────────────────▼─────────────────────────────┐
                               │              REST API & DATA REPOSITORY                │
                               │  - 15 Core Relational Entities • PostgreSQL DDL        │
                               │  - MoRTH VAHAN & Bhoomi Rashi • Google Mobility Matrix │
                               └────────────────────────────────────────────────────────┘
```

---

## 2. User Roles & Clearance Matrix

| Role | Name | Scope & Authority |
|---|---|---|
| **Role 1 — Citizen** | Public Motorist | Report violations/accidents, track status, view/pay e-challans via Bharat UPI, inspect VAHAN RC & Sarathi DL, submit RTO service applications. |
| **Role 2 — Traffic Police Officer** | Enforcement Officer | Review assigned cases, verify dashcam evidence, issue MV Act citations, manage accident cases, activate ambulance green corridors, monitor radar speed. |
| **Role 3 — RTO Officer** | Regional Transport Officer | Manage vehicle registrations & driving licences, statutory document verification (Forms 20/29/30), approve/reject applications with mandatory remarks. |
| **Role 4 — Administrator** | Traffic Dept Directorate | Master management of users, officers, departments, statutory violation classifications, risk zones, system health, and cryptographic SHA-256 audit ledger. |

---

## 3. Database Schema (15 Core Relational Tables)

The complete SQL DDL schema is provided in [`data/schema.sql`](data/schema.sql) and seed script in [`data/seed.sql`](data/seed.sql).

1. `departments`: Transport and traffic commissionerates (`id`, `name`, `type`, `district`, `office_address`, `contact_number`, `status`).
2. `users`: System users with hashed passwords and role tags (`id`, `full_name`, `email`, `phone`, `password_hash`, `role`, `department_id`, `status`).
3. `officers`: Commissioned police and RTO officers (`id`, `user_id`, `employee_id`, `designation`, `department_id`, `rank`, `badge_number`, `pin`, `joining_date`, `status`).
4. `citizens`: Motorists profile (`id`, `user_id`, `address`, `city`, `district`, `state`, `pincode`, `emergency_contact`).
5. `vehicles`: National VAHAN vehicle registry (`id`, `registration_number`, `owner_id`, `vehicle_type`, `make`, `model`, `fuel_type`, `registration_date`, `fitness_expiry`, `insurance_expiry`, `status`).
6. `driving_licences`: Sarathi DL repository (`id`, `citizen_id`, `licence_number`, `issue_date`, `expiry_date`, `licence_type`, `status`, `issuing_rto`).
7. `complaints`: Citizen traffic complaints (`id`, `complaint_number`, `citizen_id`, `category`, `description`, `priority`, `status`, `location_address`, `assigned_officer_id`, `resolved_at`).
8. `accidents`: Road crash investigations (`id`, `accident_number`, `reported_by`, `accident_type`, `severity`, `casualties`, `vehicles_involved`, `status`, `assigned_officer_id`).
9. `violations`: Traffic violations logged by ANPR/radar (`id`, `violation_number`, `vehicle_id`, `officer_id`, `violation_type`, `location`, `status`).
10. `challans`: Monetary citations with MV Act penalty (`id`, `challan_number`, `vehicle_id`, `officer_id`, `amount`, `payment_status`, `payment_reference`).
11. `evidence`: Geo-tagged photos, dashcam footage, and OCR logs (`id`, `case_type`, `case_id`, `file_url`, `verification_status`).
12. `risk_zones`: High-hazard blackspots (`id`, `zone_name`, `location`, `latitude`, `longitude`, `risk_level`, `risk_type`, `incident_count`, `recommended_action`).
13. `notifications`: Official broadcast alerts & case updates (`id`, `user_id`, `title`, `message`, `notification_type`, `is_read`).
14. `audit_logs`: Immutable SHA-256 cryptographic audit trail (`id`, `user_id`, `action`, `entity_type`, `entity_id`, `details`, `ip_address`, `sha256_hash`).
15. `rto_applications`: Transport office applications (`id`, `citizen_id`, `application_type`, `application_number`, `status`, `submitted_at`, `reviewed_by`, `remarks`).

---

## 4. API Endpoints Reference

### Authentication & Sessions
- `POST /api/auth/login`: Authenticate via password or Officer Badge ID + Camera PIN.
- `POST /api/auth/register`: Citizen Aadhaar e-KYC self-registration.

### Citizen & Enforcement
- `GET /api/departments`: List of regional traffic departments.
- `GET /api/vehicles`: VAHAN vehicle registry lookup (`?search=DL-01-AB-4921`).
- `GET /api/vehicles/:plate`: Complete vehicle dossier with challan and accident history.
- `GET /api/licences`: Sarathi driving licence verification.
- `GET /api/cases` & `POST /api/cases`: Citizen complaints queue with AI pre-processing.
- `GET /api/accidents` & `POST /api/accidents`: Accident case registration & emergency green corridor dispatch.
- `GET /api/violations` & `POST /api/violations`: ANPR radar citations.
- `POST /api/challans/:id/pay`: Simulated online fine payment with instant Bharat E-Challan receipt.

### RTO Desk & Risk Analytics
- `GET /api/rto-applications`: Statutory application list.
- `POST /api/rto-applications`: Submit new application (Transfer, Renewal, Fitness).
- `PUT /api/rto-applications/:id`: Officer approval/rejection with mandatory remarks.
- `GET /api/risk-zones`: Blackspots filtered by level (`CRITICAL`, `HIGH`, `MEDIUM`, `LOW`).
- `GET /api/analytics`: Central executive metrics (reconciliation, ANPR accuracy, revenue).
- `GET /api/audit-logs`: Cryptographic SHA-256 tamper-proof ledger.

---

## 5. Demo Credentials

| Role | Username / ID | Password | Access Scope / PIN |
|---|---|---|---|
| **Citizen Motorist** | `citizen.demo` | `Citizen@2026` | Public Portal (Aadhaar Verified) |
| **Traffic Police Officer** | `TR-INSP-5501` | `INSP@2026` | Level 3 Enforcement (PIN: `5050`) |
| **Police DCP / SP** | `IPS-9244-DEL` | `SP@2026` | Level 4 Regional Command (PIN: `7070`) |
| **Director General (IPS)** | `IPS-8801-CIP` | `DGP@2026` | Level 5 Supreme Command (PIN: `9090`) |
| **RTO Officer** | `rto.demo` | `RTO@2026` | Regional Transport Office Desk |
| **System Administrator** | `admin.demo` | `Admin@2026` | Directorate Master Control |

---

## 6. Installation & Local Execution

```bash
# Clone the repository
git clone https://github.com/Rohit-k2007/Taffic-Departement-.git
cd Taffic-Departement-

# Start the application server (Zero external npm dependencies needed)
node server.js
```

Open `http://localhost:3000/` in any modern web browser.

---

## 7. PostgreSQL Database Setup (Production)

```bash
# Connect to PostgreSQL instance
psql -U postgres -d postgres

# Create database and execute schema
CREATE DATABASE natdams_db;
\c natdams_db;

\i data/schema.sql;
\i data/seed.sql;
```

---

## 8. Deployment on Vercel

The portal is pre-configured for Vercel deployment via `vercel.json` and `api/index.js`:

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

---

## 9. Statutory Decision-Support Mandate

> **Important Operational Rule**:  
> The system operates strictly as an intelligent decision-support and workflow coordination tool. It **does NOT** automatically impose penal sanctions, initiate arrests, or issue final judicial determinations. All statutory enforcement actions remain under the constitutional authority of designated officers.
