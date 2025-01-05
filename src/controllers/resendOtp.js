const { sendEmail } = require("../utils/email");
const { query } = require("../config/db");
const crypto = require("crypto");

const resendOtp = async (req, res) => {
  const { email } = req.body;

  try {
    // Cek apakah email ada di database dan belum diverifikasi
    const sqlCheckEmail = "SELECT * FROM community WHERE email = ?";
    const resultsCheckEmail = await query(sqlCheckEmail, [email]);

    if (resultsCheckEmail.length === 0) {
      return res.status(404).json({ message: "Email tidak ditemukan" });
    }

    const user = resultsCheckEmail[0];

    if (user.is_verified === 1) {
      return res.status(400).json({ message: "Akun sudah diverifikasi" });
    }

    // Generate OTP baru
    const otp = crypto.randomInt(100000, 999999).toString();
    const otpExpiry = new Date(Date.now() + 3 * 60 * 1000); // OTP berlaku 10 menit

    // Update OTP dan waktu kedaluwarsa di database
    const sqlUpdateOtp = "UPDATE community SET otp_code = ?, otp_expiry = ? WHERE email = ?";
    await query(sqlUpdateOtp, [otp, otpExpiry, email]);

    // Kirim OTP ke email pengguna
    await sendEmail(email, "Kode OTP Anda", `Kode OTP Anda yang baru adalah: ${otp}`);

    res.status(200).json({ message: "OTP baru telah dikirim ke email." });
  } catch (err) {
    return res.status(500).json({ message: "Terjadi kesalahan pada server.", error: err.message });
  }
};

module.exports = { resendOtp };
