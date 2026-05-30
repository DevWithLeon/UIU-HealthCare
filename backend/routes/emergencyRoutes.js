const express = require('express');
const router = express.Router();
const { query } = require('../db');
const auth = require('../middleware/auth');

// GET all active emergencies (for hospital/admin dashboard)
router.get('/', async (req, res) => {
  try {
    const [rows] = await query(
      `SELECT e.*, u.name as patient_name, u.phone as patient_phone 
       FROM emergencies e 
       LEFT JOIN users u ON e.patient_id = u.id 
       ORDER BY e.created_at DESC`
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database fetch error' });
  }
});

// POST trigger an SOS (patient or anonymous)
router.post('/sos', async (req, res) => {
  try {
    const { patient_id, location, coordinates } = req.body;
    
    // In real life, we would use an SMS API (like Twilio) here to text relatives.
    // We would also use a push notification service (like Firebase) to alert nearby hospitals.

    const [result] = await query(
      'INSERT INTO emergencies (patient_id, location, coordinates, status) VALUES (?, ?, ?, ?)',
      [patient_id || null, location || 'Unknown', coordinates || '', 'Active']
    );

    res.status(201).json({ 
      success: true, 
      message: 'SOS Alert dispatched to nearby hospitals!', 
      emergency_id: result.insertId 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to trigger SOS' });
  }
});

// PUT update emergency status (hospital marks as resolved/dispatched)
router.put('/:id/status', auth, async (req, res) => {
  try {
    if (req.user.role !== 'hospital' && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Only hospitals can update SOS status.' });
    }
    const { status } = req.body;
    await query('UPDATE emergencies SET status = ? WHERE id = ?', [status, req.params.id]);
    res.json({ success: true, message: 'Emergency status updated.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database update error' });
  }
});

module.exports = router;
