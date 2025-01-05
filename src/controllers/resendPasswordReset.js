// controllers/resendPasswordReset.js

const jwt = require("jsonwebtoken");
const { query } = require("../config/db");
const { sendEmail } = require("../utils/email"); // Pastikan sudah ada fungsi sendEmail
require("dotenv").config();

const resendPasswordResetEmail = async (req, res) => {
  const { email } = req.body;
  console.log("Resend password reset request received for email:", email);

  try {
    // Menggunakan query untuk mencari email di database
    const results = await query("SELECT * FROM community WHERE email = ?", [email]);

    if (results.length === 0) {
      return res.status(404).json({ message: "Email tidak ditemukan" });
    }

    console.log("Email found in database:", email);

    // Membuat token baru dengan expire 3 menit (180 detik)
    const token = jwt.sign({ email }, process.env.SECRET_KEY, { expiresIn: '3m' });

    // Membuat URL reset password dengan token
    const resetUrl = `http://localhost:5173/NewPasswordPage/${token}`;
    const subject = "Password Reset Request";
    const text = `Anda telah meminta untuk mengatur ulang password. Klik link ini untuk mengatur ulang password Anda: ${resetUrl}`;

    // Mengirim ulang email reset password
    await sendEmail(email, subject, text);

    res.status(200).json({ message: "Email reset password telah dikirim ulang" });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

module.exports = { resendPasswordResetEmail };
