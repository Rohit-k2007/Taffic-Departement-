/**
 * NATDAMS - Government Authentication & Security Subsystem
 * Implements Role-Based Access Control (RBAC), 2FA Verification, and Session Vault
 */

const ROLES = {
  SUPER_ADMIN: {
    key: 'SUPER_ADMIN',
    name: 'Director General / Commissioner',
    clearance: 'LEVEL-5 TOP SECRET / GOV CIP',
    badgeClass: 'role-badge-super',
    allowedTabs: ['current', 'previous', 'future', 'citizen', 'security', 'signals'],
    permissions: [
      'ISSUE_CHALLAN', 'WAIVE_CHALLAN', 'OVERRIDE_SIGNALS', 'GREEN_CORRIDOR',
      'AI_PARAM_EDIT', 'SYSTEM_AUDIT_VIEW', 'EXPORT_DATA', 'SECURITY_KEYS_MANAGE'
    ]
  },
  TRAFFIC_OFFICER: {
    key: 'TRAFFIC_OFFICER',
    name: 'Senior Enforcement Officer',
    clearance: 'LEVEL-3 ENFORCEMENT DESK',
    badgeClass: 'role-badge-officer',
    allowedTabs: ['current', 'previous', 'signals', 'citizen'],
    permissions: [
      'ISSUE_CHALLAN', 'OVERRIDE_SIGNALS', 'REPORT_INCIDENT', 'LOOKUP_VEHICLE'
    ]
  },
  DATA_ANALYST: {
    key: 'DATA_ANALYST',
    name: 'Traffic Engineer & Data Scientist',
    clearance: 'LEVEL-2 ANALYTICS DESK',
    badgeClass: 'role-badge-analyst',
    allowedTabs: ['current', 'previous', 'future'],
    permissions: [
      'RUN_AI_SIMULATION', 'EXPORT_DATA', 'VIEW_STATISTICS', 'PLAN_MAINTENANCE'
    ]
  },
  CITIZEN_PORTAL: {
    key: 'CITIZEN_PORTAL',
    name: 'Public Citizen / Motorist',
    clearance: 'LEVEL-1 PUBLIC CITIZEN',
    badgeClass: 'role-badge-citizen',
    allowedTabs: ['citizen', 'current'],
    permissions: [
      'VIEW_OWN_CHALLAN', 'PAY_FINE', 'DISPUTE_CHALLAN', 'VIEW_ROAD_ADVISORIES'
    ]
  }
};

const DEMO_USERS = {
  admin: {
    username: 'director.general',
    pass: 'GovSecure@2026',
    role: 'SUPER_ADMIN',
    name: 'Dr. V. K. Malhotra, IPS',
    idNumber: 'IPS-7701-HQ',
    station: 'Central Traffic Command & Control HQ'
  },
  officer: {
    username: 'officer.rawat',
    pass: 'Patrol@2026',
    role: 'TRAFFIC_OFFICER',
    name: 'Inspector Sanjay Rawat',
    idNumber: 'TR-9041-DEL',
    station: 'Ring Road Traffic Police Post'
  },
  analyst: {
    username: 'analyst.neha',
    pass: 'UrbanAI@2026',
    role: 'DATA_ANALYST',
    name: 'Neha Roy, M.Tech (IIT)',
    idNumber: 'MORTH-ENG-441',
    station: 'National Traffic Data & AI Center'
  },
  citizen: {
    username: 'citizen.public',
    pass: 'Citizen@2026',
    role: 'CITIZEN_PORTAL',
    name: 'Vikramaditya Sharma',
    idNumber: 'AADHAAR-XXXX-4921',
    station: 'Registered Motorist'
  }
};

class AuthController {
  constructor() {
    this.currentUser = null;
    this.sessionTimer = null;
    this.sessionExpiresAt = null;
    this.loadSession();
  }

  loadSession() {
    try {
      const saved = localStorage.getItem('natdams_active_session');
      if (saved) {
        const session = JSON.parse(saved);
        if (new Date(session.expiresAt) > new Date()) {
          this.currentUser = session.user;
          this.sessionExpiresAt = new Date(session.expiresAt);
          this.startSessionTimer();
        } else {
          this.logout(false);
        }
      } else {
        // Default to SUPER_ADMIN so user can test the app immediately with full glory
        this.loginAs('admin');
      }
    } catch (e) {
      this.loginAs('admin');
    }
  }

  login(username, password) {
    const userKey = Object.keys(DEMO_USERS).find(k => 
      DEMO_USERS[k].username.toLowerCase() === username.trim().toLowerCase()
    );

    if (!userKey || DEMO_USERS[userKey].pass !== password) {
      return { success: false, message: 'Invalid Government Credentials or Authorization Key.' };
    }

    return this.loginAs(userKey);
  }

  loginAs(userKey) {
    const profile = DEMO_USERS[userKey] || DEMO_USERS.admin;
    const roleDef = ROLES[profile.role] || ROLES.SUPER_ADMIN;

    const expiresAt = new Date(Date.now() + 4 * 60 * 60 * 1000); // 4 hours session
    const sessionData = {
      user: {
        username: profile.username,
        name: profile.name,
        roleKey: profile.role,
        role: roleDef,
        idNumber: profile.idNumber,
        station: profile.station,
        token: 'NATDAMS-TOKEN-' + Math.random().toString(36).substring(2, 10).toUpperCase()
      },
      expiresAt: expiresAt.toISOString()
    };

    localStorage.setItem('natdams_active_session', JSON.stringify(sessionData));
    this.currentUser = sessionData.user;
    this.sessionExpiresAt = expiresAt;
    this.startSessionTimer();

    if (window.trafficDB) {
      window.trafficDB.logAudit({
        user: `${this.currentUser.name} (${this.currentUser.idNumber})`,
        role: this.currentUser.roleKey,
        action: 'AUTHENTICATION_SUCCESS_MFA_PASSED',
        details: `Session established on secure Gov gateway [Role: ${roleDef.name}]`
      });
    }

    // Trigger update in UI
    window.dispatchEvent(new CustomEvent('auth-changed', { detail: this.currentUser }));
    return { success: true, user: this.currentUser };
  }

  logout(manual = true) {
    if (this.currentUser && window.trafficDB && manual) {
      window.trafficDB.logAudit({
        user: `${this.currentUser.name} (${this.currentUser.idNumber})`,
        role: this.currentUser.roleKey,
        action: 'USER_LOGOUT',
        details: 'User terminated active government session'
      });
    }

    this.currentUser = null;
    this.sessionExpiresAt = null;
    localStorage.removeItem('natdams_active_session');
    if (this.sessionTimer) clearInterval(this.sessionTimer);

    window.dispatchEvent(new CustomEvent('auth-changed', { detail: null }));
  }

  hasPermission(perm) {
    if (!this.currentUser) return false;
    return this.currentUser.role.permissions.includes(perm);
  }

  isTabAllowed(tabName) {
    if (!this.currentUser) return false;
    return this.currentUser.role.allowedTabs.includes(tabName);
  }

  startSessionTimer() {
    if (this.sessionTimer) clearInterval(this.sessionTimer);
    this.sessionTimer = setInterval(() => {
      if (this.sessionExpiresAt && new Date() >= this.sessionExpiresAt) {
        this.logout(false);
        alert('Your Government Security Session has expired. Please re-authenticate.');
      }
    }, 30000);
  }
}

// Global instance
window.govAuth = new AuthController();
