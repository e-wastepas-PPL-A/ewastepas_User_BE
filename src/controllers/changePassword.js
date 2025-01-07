const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { query } = require("../config/db");
const { getUserByEmail, updateUserProfile } = require("../models/user");



const changePassword = async (req, res) => {
    const { currentPassword, newPassword, confirmNewPassword } = req.body;
  
    try {
    // cek apakah password lama benar
      if (!currentPassword || !newPassword || !confirmNewPassword) {
        return res.status(400).json({ message: "All fields are required" });
      }
  
      // cek apakah password baru dan konfirmasi password sama
      if (newPassword !== confirmNewPassword) {
        return res
          .status(400)
          .json({ message: "New password and confirm password must match" });
      }
  
      // mendapatkan data user berdasarkan email
      const userResult = await getUserByEmail(req.user.email);
      if (userResult.length === 0) {
        return res.status(404).json({ message: "User not found" });
      }
  
      const user = userResult[0];
  
      // debuging password
      console.log("Comparing current password:", currentPassword);
      console.log("Stored password hash:", user.password);
  
      // bandingkan password lama dengan password yang tersimpan
      const isPasswordValid = await bcrypt.compare(
        currentPassword,
        user.password
      );
  
      if (!isPasswordValid) {
        console.log("Password comparison failed");
        return res.status(400).json({ message: "Current password is incorrect" });
      }
  
      // hash password baru
      const hashedNewPassword = await bcrypt.hash(newPassword, 10);
  
      // update password di database
      const updatePasswordQuery =
        "UPDATE community SET password = ? WHERE community_id = ?";
      await query(updatePasswordQuery, [hashedNewPassword, user.community_id]);
  
      return res.status(200).json({ message: "Password updated successfully" });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Server error" });
    }
  };

  module.exports = {
    changePassword,
  };