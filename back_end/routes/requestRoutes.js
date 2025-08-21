// routes/requestRoutes.js
const express = require('express');
const nodemailer = require('nodemailer');
const connection = require('../config/config');
const router = express.Router();

// Nodemailer transporter (Gmail)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'tracynonjabulo@gmail.com',
    pass: 'qvbw cnaa qrls bdem'.replace(/\s/g, '')
  }
});

router.get('/test', (req, res) => {
  res.json({ message: 'Request routes working!' });
});

router.post('/logo', async (req, res) => {
  const { clientName, clientEmail, brandName, details } = req.body;

  if (!clientName || !clientEmail || !brandName || !details) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

  const sql = 'INSERT INTO logo_requests (clientName, clientEmail, brandName, details) VALUES (?, ?, ?, ?)';
  
  connection.query(sql, [clientName, clientEmail, brandName, details], async (err) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Database insert failed.' });
    }

    try {
      // Send email to admin
      await transporter.sendMail({
        from: '"TRACEATALENT" <tracynonjabulo@gmail.com>',
        to: 'tracynonjabulo@gmail.com',
        subject: 'New Logo Design Request',
        html: `
          <h3>New Logo Design Request</h3>
          <p><strong>Name:</strong> ${clientName}</p>
          <p><strong>Email:</strong> ${clientEmail}</p>
          <p><strong>Brand Name:</strong> ${brandName}</p>
          <p><strong>Details:</strong> ${details}</p>
        `
      });

      // Send confirmation email to client
      await transporter.sendMail({
        from: '"TRACEATALENT" <tracynonjabulo@gmail.com>',
        to: clientEmail,
        subject: 'Your Logo Request Received',
        html: `
          <p>Dear ${clientName},</p>
          <p>Thank you for your logo design request for <strong>${brandName}</strong>. We will review your details and get back to you shortly.</p>
          <p>Kind regards,<br>TRACEATALENT Team</p>
        `
      });

      res.json({ message: 'Logo request submitted successfully!' });
    } catch (emailErr) {
      console.error('Email sending failed:', emailErr.message);
      // Optionally, you can still send a success response if email failure isn't critical
      res.json({ message: 'Logo request submitted successfully, but email sending failed.' });
    }
  });
});

module.exports = router;