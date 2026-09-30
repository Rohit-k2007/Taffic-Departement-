/**
 * TRAFIX - Input Validation Schemas
 * Prevents invalid records, missing mandatory fields, and injection attacks.
 */

function validateComplaint(data) {
  const errors = [];
  if (!data.category || typeof data.category !== 'string') {
    errors.push('Category is required (e.g. Signal Failure, Reckless Driving, Illegal Parking).');
  }
  if (!data.description || data.description.trim().length < 5) {
    errors.push('Description must be at least 5 characters long.');
  }
  if (!data.locationAddress && !data.location) {
    errors.push('Incident location address is required.');
  }
  return {
    valid: errors.length === 0,
    errors
  };
}

function validateAccident(data) {
  const errors = [];
  if (!data.accidentType) {
    errors.push('Accident type is required (Collision, Pedestrian Hit, Rollover, etc.).');
  }
  if (!data.severity || !['MINOR', 'MODERATE', 'SERIOUS', 'CRITICAL', 'Minor', 'Moderate', 'Serious', 'Critical'].includes(data.severity)) {
    errors.push('Valid severity level is required (Minor, Moderate, Serious, Critical).');
  }
  if (!data.locationAddress && !data.location) {
    errors.push('Accident location is required for emergency dispatch.');
  }
  return {
    valid: errors.length === 0,
    errors
  };
}

const { parseVehicleNumber } = require('./vehicle-parser');

function validateViolation(data) {
  const errors = [];
  const plate = data.plateNumber || data.vehicleId || data.registrationNumber;
  if (!plate) {
    errors.push('Vehicle registration plate number is required.');
  } else {
    const parsed = parseVehicleNumber(plate);
    if (!parsed.valid) {
      errors.push(`Invalid vehicle registration plate '${plate}'. Must be a valid Indian registration (e.g. RJ14AB1234, DL01AB4921).`);
    }
  }
  if (!data.violationType) {
    errors.push('Violation type is required.');
  }
  if (data.fineAmount && (isNaN(Number(data.fineAmount)) || Number(data.fineAmount) < 100)) {
    errors.push('Fine amount must be a valid number of at least ₹100.');
  }
  return {
    valid: errors.length === 0,
    errors
  };
}

function validateRtoApplication(data) {
  const errors = [];
  if (!data.applicationType) {
    errors.push('Application type is required.');
  }
  if (!data.applicantName && !data.citizenId && !data.ownerName) {
    errors.push('Applicant identification is required.');
  }
  return {
    valid: errors.length === 0,
    errors
  };
}

module.exports = {
  validateComplaint,
  validateAccident,
  validateViolation,
  validateRtoApplication
};
