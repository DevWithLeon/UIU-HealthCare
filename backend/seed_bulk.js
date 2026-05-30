const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'uiu_healthcare',
  port: process.env.DB_PORT || 3306
};

const hospitalsList = [
  { name: "Square Hospital", email: "square@uiu.health" },
  { name: "Apollo Hospital", email: "apollo@uiu.health" },
  { name: "Labaid Specialized Hospital", email: "labaid@uiu.health" },
  { name: "United Hospital", email: "united@uiu.health" },
  { name: "Evercare Hospital", email: "evercare@uiu.health" },
  { name: "Dhaka Medical College", email: "dmch@uiu.health" },
  { name: "BSMMU", email: "bsmmu@uiu.health" },
  { name: "BIRDEM General Hospital", email: "birdem@uiu.health" },
  { name: "Ibn Sina Hospital", email: "ibnsina@uiu.health" },
  { name: "Popular Diagnostic Centre", email: "popular@uiu.health" },
  { name: "Green Life Hospital", email: "greenlife@uiu.health" },
  { name: "Kurmitola General", email: "kurmitola@uiu.health" }
];

const insuranceList = [
  { name: "MetLife Bangladesh", email: "metlife@uiu.health" },
  { name: "Delta Life Insurance", email: "deltalife@uiu.health" },
  { name: "Pragati Life Insurance", email: "pragati@uiu.health" },
  { name: "National Life Insurance", email: "national@uiu.health" },
  { name: "Green Delta Insurance", email: "greendelta@uiu.health" }
];

const doctorNames = [
  "Dr. Ayesha Akhter", "Dr. Kamal Hossain", "Dr. Nusrat Jahan", "Dr. Tariqul Islam",
  "Dr. Farzana Rahman", "Dr. Shafiqur Rahman", "Dr. Tasnia Hossain", "Dr. Mahbub Alam",
  "Dr. Rumana Islam", "Dr. Iftikhar Ahmed", "Dr. Samina Chowdhury", "Dr. Ziaur Rahman",
  "Dr. Sabrina Khan", "Dr. Tanvir Hasan", "Dr. Laila Arjumand", "Dr. Anisur Rahman",
  "Dr. Sadia Afrin", "Dr. Mostafa Kamal", "Dr. Nadia Islam", "Dr. Rakib Hasan",
  "Dr. Meherunnesa", "Dr. Aminul Islam", "Dr. Salma Begum", "Dr. Hasan Mahmud",
  "Dr. Sharmin Sultana", "Dr. Kazi Ariful Islam", "Dr. Fahmida Khatun", "Dr. Nazmul Huda",
  "Dr. Ishrat Jahan", "Dr. Enamul Haque", "Dr. Shirin Akhter", "Dr. Mizanur Rahman",
  "Dr. Farhana Islam", "Dr. Syed Asif", "Dr. Tahmina Akter", "Dr. Golam Mostafa",
  "Dr. Ruma Parvin", "Dr. Shafayat Hossain", "Dr. Rokeya Begum", "Dr. Ahsan Habib",
  "Dr. Naima Rahman", "Dr. Asaduzzaman", "Dr. Sabiha Chowdhury", "Dr. Taufiqur Rahman",
  "Dr. Jannatul Ferdous", "Dr. Anwar Hossain", "Dr. Taslima Akhter", "Dr. Moniruzzaman",
  "Dr. Farah Deeba", "Dr. Mahmudul Hasan"
];

const patientNames = [
  "Rahim Uddin", "Karim Bakhsh", "Fatema Begum", "Sufia Kamal", "Habibullah",
  "Nazma Khatun", "Selim Reza", "Morsheda Begum", "Abdul Jalil", "Ferdousi Rahman",
  "Jalal Ahmed", "Hasina Akter", "Mominul Haque", "Rizia Parveen", "Khorshed Alam",
  "Amena Begum", "Rafiqul Islam", "Nasreen Jahan", "Shahjahan Ali", "Salma Chowdhury",
  "Abdur Rahman", "Rasheda Khatun", "Iqbal Hossain", "Tania Sultana", "Humayun Kabir",
  "Sharmin Akter", "Kamrul Hasan", "Fahima Khatun", "Zahirul Islam", "Shabana Begum",
  "Farid Ahmed", "Rozina Akter", "Alamgir Hossain", "Kohinoor Begum", "Mustafizur Rahman",
  "Shahnaz Parveen", "Golam Rabbani", "Asma Khatun", "Tariqul Islam", "Parvin Sultana",
  "Anisur Rahman", "Shamima Nasrin", "Mahbubur Rahman", "Jesmin Akter", "Nazrul Islam",
  "Rubina Begum", "Ziaul Haque", "Farzana Islam", "Elias Hossain", "Sultana Razia"
];

