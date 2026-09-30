/**
 * TRAFIX - Indian Vehicle Intelligence & National RTO Master Directory
 * Ministry of Road Transport & Highways (MoRTH) / VAHAN & Parivahan Standard
 *
 * Flowchart Implementation:
 * Input (e.g. RJ54CK4706)
 *       ↓
 * Regex Parser: /^([A-Z]{2})(\d{1,2})([A-Z]{1,3})(\d{1,4})$/
 *       ↓
 * RJ | 54 | CK | 4706
 *       ↓
 * RJ → Rajasthan
 *       ↓
 * 54 → Search CURRENT RTO MASTER
 *       ↓
 * Exact match?
 *   YES → Show RTO + District → Government Services
 *   NO  → "RTO code not verified"
 *
 * Data Hierarchy:
 * states
 *  └── rto_offices
 *       └── registration_series
 *            └── government_services
 */

const defaultGovServices = [
  {
    id: "vahan",
    name: "VAHAN Vehicle Services",
    subtitle: "Vehicle Services",
    desc: "National Vehicle Register, RC Status, Technical Specs & Ownership",
    action: "lookup_rc",
    icon: "car",
    color: "#0284c7"
  },
  {
    id: "echallan",
    name: "e-Challan Traffic Challan",
    subtitle: "Traffic Challan",
    desc: "Pending Motor Vehicles Act Citations, Photo Evidence & UPI Settlement",
    action: "pay_challan",
    icon: "receipt",
    color: "#b45309"
  },
  {
    id: "state_portal",
    name: "State Transport Portal",
    subtitle: "Transport Portal",
    desc: "State Government Transport Commissionerate Official Parivahan Gateway",
    action: "external_portal",
    icon: "landmark",
    color: "#059669"
  },
  {
    id: "rc_services",
    name: "RC / Vehicle Services",
    subtitle: "Vehicle Services",
    desc: "Ownership Transfer, Address Change, Duplicate RC & Fitness Certificate",
    action: "apply_rto",
    icon: "file-check",
    color: "#7c3aed"
  }
];

