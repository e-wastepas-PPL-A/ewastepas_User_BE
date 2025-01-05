const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken");
const { query } = require("../config/db");
const logger = require("winston");


const login = async (req, res) => {
    try {
      const { email, password, rememberMe } = req.body;
  
      const sql = "SELECT * FROM community WHERE email = ?";
      const results = await query(sql, [email]);
      const user = results[0];
  
      if (!user) {
        logger.error("Pengguna tidak ditemukan");
        return res.status(400).json({ message: "Pengguna tidak ditemukan" });
      }
  
      // Check if the user is verified
      if (user.is_verified !== 1) {
        logger.error(
          "Akun belum diverifikasi. Silakan periksa email Anda untuk OTP."
        );
        return res.status(400).json({
          message:
            "Akun belum diverifikasi. Silakan periksa email Anda untuk OTP.",
        });
      }
  
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        logger.error("Password tidak valid");
        return res.status(400).json({ message: "Password tidak valid" });
      }
  
      const token = jwt.sign(
        { user: { id: user.community_id, email: user.email } },
        process.env.SECRET_KEY,
        { expiresIn: "1h" }
      );
  
      console.log("Generated JWT Token:", token);
  
      const cookieOptions = {
        httpOnly: true,
        secure: true,
        sameSite: "Strict",
      };
  
      if (rememberMe) {
        cookieOptions.expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
      } else {
        cookieOptions.expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
      }
  
      res.cookie("auth_token", token, cookieOptions);
  
      // Return both the message and the token in the response
      res.json({ message: "Login berhasil", token: token });
    } catch (err) {
      logger.error(`Error: ${err.message}`);
      res
        .status(500)
        .json({ message: "Terjadi kesalahan pada database", error: err.message });
    }
  };

  //endpoint logout
const logout = (req, res) => {
    console.log("Logout function called");
    res.status(200).json({ message: "You have been logged out successfully" });
  };

  module.exports = {
    login,
    logout,
  };