const specialties = ["Cardiology", "Neurology", "Pediatrics", "Dermatology", "Psychiatry", "Orthopedics", "General Medicine", "Oncology", "Gynaecology"];
const degrees = ["MBBS, FCPS", "MBBS, MD", "MBBS, MS", "MBBS, FRCS", "MBBS, MCPS", "MBBS, MRCP", "MBBS, DGO"];

async function seedMassiveData() {
  console.log("Starting massive realistic data seed...");
  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    
    console.log("Cleaning old data...");
    await connection.query('SET FOREIGN_KEY_CHECKS = 0');
    const tables = ['users', 'doctors', 'appointments', 'prescriptions', 'medical_records', 'insurance_claims', 'medical_tests', 'audit_logs', 'emergencies', 'chat_history'];
    for (const t of tables) {
      await connection.query(`TRUNCATE TABLE ${t}`);
    }
    await connection.query('SET FOREIGN_KEY_CHECKS = 1');
    console.log("Database wiped clean.");

    const passwordHash = await bcrypt.hash('Demo@1234', 10);
    
    // 0. Seed 1 Admin
    await connection.query('INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, "admin")', ["System Admin", "admin@uiu.health", passwordHash]);

    // 1. Seed Hospitals
    for (let i = 0; i < hospitalsList.length; i++) {
      const h = hospitalsList[i];
      const hImage = `https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?w=400&q=80&auto=format&fit=crop`; // Generic nice hospital building
      await connection.query('INSERT INTO users (name, email, password, role, image) VALUES (?, ?, ?, "hospital", ?)', [h.name, h.email, passwordHash, hImage]);
    }
    console.log(`✅ Seeded ${hospitalsList.length} Hospitals`);

    // 2. Seed Insurance
    for (let i = 0; i < insuranceList.length; i++) {
      const h = insuranceList[i];
      await connection.query('INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, "insurance")', [h.name, h.email, passwordHash]);
    }
    console.log(`✅ Seeded ${insuranceList.length} Insurance Companies`);

    // 3. Seed 50 Doctors
    for (let i = 0; i < doctorNames.length; i++) {
      const dName = doctorNames[i];
      // Generate email like ayesha.akhter@uiu.health
      const dEmail = dName.replace('Dr. ', '').toLowerCase().replace(' ', '.') + `@uiu.health`;
      const spec = specialties[i % specialties.length];
      const hosp = hospitalsList[i % hospitalsList.length].name;
      const deg = degrees[i % degrees.length];
      const fee = `৳${(Math.floor(Math.random() * 5) + 5) * 100}`;
      const img = `https://i.pravatar.cc/150?img=${(i % 70) + 1}`; // Real face avatars
      const bmdc = `A-${Math.floor(Math.random() * 90000) + 10000}`;
      const phone = `017${Math.floor(Math.random() * 90000000) + 10000000}`;

      const [uRes] = await connection.query('INSERT INTO users (name, email, password, role, phone, bmdc_number, image) VALUES (?, ?, ?, "doctor", ?, ?, ?)', [dName, dEmail, passwordHash, phone, bmdc, img]);
      const userId = uRes.insertId;
      
      await connection.query(
        'INSERT INTO doctors (user_id, name, specialty, hospital, degree, rating, reviews, fee, available, exp, image, phone) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [userId, dName, spec, hosp, deg, (4.0 + Math.random()*1.0).toFixed(1), Math.floor(Math.random()*300)+20, fee, 1, `${Math.floor(Math.random()*25)+3} years`, img, phone]
      );
    }
    console.log(`✅ Seeded ${doctorNames.length} Realistic Doctors`);

    // 4. Seed 50 Patients
    for (let i = 0; i < patientNames.length; i++) {
      const pName = patientNames[i];
      const pEmail = pName.toLowerCase().replace(' ', '.') + `.patient${i}@uiu.health`;
      const phone = `018${Math.floor(Math.random() * 90000000) + 10000000}`;
      const pImage = `https://i.pravatar.cc/150?img=${((i + 35) % 70) + 1}`;
      await connection.query('INSERT INTO users (name, email, password, role, phone, image) VALUES (?, ?, ?, "patient", ?, ?)', [pName, pEmail, passwordHash, phone, pImage]);
    }
    console.log(`✅ Seeded ${patientNames.length} Realistic Patients`);

    console.log("\n=========================================");
    console.log("🎉 SEEDING COMPLETE! ALL ACCOUNTS USE PASSWORD: Demo@1234");
    console.log("Hospitals: square@uiu.health, apollo@uiu.health, etc.");
    console.log("Doctors: ayesha.akhter@uiu.health, kamal.hossain@uiu.health, etc.");
    console.log("Patients: rahim.uddin@uiu.health, fatema.begum@uiu.health, etc.");
    console.log("Admin: admin@uiu.health");
    console.log("=========================================\n");

    await connection.end();
  } catch (error) {
    console.error("Seeding failed:", error);
    if(connection) await connection.end();
  }
}

seedMassiveData();
