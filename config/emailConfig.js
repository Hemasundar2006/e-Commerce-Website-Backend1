const nodemailer = require('nodemailer');

// Supports Gmail (recommended with App Passwords) and generic SMTP via env
// Gmail setup: set EMAIL_PROVIDER=gmail, GMAIL_USER, GMAIL_APP_PASSWORD
// Generic SMTP: set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD

let transporter;

if ((process.env.EMAIL_PROVIDER || '').toLowerCase() === 'gmail') {
  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });
} else {
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 465),
    secure: String(process.env.SMTP_PORT || '').trim() === '465',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  });
}

module.exports = transporter;
