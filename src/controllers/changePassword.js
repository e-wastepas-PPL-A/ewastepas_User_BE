const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { query } = require("../config/db");
const { getUserByEmail, updateUserProfile } = require("../models/user");



const changePassword = async (req, res) => {
    const { currentPassword, newPassword, confirmNewPassword } = req.body;
  
    try {
      // Check if all fields are provided
      if (!currentPassword || !newPassword || !confirmNewPassword) {
        return res.status(400).json({ message: "All fields are required" });
      }
  
      // Check if the new password and confirm password match
      if (newPassword !== confirmNewPassword) {
        return res
          .status(400)
          .json({ message: "New password and confirm password must match" });
      }
  
      // Get the user details from the database
      const userResult = await getUserByEmail(req.user.email);
      if (userResult.length === 0) {
        return res.status(404).json({ message: "User not found" });
      }
  
      const user = userResult[0];
  
      // Debugging: Log the current password and stored hash
      console.log("Comparing current password:", currentPassword);
      console.log("Stored password hash:", user.password);
  
      // Compare the current password with the stored password hash
      const isPasswordValid = await bcrypt.compare(
        currentPassword,
        user.password
      );
  
      if (!isPasswordValid) {
        console.log("Password comparison failed");
        return res.status(400).json({ message: "Current password is incorrect" });
      }
  
      // Hash the new password
      const hashedNewPassword = await bcrypt.hash(newPassword, 10);
  
      // Update the password in the database
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