const express = require('express');
const router = express.Router();
const { query } = require('../db');
const auth = require('../middleware/auth');

// GET all doctors (public)
router.get('/', async (req, res) => {
  try {
    const { specialty, search } = req.query;
    let sql = 'SELECT * FROM doctors WHERE 1=1';
    const params = [];
    if (specialty && specialty !== 'All') {
      sql += ' AND specialty = ?';
      params.push(specialty);
    }
    if (search) {
      sql += ' AND (name LIKE ? OR specialty LIKE ? OR hospital LIKE ?)';
      const like = `%${search}%`;
      params.push(like, like, like);
    }
    sql += ' ORDER BY rating DESC';
    const [rows] = await query(sql, params);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database fetch error' });
  }
});

// GET single doctor
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await query('SELECT * FROM doctors WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Doctor not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database fetch error' });
  }
});

module.exports = router;
