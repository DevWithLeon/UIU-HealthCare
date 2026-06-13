const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();
const { initializeDatabase } = require('./db');

const app = express();

app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175', 'http://localhost:3000'],
  credentials: true
}));
app.use(express.json());

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Initialize MySQL Connection and Tables
initializeDatabase();

// Routes
app.use('/api/auth',         require('./routes/authRoutes'));
app.use('/api/appointments', require('./routes/appointmentRoutes'));
app.use('/api/records',      require('./routes/recordRoutes'));
app.use('/api/doctors',      require('./routes/doctorRoutes'));
app.use('/api/chat',         require('./routes/chatRoutes'));
app.use('/api/emergencies',  require('./routes/emergencyRoutes'));
app.use('/api/insurance',    require('./routes/insuranceRoutes'));
app.use('/api/prescriptions', require('./routes/prescriptionRoutes'));
app.use('/api/tests',        require('./routes/testRoutes'));
app.use('/api/forum',        require('./routes/forumRoutes'));
app.use('/api/blood-donors', require('./routes/bloodDonorRoutes'));

// Public Stats for Landing Page
app.get('/api/stats', async (req, res) => {
  const { query } = require('./db');
  try {
    const [patients] = await query('SELECT COUNT(*) as count FROM users WHERE role = "patient"');
    const [doctors] = await query('SELECT COUNT(*) as count FROM users WHERE role = "doctor"');
    const [hospitals] = await query('SELECT COUNT(*) as count FROM users WHERE role = "hospital"');
    const [appointments] = await query('SELECT COUNT(*) as count FROM appointments');
    
    res.json({
      patients: patients[0].count,
      doctors: doctors[0].count,
      hospitals: hospitals[0].count,
      appointments: appointments[0].count
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

app.get('/', (req, res) => {
  res.json({ message: 'UIU HealthCare API Running 🚀', version: '2.0.0' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});