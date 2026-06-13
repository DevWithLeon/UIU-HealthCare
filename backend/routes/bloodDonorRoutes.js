const express = require('express');
const router = express.Router();
const db = require('../db');
const auth = require('../middleware/auth');

// Get all blood donors (with optional search and filters)
router.get('/', async (req, res) => {
  try {
    const { blood_group, district, search } = req.query;
    let sql = 'SELECT * FROM blood_donors WHERE 1=1';
    const params = [];

    if (blood_group && blood_group !== 'All') {
      sql += ' AND blood_group = ?';
      params.push(blood_group);
    }

    if (district && district !== 'All') {
      sql += ' AND district = ?';
      params.push(district);
    }

    if (search) {
      sql += ' AND (name LIKE ? OR phone LIKE ? OR location LIKE ? OR district LIKE ?)';
      const term = `%${search}%`;
      params.push(term, term, term, term);
    }

    sql += ' ORDER BY id DESC';

    const [donors] = await db.query(sql, params);
    res.json(donors);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch blood donors.' });
  }
});

// Get unique districts for filter dropdown
router.get('/districts', async (req, res) => {
  try {
    const [districts] = await db.query('SELECT DISTINCT district FROM blood_donors ORDER BY district ASC');
    res.json(districts.map(d => d.district));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch districts.' });
  }
});

// Get user's own donor profile
router.get('/me', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const [donor] = await db.query('SELECT * FROM blood_donors WHERE user_id = ?', [userId]);
    if (donor.length === 0) {
      return res.status(404).json({ error: 'Donor profile not found.' });
    }
    res.json(donor[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch donor profile.' });
  }
});

// Register or update yourself as a blood donor
router.post('/', auth, async (req, res) => {
  try {
    const { name, blood_group, phone, district, location } = req.body;
    const userId = req.user.id;

    if (!name || !blood_group || !phone || !district || !location) {
      return res.status(400).json({ error: 'All fields are required.' });
    }

    // Phone validation (11 digits in Bangladesh, e.g. 01[3-9]\d{8})
    const phoneRegex = /^01[3-9]\d{8}$/;
    if (!phoneRegex.test(phone)) {
      return res.status(400).json({ error: 'Please enter a valid 11-digit Bangladesh phone number.' });
    }

    // Check if user is already registered as a donor
    const [existing] = await db.query('SELECT id FROM blood_donors WHERE user_id = ?', [userId]);
    if (existing.length > 0) {
      // Update existing donor profile
      await db.query(`
        UPDATE blood_donors 
        SET name = ?, blood_group = ?, phone = ?, district = ?, location = ?
        WHERE user_id = ?
      `, [name, blood_group, phone, district, location, userId]);
      
      return res.json({ message: 'Blood donor profile updated successfully!' });
    }

    await db.query(`
      INSERT INTO blood_donors (user_id, name, blood_group, phone, district, location)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [userId, name, blood_group, phone, district, location]);

    res.status(201).json({ message: 'Successfully registered as a blood donor!' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to register as blood donor.' });
  }
});

// Delete user's donor profile
router.delete('/me', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    await db.query('DELETE FROM blood_donors WHERE user_id = ?', [userId]);
    res.json({ message: 'Blood donor profile deleted successfully.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete donor profile.' });
  }
});

// Admin only: Update any blood donor profile
router.put('/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required.' });
    }
    const { name, blood_group, phone, district, location } = req.body;
    if (!name || !blood_group || !phone || !district || !location) {
      return res.status(400).json({ error: 'All fields are required.' });
    }
    const phoneRegex = /^01[3-9]\d{8}$/;
    if (!phoneRegex.test(phone)) {
      return res.status(400).json({ error: 'Please enter a valid 11-digit Bangladesh phone number.' });
    }

    await db.query(`
      UPDATE blood_donors 
      SET name = ?, blood_group = ?, phone = ?, district = ?, location = ?
      WHERE id = ?
    `, [name, blood_group, phone, district, location, req.params.id]);

    res.json({ message: 'Blood donor profile updated successfully by Admin!' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update donor profile.' });
  }
});

// Admin only: Delete any blood donor profile
router.delete('/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required.' });
    }
    await db.query('DELETE FROM blood_donors WHERE id = ?', [req.params.id]);
    res.json({ message: 'Blood donor profile deleted successfully by Admin.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete donor profile.' });
  }
});

module.exports = router;
