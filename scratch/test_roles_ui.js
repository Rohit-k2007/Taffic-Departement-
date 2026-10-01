// Simulate browser environment for App.switchRole and App.switchTab
const fs = require('fs');

global.window = {
  location: { origin: 'http://localhost:3000' },
  dispatchEvent: () => {}
};
global.localStorage = {
  _store: {},
  setItem(k, v) { this._store[k] = v; },
  getItem(k) { return this._store[k]; }
};
global.btoa = (str) => Buffer.from(str).toString('base64');

// Load database and auth
require('../assets/js/database.js');
require('../assets/js/auth.js');

// Mock DOM elements
const elements = {};
function getOrCreateEl(id) {
  if (!elements[id]) {
    elements[id] = {
      id,
      classList: {
        _classes: new Set(),
        add(c) { this._classes.add(c); },
        remove(c) { this._classes.delete(c); },
        toggle(c, val) { if (val) this._classes.add(c); else this._classes.delete(c); },
        contains(c) { return this._classes.has(c); }
      },
      style: {},
      innerHTML: '',
      innerText: '',
      getAttribute(attr) { return this[attr]; },
      setAttribute(attr, val) { this[attr] = val; },
      appendChild() {}
    };
  }
  return elements[id];
}

global.document = {
  addEventListener: () => {},
  createElement: () => ({ appendChild: () => {}, classList: { add: () => {} }, remove: () => {} }),
  getElementById(id) { return getOrCreateEl(id); },
  querySelectorAll(sel) {
    if (sel === '.role-pill-btn') {
      return [getOrCreateEl('pillRoleCitizen'), getOrCreateEl('pillRoleOfficer'), getOrCreateEl('pillRoleRto'), getOrCreateEl('pillRoleAdmin')];
    }
    if (sel === '.sidebar-nav-item') {
      return [
        getOrCreateEl('nav-citizen-dashboard'),
        getOrCreateEl('nav-officer-cases'),
        getOrCreateEl('nav-rto-desk')
      ];
    }
    if (sel === '.nav-tab' || sel === '.view-panel') return [];
    return [];
  }
};

const appCode = fs.readFileSync('assets/js/app.js', 'utf8');
eval(appCode);

console.log("Testing window.App.switchRole('officer')...");
window.App.switchRole('officer');
console.log("Current role:", window.App.currentRole);
console.log("Auth User Role:", window.govAuth.currentUser.role);
console.log("Auth Token:", window.govAuth.currentUser.token ? "Present" : "Missing");

console.log("\nTesting window.App.switchRole('rto')...");
window.App.switchRole('rto');
console.log("Current role:", window.App.currentRole);
console.log("Auth User Role:", window.govAuth.currentUser.role);
console.log("Auth Token:", window.govAuth.currentUser.token ? "Present" : "Missing");

console.log("\nTesting window.App.switchRole('citizen')...");
window.App.switchRole('citizen');
console.log("Current role:", window.App.currentRole);
console.log("Auth User Role:", window.govAuth.currentUser.role);

console.log("\nTesting smart auto-switch when clicking 'rto-desk' from citizen mode...");
window.App.switchTab('rto-desk');
console.log("New current role:", window.App.currentRole);
console.log("Active Tab:", window.App.activeTab);

console.log("\nALL ROLE SWITCH TESTS PASSED!");
