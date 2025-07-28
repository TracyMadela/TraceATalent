// routes/cvRoutes.js
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const nodemailer = require('nodemailer');
const twilio = require('twilio');
const connection = require('../config/config');

const router = express.Router();

const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

// Multer storage config
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

// Nodemailer transporter (Gmail)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'tracynonjabulo@gmail.com',
    pass: 'qvbw cnaa qrls bdem'.replace(/\s/g, '')
  }
});

// Twilio config
const twilioClient = twilio(
  'AC00823d9736167895948078e8402b2835',
  'ecb5ce805b435c4b6d0f6e429c8865bb'
);

router.post('/upload', upload.single('cvFile'), async (req, res) => {
  const { name, email, phone, details } = req.body;
  const file = req.file;

  if (!file || !name || !email || !phone) {
    return res.status(400).json({ message: 'Missing required fields or file.' });
  }

  const sql = `INSERT INTO cv_submissions (name, email, phone, filename, filepath, extension, details)
               VALUES (?, ?, ?, ?, ?, ?, ?)`;
  const values = [name, email, phone, file.filename, file.path, path.extname(file.originalname), details];

  connection.query(sql, values, async (err) => {
    if (err) {
      console.error('DB error:', err);
      return res.status(500).json({ message: 'Upload failed.' });
    }

    // Send email to admin with CV attachment
    try {
      await transporter.sendMail({
        from: 'tracynonjabulo@gmail.com',
        to: 'tracynonjabulo@gmail.com',
        subject: 'New CV Submission',
        text: `Name: ${name}\nEmail: ${email}\nPhone: ${phone}\nDetails: ${details}`,
        attachments: [
          {
            filename: file.originalname,
            path: file.path
          }
        ]
      });
    } catch (e) {
      console.error('Admin email failed:', e.message);
    }

    // Send confirmation email to user
    try {
      await transporter.sendMail({
        from: 'tracynonjabulo@gmail.com',
        to: email,
        subject: 'CV Received - TRACEATALENT',
        text: `Hi ${name},\n\nThank you for submitting your CV to TRACEATALENT. We will be in touch soon.\n\nRegards,\nTRACEATALENT`
      });
    } catch (e) {
      console.error('User confirmation email failed:', e.message);
    }

    // Send SMS via Twilio to admin
    try {
      await twilioClient.messages.create({
        from: '+12055293304', // Twilio trial number
        to: '+27734728193',
        body: `New CV uploaded by ${name}. Check email.`
      });
    } catch (e) {
      console.error('Twilio SMS failed:', e.message);
    }

    // Send response with download link
    res.json({
      message: 'CV uploaded successfully!',
      downloadUrl: `/uploads/${file.filename}`
    });
  });
});

module.exports = router;
 