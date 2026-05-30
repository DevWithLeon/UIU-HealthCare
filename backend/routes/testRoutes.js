const express = require('express');
const router = require('express').Router();
const jwt = require('jsonwebtoken');
const { query } = require('../db');

// Middleware to authenticate
const auth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'No token provided' });
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'uiu_healthcare_secret_key_2026');
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// 1. Book a Medical Test (Patient)
router.post('/book', auth, async (req, res) => {
  if (req.user.role !== 'patient') return res.status(403).json({ error: 'Only patients can book tests.' });
  
  const { hospital_id, test_name, insurance_company, policy_number, total_fee } = req.body;
  if (!hospital_id || !test_name || total_fee === undefined) {
    return res.status(400).json({ error: 'Hospital, Test name, and total fee are required.' });
  }

  try {
    const [result] = await query(
      'INSERT INTO medical_tests (patient_id, hospital_id, test_name, insurance_company, policy_number, total_fee) VALUES (?, ?, ?, ?, ?, ?)',
      [req.user.id, hospital_id, test_name, insurance_company || null, policy_number || null, total_fee]
    );
    res.json({ success: true, test_id: result.insertId });
  } catch (error) {
    console.error('Error booking test:', error);
    res.status(500).json({ error: 'Failed to book medical test.' });
  }
});

// 2. Get Test History (Patient)
router.get('/my-tests', auth, async (req, res) => {
  if (req.user.role !== 'patient') return res.status(403).json({ error: 'Unauthorized.' });
  
  try {
    const [rows] = await query(`
      SELECT t.*, u.name as hospital_name 
      FROM medical_tests t
      JOIN users u ON t.hospital_id = u.id
      WHERE t.patient_id = ?
      ORDER BY t.id DESC
    `, [req.user.id]);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching tests:', error);
    res.status(500).json({ error: 'Failed to fetch medical tests.' });
  }
});

// 3. Get Tests for Hospital (Hospital)
router.get('/hospital', auth, async (req, res) => {
  if (req.user.role !== 'hospital') return res.status(403).json({ error: 'Unauthorized.' });
  
  try {
    const [rows] = await query(`
      SELECT t.*, p.name as patient_name, p.phone as patient_phone
      FROM medical_tests t
      JOIN users p ON t.patient_id = p.id
      WHERE t.hospital_id = ?
      ORDER BY t.id DESC
    `, [req.user.id]);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching tests:', error);
    res.status(500).json({ error: 'Failed to fetch medical tests.' });
  }
});

// 4. Update Test Status (Hospital)
router.put('/:id/status', auth, async (req, res) => {
  if (req.user.role !== 'hospital') return res.status(403).json({ error: 'Unauthorized.' });
  
  const { status } = req.body;
  if (!['Pending', 'Completed', 'Cancelled'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status.' });
  }

  try {
    const [test] = await query('SELECT hospital_id FROM medical_tests WHERE id = ?', [req.params.id]);
    if (test.length === 0) return res.status(404).json({ error: 'Test not found.' });
    if (test[0].hospital_id !== req.user.id) return res.status(403).json({ error: 'Unauthorized to modify this test.' });

    await query('UPDATE medical_tests SET status = ? WHERE id = ?', [status, req.params.id]);
    res.json({ success: true });
  } catch (error) {
    console.error('Error updating test:', error);
    res.status(500).json({ error: 'Failed to update medical test.' });
  }
});

module.exports = router;