const rtoMaster = {
  RJ: {
    state: "Rajasthan",
    portalUrl: "https://transport.rajasthan.gov.in",
    offices: {
      "01": { district: "Ajmer", authority: "RTO & DTO, Ajmer", registration_series: ["AB", "AC", "AD", "SA", "SB"] },
      "02": { district: "Alwar", authority: "RTO & DTO, Alwar", registration_series: ["AA", "AB", "AC", "CA"] },
      "03": { district: "Banswara", authority: "DTO Banswara", registration_series: ["AA", "AB", "AC"] },
      "04": { district: "Barmer", authority: "DTO Barmer", registration_series: ["AA", "AB", "AC"] },
      "05": { district: "Bharatpur", authority: "DTO Bharatpur", registration_series: ["AA", "AB", "AC"] },
      "06": { district: "Bhilwara", authority: "DTO Bhilwara", registration_series: ["AA", "AB", "AC"] },
      "07": { district: "Bikaner", authority: "RTO Bikaner", registration_series: ["AA", "AB", "AC"] },
      "08": { district: "Bundi", authority: "DTO Bundi", registration_series: ["AA", "AB"] },
      "09": { district: "Chittorgarh", authority: "DTO Chittorgarh", registration_series: ["AA", "AB", "AC"] },
      "10": { district: "Churu", authority: "DTO Churu", registration_series: ["AA", "AB"] },
      "11": { district: "Dholpur", authority: "DTO Dholpur", registration_series: ["AA", "AB"] },
      "12": { district: "Dungarpur", authority: "DTO Dungarpur", registration_series: ["AA", "AB"] },
      "13": { district: "Sri Ganganagar", authority: "DTO Sri Ganganagar", registration_series: ["AA", "AB", "AC"] },
      "14": { district: "Jaipur South", authority: "RTO, ARTO & DTO Jaipur South", registration_series: ["AB", "AC", "AD", "AE", "CK", "CP", "DA", "DB", "SA", "SB"] },
      "15": { district: "Jaisalmer", authority: "DTO Jaisalmer", registration_series: ["AA", "AB"] },
      "16": { district: "Jalore", authority: "DTO Jalore", registration_series: ["AA", "AB"] },
      "17": { district: "Jhalawar", authority: "DTO Jhalawar", registration_series: ["AA", "AB"] },
      "18": { district: "Jhunjhunu", authority: "DTO Jhunjhunu", registration_series: ["AA", "AB", "AC"] },
      "19": { district: "Jodhpur", authority: "RTO Jodhpur", registration_series: ["AA", "AB", "AC", "AD", "SA", "SB"] },
      "20": { district: "Kota", authority: "RTO Kota", registration_series: ["AA", "AB", "AC", "AD"] },
      "21": { district: "Nagaur", authority: "DTO Nagaur", registration_series: ["AA", "AB"] },
      "22": { district: "Pali", authority: "DTO Pali", registration_series: ["AA", "AB"] },
      "23": { district: "Sikar", authority: "DTO Sikar", registration_series: ["AA", "AB", "AC"] },
      "24": { district: "Sirohi", authority: "DTO Sirohi", registration_series: ["AA", "AB"] },
      "25": { district: "Sawai Madhopur", authority: "DTO Sawai Madhopur", registration_series: ["AA", "AB"] },
      "26": { district: "Tonk", authority: "DTO Tonk", registration_series: ["AA", "AB"] },
      "27": { district: "Udaipur", authority: "RTO Udaipur", registration_series: ["AA", "AB", "AC", "AD"] },
      "28": { district: "Baran", authority: "DTO Baran", registration_series: ["AA", "AB"] },
      "29": { district: "Dausa", authority: "DTO Dausa", registration_series: ["AA", "AB"] },
      "30": { district: "Rajsamand", authority: "DTO Rajsamand", registration_series: ["AA", "AB"] },
      "31": { district: "Hanumangarh", authority: "DTO Hanumangarh", registration_series: ["AA", "AB"] },
      "32": { district: "Kotputli", authority: "DTO Kotputli", registration_series: ["AA", "AB"] },
      "33": { district: "Ramganj Mandi", authority: "DTO Ramganj Mandi", registration_series: ["AA", "AB"] },
      "34": { district: "Karauli", authority: "DTO Karauli", registration_series: ["AA", "AB"] },
      "35": { district: "Pratapgarh", authority: "DTO Pratapgarh", registration_series: ["AA", "AB"] },
      "36": { district: "Beawar", authority: "DTO Beawar", registration_series: ["AA", "AB"] },
      "45": { district: "Jaipur North", authority: "RTO Jaipur North", registration_series: ["AA", "AB", "AC", "AD", "AE"] },
      "54": { district: "Pipar City / Jodhpur", authority: "DTO Pipar City, Jodhpur Division", registration_series: ["CA", "CB", "CK", "CL", "AA", "AB"] }
    }
  },
  DL: {
    state: "Delhi NCT",
    portalUrl: "https://transport.delhi.gov.in",
    offices: {
      "01": { district: "North Delhi", authority: "RTO Mall Road (Civil Lines)", registration_series: ["AB", "AC", "AD", "CK", "S", "C"] },
      "02": { district: "New Delhi", authority: "RTO IP Estate (Central Secretariat)", registration_series: ["A", "B", "C", "AB"] },
      "03": { district: "South Delhi", authority: "RTO Sheikh Sarai", registration_series: ["A", "B", "C", "S", "SB"] },
      "04": { district: "West Delhi", authority: "RTO Janakpuri", registration_series: ["A", "B", "C", "E", "EA"] },
      "05": { district: "North East Delhi", authority: "RTO Loni Road", registration_series: ["A", "B", "C"] },
      "06": { district: "Central Delhi", authority: "RTO Sarai Kale Khan", registration_series: ["A", "B", "C", "D"] },
      "07": { district: "East Delhi", authority: "RTO Mayur Vihar", registration_series: ["A", "B", "C"] },
      "08": { district: "North West Delhi", authority: "RTO Wazirpur", registration_series: ["A", "B", "C"] },
      "09": { district: "South West Delhi", authority: "RTO Palam", registration_series: ["A", "B", "C"] },
      "10": { district: "West Delhi II", authority: "RTO Raja Garden", registration_series: ["A", "B", "C"] },
      "11": { district: "North Delhi II", authority: "RTO Rohini", registration_series: ["A", "B", "C"] },
      "12": { district: "South West Delhi II", authority: "RTO Vasant Vihar", registration_series: ["A", "B", "C"] }
    }
  },
  MH: {
    state: "Maharashtra",
    portalUrl: "https://transport.maharashtra.gov.in",
    offices: {
      "01": { district: "Mumbai South", authority: "RTO Tardeo, Mumbai Central", registration_series: ["AA", "AB", "AC"] },
      "02": { district: "Mumbai West", authority: "RTO Andheri, Mumbai Suburban", registration_series: ["AA", "AB", "AC"] },
      "03": { district: "Mumbai East", authority: "RTO Wadala, Mumbai", registration_series: ["AA", "AB"] },
      "04": { district: "Thane", authority: "RTO Thane", registration_series: ["AA", "AB", "AC"] },
      "12": { district: "Pune", authority: "RTO Pune Metropolitan", registration_series: ["TX", "TY", "AA", "AB", "AC"] },
      "14": { district: "Pimpri-Chinchwad", authority: "RTO PCMC Pune", registration_series: ["AA", "AB"] },
      "31": { district: "Nagpur", authority: "RTO Nagpur City", registration_series: ["AA", "AB"] },
      "43": { district: "Navi Mumbai", authority: "RTO Vashi, Navi Mumbai", registration_series: ["AA", "AB"] },
      "47": { district: "Mumbai North", authority: "RTO Borivali", registration_series: ["AA", "AB"] }
    }
  },
  UP: {
    state: "Uttar Pradesh",
    portalUrl: "https://uptransport.upsdc.gov.in",
    offices: {
      "14": { district: "Ghaziabad", authority: "RTO Ghaziabad", registration_series: ["AA", "AB", "AC", "BZ"] },
      "16": { district: "Gautam Buddha Nagar", authority: "RTO Noida / Greater Noida", registration_series: ["BZ", "CA", "CB", "AA"] },
      "32": { district: "Lucknow", authority: "RTO Transport Nagar, Lucknow", registration_series: ["AA", "AB", "AC", "AD"] },
      "78": { district: "Kanpur Nagar", authority: "RTO Kanpur", registration_series: ["AA", "AB"] },
      "80": { district: "Agra", authority: "RTO Agra", registration_series: ["AA", "AB"] },
      "65": { district: "Varanasi", authority: "RTO Varanasi", registration_series: ["AA", "AB"] }
    }
  },
  KA: {
    state: "Karnataka",
    portalUrl: "https://transport.karnataka.gov.in",
    offices: {
      "01": { district: "Bengaluru Central", authority: "RTO Koramangala", registration_series: ["AA", "AB", "AC"] },
      "02": { district: "Bengaluru West", authority: "RTO Rajajinagar", registration_series: ["AA", "AB"] },
      "03": { district: "Bengaluru East", authority: "RTO Indiranagar", registration_series: ["AA", "AB"] },
      "04": { district: "Bengaluru North", authority: "RTO Yeshwanthpur", registration_series: ["E", "EA", "EB", "AA"] },
      "05": { district: "Bengaluru South", authority: "RTO Jayanagar", registration_series: ["AA", "AB"] },
      "51": { district: "Bengaluru Electronic City", authority: "RTO Electronic City", registration_series: ["AA", "AB"] },
      "53": { district: "Bengaluru Whitefield", authority: "RTO K.R. Puram", registration_series: ["AA", "AB"] }
    }
  },
  HR: {
    state: "Haryana",
    portalUrl: "https://haryanatransport.gov.in",
    offices: {
      "26": { district: "Gurugram North", authority: "RTO Gurugram", registration_series: ["DK", "DL", "AA", "AB"] },
      "55": { district: "Gurugram South", authority: "RTO Gurugram Sub-Division", registration_series: ["AA", "AB"] },
      "51": { district: "Faridabad", authority: "RTO Faridabad", registration_series: ["AA", "AB"] },
      "98": { district: "Badshahpur", authority: "RTO Badshahpur", registration_series: ["AA", "AB"] }
    }
  },
  GJ: {
    state: "Gujarat",
    portalUrl: "https://cot.gujarat.gov.in",
    offices: {
      "01": { district: "Ahmedabad City", authority: "RTO Subhash Bridge, Ahmedabad", registration_series: ["AA", "AB", "AC"] },
      "05": { district: "Surat", authority: "RTO Surat", registration_series: ["AA", "AB"] },
      "06": { district: "Vadodara", authority: "RTO Vadodara", registration_series: ["AA", "AB"] },
      "18": { district: "Gandhinagar", authority: "RTO Gandhinagar", registration_series: ["AA", "AB"] },
      "27": { district: "Ahmedabad East", authority: "RTO Vastral, Ahmedabad", registration_series: ["AA", "AB"] }
    }
  }
};

