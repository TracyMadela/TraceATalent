const express = require('express');
const router = express.Router();
const connection = require('../config/config'); // make sure this path is correct

router.post('/register', (req, res) => {
    const {
        name,
        surname,
        email,
        phone,
        country,
        province,
        city,
        postalCode
    } = req.body;

    const sql = `
        INSERT INTO user 
        (name, surname, email, phone, country, province, city, postalCode) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    connection.query(sql, [name, surname, email, phone, country, province, city, postalCode], (err, result) => {
        if (err) {
            console.error("Registration failed:", err);
            return res.status(500).json({ success: false, message: "Server error" });
        }
        res.status(201).json({ success: true, message: "User registered successfully", userId: result.insertId });
    });
});

module.exports = router;
