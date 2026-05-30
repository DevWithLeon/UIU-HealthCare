const express = require('express');
const router = express.Router();
const { query } = require('../db');
const auth = require('../middleware/auth');

// GET all prescriptions for the logged-in user (patient or doctor)
router.get('/', auth, async (req, res) => {
  try {
    const { role, id } = req.user;
    if (role === 'patient') {
      const [rows] = await query(
        `SELECT p.*, d.name as doctor_name, d.specialty, d.hospital, d.degree, d.phone as doctor_phone, u.name as patient_name, u.phone as patient_phone
         FROM prescriptions p
         LEFT JOIN doctors d ON p.doctor_id = d.id
         LEFT JOIN users u ON p.patient_id = u.id
         WHERE p.patient_id = ? ORDER BY p.id DESC`,
        [id]
      );
      res.json(rows);
    } else if (role === 'doctor') {
      // Find the doctor record linked to this user
      const [doctorRows] = await query('SELECT id FROM doctors WHERE user_id = ?', [id]);
      const doctorId = doctorRows.length > 0 ? doctorRows[0].id : null;
      if (!doctorId) return res.json([]);

      const [rows] = await query(
        `SELECT p.*, d.name as doctor_name, d.specialty, d.hospital, d.degree, d.phone as doctor_phone, u.name as patient_name, u.phone as patient_phone
         FROM prescriptions p
         LEFT JOIN doctors d ON p.doctor_id = d.id
         LEFT JOIN users u ON p.patient_id = u.id
         WHERE p.doctor_id = ? ORDER BY p.id DESC`,
        [doctorId]
      );
      res.json(rows);
    } else {
      // admin or hospital/etc can see all prescriptions
      const [rows] = await query(
        `SELECT p.*, d.name as doctor_name, d.specialty, d.hospital, d.degree, d.phone as doctor_phone, u.name as patient_name, u.phone as patient_phone
         FROM prescriptions p
         LEFT JOIN doctors d ON p.doctor_id = d.id
         LEFT JOIN users u ON p.patient_id = u.id
         ORDER BY p.id DESC`
      );
      res.json(rows);
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database fetch error' });
  }
});

// POST create prescription (doctor only)
router.post('/', auth, async (req, res) => {
  try {
    const { role, id } = req.user;
    if (role !== 'doctor' && role !== 'admin') {
      return res.status(403).json({ error: 'Only doctors can write prescriptions.' });
    }

    const { patient_id, diagnosis, medications, advice, suggested_tests } = req.body;
    if (!patient_id || !diagnosis || !medications) {
      return res.status(400).json({ error: 'Missing required fields: patient_id, diagnosis, medications.' });
    }

    // Find the doctor record linked to this user
    let doctorId = null;
    if (role === 'doctor') {
      const [doctorRows] = await query('SELECT id FROM doctors WHERE user_id = ?', [id]);
      if (doctorRows.length === 0) {
        return res.status(404).json({ error: 'Doctor profile not found.' });
      }
      doctorId = doctorRows[0].id;
    } else {
      // For admin seeding or mock requests, use body's doctor_id if available, else default to first doctor
      const [allDocs] = await query('SELECT id FROM doctors LIMIT 1');
      doctorId = req.body.doctor_id || (allDocs.length > 0 ? allDocs[0].id : 1);
    }

    // Generate a secure verification QR code string
    const refCode = `RX-${Date.now().toString().slice(-6)}`;
    const qrCodeUrl = `https://uiu-healthcare.com/verify-prescription/${refCode}`;

    const [result] = await query(
      `INSERT INTO prescriptions (doctor_id, patient_id, diagnosis, medications, advice, suggested_tests, qr_code)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [doctorId, patient_id, diagnosis, medications, advice || null, suggested_tests || null, qrCodeUrl]
    );

    res.status(201).json({
      id: result.insertId,
      doctor_id: doctorId,
      patient_id,
      diagnosis,
      medications,
      advice,
      suggested_tests,
      qr_code: qrCodeUrl,
      message: 'Prescription issued successfully.'
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database save error' });
  }
});

module.exports = router;