/**
 * Parses Indian Vehicle Number according to the exact flowchart:
 * Input (e.g. RJ54CK4706)
 *  -> Regex Parser: ^([A-Z]{2})(\d{1,2})([A-Z]{1,3})(\d{1,4})$
 *  -> State Code (RJ) -> Search in state list (Rajasthan)
 *  -> RTO Code (54) -> Search in CURRENT RTO MASTER
 *  -> Exact match?
 *       YES: Show RTO + District + Government Services
 *       NO:  "RTO code not verified"
 */
function parseVehicleNumber(input) {
  if (!input || typeof input !== "string") {
    return {
      valid: false,
      message: "Vehicle registration number is required"
    };
  }

  const value = input
    .toUpperCase()
    .replace(/[\s-]/g, "");

  const pattern = /^([A-Z]{2})(\d{1,2})([A-Z]{1,3})(\d{1,4})$/;
  const match = value.match(pattern);

  if (!match) {
    // Also support Bharat Series (YY BH #### XX, e.g. 22BH1234AA)
    const bhPattern = /^(\d{2})BH(\d{1,4})([A-Z]{1,2})$/;
    const bhMatch = value.match(bhPattern);

    if (bhMatch) {
      const regYear = bhMatch[1];
      const number = bhMatch[2].padStart(4, "0");
      const series = bhMatch[3];
      return {
        valid: true,
        rtoMatched: true,
        format: "BHARAT_SERIES",
        stateCode: "BH",
        state: "Pan-India Bharat Series",
        rtoCode: "BH",
        district: "Central Transport Directorate (MoRTH)",
        authority: "Ministry of Road Transport & Highways, Central Registry",
        series: series,
        number: number,
        registrationNumber: value,
        formattedPlate: `${regYear}-BH-${number}-${series}`,
        governmentServices: defaultGovServices
      };
    }

    return {
      valid: false,
      message: "Invalid vehicle registration format. Expected format: RJ54CK4706 or DL01AB4921"
    };
  }

  const stateCode = match[1];
  const rtoCode = match[2].padStart(2, "0");
  const series = match[3];
  const number = match[4];

  const stateObj = rtoMaster[stateCode];
  const stateName = stateObj ? stateObj.state : stateCode;

  // Search CURRENT RTO MASTER for exact match
  if (stateObj && stateObj.offices && stateObj.offices[rtoCode]) {
    const office = stateObj.offices[rtoCode];
    const services = defaultGovServices.map(srv => {
      if (srv.id === "state_portal" && stateObj.portalUrl) {
        return Object.assign({}, srv, { url: stateObj.portalUrl, desc: `${stateName} State Transport Portal` });
      }
      return srv;
    });

    return {
      valid: true,
      rtoMatched: true,
      stateCode: stateCode,
      state: stateName,
      rtoCode: rtoCode,
      district: office.district,
      authority: office.authority,
      series: series,
      number: number,
      registrationNumber: value,
      formattedPlate: `${stateCode}-${rtoCode}-${series}-${number}`,
      governmentServices: services,
      statusMessage: "Verified Active Registering Authority"
    };
  } else {
    // Exact match failed -> "RTO code not verified"
    return {
      valid: true,
      rtoMatched: false,
      stateCode: stateCode,
      state: stateName,
      rtoCode: rtoCode,
      district: "RTO code not verified",
      authority: "RTO code not verified in Registry",
      series: series,
      number: number,
      registrationNumber: value,
      formattedPlate: `${stateCode}-${rtoCode}-${series}-${number}`,
      governmentServices: defaultGovServices,
      statusMessage: "RTO code not verified"
    };
  }
}

