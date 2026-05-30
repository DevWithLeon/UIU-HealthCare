// routes/appointments.js
const express = require('express');
const router = express.Router();

// Get all appointments for a user
router.get('/user/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    const [rows] = await req.db.execute(
      `SELECT * FROM appointments WHERE user_id = ? ORDER BY appointment_time ASC`,
      [userId]
    );
    res.json(rows);
  } catch (err) {
    console.error('Error fetching appointments:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create a new appointment
router.post('/', async (req, res) => {
  const { userId, doctorId, appointment_time, reason } = req.body;
  try {
    const [result] = await req.db.execute(
      `INSERT INTO appointments (user_id, doctor_id, appointment_time, reason) VALUES (?,?,?,?)`,
      [userId, doctorId, appointment_time, reason]
    );
    res.status(201).json({ id: result.insertId });
  } catch (err) {
    console.error('Error creating appointment:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Cancel an appointment
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await req.db.execute(`DELETE FROM appointments WHERE id = ?`, [id]);
    res.json({ success: true });
  } catch (err) {
    console.error('Error deleting appointment:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
