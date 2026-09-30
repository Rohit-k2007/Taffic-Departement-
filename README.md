# TRAFIX: Advanced Traffic Police, RTO Management & Risk Intelligence Platform
### Ministry of Road Transport & Highways (MoRTH) • State Traffic Police Directorate • Govt of India

A sovereign, centralized digital public-sector platform integrating **Traffic Police Enforcement**, **Regional Transport Offices (RTO)**, **Directorate Administrators**, and **Public Citizens/Motorists**, backed by a relational PostgreSQL database, Prisma ORM, strict server-side Role-Based Access Control (RBAC), and AI-assisted risk analytics.

---

## 1. System Architecture Overview

```
                               ┌────────────────────────────────────────────────────────┐
                               │                    CITIZEN SERVICES                    │
                               │  - Incident Reporting • e-Challan Payment (Bharat UPI) │
                               │  - VAHAN RC & Sarathi DL Locker • RTO Applications     │
                               └──────────────────────────┬─────────────────────────────┘
                                                          │
                               ┌──────────────────────────▼─────────────────────────────┐
                               │       DIVIDED MULTI-PORTAL SOVEREIGN LOGIN GATEWAY     │
                               │  [Citizen Portal | Police Gateway | RTO Desk | Admin]  │
                               │  - User ID / Pass • Camera Access PIN • Bearer JWT     │
                               └──────────────────────────┬─────────────────────────────┘
                                                          │
                       ┌──────────────────────────────────┼──────────────────────────────────┐
                       │                                  │                                  │
         ┌─────────────▼────────────┐       ┌─────────────▼────────────┐       ┌─────────────▼────────────┐
         │   TRAFFIC POLICE DESK    │       │     RTO COMMAND DESK     │       │    DIRECTORATE COMMAND   │
         │ - Assigned Cases & Review│       │ - VAHAN RC & DL Registry │       │ - User & Officer Mgt     │
         │ - Optical ANPR Citations │       │ - Document Verification  │       │ - Departments & Fleets   │
         │ - Accident Investigation │       │ - Statutory Approvals    │       │ - Risk Hotspots Center   │
         │ - 112 Green Corridor SOS │       │ - Fitness & Compliance   │       │ - SHA-256 Audit Ledger   │
         └──────────────────────────┘       └──────────────────────────┘       └──────────────────────────┘
                                                          │
                               ┌──────────────────────────▼─────────────────────────────┐
                               │              REST API & PRISMA ORM LAYER               │
                               │  - 16 Relational Tables • PostgreSQL & Graceful Store  │
                               │  - Server-Side RBAC Enforcement (HTTP 403 Barriers)    │
                               │  - AI-Assisted Risk Intelligence & ISRO Telemetry      │
                               └────────────────────────────────────────────────────────┘
```

---

## 2. Strict Role-Based Access Control (RBAC) & Portal Separation

The platform enforces strict role boundaries:
1. **Citizens CANNOT access RTO or Police internal records**: Attempting to query `/api/audit-logs`, update case statuses (`PUT /api/cases/:id`), or approve RTO applications returns **HTTP 403 Forbidden**.
2. **Police Officers CANNOT grant statutory RTO approvals**: Police officers cannot approve vehicle registrations or issue driving licence endorsements (`PUT /api/rto-applications/:id` blocked with **HTTP 403 Forbidden**).
3. **RTO Officers CANNOT issue police tactical citations or alter police accident investigations** (`PUT /api/cases/:id` and `PUT /api/accidents/:id` blocked with **HTTP 403 Forbidden**).
4. **No Sensitive Data in `localStorage`**: All users, complaints, accidents, violations, challans, vehicles, licences, RTO applications, and audit trails are fetched dynamically from the live REST API layer.

### Role Matrix & Clearances

| Role | Portal / Door | Clearances & Permissions | Prohibited Actions |
|---|---|---|---|
| **CITIZEN** | 🛡️ Citizen Portal | Report issues, report accidents, pay challans (UPI), view VAHAN RC / DL locker, submit RTO service requests. | Cannot view police investigation notes, cannot access officer roster, cannot approve RTO applications. |
| **TRAFFIC_POLICE_OFFICER** | 👮 Police Gateway | Review assigned cases, issue ANPR citations, investigate accidents, monitor speed radars, view risk zones. | Cannot approve RTO registrations/licences, cannot modify admin settings or commissioner logs. |
| **RTO_OFFICER** | 🏛️ RTO Portal | Review VAHAN RC applications, Sarathi DL renewals, verify citizen KYC documents, grant/reject approvals with statutory remarks. | Cannot issue on-field police citations, cannot modify 112 emergency dispatch queue. |
| **ADMINISTRATOR** | ⚡ Admin Command | Master oversight of staff commissions, department fleet, highway advisories, tamper-proof SHA-256 audit ledger. | Subject to immutable audit logging. |