/**
 * Returns complete list of states and their RTO offices
 */
function getRtoMasterCatalog() {
  return rtoMaster;
}

/**
 * Returns array of states for authority selection
 */
function getStatesList() {
  return Object.keys(rtoMaster).map(code => ({
    code: code,
    name: rtoMaster[code].state,
    portalUrl: rtoMaster[code].portalUrl
  }));
}

/**
 * Returns array of RTO offices for a given state
 */
function getRtosByState(stateCode) {
  if (!stateCode || !rtoMaster[stateCode]) return [];
  const offices = rtoMaster[stateCode].offices || {};
  return Object.keys(offices).map(rtoCode => ({
    rtoCode: rtoCode,
    district: offices[rtoCode].district,
    authority: offices[rtoCode].authority,
    series: offices[rtoCode].registration_series || []
  }));
}

/**
 * Returns registration series list for specific RTO
 */
function getSeriesByRto(stateCode, rtoCode) {
  const code = (rtoCode || "").padStart(2, "0");
  if (!stateCode || !rtoMaster[stateCode] || !rtoMaster[stateCode].offices[code]) return [];
  return rtoMaster[stateCode].offices[code].registration_series || [];
}

// Module export for Node.js
if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    rtoMaster,
    parseVehicleNumber,
    getRtoMasterCatalog,
    getStatesList,
    getRtosByState,
    getSeriesByRto,
    defaultGovServices
  };
}

// Global window export for Browser
if (typeof window !== "undefined") {
  window.rtoMaster = rtoMaster;
  window.parseVehicleNumber = parseVehicleNumber;
  window.getRtoMasterCatalog = getRtoMasterCatalog;
  window.getStatesList = getStatesList;
  window.getRtosByState = getRtosByState;
  window.getSeriesByRto = getSeriesByRto;
  window.defaultGovServices = defaultGovServices;
}

