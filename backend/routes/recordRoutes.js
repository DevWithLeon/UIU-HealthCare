const express = require('express');
const router = express.Router();
const { query } = require('../db');
const auth = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directory exists
const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const ALLOWED_EXTENSIONS = ['pdf', 'jpg', 'jpeg', 'png', 'dicom'];

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = file.originalname.split('.').pop().toLowerCase();
    cb(null, `${req.user.id}_${Date.now()}.${ext}`);
  }
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const ext = file.originalname.split('.').pop().toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      return cb(new Error('Unsupported file format. Only PDF, JPG, PNG, and DICOM are allowed.'));
    }
    cb(null, true);
  },
  limits: { fileSize: 20 * 1024 * 1024 } // 20MB
});

// GET health records for the logged-in patient
router.get('/', auth, async (req, res) => {
  try {
    const patient_id = req.query.patient_id || req.user.id;
    // Patients can only see their own records; admin/doctor can see others
    if (req.user.role === 'patient' && parseInt(patient_id) !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden: You can only view your own records.' });
    }
    const [rows] = await query(
      'SELECT * FROM medical_records WHERE patient_id = ? ORDER BY id DESC',
      [patient_id]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database fetch error' });
  }
});

// POST upload a medical record (with optional file)
router.post('/', auth, (req, res) => {
  upload.single('file')(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    try {
      let patient_id = req.user.id;
      if (req.user.role === 'doctor' || req.user.role === 'hospital' || req.user.role === 'admin') {
        patient_id = req.body.patient_id;
        if (!patient_id) {
          return res.status(400).json({ error: 'Patient ID is required when uploading as doctor, hospital, or admin.' });
        }
      } else if (req.user.role !== 'patient') {
        return res.status(403).json({ error: 'Forbidden: Unauthorized to upload medical records.' });
      }

      const { title, type } = req.body;
      if (!title || !type) {
        return res.status(400).json({ error: 'Title and type are required.' });
      }
      const file_url = req.file ? `/uploads/${req.file.filename}` : null;
      const date = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      const [result] = await query(
        'INSERT INTO medical_records (patient_id, title, type, file_url, date) VALUES (?, ?, ?, ?, ?)',
        [patient_id, title, type, file_url, date]
      );
      res.status(201).json({ id: result.insertId, patient_id, title, type, file_url, date });
    } catch (dbErr) {
      console.error(dbErr);
      res.status(500).json({ error: 'Database save error' });
    }
  });
});

// DELETE a medical record
router.delete('/:id', auth, async (req, res) => {
  try {
    const [rows] = await query('SELECT * FROM medical_records WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Record not found.' });

    // Patients can only delete their own records
    if (req.user.role === 'patient' && rows[0].patient_id !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden: You can only delete your own records.' });
    }

    await query('DELETE FROM medical_records WHERE id = ?', [req.params.id]);
    res.json({ message: 'Record deleted.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database delete error' });
  }
});

module.exports = router;
