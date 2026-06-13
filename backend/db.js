const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  port: process.env.DB_PORT || 3306
};

let pool;

async function initializeDatabase() {
  try {
    const connection = await mysql.createConnection(dbConfig);
    const dbName = process.env.DB_NAME || 'uiu_healthcare';
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\`;`);
    await connection.end();

    pool = mysql.createPool({
      ...dbConfig,
      database: dbName,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });

    console.log(`Connected to MySQL database: ${dbName}`);
    await createTables();

  } catch (error) {
    console.error('Database initialization failed:', error);
    process.exit(1);
  }
}

async function createTables() {
  // ── Users ──────────────────────────────────────────────────────────────────
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id          INT AUTO_INCREMENT PRIMARY KEY,
      name        VARCHAR(255) NOT NULL,
      email       VARCHAR(255) UNIQUE NOT NULL,
      password    VARCHAR(255) NOT NULL,
      role        ENUM('patient','doctor','hospital','pharmacy','insurance','admin') DEFAULT 'patient',
      phone       VARCHAR(50),
      bmdc_number VARCHAR(100),
      license_number VARCHAR(100),
      created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // ── Doctors (separate profile table) ──────────────────────────────────────
  await pool.query(`
    CREATE TABLE IF NOT EXISTS doctors (
      id             INT AUTO_INCREMENT PRIMARY KEY,
      user_id        INT DEFAULT NULL,
      name           VARCHAR(255) NOT NULL,
      specialty      VARCHAR(255) NOT NULL,
      hospital       VARCHAR(255) NOT NULL,
      rating         DECIMAL(3,2) DEFAULT 5.0,
      reviews        INT DEFAULT 0,
      fee            VARCHAR(50) NOT NULL,
      available      TINYINT(1) DEFAULT 1,
      exp            VARCHAR(50),
      image_initials VARCHAR(10),
      phone          VARCHAR(50),
      degree         VARCHAR(255),
      avail_text     VARCHAR(100)
    )
  `);

  // ── Appointments ───────────────────────────────────────────────────────────
  await pool.query(`
    CREATE TABLE IF NOT EXISTS appointments (
      id         INT AUTO_INCREMENT PRIMARY KEY,
      ref_code   VARCHAR(20) UNIQUE,
      patient_id INT NOT NULL,
      doctor_id  INT NOT NULL,
      date       VARCHAR(100) NOT NULL,
      time       VARCHAR(100) NOT NULL,
      type       VARCHAR(100) NOT NULL,
      notes      TEXT,
      status     VARCHAR(50) DEFAULT 'Upcoming',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // ── Medical Records ────────────────────────────────────────────────────────
  await pool.query(`
    CREATE TABLE IF NOT EXISTS medical_records (
      id         INT AUTO_INCREMENT PRIMARY KEY,
      patient_id INT NOT NULL,
      title      VARCHAR(255) NOT NULL,
      type       VARCHAR(100) NOT NULL,
      file_url   VARCHAR(500),
      date       VARCHAR(100) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // ── Prescriptions ──────────────────────────────────────────────────────────
  await pool.query(`
    CREATE TABLE IF NOT EXISTS prescriptions (
      id          INT AUTO_INCREMENT PRIMARY KEY,
      doctor_id   INT NOT NULL,
      patient_id  INT NOT NULL,
      diagnosis   TEXT,
      medications TEXT,
      advice      TEXT,
      qr_code     VARCHAR(255),
      created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // ── AI Chat History ────────────────────────────────────────────────────────
  await pool.query(`
    CREATE TABLE IF NOT EXISTS chat_history (
      id         INT AUTO_INCREMENT PRIMARY KEY,
      user_id    INT,
      session_id VARCHAR(64) NOT NULL,
      role       ENUM('user','assistant') NOT NULL,
      content    TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_session (session_id)
    )
  `);

  // ── Emergencies (SOS) ──────────────────────────────────────────────────────
  await pool.query(`
    CREATE TABLE IF NOT EXISTS emergencies (
      id          INT AUTO_INCREMENT PRIMARY KEY,
      patient_id  INT DEFAULT NULL,
      location    VARCHAR(255) DEFAULT 'Unknown',
      coordinates VARCHAR(100) DEFAULT '',
      status      ENUM('Active', 'Dispatched', 'Resolved', 'False Alarm') DEFAULT 'Active',
      created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // ── Insurance Claims ────────────────────────────────────────────────────────
  await pool.query(`
    CREATE TABLE IF NOT EXISTS insurance_claims (
      id          INT AUTO_INCREMENT PRIMARY KEY,
      patient_id  INT NOT NULL,
      title       VARCHAR(255) NOT NULL,
      description TEXT,
      amount      DECIMAL(10,2) NOT NULL,
      record_id   INT DEFAULT NULL,
      status      VARCHAR(50) DEFAULT 'Pending',
      created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // ── Medical Tests (Bookings/Billing) ───────────────────────────────────────
  await pool.query(`
    CREATE TABLE IF NOT EXISTS medical_tests (
      id                INT AUTO_INCREMENT PRIMARY KEY,
      patient_id        INT NOT NULL,
      hospital_id       INT NOT NULL,
      test_name         VARCHAR(255) NOT NULL,
      insurance_company VARCHAR(255),
      policy_number     VARCHAR(255),
      total_fee         DECIMAL(10,2) NOT NULL,
      status            ENUM('Pending', 'Completed', 'Cancelled') DEFAULT 'Pending',
      created_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // ── Audit Logs ─────────────────────────────────────────────────────────────
  await pool.query(`
    CREATE TABLE IF NOT EXISTS audit_logs (
      id         INT AUTO_INCREMENT PRIMARY KEY,
      admin_id   INT NOT NULL,
      action     VARCHAR(255) NOT NULL,
      details    TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // ── Forum Posts ─────────────────────────────────────────────────────────────
  await pool.query(`
    CREATE TABLE IF NOT EXISTS forum_posts (
      id          INT AUTO_INCREMENT PRIMARY KEY,
      user_id     INT NOT NULL,
      title       VARCHAR(255) NOT NULL,
      content     TEXT NOT NULL,
      category    VARCHAR(100) NOT NULL,
      created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // ── Forum Comments ──────────────────────────────────────────────────────────
  await pool.query(`
    CREATE TABLE IF NOT EXISTS forum_comments (
      id          INT AUTO_INCREMENT PRIMARY KEY,
      post_id     INT NOT NULL,
      user_id     INT NOT NULL,
      content     TEXT NOT NULL,
      created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (post_id) REFERENCES forum_posts(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // ── Forum Votes ─────────────────────────────────────────────────────────────
  await pool.query(`
    CREATE TABLE IF NOT EXISTS forum_votes (
      user_id     INT NOT NULL,
      post_id     INT NOT NULL,
      vote_value  TINYINT NOT NULL,
      PRIMARY KEY (user_id, post_id),
      FOREIGN KEY (post_id) REFERENCES forum_posts(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // ── Safe ALTER for missing columns ─────────────────────────────────────────
  const safeAlter = async (sql) => { try { await pool.query(sql); } catch (_) {} };
  await safeAlter("ALTER TABLE prescriptions ADD COLUMN advice TEXT");
  await safeAlter("ALTER TABLE prescriptions ADD COLUMN suggested_tests TEXT");
  await safeAlter("ALTER TABLE appointments ADD COLUMN ref_code VARCHAR(20) UNIQUE");
  await safeAlter("ALTER TABLE appointments ADD COLUMN notes TEXT");
  await safeAlter("ALTER TABLE doctors ADD COLUMN user_id INT DEFAULT NULL");
  await safeAlter("ALTER TABLE doctors ADD COLUMN phone VARCHAR(50)");
  await safeAlter("ALTER TABLE doctors ADD COLUMN degree VARCHAR(255)");
  await safeAlter("ALTER TABLE doctors ADD COLUMN avail_text VARCHAR(100)");
  await safeAlter("ALTER TABLE doctors ADD COLUMN image TEXT");
  await safeAlter("ALTER TABLE users ADD COLUMN phone VARCHAR(50)");
  await safeAlter("ALTER TABLE users ADD COLUMN bmdc_number VARCHAR(100)");
  await safeAlter("ALTER TABLE users ADD COLUMN is_banned TINYINT(1) DEFAULT 0");
  await safeAlter("ALTER TABLE users ADD COLUMN image TEXT");
  await safeAlter("ALTER TABLE users ADD COLUMN license_number VARCHAR(100)");

  // ── Seed demo users ────────────────────────────────────────────────────────
  const [demoCheck] = await pool.query("SELECT COUNT(*) as c FROM users WHERE email = 'patient@uiu.health'");
  if (demoCheck[0].c === 0) {
    // Hash = bcrypt of 'Demo@1234'
    await pool.query(`
      INSERT IGNORE INTO users (name, email, password, role, phone) VALUES
      ('Rahul Ahmed',       'patient@uiu.health',  '$2b$10$mXl/KkObn./4MXeySTxM6.ayETHGqWP1sWtmas5cYX2BQ9mX7BJLK', 'patient',  '01712345678'),
      ('Dr. Demo User',     'doctor@uiu.health',   '$2b$10$mXl/KkObn./4MXeySTxM6.ayETHGqWP1sWtmas5cYX2BQ9mX7BJLK', 'doctor',   '01712345679'),
      ('Dhaka Medical',     'hospital@uiu.health', '$2b$10$mXl/KkObn./4MXeySTxM6.ayETHGqWP1sWtmas5cYX2BQ9mX7BJLK', 'hospital', '01712345680'),
      ('Admin User',        'admin@uiu.health',    '$2b$10$mXl/KkObn./4MXeySTxM6.ayETHGqWP1sWtmas5cYX2BQ9mX7BJLK', 'admin',    '01712345681')
    `);
    console.log('Seeded demo users.');
  }

  // Seed example@gmail.com test patient (password123)
  const [exCheck] = await pool.query("SELECT COUNT(*) as c FROM users WHERE email = 'example@gmail.com'");
  if (exCheck[0].c === 0) {
    await pool.query(`
      INSERT INTO users (name, email, password, role, phone) VALUES
      ('Example Patient', 'example@gmail.com', '$2b$10$.qA1dNsNoB.WCZA/AQSBgOI1cDz/H5WxzhZCO5W08LADAfsizyADu', 'patient', '01711111111')
    `);
    console.log('Seeded example test user.');
  }

  // ── Seed doctors ───────────────────────────────────────────────────────────
  const [docCheck] = await pool.query('SELECT COUNT(*) as c FROM doctors');
  if (docCheck[0].c === 0) {
    await pool.query(`
      INSERT INTO doctors (name, specialty, hospital, rating, reviews, fee, available, exp, image_initials, phone, degree, avail_text) VALUES
      ('Dr. Aisha Rahman', 'Cardiology',   'Dhaka Medical',    4.9, 312, '৳800',  1, '15 years', 'AR', '+880 1712-345678', 'MBBS, FCPS (Cardiology)',  'Today'),
      ('Dr. Karim Hassan', 'Neurology',    'Square Hospital',  4.8, 248, '৳1000', 1, '12 years', 'KH', '+880 1712-345679', 'MBBS, MD (Neurology)',     'Tomorrow'),
      ('Dr. Priya Das',    'Pediatrics',   'Bangladesh Nat.',  4.9, 421, '৳600',  1, '8 years',  'PD', '+880 1712-345680', 'MBBS, DCH (Pediatrics)',   'Wed, Oct 16'),
      ('Dr. Omar Sheikh',  'Dermatology',  'BSMMU',            4.7, 189, '৳700',  1, '10 years', 'OS', '+880 1712-345681', 'MBBS, DDV (Dermatology)',  'Today'),
      ('Dr. Fatima Ali',   'Psychiatry',   'Apollo',           4.8, 156, '৳900',  1, '14 years', 'FA', '+880 1712-345682', 'MBBS, FCPS (Psychiatry)', 'Tomorrow'),
      ('Dr. Rafi Islam',   'Orthopedics',  'Labaid',           4.6, 203, '৳850',  1, '18 years', 'RI', '+880 1712-345683', 'MBBS, MS (Orthopedics)',   'Thu, Oct 17')
    `);
    console.log('Seeded doctors data.');
  }

  // Link seeded 'Dr. Demo User' (doctor@uiu.health) user to 'Dr. Aisha Rahman' in doctors table
  const [demoDoctorUser] = await pool.query("SELECT id FROM users WHERE email = 'doctor@uiu.health'");
  if (demoDoctorUser.length > 0) {
    const docUserId = demoDoctorUser[0].id;
    await pool.query("UPDATE doctors SET user_id = ? WHERE name = 'Dr. Aisha Rahman' AND (user_id IS NULL OR user_id = 0)", [docUserId]);
  }

  // ── Blood Donors Table ──────────────────────────────────────────────────────
  await pool.query(`
    CREATE TABLE IF NOT EXISTS blood_donors (
      id          INT AUTO_INCREMENT PRIMARY KEY,
      user_id     INT NULL,
      name        VARCHAR(255) NOT NULL,
      blood_group VARCHAR(10) NOT NULL,
      phone       VARCHAR(50) NOT NULL,
      country     VARCHAR(100) DEFAULT 'Bangladesh',
      district    VARCHAR(100) NOT NULL,
      location    VARCHAR(255) NOT NULL,
      created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  const [donorCheck] = await pool.query('SELECT COUNT(*) as c FROM blood_donors WHERE user_id IS NULL');
  if (donorCheck[0].c < 100) {
    try {
      const fs = require('fs');
      const path = require('path');
      const donorsData = JSON.parse(fs.readFileSync(path.join(__dirname, 'donors.json'), 'utf8'));
      
      // Clear incomplete automatic seedings
      await pool.query('DELETE FROM blood_donors WHERE user_id IS NULL');
      
      const values = donorsData.map(d => [d.name, d.blood_group, d.phone, d.country, d.district, d.location]);
      await pool.query(`
        INSERT INTO blood_donors (name, blood_group, phone, country, district, location)
        VALUES ?
      `, [values]);
      console.log('Seeded 100 blood donors.');
    } catch (err) {
      console.error('Failed to seed blood donors:', err);
    }
  }

  console.log('Database tables verified/created successfully.');
}

async function query(sql, params) {
  return pool.query(sql, params);
}

module.exports = { initializeDatabase, query };
