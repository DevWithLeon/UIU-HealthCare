const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { query } = require('../db');

// CHECK EMAIL
router.post('/check-email', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required.' });
    const [existing] = await query('SELECT * FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(400).json({ error: 'User with this email already exists.' });
    }
    res.json({ available: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database check error' });
  }
});

// REGISTER
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, phone, bmdc_number, license_number } = req.body;
    
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required.' });
    }

    // Check if user already exists
    const [existing] = await query('SELECT * FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(400).json({ error: 'User with this email already exists.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await query(
      `INSERT INTO users (name, email, password, role, phone, bmdc_number, license_number) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [name, email, hashedPassword, role || 'patient', phone || null, bmdc_number || null, license_number || null]
    );

    const userId = result.insertId;
    const user = { id: userId, name, email, role: role || 'patient' };

    res.status(201).json({ message: 'User registered successfully', user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database register error' });
  }
});

// LOGIN
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const [rows] = await query('SELECT * FROM users WHERE email = ?', [email]);
    if (rows.length === 0) {
      return res.status(400).json({ error: 'User not found' });
    }

    const user = rows[0];
    if (user.is_banned === 1) {
      return res.status(403).json({ error: 'This account has been suspended/banned by Admin.' });
    }

    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return res.status(400).json({ error: 'Wrong password' });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role }, 
      process.env.JWT_SECRET || 'uiu_healthcare_secret_key_2026',
      { expiresIn: '7d' }
    );

    // Don't send password back
    delete user.password;

    res.json({ token, user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database login error' });
  }
});

// VERIFY SESSION
router.get('/me', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: 'No token provided' });

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'uiu_healthcare_secret_key_2026');

    const [rows] = await query('SELECT id, name, email, role, phone, bmdc_number, license_number, is_banned, image FROM users WHERE id = ?', [decoded.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'User not found' });
    if (rows[0].is_banned === 1) return res.status(403).json({ error: 'Account suspended' });

    res.json({ user: rows[0] });
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
});

// GET all hospitals (Public / Patient accessible)
router.get('/hospitals', async (req, res) => {
  try {
    const [rows] = await query("SELECT id, name FROM users WHERE role = 'hospital' AND is_banned = 0");
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'DB error' });
  }
});

// GET all users (admin only)
router.get('/users', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: 'No token' });
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(authHeader.split(' ')[1], process.env.JWT_SECRET || 'uiu_healthcare_secret_key_2026');
    if (decoded.role !== 'admin') return res.status(403).json({ error: 'Admin only.' });
    const [rows] = await query('SELECT id, name, email, role, phone, is_banned, created_at FROM users ORDER BY id DESC');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(401).json({ error: 'Invalid token or DB error' });
  }
});

// TOGGLE BAN user (admin only)
router.put('/users/:id/ban', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: 'No token' });
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(authHeader.split(' ')[1], process.env.JWT_SECRET || 'uiu_healthcare_secret_key_2026');
    if (decoded.role !== 'admin') return res.status(403).json({ error: 'Admin only.' });
    
    const { is_banned } = req.body;
    await query('UPDATE users SET is_banned = ? WHERE id = ?', [is_banned, req.params.id]);
    
    // Create Audit Log
    const action = is_banned ? 'User Banned' : 'User Unbanned';
    await query('INSERT INTO audit_logs (admin_id, action, details) VALUES (?, ?, ?)', [decoded.id, action, `Admin changed ban status of user ID ${req.params.id} to ${is_banned}`]);
    
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ban error' });
  }
});

// DELETE user (admin only)
router.delete('/users/:id', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: 'No token' });
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(authHeader.split(' ')[1], process.env.JWT_SECRET || 'uiu_healthcare_secret_key_2026');
    if (decoded.role !== 'admin') return res.status(403).json({ error: 'Admin only.' });
    
    await query('DELETE FROM users WHERE id = ?', [req.params.id]);
    
    // Create Audit Log
    await query('INSERT INTO audit_logs (admin_id, action, details) VALUES (?, ?, ?)', [decoded.id, 'User Deleted', `Admin deleted user ID ${req.params.id}`]);
    
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Delete error' });
  }
});

// GET Audit Logs (admin only)
router.get('/audit-logs', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: 'No token' });
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(authHeader.split(' ')[1], process.env.JWT_SECRET || 'uiu_healthcare_secret_key_2026');
    if (decoded.role !== 'admin') return res.status(403).json({ error: 'Admin only.' });
    
    const [rows] = await query('SELECT a.*, u.name as admin_name FROM audit_logs a LEFT JOIN users u ON a.admin_id = u.id ORDER BY a.id DESC');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Audit fetch error' });
  }
});

module.exports = router;
