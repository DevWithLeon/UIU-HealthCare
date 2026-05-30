const express = require('express');
const router = express.Router();
const { query } = require('../db');
const auth = require('../middleware/auth');

// GET all claims (for insurance role or admin)
router.get('/all', auth, async (req, res) => {
  try {
    if (req.user.role !== 'insurance' && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied.' });
    }
    const [rows] = await query(`
      SELECT c.*, u.name as patient_name, u.phone as patient_phone, r.title as record_title, r.file_url
      FROM insurance_claims c
      JOIN users u ON c.patient_id = u.id
      LEFT JOIN medical_records r ON c.record_id = r.id
      ORDER BY c.id DESC
    `);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database fetch error' });
  }
});

// GET patient's own claims
router.get('/my-claims', auth, async (req, res) => {
  try {
    if (req.user.role !== 'patient') {
      return res.status(403).json({ error: 'Patients only.' });
    }
    const [rows] = await query(`
      SELECT c.*, r.title as record_title, r.file_url
      FROM insurance_claims c
      LEFT JOIN medical_records r ON c.record_id = r.id
      WHERE c.patient_id = ?
      ORDER BY c.id DESC
    `, [req.user.id]);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database fetch error' });
  }
});

// POST submit a claim
router.post('/', auth, async (req, res) => {
  try {
    if (req.user.role !== 'patient') {
      return res.status(403).json({ error: 'Only patients can submit claims.' });
    }
    const { title, description, amount, record_id } = req.body;
    if (!title || !amount) {
      return res.status(400).json({ error: 'Title and amount are required.' });
    }
    const [result] = await query(
      'INSERT INTO insurance_claims (patient_id, title, description, amount, record_id, status) VALUES (?, ?, ?, ?, ?, ?)',
      [req.user.id, title, description || null, amount, record_id || null, 'Pending']
    );
    res.status(201).json({ id: result.insertId, message: 'Claim submitted successfully.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database save error' });
  }
});

// PUT update claim status (Approved / Rejected)
router.put('/:id/status', auth, async (req, res) => {
  try {
    if (req.user.role !== 'insurance' && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied.' });
    }
    const { status } = req.body;
    if (status !== 'Approved' && status !== 'Rejected' && status !== 'Pending') {
      return res.status(400).json({ error: 'Invalid status.' });
    }
    await query('UPDATE insurance_claims SET status = ? WHERE id = ?', [status, req.params.id]);
    res.json({ message: 'Claim status updated.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database update error' });
  }
});

module.exports = router;
