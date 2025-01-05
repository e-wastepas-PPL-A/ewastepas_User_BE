const { query } = require("../config/db");
const logger = require("winston");

const verifyOtp = async (req, res) => {
    try {
      const { email, otp_code } = req.body;
  
      // Validasi input
      if (!email || !otp_code) {
        logger.error("Email dan kode OTP wajib diisi.");
        return res
          .status(400)
          .json({ message: "Email dan kode OTP wajib diisi." });
      }
  
      // Cek apakah email dan otp_code ada di database
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
  
      // Periksa apakah OTP sudah kedaluwarsa (3 menit)
      if (new Date(user.otp_expiry) < now) {
        logger.error("OTP sudah kedaluwarsa.");
        return res.status(400).json({ message: "OTP sudah kedaluwarsa." });
      }
  
      // Update status pengguna menjadi terverifikasi
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
