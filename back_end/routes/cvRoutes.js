const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const connection = require('../config/config');
const router = express.Router();

const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

// Multer setup
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)); // e.g., 17218712223.pdf
  }
});

const upload = multer({ storage: storage });

router.post('/upload', upload.single('cvFile'), (req, res) => {
  const file = req.file;
  const details = req.body.details;

  if (!file) {
    return res.status(400).json({ message: 'No file uploaded.' });
  }

  const sql = `INSERT INTO cv_submissions (filename, filepath, extension, details) VALUES (?, ?, ?, ?)`;
  const values = [
    file.filename,
    file.path,
    path.extname(file.originalname),
    details
  ];

  connection.query(sql, values, (err) => {
    if (err) {
      console.error('DB insert error:', err);
      return res.status(500).json({ message: 'Upload failed.' });
    }

    // ✅ Return filename for download
    res.status(200).json({
      message: 'CV uploaded successfully!',
      filename: file.filename
    });
  });
});

module.exports = router;
