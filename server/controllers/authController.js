const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const crypto = require('crypto');

// Email transporter
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Register
const register = (req, res) => {
  const { name, email, password } = req.body;

  db.query('SELECT * FROM users WHERE email = ?', [email], (err, results) => {
    if (err) return res.status(500).json({ message: 'Database error' });
    if (results.length > 0) return res.status(400).json({ message: 'Email already exists' });

    const hashedPassword = bcrypt.hashSync(password, 10);
    const verificationToken = crypto.randomBytes(32).toString('hex');

    db.query('INSERT INTO users (name, email, password, verification_token, is_verified) VALUES (?, ?, ?, ?, 1)',
      [name, email, hashedPassword, verificationToken],
      (err, result) => {
        if (err) return res.status(500).json({ message: 'Database error' });

        // Send verification email
        const verifyUrl = `https://ride-sharing-tracker-backend.onrender.com/api/auth/verify/${verificationToken}`;

        const mailOptions = {
          from: process.env.EMAIL_USER,
          to: email,
          subject: '🚗 Verify your RideTracker account',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto;">
              <h2 style="color: #e94560;">🚗 Welcome to RideTracker!</h2>
              <p>Hi ${name},</p>
              <p>Please verify your email by clicking the button below:</p>
              <a href="${verifyUrl}" style="
                display: inline-block;
                padding: 12px 24px;
                background-color: #e94560;
                color: white;
                text-decoration: none;
                border-radius: 8px;
                font-weight: bold;
              ">✅ Verify Email</a>
              <p style="color: #888; margin-top: 20px;">If you didn't create an account, ignore this email.</p>
            </div>
          `
        };

        transporter.sendMail(mailOptions, (err) => {
          if (err) console.log('Email error:', err);
        });

        res.status(201).json({ message: '✅ Registered! Please check your email to verify your account.' });
      }
    );
  });
};

// Verify Email
const verifyEmail = (req, res) => {
  const { token } = req.params;

  db.query('SELECT * FROM users WHERE verification_token = ?', [token], (err, results) => {
    if (err) return res.status(500).json({ message: 'Database error' });
    if (results.length === 0) return res.status(400).json({ message: 'Invalid verification token' });

    db.query('UPDATE users SET is_verified = 1, verification_token = NULL WHERE verification_token = ?',
      [token],
      (err) => {
        if (err) return res.status(500).json({ message: 'Database error' });
        res.redirect('https://ride-sharing-tracker.vercel.app?verified=true');
      }
    );
  });
};

// Login
const login = (req, res) => {
  const { email, password } = req.body;

  db.query('SELECT * FROM users WHERE email = ?', [email], (err, results) => {
    if (err) return res.status(500).json({ message: 'Database error' });
    if (results.length === 0) return res.status(400).json({ message: 'User not found' });

    const user = results[0];

    if (!user.is_verified) {
      return res.status(400).json({ message: 'Please verify your email before logging in!' });
    }

    const isMatch = bcrypt.compareSync(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid password' });

    const token = jwt.sign(
      { id: user.id, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(200).json({
      message: '✅ Login successful!',
      token,
      user: { id: user.id, name: user.name, email: user.email }
    });
  });
};

module.exports = { register, verifyEmail, login };