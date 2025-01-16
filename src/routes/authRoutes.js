const express = require("express");
const multer = require("multer");
const dotenv = require("dotenv");
const { register } = require("../controllers/Register");
const { verifyOtp } = require("../controllers/Verifikasi");
const { login } = require("../controllers/Login");
const { forgotPassword, resetPassword } = require("../controllers/LupaPassword");
const { updateProfile, getProfile } = require("../controllers/updateProfile");
const { changePassword } = require("../controllers/changePassword");
const { logout } = require("../controllers/Login");
const { resendOtp } = require("../controllers/resendOtp");
const authenticate = require("../middleware/authenticate"); 
const upload = require("../middleware/uploadMiddleware");
const { PrismaClient } = require("@prisma/client");
const { contactUs } = require("../controllers/contactUs");

dotenv.config(); 
const router = express.Router();
const prisma = new PrismaClient();

router.post("/register", register); 
router.post("/verify-otp", verifyOtp); 
router.post("/resend-otp", resendOtp); 
router.post("/login", login); 
router.post("/forgot-password", forgotPassword); 
router.post("/reset-password/:token", resetPassword); 
router.post("/contact", contactUs);
router.put("/profile", upload.single("photo"), authenticate, updateProfile); 
router.get("/profile", authenticate, getProfile);
router.put("/change-password", authenticate, changePassword); 
router.post("/logout", (req, res) => {
  console.log("Logout route hit");
  logout(req, res); 
});


module.exports = router;
