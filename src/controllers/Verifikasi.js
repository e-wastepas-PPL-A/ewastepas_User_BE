const { query } = require("../config/db");
const logger = require("winston");

const verifyOtp = async (req, res) => {
    try {
      const { email, otp_code } = req.body;
      if (!email || !otp_code) {
        logger.error("Email dan kode OTP wajib diisi.");
        return res
          .status(400)
          .json({ message: "Email dan kode OTP wajib diisi." });
      }
  
      const sqlCheckOtp =
        "SELECT * FROM community WHERE email = ? AND otp_code = ?";
      const results = await query(sqlCheckOtp, [email, otp_code]);
  
      if (results.length === 0) {
        logger.error("OTP tidak valid atau email salah.");
        return res
          .status(400)
          .json({ message: "OTP tidak valid atau email salah." });
      }
  
      const user = results[0];
      const now = new Date();
  
      if (new Date(user.otp_expiry) < now) {
        logger.error("OTP sudah kedaluwarsa.");
        return res.status(400).json({ message: "OTP sudah kedaluwarsa." });
      }
  
      const sqlUpdateVerification =
        "UPDATE community SET is_verified = 1, otp_code = NULL, otp_expiry = NULL WHERE email = ?";
      await query(sqlUpdateVerification, [email]);
  
      logger.info("Akun berhasil diverifikasi!");
      res.status(200).json({ message: "Akun berhasil diverifikasi!" });
    } catch (err) {
      logger.error(`Error: ${err.message}`);
      res
        .status(500)
        .json({ message: "Terjadi kesalahan pada server.", error: err.message });
    }
  };

  module.exports = {
    verifyOtp,
  };