---

## 3. Database Architecture (16 Relational Tables)

The system is modeled in `prisma/schema.prisma` and `data/schema.sql`:

1. `users`: Master identity records (`id`, `full_name`, `email`, `phone`, `password_hash`, `role`, `department_id`, `status`, `last_login`, `created_at`, `updated_at`).
2. `departments`: Regional traffic police commissionerates & RTO offices (`id`, `name`, `type`, `district`, `state`, `office_address`, `contact_number`, `status`).
3. `officers`: Commissioned personnel with rank and clearance (`id`, `user_id`, `employee_id`, `designation`, `rank`, `badge_number`, `camera_pin`, `department_id`, `clearance_level`, `status`).
4. `citizens`: Registered motorists (`id`, `user_id`, `aadhaar_masked`, `address`, `city`, `district`, `state`, `pincode`, `emergency_contact`, `kyc_status`).
5. `vehicles`: National VAHAN vehicle registry (`id`, `registration_number`, `owner_id`, `vehicle_type`, `make`, `model`, `fuel_type`, `color`, `manufacture_year`, `registration_date`, `fitness_expiry`, `insurance_expiry`, `status`).
6. `driving_licences`: National Sarathi DL registry (`id`, `citizen_id`, `licence_number`, `licence_type`, `blood_group`, `issue_date`, `expiry_date`, `status`, `issuing_rto`).
7. `complaints`: Citizen traffic issues (`id`, `complaint_number`, `citizen_id`, `category`, `description`, `priority`, `status`, `latitude`, `longitude`, `location_address`, `assigned_officer_id`, `investigation_notes`).
8. `accidents`: Emergency accident forensics (`id`, `accident_number`, `reported_by`, `latitude`, `longitude`, `location_address`, `accident_type`, `severity`, `casualties`, `vehicles_involved`, `status`, `assigned_officer_id`).
9. `violations`: Motor Vehicles Act offences (`id`, `violation_number`, `vehicle_id`, `officer_id`, `violation_type`, `violation_code`, `description`, `location`, `latitude`, `longitude`, `status`).
10. `challans`: Statutory e-challans (`id`, `challan_number`, `vehicle_id`, `driver_id`, `officer_id`, `amount`, `issue_date`, `due_date`, `payment_status`, `payment_reference`, `paid_at`).
11. `evidence`: Dashcam and OCR digital evidence (`id`, `uploaded_by`, `case_type`, `case_id`, `file_name`, `file_type`, `file_url`, `file_hash`, `verification_status`).
12. `risk_zones`: Accident hotspots and safety corridors (`id`, `zone_name`, `latitude`, `longitude`, `location`, `risk_level`, `risk_type`, `incident_count`, `suggested_action`, `status`).
13. `notifications`: System alerts and SMS alerts (`id`, `user_id`, `title`, `message`, `notification_type`, `is_read`, `created_at`).
14. `rto_applications`: Parivahan vehicle & DL services (`id`, `application_number`, `citizen_id`, `application_type`, `vehicle_id`, `status`, `submitted_at`, `reviewed_by`, `remarks`).
15. `audit_logs`: Cryptographic SHA-256 tamper-proof ledger (`id`, `user_id`, `action`, `entity_type`, `entity_id`, `old_value`, `new_value`, `ip_address`, `sha256_hash`, `created_at`).
16. `feedback`: Citizen post-resolution ratings (`id`, `user_id`, `case_id`, `rating`, `comment`, `created_at`).

---

## 4. REST API Endpoints & Role Guardrails

