const express = require('express');
const router = express.Router();
const { query } = require('../db');
const auth = require('../middleware/auth');

// GET all appointments for logged-in user
router.get('/', auth, async (req, res) => {
  try {
    const { role, id } = req.user;
    let rows;
    if (role === 'patient') {
      [rows] = await query(
        `SELECT a.*, d.name as doctor_name, d.specialty, d.hospital 
         FROM appointments a
         LEFT JOIN doctors d ON a.doctor_id = d.id
         WHERE a.patient_id = ? ORDER BY a.id DESC`,
        [id]
      );
    } else if (role === 'doctor') {
      // Find doctor record linked to this user
      const [doctorRows] = await query('SELECT id FROM doctors WHERE user_id = ?', [id]);
      const doctorId = doctorRows.length > 0 ? doctorRows[0].id : null;
      if (!doctorId) return res.json([]);
      [rows] = await query(
        `SELECT a.*, u.name as patient_name 
         FROM appointments a
         LEFT JOIN users u ON a.patient_id = u.id
         WHERE a.doctor_id = ? ORDER BY a.id DESC`,
        [doctorId]
      );
    } else {
      // admin: all appointments
      [rows] = await query(
        `SELECT a.*, u.name as patient_name, d.name as doctor_name
         FROM appointments a
         LEFT JOIN users u ON a.patient_id = u.id
         LEFT JOIN doctors d ON a.doctor_id = d.id
         ORDER BY a.id DESC`
      );
    }
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database fetch error' });
  }
});

// Book appointment (patient only)
router.post('/', auth, async (req, res) => {
  try {
    if (req.user.role !== 'patient') {
      return res.status(403).json({ error: 'Only patients can book appointments.' });
    }
    const patient_id = req.user.id;
    const { doctor_id, date, time, type, notes } = req.body;
    if (!doctor_id || !date || !time || !type) {
      return res.status(400).json({ error: 'Missing required fields: doctor_id, date, time, type.' });
    }
    
    // Generate ref code
    const [countResult] = await query('SELECT COUNT(*) as count FROM appointments');
    const refCode = `APT-${String(countResult[0].count + 1).padStart(4, '0')}`;

    const [result] = await query(
      'INSERT INTO appointments (ref_code, patient_id, doctor_id, date, time, type, status, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [refCode, patient_id, doctor_id, date, time, type, 'Upcoming', notes || null]
    );

    // Fetch doctor info for response
    const [doctorRows] = await query('SELECT name, specialty, hospital FROM doctors WHERE id = ?', [doctor_id]);
    const doctor = doctorRows[0] || {};

    res.status(201).json({
      id: result.insertId,
      ref_code: refCode,
      patient_id,
      doctor_id,
      doctor_name: doctor.name,
      specialty: doctor.specialty,
      hospital: doctor.hospital,
      date,
      time,
      type,
      status: 'Upcoming'
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database save error' });
  }
});

// Cancel appointment by index (patient only)
router.delete('/:id', auth, async (req, res) => {
  try {
    const patient_id = req.user.id;
    const { id } = req.params;
    
    const [rows] = await query('SELECT * FROM appointments WHERE id = ? AND patient_id = ?', [id, patient_id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Appointment not found or not yours.' });
    }
    if (rows[0].status === 'Completed') {
      return res.status(400).json({ error: 'Cannot cancel a completed appointment.' });
    }

    await query('UPDATE appointments SET status = ? WHERE id = ?', ['Cancelled', id]);
    res.json({ message: 'Appointment cancelled successfully.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database cancel error' });
  }
});

// Cancel by reference code
router.post('/cancel-by-ref', auth, async (req, res) => {
  try {
    const patient_id = req.user.id;
    const { ref_code } = req.body;
    if (!ref_code) return res.status(400).json({ error: 'ref_code is required.' });

    const [rows] = await query('SELECT * FROM appointments WHERE ref_code = ? AND patient_id = ?', [ref_code, patient_id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Invalid appointment reference or not yours.' });
    }
    if (rows[0].status === 'Completed') {
      return res.status(400).json({ error: 'Cannot cancel a completed appointment.' });
    }
    if (rows[0].status === 'Cancelled') {
      return res.status(400).json({ error: 'Appointment is already cancelled.' });
    }

    await query('UPDATE appointments SET status = ? WHERE ref_code = ? AND patient_id = ?', ['Cancelled', ref_code, patient_id]);
    res.json({ message: 'Appointment cancelled successfully.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database cancel error' });
  }
});

// GET appointments for a specific doctor by user_id (doctor dashboard)
router.get('/doctor', auth, async (req, res) => {
  try {
    const { id, role } = req.user;
    if (role !== 'doctor' && role !== 'admin') {
      return res.status(403).json({ error: 'Access denied.' });
    }
    // Find the doctor record linked to this user
    const [doctorRows] = await query('SELECT id FROM doctors WHERE user_id = ?', [id]);
    if (doctorRows.length === 0) {
      // Fallback: return all appointments for admin, or empty for doctor without record
      if (role === 'admin') {
        const [rows] = await query(
          `SELECT a.*, u.name as patient_name, d.name as doctor_name
           FROM appointments a
           LEFT JOIN users u ON a.patient_id = u.id
           LEFT JOIN doctors d ON a.doctor_id = d.id
           ORDER BY a.id DESC`
        );
        return res.json(rows);
      }
      return res.json([]);
    }
    const doctorId = doctorRows[0].id;
    const [rows] = await query(
      `SELECT a.*, u.name as patient_name
       FROM appointments a
       LEFT JOIN users u ON a.patient_id = u.id
       WHERE a.doctor_id = ? ORDER BY a.id DESC`,
      [doctorId]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

// GET all appointments (admin)
router.get('/all', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'hospital') return res.status(403).json({ error: 'Hospital or Admin only.' });
    const [rows] = await query(
      `SELECT a.*, u.name as patient_name, d.name as doctor_name, d.specialty
       FROM appointments a
       LEFT JOIN users u ON a.patient_id = u.id
       LEFT JOIN doctors d ON a.doctor_id = d.id
       ORDER BY a.id DESC`
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

// PUT update appointment status (doctor/admin)
router.put('/:id/status', auth, async (req, res) => {
  try {
    const { role } = req.user;
    if (role !== 'doctor' && role !== 'admin' && role !== 'hospital') {
      return res.status(403).json({ error: 'Not authorized.' });
    }
    const { status } = req.body;
    const validStatuses = ['Upcoming', 'Completed', 'Cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status.' });
    }
    await query('UPDATE appointments SET status = ? WHERE id = ?', [status, req.params.id]);
    res.json({ success: true, message: 'Status updated.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Update error' });
  }
});

module.exports = router;
