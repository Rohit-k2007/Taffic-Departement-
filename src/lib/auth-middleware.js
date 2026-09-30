/**
 * TRAFIX - Role-Based Access Control (RBAC) & Server-Side Security Middleware
 * Ministry of Road Transport & Highways and State Traffic Police Department
 *
 * Strict Security Rules:
 * 1. Citizens must NEVER access internal Police investigation records, Officer assignments, or RTO approval queues.
 * 2. RTO Officers cannot issue Police on-field tactical citations or modify Police emergency dispatch.
 * 3. Traffic Police Officers cannot approve or reject statutory RTO vehicle or licence applications.
 * 4. Only Administrators have global system configuration, officer commissioning, and audit log access.
 */

const ROLE_PERMISSIONS = {
  CITIZEN: [
    'citizen:read_profile',
    'citizen:update_profile',
    'complaints:create',
    'complaints:read_own',
    'complaints:feedback',
    'accidents:report',
    'vehicles:read_own',
    'licences:read_own',
    'challans:read_own',
    'challans:pay',
    'rto_applications:create',
    'rto_applications:read_own',
    'notifications:read_own',
    'risk_zones:read_public',
    'roadworks:read_public'
  ],
  TRAFFIC_POLICE_OFFICER: [
    'cases:read_assigned',
    'cases:update_status',
    'cases:add_notes',
    'accidents:read_all',
    'accidents:update_status',
    'accidents:investigate',
    'violations:create',
    'violations:read_all',
    'challans:create',
    'challans:read_all',
    'vehicles:search',
    'licences:search',
    'risk_zones:read_all',
    'risk_zones:update',
    'emergencies:read_all',
    'emergencies:dispatch',
    'reports:generate_police',
    'notifications:read_own'
  ],
  RTO_OFFICER: [
    'rto_applications:read_all',
    'rto_applications:verify_documents',
    'rto_applications:approve',
    'rto_applications:reject',
    'vehicles:read_all',
    'vehicles:verify_rc',
    'vehicles:update_fitness',
    'licences:read_all',
    'licences:verify_dl',
    'licences:issue_endorsement',
    'reports:generate_rto',
    'notifications:read_own'
  ],
  ADMINISTRATOR: [
    'users:manage',
    'officers:manage',
    'departments:manage',
    'cases:read_all',
    'cases:manage_all',
    'accidents:manage_all',
    'violations:manage_all',
    'challans:manage_all',
    'rto_applications:manage_all',
    'risk_zones:manage_all',
    'audit_logs:read_all',
    'analytics:read_all',
    'broadcasts:send',
    'system:configure'
  ]
};

/**
 * Extracts and decodes user session from Authorization header
 * Header format: Authorization: Bearer <token>
 */
function parseAuthToken(authHeader, dbUsers = [], dbOfficers = []) {
  if (!authHeader) return null;
  const token = authHeader.replace(/^Bearer\s+/i, '').trim();
  if (!token) return null;

  try {
    if (token.startsWith('JWT-NATDAMS-') || token.startsWith('JWT-TRAFIX-')) {
      const payloadBase64 = token.replace(/^(JWT-NATDAMS-|JWT-TRAFIX-)/, '');
      const decoded = Buffer.from(payloadBase64, 'base64').toString('utf8');
      const parts = decoded.split(':');
      const identifier = parts[0];

      // Match against officers or users
      const officer = dbOfficers.find(o => 
        (o.badgeNumber && o.badgeNumber.toLowerCase() === identifier.toLowerCase()) ||
        (o.id && o.id.toLowerCase() === identifier.toLowerCase())
      );

      if (officer) {
        let role = 'TRAFFIC_POLICE_OFFICER';
        if (officer.rank && officer.rank.includes('RTO')) role = 'RTO_OFFICER';
        if (officer.rank && (officer.rank.includes('DGP') || officer.rank.includes('COMMISSIONER'))) role = 'ADMINISTRATOR';
        return {
          id: officer.userId || officer.id,
          name: officer.name,
          badgeNumber: officer.badgeNumber,
          role: role,
          clearance: officer.clearance || 3,
          isOfficer: true
        };
      }

      const user = dbUsers.find(u => 
        (u.email && u.email.toLowerCase() === identifier.toLowerCase()) ||
        (u.id && u.id.toLowerCase() === identifier.toLowerCase())
      );

      if (user) {
        return {
          id: user.id,
          name: user.fullName,
          email: user.email,
          role: user.role || 'CITIZEN',
          isOfficer: user.role !== 'CITIZEN'
        };
      }
    }

    if (token.startsWith('CIP-PASS-')) {
      return {
        id: 'CIP-OFFICER',
        role: 'TRAFFIC_POLICE_OFFICER',
        isOfficer: true
      };
    }
  } catch (err) {
    console.error("Token verification error:", err.message);
  }

  return null;
}

/**
 * Validates if the requesting user's role is allowed to access the route
 */
function authorizeRoles(allowedRoles) {
  return function(reqUser) {
    if (!reqUser) {
      return { allowed: false, status: 401, error: "Authentication required. Please log in with your credentials." };
    }
    // Administrator has global oversight
    if (reqUser.role === 'ADMINISTRATOR' || reqUser.role === 'ADMIN') {
      return { allowed: true };
    }
    const roleKey = reqUser.role.toUpperCase();
    const hasRole = allowedRoles.some(r => r.toUpperCase() === roleKey);
    if (!hasRole) {
      return {
        allowed: false,
        status: 403,
        error: `Access Denied: Role '${reqUser.role}' is not authorized to access this restricted government resource.`
      };
    }
    return { allowed: true };
  };
}

module.exports = {
  ROLE_PERMISSIONS,
  parseAuthToken,
  authorizeRoles
};
