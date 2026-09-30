-- =========================================================================
-- TRAFIX - Advanced Traffic Police & RTO Management Platform
-- Initial Prisma Migration for PostgreSQL
-- =========================================================================

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('CITIZEN', 'TRAFFIC_POLICE_OFFICER', 'RTO_OFFICER', 'ADMINISTRATOR');
CREATE TYPE "AccountStatus" AS ENUM ('ACTIVE', 'SUSPENDED', 'REVOKED', 'PENDING_VERIFICATION');
CREATE TYPE "DepartmentType" AS ENUM ('TRAFFIC_POLICE', 'RTO', 'TRANSPORT_MINISTRY', 'HIGHWAY_PATROL');
CREATE TYPE "VehicleType" AS ENUM ('TWO_WHEELER', 'FOUR_WHEELER', 'COMMERCIAL_TRUCK', 'BUS', 'AUTO_RICKSHAW', 'ELECTRIC_VEHICLE');
CREATE TYPE "LicenceType" AS ENUM ('MCWG', 'LMV', 'HMV', 'TRANS', 'COMMERCIAL');
CREATE TYPE "LicenceStatus" AS ENUM ('ACTIVE', 'EXPIRED', 'SUSPENDED', 'UNDER_VERIFICATION', 'REVOKED');
CREATE TYPE "ComplaintPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');
CREATE TYPE "ComplaintStatus" AS ENUM ('SUBMITTED', 'UNDER_REVIEW', 'ASSIGNED', 'INVESTIGATION', 'ACTION_TAKEN', 'RESOLVED', 'CLOSED', 'REJECTED');
CREATE TYPE "AccidentSeverity" AS ENUM ('MINOR', 'MODERATE', 'SERIOUS', 'CRITICAL');
CREATE TYPE "AccidentStatus" AS ENUM ('REPORTED', 'PATROL_DISPATCHED', 'INVESTIGATION', 'RESOLVED', 'CLOSED');
CREATE TYPE "ViolationStatus" AS ENUM ('RECORDED', 'CHALLAN_ISSUED', 'DISMISSED', 'COURT_SUMMONS');
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'PAID', 'OVERDUE', 'CANCELLED');
CREATE TYPE "RiskLevel" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');
CREATE TYPE "RiskType" AS ENUM ('ACCIDENT_HOTSPOT', 'REPEATED_VIOLATIONS', 'CONGESTION', 'DANGEROUS_INTERSECTION', 'SCHOOL_ZONE', 'HIGHWAY_RISK', 'ROAD_CONDITION', 'OTHER');
CREATE TYPE "RtoApplicationType" AS ENUM ('NEW_REGISTRATION', 'OWNERSHIP_TRANSFER', 'LICENCE_APPLICATION', 'LICENCE_RENEWAL', 'ADDRESS_UPDATE', 'VEHICLE_DOCUMENT_UPDATE', 'FITNESS_CERTIFICATE');
CREATE TYPE "RtoApplicationStatus" AS ENUM ('SUBMITTED', 'UNDER_REVIEW', 'DOCUMENTS_VERIFIED', 'APPROVED', 'REJECTED');

-- CreateTable users
CREATE TABLE "users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "full_name" TEXT NOT NULL,
    "email" TEXT NOT NULL UNIQUE,
    "phone" TEXT NOT NULL UNIQUE,
    "password_hash" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'CITIZEN',
    "department_id" TEXT,
    "status" "AccountStatus" NOT NULL DEFAULT 'ACTIVE',
    "last_login" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable departments
CREATE TABLE "departments" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "type" "DepartmentType" NOT NULL,
    "district" TEXT NOT NULL,
    "state" TEXT NOT NULL DEFAULT 'DL',
    "office_address" TEXT NOT NULL,
    "contact_number" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable officers
CREATE TABLE "officers" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL UNIQUE,
    "employee_id" TEXT NOT NULL UNIQUE,
    "designation" TEXT NOT NULL,
    "rank" TEXT NOT NULL,
    "badge_number" TEXT NOT NULL UNIQUE,
    "camera_pin" TEXT,
    "department_id" TEXT NOT NULL,
    "clearance_level" INTEGER NOT NULL DEFAULT 3,
    "joining_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE'
);

