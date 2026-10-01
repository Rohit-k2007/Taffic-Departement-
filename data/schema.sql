-- =========================================================================
-- TRAFIX INDIA - National Traffic, RTO & Geo-Governance Database Schema
-- Ministry of Road Transport & Highways (MoRTH) Standard Architecture
-- =========================================================================

CREATE DATABASE IF NOT EXISTS trafix_india;
USE trafix_india;

-- =========================================
-- 1. STATES / UNION TERRITORIES
-- =========================================
CREATE TABLE states (
    state_id INT PRIMARY KEY AUTO_INCREMENT,
    state_code VARCHAR(10) UNIQUE NOT NULL,
    state_name VARCHAR(100) NOT NULL,
    state_type ENUM('STATE','Distict','UNION_TERRITORY') NOT NULL,
    capital VARCHAR(100),
    official_website VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =========================================
-- 2. DISTRICTS
-- =========================================
CREATE TABLE districts (
    district_id INT PRIMARY KEY AUTO_INCREMENT,
    state_id INT NOT NULL,
    lgd_district_code VARCHAR(20),
    district_name VARCHAR(150) NOT NULL,
    district_headquarters VARCHAR(150),
    area_sq_km DECIMAL(12,2),
    official_website VARCHAR(255),

    FOREIGN KEY (state_id)
        REFERENCES states(state_id),

    UNIQUE(state_id, district_name)
);

-- =========================================
-- 3. CITIES / TOWNS / AREAS
-- =========================================
CREATE TABLE areas (
    area_id INT PRIMARY KEY AUTO_INCREMENT,
    district_id INT NOT NULL,
    area_name VARCHAR(150) NOT NULL,
    area_type VARCHAR(50),
    pincode VARCHAR(10),
    latitude DECIMAL(10,7),
    longitude DECIMAL(10,7),

    FOREIGN KEY (district_id)
        REFERENCES districts(district_id)
);

-- =========================================
-- 4. ROADS
-- =========================================
CREATE TABLE roads (
    road_id INT PRIMARY KEY AUTO_INCREMENT,
    district_id INT NOT NULL,
    area_id INT,
    road_name VARCHAR(200) NOT NULL,
    road_type VARCHAR(100),
    highway_number VARCHAR(50),
    start_location VARCHAR(255),
    end_location VARCHAR(255),
    length_km DECIMAL(10,2),
    latitude DECIMAL(10,7),
    longitude DECIMAL(10,7),

    FOREIGN KEY (district_id)
        REFERENCES districts(district_id),

    FOREIGN KEY (area_id)
        REFERENCES areas(area_id)
);

-- =========================================
-- 5. TRAFFIC CIRCLES / JURISDICTIONS
-- =========================================
CREATE TABLE traffic_circles (
    circle_id INT PRIMARY KEY AUTO_INCREMENT,
    district_id INT NOT NULL,
    circle_name VARCHAR(150) NOT NULL,
    circle_type VARCHAR(100),
    office_address TEXT,
    phone VARCHAR(30),
    email VARCHAR(150),
    latitude DECIMAL(10,7),
    longitude DECIMAL(10,7),

    FOREIGN KEY (district_id)
        REFERENCES districts(district_id)
);

-- =========================================
-- 6. RTO OFFICES
-- =========================================
CREATE TABLE rto_offices (
    rto_id INT PRIMARY KEY AUTO_INCREMENT,
    state_id INT NOT NULL,
    district_id INT,
    rto_code VARCHAR(20) NOT NULL,
    office_name VARCHAR(200),
    address TEXT,
    pincode VARCHAR(10),
    phone VARCHAR(30),
    email VARCHAR(150),
    latitude DECIMAL(10,7),
    longitude DECIMAL(10,7),

    FOREIGN KEY (state_id)
        REFERENCES states(state_id),

    FOREIGN KEY (district_id)
        REFERENCES districts(district_id),

    UNIQUE(rto_code)
);

-- =========================================
-- 7. POLICE STATIONS
-- =========================================
CREATE TABLE police_stations (
    police_station_id INT PRIMARY KEY AUTO_INCREMENT,
    district_id INT NOT NULL,
    station_name VARCHAR(200) NOT NULL,
    address TEXT,
    phone VARCHAR(30),
    email VARCHAR(150),
    latitude DECIMAL(10,7),
    longitude DECIMAL(10,7),

    FOREIGN KEY (district_id)
        REFERENCES districts(district_id)
);

-- =========================================
-- 8. PINCODES
-- =========================================
CREATE TABLE pincodes (
    pincode_id INT PRIMARY KEY AUTO_INCREMENT,
    district_id INT NOT NULL,
    pincode VARCHAR(10) NOT NULL,
    post_office_name VARCHAR(200),
    delivery_status VARCHAR(50),

    FOREIGN KEY (district_id)
        REFERENCES districts(district_id),

    UNIQUE(pincode, post_office_name)
);

-- =========================================
-- 9. VEHICLE REGISTRATION SERIES
-- =========================================
CREATE TABLE vehicle_registration_series (
    registration_id INT PRIMARY KEY AUTO_INCREMENT,
    state_id INT NOT NULL,
    district_id INT,
    rto_id INT,
    registration_code VARCHAR(20) NOT NULL,
    series_format VARCHAR(100),
    issuing_authority VARCHAR(200),

    FOREIGN KEY (state_id)
        REFERENCES states(state_id),

    FOREIGN KEY (district_id)
        REFERENCES districts(district_id),

    FOREIGN KEY (rto_id)
        REFERENCES rto_offices(rto_id),

    UNIQUE(registration_code)
);

-- =========================================================================
-- SAMPLE REFERENCE SEED DATA: RAJASTHAN & DELHI NCT
-- =========================================================================

INSERT INTO states (state_id, state_code, state_name, state_type, capital, official_website) VALUES
(1, 'RJ', 'Rajasthan', 'STATE', 'Jaipur','Jodhpur','Ajmer','pali','Kishangarh','Nagaur','Merta city','pipar city','churu','Shriganganagar', 'https://transport.rajasthan.gov.in'),
(2, 'DL', 'Delhi NCT', 'UNION_TERRITORY', 'New Delhi', 'https://transport.delhi.gov.in'),
(3, 'MH', 'Maharashtra', 'STATE', 'Mumbai', 'https://transport.maharashtra.gov.in'),
(4, 'UP', 'Uttar Pradesh', 'STATE', 'Lucknow', 'https://uptransport.upsdc.gov.in'),
(5, 'KA', 'Karnataka', 'STATE', 'Bengaluru', 'https://transport.karnataka.gov.in');

-- Districts for Rajasthan (RJ)
INSERT INTO districts (district_id, state_id, lgd_district_code, district_name, district_headquarters, area_sq_km, official_website) VALUES
(1, 1, 'LGD-RJ-JOD', 'Jodhpur', 'Jodhpur', 22850.00, 'https://jodhpur.rajasthan.gov.in'),
(2, 1, 'LGD-RJ-JAI', 'Jaipur', 'Jaipur', 11152.00, 'https://jaipur.rajasthan.gov.in'),
(3, 1, 'LGD-RJ-AJM', 'Ajmer', 'Ajmer', 8481.00, 'https://ajmer.rajasthan.gov.in');

-- RTO Offices for Rajasthan (RJ) including RJ-54 Pipar City / Jodhpur
INSERT INTO rto_offices (rto_id, state_id, district_id, rto_code, office_name, address, pincode, phone, email, latitude, longitude) VALUES
(1, 1, 1, '54', 'DTO Pipar City, Jodhpur Division', 'Sub-Divisional Office Complex, Pipar City, Jodhpur District, Rajasthan', '342601', '+91 2930 222110', 'dto.piparcity@rajasthan.gov.in', 26.3912000, 73.5410000),
(2, 1, 1, '19', 'RTO Jodhpur', 'RTO Office, Mandore Road, Jodhpur, Rajasthan', '342001', '+91 291 2544200', 'rto.jodhpur@rajasthan.gov.in', 26.2968000, 73.0351000),
(3, 1, 2, '14', 'RTO Jaipur South', 'Jhalana Doongri Transport Nagar, Jaipur, Rajasthan', '302004', '+91 141 2700300', 'rto.jaipursouth@rajasthan.gov.in', 26.8912000, 75.8210000),
(4, 1, 2, '45', 'RTO Jaipur North', 'Vidyadhar Nagar RTO Complex, Jaipur, Rajasthan', '302039', '+91 141 2334400', 'rto.jaipurnorth@rajasthan.gov.in', 26.9644000, 75.7766000),
(5, 1, 3, '01', 'RTO & DTO Ajmer', 'Civil Lines, Near Collectorate, Ajmer, Rajasthan', '305001', '+91 145 2623300', 'dto.ajmer@rajasthan.gov.in', 26.4691000, 74.6399000);

-- Vehicle Registration Series for Pipar City / Jodhpur (RJ54)
INSERT INTO vehicle_registration_series (registration_id, state_id, district_id, rto_id, registration_code, series_format, issuing_authority) VALUES
(1, 1, 1, 1, 'RJ54CK', 'RJ-54-CK-####', 'District Transport Office, Pipar City (Jodhpur)'),
(2, 1, 1, 1, 'RJ54CA', 'RJ-54-CA-####', 'District Transport Office, Pipar City (Jodhpur)'),
(3, 1, 1, 1, 'RJ54CB', 'RJ-54-CB-####', 'District Transport Office, Pipar City (Jodhpur)'),
(4, 1, 1, 1, 'RJ54CL', 'RJ-54-CL-####', 'District Transport Office, Pipar City (Jodhpur)');
