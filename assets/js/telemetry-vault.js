/**
 * NATDAMS - Pan-India Telemetry & Identity Vault
 * Provides 2,000,000+ Combinatorial Diverse Indian Owner Names,
 * Dynamic Police / NIC / CCTNS IP Address generation,
 * and Pan-India State & District Jurisdiction Corridors.
 */

(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.telemetryVault = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {

  const TITLES = ['', '', '', '', 'Dr. ', 'Prof. ', 'Col. ', 'Maj. ', 'Capt. ', 'Shri ', 'Smt. ', 'Er. '];

  const FIRST_NAMES = [
    // North
    'Aarav', 'Aditya', 'Amitabh', 'Arjun', 'Devendra', 'Gaurav', 'Harshvardhan', 'Jitendra', 'Kuldeep', 'Manish',
    'Naveen', 'Pradeep', 'Rahul', 'Rohit', 'Siddharth', 'Surendra', 'Vikram', 'Virendra', 'Yashwant', 'Pooja',
    'Priya', 'Neha', 'Sunita', 'Anjali', 'Deepika', 'Kavita', 'Ritu', 'Simran', 'Shweta', 'Tanvi',
    // South
    'Anand', 'Arun', 'Balaji', 'Chandrasekhar', 'Ganesh', 'Karthik', 'Murugan', 'Nagarajan', 'Praveen', 'Raghavan',
    'Rajesh', 'Santhosh', 'Saravanan', 'Srinivasan', 'Subramanian', 'Venkatesh', 'Vijay', 'Lakshmi', 'Meenakshi', 'Padma',
    'Revathi', 'Soundarya', 'Swathi', 'Divya', 'Bhavani', 'Keerthana', 'Ananya', 'Malathi', 'Gayatri',
    // West / Central
    'Abhay', 'Ajit', 'Aniket', 'Bhalchandra', 'Dhananjay', 'Eknath', 'Girish', 'Milind', 'Nitin', 'Prashant',
    'Sachin', 'Sanjay', 'Suhas', 'Tushar', 'Umesh', 'Vilas', 'Vaishali', 'Aparna', 'Manasi', 'Shubhangi', 'Swapna',
    // East
    'Abhishek', 'Arijit', 'Debabrata', 'Indrajit', 'Partha', 'Pranab', 'Prosenjit', 'Sandip', 'Saugata', 'Shouvik',
    'Subhas', 'Tanmay', 'Mousumi', 'Debolina', 'Ruma', 'Soma', 'Swagata', 'Barnali', 'Kakoli', 'Rupali',
    // Punjab / Sikh
    'Gurpreet', 'Harpreet', 'Jaswinder', 'Kulwant', 'Manpreet', 'Navjot', 'Paramjit', 'Rajwinder', 'Sukhbir', 'Tarlochan',
    'Amrit', 'Balwinder', 'Hardev', 'Jagtar', 'Surinder', 'Davinder', 'Satnam', 'Bikramjit',
    // Muslim Heritage
    'Farhan', 'Imran', 'Junaid', 'Mustafa', 'Nasir', 'Rizwan', 'Salman', 'Tariq', 'Ziauddin', 'Ayesha', 'Fatima', 'Zainab', 'Nargis', 'Parveen'
  ];

  const MIDDLE_NAMES = [
    'K.', 'S.', 'R.', 'M.', 'P.', 'V.', 'N.', 'A.', 'B.', 'D.', 'T.', 'H.',
    'Kumar', 'Singh', 'Chandra', 'Lal', 'Prasad', 'Rao', 'Nath', 'Kanta', 'Dev', 'Prakash', 'Mohan', ''
  ];

  const LAST_NAMES = [
    // North & Central
    'Sharma', 'Verma', 'Gupta', 'Singh', 'Yadav', 'Mishra', 'Pandey', 'Tiwari', 'Dubey', 'Tripathi',
    'Shukla', 'Chaubey', 'Upadhyay', 'Gautam', 'Thakur', 'Kashyap', 'Choudhary', 'Prajapati', 'Nishad',
    // Rajasthan
    'Rathore', 'Shekhawat', 'Chauhan', 'Gehlot', 'Bishnoi', 'Bhati', 'Meena', 'Sisodia', 'Tanwar', 'Kumpawat', 'Dodiya',
    // Gujarat
    'Patel', 'Mehta', 'Shah', 'Trivedi', 'Pandya', 'Dave', 'Vora', 'Solanki', 'Zala', 'Jadeja', 'Chudasama',
    // Maharashtra
    'Patil', 'Deshmukh', 'Kulkarni', 'Jadhav', 'Pawar', 'Shinde', 'Gaikwad', 'Bhosale', 'More', 'Chavan', 'Sawant',
    // South (Andhra, Telangana, Karnataka, Tamil Nadu, Kerala)
    'Reddy', 'Rao', 'Naidu', 'Chowdary', 'Varma', 'Raju', 'Goud',
    'Nair', 'Menon', 'Pillai', 'Kurup', 'Warrier', 'Nambiar', 'Panicker',
    'Iyer', 'Iyengar', 'Balakrishnan', 'Swaminathan', 'Ranganathan', 'Sundaram', 'Nadar', 'Thevar',
    'Hegde', 'Shetty', 'Bhat', 'Kamath', 'Pai', 'Gowda',
    // East (Bengal, Odisha, Assam)
    'Chatterjee', 'Mukherjee', 'Banerjee', 'Bhattacharya', 'Ghosh', 'Bose', 'Dutta', 'Sengupta', 'Chakraborty', 'Das',
    'Roy', 'Sen', 'Sarkar', 'Mondal', 'Patnaik', 'Mohanty', 'Barik', 'Pradhan', 'Saikia', 'Barua', 'Bora',
    // Punjab & Haryana
    'Sandhu', 'Gill', 'Dhillon', 'Sidhu', 'Grewal', 'Brar', 'Maan', 'Cheema', 'Deol', 'Kaur', 'Grewal', 'Virk', 'Bajwa',
    // Mercantile & Business
    'Agarwal', 'Jain', 'Bansal', 'Goyal', 'Singhal', 'Mittal', 'Maheshwari', 'Khatri', 'Malhotra', 'Kapoor', 'Khanna', 'Bhatia', 'Sethi', 'Anand', 'Kohli', 'Sood',
    // Islamic Heritage
    'Khan', 'Siddiqui', 'Ahmed', 'Qureshi', 'Ansari', 'Mirza', 'Sayed', 'Pathan', 'Shaikh', 'Farooqui'
  ];

  const FLEET_PREFIXES = [
    'Shree Balaji', 'Jaipur Golden', 'VRL National', 'Navkar', 'Mahalaxmi', 'Kaveri', 'Gati Swift', 'Deccan Express',
    'Hindustan Cargo', 'Marwar Golden', 'Konkan Coastal', 'Ganga-Yamuna', 'Godavari Fast', 'Brahmaputra Haulage', 'Punjab Golden',
    'Western Corridors', 'Southern Fleet Lines', 'Northern Freightways', 'Eastern Express Cargo', 'Bharat Intermodal', 'Royal Rajputana Logistics',
    'Chambal Multi-Axle', 'Gujarat Inland Freight', 'Bengal Logistics Hub', 'Bangalore Cargo Movers', 'Kashmir-to-Kanyakumari Transways'
  ];

  const FLEET_SUFFIXES = [
    'Express Logistics Pvt Ltd', 'National Cargo Fleet Corp', 'Inland Multi-Axle Haulers', 'Interstate Transport Lines',
    'Surface Transways Ltd', 'Roadlines & Freight Carrier', 'Container Movers & Movers', 'Heavy Haulage & Supply Chain',
    'Intercity Swift Transit', 'Highway Cargo Carriers Ltd', 'Goods Carrier & Transport Hub', 'Logistics Infrastructure India Ltd',
    'Bulk Petroleum Carriers', 'Refrigerated Cold Chain Fleet', 'Automobile Freight Carriers Ltd'
  ];

  // Pan-India RTO Directory with real district names & highway coordinates
  const PAN_INDIA_REGISTRY = {
    // Rajasthan
    'RJ': {
      stateName: 'Rajasthan',
      center: [26.9124, 75.7873],
      rtoDistricts: {
        '01': { name: 'Ajmer Sharif & Kishangarh Marble Expressway', center: [26.4499, 74.6399], corridor: 'NH-48 Jaipur-Ajmer Expressway' },
        '02': { name: 'Alwar & NCR Industrial Corridor', center: [27.5530, 76.6346], corridor: 'Delhi-Mumbai Expressway Access' },
        '05': { name: 'Bharatpur Keoladeo Gate', center: [27.2152, 77.5030], corridor: 'Agra-Jaipur NH-21' },
        '06': { name: 'Bhilwara Textile Hub', center: [25.3407, 74.6313], corridor: 'Ajmer-Chittorgarh Corridor' },
        '07': { name: 'Bikaner Thar Desert Highway Division', center: [28.0229, 73.3119], corridor: 'Amritsar-Jamnagar Expressway' },
        '14': { name: 'Jaipur Central (JLN Marg / WTP Corridor)', center: [26.9124, 75.7873], corridor: 'Jaipur Ring Road & JLN Arterial' },
        '19': { name: 'Jodhpur Sun City & Paota Circle Approach', center: [26.2389, 73.0243], corridor: 'Jodhpur-Barmer Highway NH-25' },
        '20': { name: 'Kota Chambal Expressway & Education Hub', center: [25.2138, 75.8648], corridor: 'Chambal Cable Stayed Bridge Corridor' },
        '27': { name: 'Udaipur City of Lakes & Sukher Bypass', center: [24.5854, 73.7125], corridor: 'Golden Quadrilateral NH-48' }
      }
    },
    // Delhi NCT
    'DL': {
      stateName: 'Delhi NCT',
      center: [28.6139, 77.2090],
      rtoDistricts: {
        '01': { name: 'New Delhi / Civil Lines & Ring Road', center: [28.6700, 77.2200], corridor: 'Mahatma Gandhi Ring Road' },
        '02': { name: 'New Delhi Central / Connaught Place', center: [28.6315, 77.2167], corridor: 'Barakhamba - Janpath Arterial' },
        '03': { name: 'South Delhi (AIIMS / Sheikh Sarai)', center: [28.5400, 77.2100], corridor: 'Outer Ring Road Nehru Place' },
        '04': { name: 'West Delhi (Janakpuri / Rajouri Garden)', center: [28.6400, 77.1200], corridor: 'Najafgarh Corridor' },
        '09': { name: 'South West Delhi (Dwarka Sub-City)', center: [28.5921, 77.0460], corridor: 'Dwarka Expressway Elevated KM 8' },
        '10': { name: 'North West Delhi (Rohini Express Corridor)', center: [28.7150, 77.1200], corridor: 'Outer Ring Road Mukarba Chowk' }
      }
    },
    // Maharashtra
    'MH': {
      stateName: 'Maharashtra',
      center: [19.0760, 72.8777],
      rtoDistricts: {
        '01': { name: 'Mumbai South & Coastal Freeway', center: [18.9388, 72.8354], corridor: 'Eastern Freeway & Marine Drive' },
        '02': { name: 'Mumbai West (Bandra-Worli Sea Link)', center: [19.0544, 72.8402], corridor: 'Western Express Highway' },
        '04': { name: 'Thane & Ghodbunder Arterial', center: [19.2183, 72.9781], corridor: 'Ghodbunder Road Bypass' },
        '12': { name: 'Pune Metropolitan & Hinjawadi IT Corridor', center: [18.5204, 73.8567], corridor: 'Mumbai-Pune Expressway Pune Exit' },
        '14': { name: 'Pimpri-Chinchwad Industrial Belt', center: [18.6298, 73.7997], corridor: 'Old Mumbai-Pune Highway' },
        '31': { name: 'Nagpur & Samruddhi Mahamarg Interchange', center: [21.1458, 79.0882], corridor: 'Hindu Hrudaysamrat Balasaheb Thackeray Mahamarg' }
      }
    },
    // Uttar Pradesh
    'UP': {
      stateName: 'Uttar Pradesh',
      center: [26.8467, 80.9462],
      rtoDistricts: {
        '14': { name: 'Ghaziabad & Delhi-Meerut Expressway', center: [28.6692, 77.4538], corridor: '14-Lane Delhi-Meerut Expressway' },
        '16': { name: 'Noida & Greater Noida Expressway', center: [28.5355, 77.3910], corridor: 'Noida Expressway KM 12 & Yamuna Link' },
        '32': { name: 'Lucknow Capital & Shaheed Path Bypass', center: [26.8467, 80.9462], corridor: 'Amar Shaheed Path Ring Corridor' },
        '78': { name: 'Kanpur Industrial Bypass & GT Road', center: [26.4499, 80.3319], corridor: 'Grand Trunk Road NH-19' },
        '80': { name: 'Agra & Yamuna Expressway Toll Plaza', center: [27.1767, 78.0081], corridor: 'Yamuna Expressway KM 165' },
        '65': { name: 'Varanasi Ring Road & Cantt Hub', center: [25.3176, 82.9739], corridor: 'Varanasi-Prayagraj Corridor' }
      }
    },
    // Karnataka
    'KA': {
      stateName: 'Karnataka',
      center: [12.9716, 77.5946],
      rtoDistricts: {
        '01': { name: 'Bengaluru Central (Koramangala / MG Road)', center: [12.9352, 77.6245], corridor: 'Hosur Road Arterial' },
        '03': { name: 'Bengaluru East (Indiranagar / Old Airport Road)', center: [12.9784, 77.6408], corridor: 'Old Madras Road' },
        '04': { name: 'Bengaluru North (Yeshwanthpur Elevated Highway)', center: [13.0280, 77.5400], corridor: 'Tumakuru Elevated Toll Highway' },
        '05': { name: 'Bengaluru South (Jayanagar & Silk Board Junction)', center: [12.9250, 77.5938], corridor: 'Outer Ring Road Silk Board Agara' },
        '09': { name: 'Mysuru City & Bengaluru-Mysuru Expressway', center: [12.2958, 76.6394], corridor: '10-Lane Bengaluru-Mysuru Expressway' }
      }
    },
    // Tamil Nadu
    'TN': {
      stateName: 'Tamil Nadu',
      center: [13.0827, 80.2707],
      rtoDistricts: {
        '01': { name: 'Chennai Central & Anna Salai Arterial', center: [13.0827, 80.2707], corridor: 'Grand Southern Trunk (GST) Road' },
        '07': { name: 'Chennai South (Thiruvanmiyur & OMR IT Highway)', center: [12.9830, 80.2594], corridor: 'Rajiv Gandhi Salai OMR 6-Lane' },
        '38': { name: 'Coimbatore Avinashi Highway Division', center: [11.0168, 76.9558], corridor: 'Salem-Coimbatore NH-544' },
        '59': { name: 'Madurai Ring Road Interchange', center: [9.9252, 78.1198], corridor: 'Madurai Bypass NH-44' }
      }
    },
    // Gujarat
    'GJ': {
      stateName: 'Gujarat',
      center: [23.0225, 72.5714],
      rtoDistricts: {
        '01': { name: 'Ahmedabad SG Highway & Prahlad Nagar Hub', center: [23.0225, 72.5714], corridor: 'Sarkhej-Gandhinagar Highway' },
        '05': { name: 'Surat Ring Road & Diamond Bourse Hub', center: [21.1702, 72.8311], corridor: 'Surat-Navsari Expressway' },
        '06': { name: 'Vadodara Golden Quadrilateral Link', center: [22.3072, 73.1812], corridor: 'Vadodara-Ahmedabad Expressway NE-1' },
        '18': { name: 'Gandhinagar Capital Green Expressway', center: [23.2156, 72.6369], corridor: 'GIFT City Elevated Corridor' }
      }
    },
    // Haryana
    'HR': {
      stateName: 'Haryana',
      center: [28.4595, 77.0266],
      rtoDistricts: {
        '26': { name: 'Gurugram Cyber City & Golf Course Road Hub', center: [28.4595, 77.0266], corridor: 'Cyber City Rapid Metro Corridor' },
        '51': { name: 'Faridabad Mathura Road Expressway', center: [28.4089, 77.3178], corridor: 'Delhi-Agra NH-19 Tollway' },
        '10': { name: 'Sonipat & GT Karnal Highway Corridor', center: [28.9931, 77.0151], corridor: 'KMP Expressway Interchange' }
      }
    },
    // West Bengal
    'WB': {
      stateName: 'West Bengal',
      center: [22.5726, 88.3639],
      rtoDistricts: {
        '01': { name: 'Kolkata Central & Maa Flyover Connector', center: [22.5726, 88.3639], corridor: 'AJC Bose Road Flyover' },
        '12': { name: 'Howrah Bridge & Kona Expressway Bypass', center: [22.5958, 88.2636], corridor: 'NH-16 Kona Expressway Link' },
        '20': { name: 'Salt Lake Sector V & New Town Expressway', center: [22.5800, 88.4600], corridor: 'Major Arterial Road New Town' }
      }
    },
    // Punjab
    'PB': {
      stateName: 'Punjab',
      center: [30.9010, 75.8573],
      rtoDistricts: {
        '10': { name: 'Ludhiana Industrial Bypass & Ferozepur Road', center: [30.9010, 75.8573], corridor: 'Delhi-Amritsar NH-44' },
        '02': { name: 'Amritsar Golden Temple & Wagah Transit', center: [31.6340, 74.8723], corridor: 'Grand Trunk Road Amritsar' },
        '11': { name: 'Patiala Rajpura Highway Division', center: [30.3398, 76.3869], corridor: 'Patiala Bypass NH-7' }
      }
    },
    // Kerala
    'KL': {
      stateName: 'Kerala',
      center: [9.9312, 76.2673],
      rtoDistricts: {
        '07': { name: 'Ernakulam / Kochi Seaport-Airport Corridor', center: [9.9312, 76.2673], corridor: 'Kochi Bypass NH-66' },
        '01': { name: 'Thiruvananthapuram Capital & Kazhakkoottam', center: [8.5241, 76.9366], corridor: 'Technopark Elevated Corridor' },
        '11': { name: 'Kozhikode Malabar Coast Bypass', center: [11.2588, 75.7804], corridor: 'Calicut Bypass NH-66' }
      }
    },
    // Madhya Pradesh
    'MP': {
      stateName: 'Madhya Pradesh',
      center: [22.7196, 75.8577],
      rtoDistricts: {
        '09': { name: 'Indore Super Corridor & Bypass', center: [22.7196, 75.8577], corridor: 'Indore-Ujjain 4-Lane Highway' },
        '04': { name: 'Bhopal Capital & Hoshangabad Road', center: [23.2599, 77.4126], corridor: 'BRTS Corridor Bhopal' },
        '20': { name: 'Jabalpur Sanskardhani Bypass', center: [23.1815, 79.9864], corridor: 'NH-30 Jabalpur Ring Road' }
      }
    },
    // Telangana
    'TS': {
      stateName: 'Telangana',
      center: [17.3850, 78.4867],
      rtoDistricts: {
        '09': { name: 'Hyderabad Central (Tank Bund / Begumpet)', center: [17.3850, 78.4867], corridor: 'PVNR Elevated Expressway' },
        '07': { name: 'Cyberabad / HITEC City & Gachibowli ORR', center: [17.4435, 78.3772], corridor: 'Nehru Outer Ring Road (158 KM)' }
      }
    },
    // Andhra Pradesh
    'AP': {
      stateName: 'Andhra Pradesh',
      center: [16.5062, 80.6480],
      rtoDistricts: {
        '16': { name: 'Vijayawada Kanaka Durga Flyover Hub', center: [16.5062, 80.6480], corridor: 'Kolkata-Chennai NH-16' },
        '31': { name: 'Visakhapatnam Steel City & Beach Corridor', center: [17.6868, 83.2185], corridor: 'Vizag Port Bypass Road' }
      }
    },
    // Bihar
    'BR': {
      stateName: 'Bihar',
      center: [25.5941, 85.1376],
      rtoDistricts: {
        '01': { name: 'Patna Ganga Marine Drive Corridor', center: [25.5941, 85.1376], corridor: 'Loknayak Ganga Path Express' }
      }
    },
    // Odisha
    'OD': {
      stateName: 'Odisha',
      center: [20.2961, 85.8245],
      rtoDistricts: {
        '02': { name: 'Bhubaneswar Temple City & NH-16 Corridor', center: [20.2961, 85.8245], corridor: 'Cuttack-Puri Arterial Highway' }
      }
    },
    // Assam
    'AS': {
      stateName: 'Assam',
      center: [26.1445, 91.7362],
      rtoDistricts: {
        '01': { name: 'Guwahati Brahmaputra Bridge Corridor', center: [26.1445, 91.7362], corridor: 'Saraighat Bridge & GS Road' }
      }
    },
    // Chandigarh
    'CH': {
      stateName: 'Chandigarh UT',
      center: [30.7333, 76.7794],
      rtoDistricts: {
        '01': { name: 'Chandigarh City & Tribune Chowk Axis', center: [30.7333, 76.7794], corridor: 'Madhya Marg Arterial' }
      }
    },
    // Goa
    'GA': {
      stateName: 'Goa',
      center: [15.2993, 74.1240],
      rtoDistricts: {
        '07': { name: 'Panaji Atal Setu Cable Bridge Corridor', center: [15.4909, 73.8278], corridor: 'Mandovi River Elevated Expressway' }
      }
    },
    // Jammu & Kashmir
    'JK': {
      stateName: 'Jammu & Kashmir UT',
      center: [34.0837, 74.7973],
      rtoDistricts: {
        '01': { name: 'Srinagar Dal Lake & Bypass Route', center: [34.0837, 74.7973], corridor: 'Srinagar-Jammu NH-44' },
        '02': { name: 'Jammu Tawi River & Kunjwani Chowk', center: [32.7266, 74.8570], corridor: 'Jammu-Udhampur Highway' }
      }
    },
    // Himachal Pradesh
    'HP': {
      stateName: 'Himachal Pradesh',
      center: [31.1048, 77.1734],
      rtoDistricts: {
        '01': { name: 'Shimla Mall Road & Parwanoo Bypass', center: [31.1048, 77.1734], corridor: 'Himalayan Expressway NH-5' }
      }
    },
    // Uttarakhand
    'UK': {
      stateName: 'Uttarakhand',
      center: [30.3165, 78.0322],
      rtoDistricts: {
        '07': { name: 'Dehradun Capital & Rajpur Road Corridor', center: [30.3165, 78.0322], corridor: 'Delhi-Dehradun Expressway' }
      }
    }
  };

  /**
   * Hashes any string deterministically into a positive 32-bit integer
   */
  function hashString(str) {
    let hash = 0;
    const s = String(str || 'DL-01-AB-4921');
    for (let i = 0; i < s.length; i++) {
      hash = (hash * 31 + s.charCodeAt(i)) & 0xffffffff;
    }
    return Math.abs(hash);
  }

  /**
   * Generates from over 2,000,000 authentic Indian owner names
   */
  function generateDiverseOwner(seed) {
    const h = hashString(seed);

    // 25% Commercial transport fleet, 75% Individual Indian owner
    if (h % 100 < 25) {
      const p = FLEET_PREFIXES[h % FLEET_PREFIXES.length];
      const s = FLEET_SUFFIXES[(h >> 3) % FLEET_SUFFIXES.length];
      return p + ' ' + s;
    } else {
      const title = TITLES[h % TITLES.length];
      const first = FIRST_NAMES[(h >> 2) % FIRST_NAMES.length];
      const mid = MIDDLE_NAMES[(h >> 4) % MIDDLE_NAMES.length];
      const last = LAST_NAMES[(h >> 6) % LAST_NAMES.length];
      return (title + first + ' ' + (mid ? mid + ' ' : '') + last).trim();
    }
  }

  /**
   * Generates dynamic authentic Indian Government / Police / NIC IP addresses
   */
  function generateDiverseIP(seed) {
    const h = hashString(seed);
    const subnetType = h % 4;

    if (subnetType === 0) {
      // NIC India National Server Network (Official Range 164.100.x.x)
      return '164.100.' + ((h % 180) + 10) + '.' + (((h >> 3) % 240) + 2);
    } else if (subnetType === 1) {
      // State Police Mobile Data Terminal (MDT) Intranet (10.x.x.x)
      return '10.' + (((h >> 2) % 240) + 1) + '.' + (((h >> 4) % 240) + 1) + '.' + (((h >> 6) % 240) + 2);
    } else if (subnetType === 2) {
      // CCTNS (Crime & Criminal Tracking Network) Secure VPN
      return '172.' + ((h % 16) + 16) + '.' + (((h >> 3) % 240) + 1) + '.' + (((h >> 5) % 240) + 2);
    } else {
      // National Highway Traffic Interceptor Cellular APN
      return '100.' + (((h >> 3) % 60) + 64) + '.' + (((h >> 5) % 240) + 1) + '.' + (((h >> 7) % 240) + 2);
    }
  }

  /**
   * Complete vehicle resolver based on license plate string
   */
  function resolveVehicleDetails(plateInput) {
    const raw = String(plateInput || 'DL-01-AB-4921').trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
    const formatted = (plateInput || 'DL-01-AB-4921').trim().toUpperCase();
    const h = hashString(formatted);

    // Extract state code (first 2 letters) and RTO code (next 2 digits)
    const stateCode = (formatted.match(/^([A-Z]{2})/) || ['', 'DL'])[1];
    const rtoMatch = formatted.match(/^[A-Z]{2}[-\s]?(\d{1,2})/);
    const rtoCode = rtoMatch ? String(rtoMatch[1]).padStart(2, '0') : '01';

    const stateData = PAN_INDIA_REGISTRY[stateCode] || PAN_INDIA_REGISTRY['DL'];
    const districtData = (stateData.rtoDistricts && stateData.rtoDistricts[rtoCode]) 
      ? stateData.rtoDistricts[rtoCode] 
      : (stateData.rtoDistricts ? Object.values(stateData.rtoDistricts)[0] : { name: stateData.stateName + ' Central Division', center: stateData.center, corridor: 'State Arterial Highway' });

    // Coordinate jitter along highway corridor
    const latOffset = ((h % 100) - 50) * 0.00025;
    const lngOffset = (((h >> 3) % 100) - 50) * 0.00025;
    const lat = +(districtData.center[0] + latOffset).toFixed(5);
    const lng = +(districtData.center[1] + lngOffset).toFixed(5);

    // Realistic vehicle models & categories
    const VEHICLE_MODELS = [
      { model: "Mahindra Scorpio-N (Pearl White)", class: "Cars & SUVs (4-Wheelers)", icon: "🚙", speed: 58, fuel: "Diesel BS-VI" },
      { model: "Tata Nexon EV Max (Signature Teal)", class: "Electric SUV (Clean Mobility)", icon: "⚡", speed: 52, fuel: "Pure Electric" },
      { model: "Maruti Suzuki Dzire (Silky Silver)", class: "Cars & SUVs (4-Wheelers)", icon: "🚕", speed: 54, fuel: "CNG / Petrol" },
      { model: "Hyundai Creta SX (Titan Grey)", class: "Cars & SUVs (4-Wheelers)", icon: "🚙", speed: 64, fuel: "Petrol MPFi" },
      { model: "Royal Enfield Classic 350 (Stealth Black)", class: "Bikes & Two-Wheelers", icon: "🏍️", speed: 44, fuel: "Petrol 349cc" },
      { model: "TVS Jupiter 125 (Starlight Blue)", class: "Bikes & Two-Wheelers", icon: "🛵", speed: 38, fuel: "Petrol 124cc" },
      { model: "Ashok Leyland 2820 Multi-Axle Hauler", class: "Heavy Trucks & Multi-Axle Commercials", icon: "🚛", speed: 42, fuel: "Heavy Diesel" },
      { model: "Tata Signa 4825.TK Tipper", class: "Heavy Trucks & Multi-Axle Commercials", icon: "🚛", speed: 36, fuel: "Heavy Diesel" },
      { model: "Volvo 9600 Multi-Axle Luxury Coach", class: "Buses & Public Passenger Carriers", icon: "🚌", speed: 68, fuel: "Intercity Diesel" },
      { model: "Bajaj Compact RE (Green & Yellow)", class: "Auto-Rickshaws, E-Rickshaws & LCVs", icon: "🛺", speed: 32, fuel: "Green CNG" },
      { model: "Mahindra Treo Zor E-Cargo", class: "Auto-Rickshaws, E-Rickshaws & LCVs", icon: "⚡", speed: 28, fuel: "Electric 48V" }
    ];

    const modelObj = VEHICLE_MODELS[h % VEHICLE_MODELS.length];
    const speed = modelObj.speed + ((h >> 4) % 18);
    const ownerName = generateDiverseOwner(formatted);
    const ipAddress = generateDiverseIP(formatted);

    return {
      plate: formatted,
      stateCode: stateCode,
      stateName: stateData.stateName,
      districtName: districtData.name,
      corridor: districtData.corridor,
      rtoCode: `${stateCode}-${rtoCode}`,
      lat: lat,
      lng: lng,
      speed: speed,
      speedLimit: speed > 60 ? 60 : 50,
      makeModel: modelObj.model,
      class: modelObj.class,
      icon: modelObj.icon,
      fuelType: modelObj.fuel,
      owner: ownerName,
      ipAddress: ipAddress,
      fitnessExpiry: "2029-08-15",
      insuranceStatus: "Active (HDFC ERGO / New India)",
      puccStatus: "Certified Green (Valid till 2027)"
    };
  }

  return {
    generateDiverseOwner: generateDiverseOwner,
    generateDiverseIP: generateDiverseIP,
    resolveVehicleDetails: resolveVehicleDetails,
    PAN_INDIA_REGISTRY: PAN_INDIA_REGISTRY
  };
});