-- CreateTable citizens
CREATE TABLE "citizens" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL UNIQUE,
    "aadhaar_masked" TEXT,
    "address" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "district" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "pincode" TEXT NOT NULL,
    "emergency_contact" TEXT NOT NULL,
    "kyc_status" TEXT NOT NULL DEFAULT 'DIGILOCKER_VERIFIED'
);

-- CreateTable vehicles
CREATE TABLE "vehicles" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "registration_number" TEXT NOT NULL UNIQUE,
    "owner_id" TEXT NOT NULL,
    "vehicle_type" "VehicleType" NOT NULL,
    "make" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "fuel_type" TEXT NOT NULL DEFAULT 'PETROL',
    "color" TEXT NOT NULL,
    "manufacture_year" INTEGER NOT NULL,
    "registration_date" TIMESTAMP(3) NOT NULL,
    "registration_expiry" TIMESTAMP(3) NOT NULL,
    "fitness_expiry" TIMESTAMP(3) NOT NULL,
    "insurance_expiry" TIMESTAMP(3) NOT NULL,
    "insurance_policy_no" TEXT,
    "puc_expiry" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable driving_licences
CREATE TABLE "driving_licences" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "citizen_id" TEXT NOT NULL,
    "licence_number" TEXT NOT NULL UNIQUE,
    "licence_type" "LicenceType" NOT NULL,
    "blood_group" TEXT,
    "issue_date" TIMESTAMP(3) NOT NULL,
    "expiry_date" TIMESTAMP(3) NOT NULL,
    "status" "LicenceStatus" NOT NULL DEFAULT 'ACTIVE',
    "issuing_rto" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable complaints
CREATE TABLE "complaints" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "complaint_number" TEXT NOT NULL UNIQUE,
    "citizen_id" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "priority" "ComplaintPriority" NOT NULL DEFAULT 'MEDIUM',
    "status" "ComplaintStatus" NOT NULL DEFAULT 'SUBMITTED',
    "rejection_reason" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "location_address" TEXT NOT NULL,
    "assigned_officer_id" TEXT,
    "investigation_notes" TEXT,
    "submitted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolved_at" TIMESTAMP(3)
);

-- CreateTable challans
CREATE TABLE "challans" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "challan_number" TEXT NOT NULL UNIQUE,
    "vehicle_id" TEXT,
    "driver_id" TEXT,
    "officer_id" TEXT NOT NULL,
    "violation_id" TEXT,
    "amount" DOUBLE PRECISION NOT NULL,
    "issue_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "due_date" TIMESTAMP(3) NOT NULL,
    "payment_status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "payment_reference" TEXT,
    "payment_mode" TEXT,
    "paid_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable evidence
CREATE TABLE "evidence" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "uploaded_by" TEXT NOT NULL,
    "case_type" TEXT NOT NULL,
    "case_id" TEXT NOT NULL,
    "file_name" TEXT NOT NULL,
    "file_type" TEXT NOT NULL,
    "file_url" TEXT NOT NULL,
    "file_hash" TEXT NOT NULL,
    "uploaded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "verified_by" TEXT,
    "verification_status" TEXT NOT NULL DEFAULT 'PENDING'
);

-- CreateTable risk_zones
CREATE TABLE "risk_zones" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "zone_name" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "location" TEXT NOT NULL,
    "risk_level" "RiskLevel" NOT NULL,
    "risk_type" "RiskType" NOT NULL,
    "incident_count" INTEGER NOT NULL DEFAULT 0,
    "description" TEXT NOT NULL,
    "suggested_action" TEXT,
    "assigned_officer_id" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable notifications
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "notification_type" TEXT NOT NULL,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable rto_applications
CREATE TABLE "rto_applications" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "application_number" TEXT NOT NULL UNIQUE,
    "citizen_id" TEXT NOT NULL,
    "application_type" "RtoApplicationType" NOT NULL,
    "vehicle_id" TEXT,
    "status" "RtoApplicationStatus" NOT NULL DEFAULT 'SUBMITTED',
    "submitted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewed_by" TEXT,
    "reviewed_at" TIMESTAMP(3),
    "remarks" TEXT
);