| Endpoint | Method | Allowed Roles | Description |
|---|---|---|---|
| `/api/auth/login` | POST | ALL | Divided multi-portal role authentication returning `JWT-TRAFIX-*`. |
| `/api/auth/register` | POST | Public | Citizen registration. |
| `/api/cases` | GET | ALL | Fetch complaint cases (Citizen sees non-confidential reports). |
| `/api/cases` | POST | ALL | Citizen files incident report (Input validated). |
| `/api/cases/:id` | PUT | POLICE, ADMIN | Officer reviews, verifies, and updates case disposition (403 for Citizen/RTO). |
| `/api/accidents` | GET | ALL | Fetch emergency accident reports. |
| `/api/accidents` | POST | ALL | Report accident with coordinates and severity rating. |
| `/api/accidents/:id` | PUT | POLICE, ADMIN | Update accident forensic findings (403 for Citizen/RTO). |
| `/api/violations` | GET | ALL | ANPR violation citations list. |
| `/api/violations` | POST | POLICE, ADMIN | Officer issues statutory MV Act citation (403 for Citizen/RTO). |
| `/api/violations/:id` | PUT | POLICE, ADMIN | Officer updates violation status (403 for Citizen/RTO). |
| `/api/challans/:id/pay`| POST | ALL | Online e-challan simulated settlement via Bharat UPI. |
| `/api/vehicles` | GET | ALL | VAHAN vehicle registry lookup. |
| `/api/licences` | GET | ALL | SARATHI driving licence registry lookup. |
| `/api/rto-applications`| GET | ALL | Parivahan service applications. |
| `/api/rto-applications`| POST | ALL | Citizen submits DL renewal, RC transfer, fitness application. |
| `/api/rto-applications/:id`| PUT | RTO, ADMIN | Statutory officer approves or rejects application (403 for Citizen/Police). |
| `/api/risk-zones` | GET | ALL | High-risk accident hotspots and radar corridors. |
| `/api/audit-logs` | GET | ADMIN ONLY | Cryptographic SHA-256 audit ledger (403 for Citizen/Police/RTO). |
| `/api/users/:id/toggle`| PUT | ADMIN ONLY | Suspend or reinstate driver licence (403 for others). |
| `/api/officers` | POST | ADMIN ONLY | Commission new police/RTO officer (403 for others). |
| `/api/admin/broadcast` | POST | ADMIN ONLY | Broadcast high-priority highway advisory. |

---

## 5. AI-Assisted Decision Support Principle

> **LEGAL NOTICE**: TRAFIX is an analytical decision-support and operational workflow platform.
> AI-assisted risk indicators, ANPR detections, and priority suggestions display:
> *"AI-generated insight — authorized officer review required. AI does not independently issue legal enforcement, arrests, fines, or licence suspensions."*
> Authorized officers retain statutory responsibility for final decisions under the Motor Vehicles Act, 1988.

---

## 6. Official Demo Credentials

Use these fictional demo credentials across the divided portal tabs:

| Role | Username / ID | Password | PIN / Passcode | Camera Scope |
|---|---|---|---|---|
| **Citizen Motorist** | `citizen@trafix.gov.in` | `Citizen@2026` | — | Personal Services |
| **Traffic Police Inspector** | `TR-INSP-5501` | `INSP@2026` | `5050` | Gantry 04 (Ring Road) |
| **Highway Patrol SI** | `TR-SI-4219` | `PATROL@2026` | `3030` | Outer Ring Road |
| **RTO Officer** | `RTO-DL-4402` | `RTO@2026` | `7788` | DL-01 Division |
| **Directorate Administrator** | `IPS-8801-CIP` | `Admin@2026` | `9090` | Pan-India National CIP |

---

## 7. Local Installation & Running

```bash
# 1. Clone repository
git clone https://github.com/Rohit-k2007/Taffic-Departement-.git
cd Taffic-Departement-

# 2. Configure Environment Variables
cp .env.example .env

# 3. Seed Database Records (PostgreSQL or local store)
node prisma/seed.js

# 4. Start TRAFIX Application Server
node server.js
```
The application will launch on **http://localhost:3000/**.

---

## 8. Automated Test Suite Execution

Run the 23-point verification suite verifying all role logins, RBAC barriers, and CRUD workflows:
```bash
node scratch/verify_trafix_system.js
```

---

## 9. Vercel Production Deployment

1. Set the following environment variables in the Vercel Dashboard:
   - `DATABASE_URL`: Connection string for external PostgreSQL (e.g., Supabase, Neon, AWS RDS).
   - `AUTH_SECRET`: Strong 32-character secret key.
   - `NEXT_PUBLIC_MAP_PROVIDER`: `OPEN_STREET_MAP`
2. Deploy directly via Vercel Git integration or:
   ```bash
   vercel --prod
   ```
The application includes `vercel.json` and `api/index.js` configured for seamless serverless routing.
