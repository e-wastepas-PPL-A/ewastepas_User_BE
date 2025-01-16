const jwt = require("jsonwebtoken");
const { query } = require("../config/db");
const { sendEmail } = require("../utils/email");
require("dotenv").config();
const bcrypt = require("bcrypt");

const forgotPassword = async (req, res) => {
  const { email } = req.body;
  console.log("Forgot password request received for email:", email);

  try {
    const results = await query("SELECT * FROM community WHERE email = ?", [
      email,
    ]);

    if (results.length === 0) {
      return res.status(404).json({ message: "Email tidak ditemukan" });
    }

    console.log("Email found in database:", email);

    const token = jwt.sign({ email }, process.env.SECRET_KEY, {
      expiresIn: "3m",
    });

    const resetUrl = `http://localhost:5173/NewPasswordPage/${token}`;
    const subject = "Password Reset";
    const text = `Anda telah meminta untuk mengatur ulang password. Klik link ini untuk mengatur ulang password Anda: ${resetUrl}`;

    await sendEmail(email, subject, text);

    res.status(200).json({ message: "Email reset password telah dikirim" });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

const resetPassword = async (req, res) => {
  const token = req.params.token;
  const { newPassword } = req.body;

  if (!newPassword) {
    return res.status(400).json({ message: "Password baru harus diisi" });
  }

  try {
    const decoded = jwt.verify(token, process.env.SECRET_KEY);

    if (!decoded || !decoded.email) {
      return res
        .status(400)
        .json({ message: "Token tidak valid atau telah kadaluarsa" });
    }

    const email = decoded.email;

    const hashedPassword = await bcrypt.hash(newPassword, 8);

    await query("UPDATE community SET password = ? WHERE email = ?", [
      hashedPassword,
      email,
    ]);

    res.status(200).json({ message: "Password berhasil diperbarui" });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

module.exports = {
  forgotPassword,
  resetPassword,
};