-- CreateTable audit_logs
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT,
    "action" TEXT NOT NULL,
    "entity_type" TEXT NOT NULL,
    "entity_id" TEXT NOT NULL,
    "old_value" TEXT,
    "new_value" TEXT,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "sha256_hash" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable feedback
CREATE TABLE "feedback" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "case_id" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Foreign Key Constraints
ALTER TABLE "users" ADD CONSTRAINT "users_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "departments"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "officers" ADD CONSTRAINT "officers_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "officers" ADD CONSTRAINT "officers_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "departments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "citizens" ADD CONSTRAINT "citizens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "vehicles" ADD CONSTRAINT "vehicles_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "citizens"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "driving_licences" ADD CONSTRAINT "driving_licences_citizen_id_fkey" FOREIGN KEY ("citizen_id") REFERENCES "citizens"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "complaints" ADD CONSTRAINT "complaints_citizen_id_fkey" FOREIGN KEY ("citizen_id") REFERENCES "citizens"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "complaints" ADD CONSTRAINT "complaints_assigned_officer_id_fkey" FOREIGN KEY ("assigned_officer_id") REFERENCES "officers"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "accidents" ADD CONSTRAINT "accidents_reported_by_fkey" FOREIGN KEY ("reported_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "accidents" ADD CONSTRAINT "accidents_assigned_officer_id_fkey" FOREIGN KEY ("assigned_officer_id") REFERENCES "officers"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "violations" ADD CONSTRAINT "violations_vehicle_id_fkey" FOREIGN KEY ("vehicle_id") REFERENCES "vehicles"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "violations" ADD CONSTRAINT "violations_officer_id_fkey" FOREIGN KEY ("officer_id") REFERENCES "officers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "challans" ADD CONSTRAINT "challans_vehicle_id_fkey" FOREIGN KEY ("vehicle_id") REFERENCES "vehicles"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "challans" ADD CONSTRAINT "challans_driver_id_fkey" FOREIGN KEY ("driver_id") REFERENCES "citizens"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "challans" ADD CONSTRAINT "challans_officer_id_fkey" FOREIGN KEY ("officer_id") REFERENCES "officers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "challans" ADD CONSTRAINT "challans_violation_id_fkey" FOREIGN KEY ("violation_id") REFERENCES "violations"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "evidence" ADD CONSTRAINT "evidence_uploaded_by_fkey" FOREIGN KEY ("uploaded_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "evidence" ADD CONSTRAINT "evidence_verified_by_fkey" FOREIGN KEY ("verified_by") REFERENCES "officers"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "risk_zones" ADD CONSTRAINT "risk_zones_assigned_officer_id_fkey" FOREIGN KEY ("assigned_officer_id") REFERENCES "officers"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "rto_applications" ADD CONSTRAINT "rto_applications_citizen_id_fkey" FOREIGN KEY ("citizen_id") REFERENCES "citizens"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "rto_applications" ADD CONSTRAINT "rto_applications_vehicle_id_fkey" FOREIGN KEY ("vehicle_id") REFERENCES "vehicles"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "rto_applications" ADD CONSTRAINT "rto_applications_reviewed_by_fkey" FOREIGN KEY ("reviewed_by") REFERENCES "officers"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "feedback" ADD CONSTRAINT "feedback_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Indexes
CREATE INDEX "users_role_idx" ON "users"("role");
CREATE INDEX "users_email_idx" ON "users"("email");
CREATE INDEX "users_phone_idx" ON "users"("phone");
CREATE INDEX "vehicles_registration_number_idx" ON "vehicles"("registration_number");
CREATE INDEX "driving_licences_licence_number_idx" ON "driving_licences"("licence_number");
CREATE INDEX "complaints_complaint_number_idx" ON "complaints"("complaint_number");
CREATE INDEX "complaints_status_idx" ON "complaints"("status");
CREATE INDEX "accidents_accident_number_idx" ON "accidents"("accident_number");
CREATE INDEX "violations_violation_number_idx" ON "violations"("violation_number");
CREATE INDEX "challans_challan_number_idx" ON "challans"("challan_number");
CREATE INDEX "challans_payment_status_idx" ON "challans"("payment_status");
CREATE INDEX "risk_zones_risk_level_idx" ON "risk_zones"("risk_level");
CREATE INDEX "rto_applications_application_number_idx" ON "rto_applications"("application_number");
