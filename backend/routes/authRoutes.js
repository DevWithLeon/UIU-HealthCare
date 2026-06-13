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

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format. Must be a valid email address ending with a domain extension (e.g. name@mail.com).' });
    }

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

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format. Must be a valid email address ending with a domain extension (e.g. name@mail.com).' });
    }

    if (!phone) {
      return res.status(400).json({ error: 'Phone number is required.' });
    }

    let digits = phone.replace(/\D/g, '');
    if (digits.startsWith('880')) {
      digits = digits.substring(2);
    } else if (digits.startsWith('88')) {
      digits = '0' + digits.substring(2);
    }
    const bdPhoneRegex = /^01[3-9]\d{8}$/;
    if (!bdPhoneRegex.test(digits)) {
      return res.status(400).json({ error: 'Invalid phone number. Must be a valid 11-digit Bangladesh phone number (e.g. 01XXXXXXXXX).' });
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
      [name, email, hashedPassword, role || 'patient', digits, bmdc_number || null, license_number || null]
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

// RESET user password (admin only)
router.put('/users/:id/reset-password', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: 'No token' });
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(authHeader.split(' ')[1], process.env.JWT_SECRET || 'uiu_healthcare_secret_key_2026');
    if (decoded.role !== 'admin') return res.status(403).json({ error: 'Admin only.' });

    const { password } = req.body;
    if (!password || password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters long.' });
    }

    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash(password, 10);

    await query('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, req.params.id]);

    // Create Audit Log
    await query('INSERT INTO audit_logs (admin_id, action, details) VALUES (?, ?, ?)', [
      decoded.id,
      'Password Reset',
      `Admin reset password for user ID ${req.params.id}`
    ]);

    res.json({ success: true, message: 'Password reset successfully!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to reset password.' });
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

// Admin Database Viewer HTML
router.get('/db-viewer', async (req, res) => {
  try {
    const [donors] = await query('SELECT * FROM blood_donors ORDER BY id DESC');
    const [posts] = await query('SELECT * FROM forum_posts ORDER BY id DESC');
    const [users] = await query('SELECT id, name, email, role, phone FROM users ORDER BY id DESC');

    const renderTable = (title, headers, rows) => {
      if (!rows || rows.length === 0) return `<p style="color: #a3a3a3; font-style: italic; margin-bottom: 24px;">No records found in this table.</p>`;
      return `
        <h3 style="color: #ffffff; margin-top: 32px; font-size: 1.25rem; border-left: 4px solid #bef264; padding-left: 10px;">${title} (${rows.length} rows)</h3>
        <div style="overflow-x: auto; border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 12px; margin-top: 12px; margin-bottom: 24px; background: rgba(255,255,255,0.02);">
          <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 0.9rem;">
            <thead>
              <tr style="background: rgba(190, 242, 100, 0.1); border-bottom: 1px solid rgba(255, 255, 255, 0.1);">
                ${headers.map(h => `<th style="padding: 12px 16px; color: #bef264; font-weight: 700;">${h}</th>`).join('')}
              </tr>
            </thead>
            <tbody>
              ${rows.map((row, idx) => `
                <tr style="border-bottom: 1px solid rgba(255, 255, 255, 0.05); background: ${idx % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)'}">
                  ${headers.map(h => `<td style="padding: 12px 16px; color: rgba(255, 255, 255, 0.85);">${row[h] !== null && row[h] !== undefined ? row[h] : '<span style="color: rgba(255,255,255,0.3)">NULL</span>'}</td>`).join('')}
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `;
    };

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>UIU HealthCare Database Explorer</title>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body {
              background-color: #022c22;
              color: #ffffff;
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
              margin: 0;
              padding: 40px 20px;
            }
            .container {
              max-width: 1200px;
              margin: 0 auto;
            }
            header {
              display: flex;
              justify-content: space-between;
              align-items: center;
              border-bottom: 1px solid rgba(255, 255, 255, 0.1);
              padding-bottom: 20px;
              margin-bottom: 30px;
            }
            h1 { margin: 0; font-size: 1.75rem; font-weight: 800; color: #bef264; }
            .badge { background: #bef264; color: #064e3b; padding: 4px 12px; border-radius: 20px; font-size: 0.8rem; font-weight: 800; }
            .refresh-btn {
              background: rgba(255,255,255,0.1);
              color: white;
              border: none;
              padding: 8px 16px;
              border-radius: 8px;
              cursor: pointer;
              font-weight: 600;
              text-decoration: none;
              font-size: 0.9rem;
            }
            .refresh-btn:hover { background: rgba(255,255,255,0.15); }
          </style>
        </head>
        <body>
          <div class="container">
            <header>
              <div>
                <h1>UIU HealthCare Database Explorer 🛢️</h1>
                <p style="color: rgba(255,255,255,0.6); margin: 4px 0 0 0; font-size: 0.9rem;">Real-time database monitor for Admin testing and validation.</p>
              </div>
              <div style="display: flex; gap: 12px; align-items: center;">
                <span class="badge">DEVELOPMENT MODE</span>
                <a href="" class="refresh-btn">🔄 Refresh Data</a>
              </div>
            </header>

            ${renderTable('USERS TABLE', ['id', 'name', 'email', 'role', 'phone'], users)}
            ${renderTable('BLOOD DONORS TABLE', ['id', 'user_id', 'name', 'blood_group', 'phone', 'district', 'location'], donors)}
            ${renderTable('FORUM POSTS TABLE', ['id', 'user_id', 'title', 'category', 'created_at'], posts)}
          </div>
        </body>
      </html>
    `;

    res.send(html);
  } catch (err) {
    console.error(err);
    res.status(500).send('<h3>Error reading database.</h3>');
  }
});

module.exports = router;
