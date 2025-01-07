// router.js

const express = require("express");
const axios = require("axios");
const { google } = require("googleapis");
const multer = require("multer");
const dotenv = require("dotenv");
const { googleLogin, googleCallback } = require("../controllers/authController");
const {register,} = require("../controllers/Register");
const {verifyOtp,} = require("../controllers/Verifikasi");
const {login,} = require("../controllers/Login");
const {forgotPassword,
  resetPassword} = require("../controllers/LupaPassword");
const {updateProfile,
  getProfile} = require("../controllers/updateProfile");
const {changePassword,} = require("../controllers/changePassword");
const {logout,} = require("../controllers/Login");
const { resendOtp } = require("../controllers/resendOtp");
const authenticate = require("../middleware/authenticate"); // Middleware Autentikasi
const upload = require("../middleware/uploadMiddleware");
const { PrismaClient } = require("@prisma/client");
const { contactUs } = require("../controllers/contactUs");


dotenv.config(); // Load variabel lingkungan
const router = express.Router();
const prisma = new PrismaClient();

// Setup OAuth2Client untuk Google OAuth
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

// ------------------------- Rute Autentikasi -------------------------
router.post("/register", register); // Registrasi pengguna baru
router.post("/verify-otp", verifyOtp); // Verifikasi kode OTP
router.post("/resend-otp", resendOtp); // Kirim ulang kode OTP
router.post("/login", login); // Login pengguna
router.post("/forgot-password", forgotPassword); // Lupa password
router.post("/reset-password/:token", resetPassword); // Reset password berdasarkan email
router.post("/contact", contactUs);

// ------------------------- Rute Profil -------------------------
router.put("/profile", upload.single("photo"), authenticate, updateProfile); // Update profil dengan foto
router.get("/profile", authenticate, getProfile);
router.put("/change-password", authenticate, changePassword); // Ubah password

// ------------------------- Rute Google OAuth -------------------------
router.get("/google", googleLogin); // Login menggunakan Google
router.get("/google/callback", googleCallback); // Callback setelah login Google

// ------------------------- Logout -------------------------
router.post("/logout", (req, res) => {
  console.log("Logout route hit");
  logout(req, res); // Gunakan fungsi logout dari authController
});

// Ekspor router
module.exports = router;
