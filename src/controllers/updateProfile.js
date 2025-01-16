const fs = require("fs");
const { query } = require("../config/db");
const { getUserByEmail, updateUserProfile } = require("../models/user");


const updateProfile = async (req, res) => {
  try {
    console.log("Request Body:", req.body); 
    if (!req.user) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const { name, email, phone, address, date_of_birth } = req.body;
    const userEmail = req.user.email;

    if (!name || !email || !phone || !address || !date_of_birth) {
      return res.status(400).json({ message: "All fields must be filled" });
    }

    let photoPath = req.user.photo;
    if (req.file) {
      photoPath = req.file.path;
    }

    const queryStr = `
      UPDATE community 
      SET 
        name = ?, 
        email = ?, 
        phone = ?, 
        address = ?, 
        date_of_birth = ?, 
        photo = ? 
      WHERE email = ?
    `;

    console.log("Query:", queryStr);

    await query(queryStr, [
      name || req.user.name,
      email || req.user.email,
      phone || req.user.phone,
      address || req.user.address,
      date_of_birth || req.user.date_of_birth,
      photoPath,
      userEmail,
    ]);

    if (req.file) {
      const oldPhotoPath = req.user.photo;
      if (oldPhotoPath && fs.existsSync(oldPhotoPath)) {
        fs.unlinkSync(oldPhotoPath);
      }
    }

    return res.status(200).json({ message: "Profile updated successfully" });
  } catch (error) {
    console.error("Error updating profile:", error); 
    return res.status(500).json({
      message: "Failed to update profile",
      error: error.message,
    });
  }
};

const getProfile = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const userEmail = req.user.email; 
    const user = await getUserByEmail(userEmail); 
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({ user }); 
  } catch (error) {
    console.error("Error getting profile:", error);
    return res
      .status(500)
      .json({ message: "Failed to get profile", error: error.message });
  }
};

module.exports = {
    updateProfile,
    getProfile,
  };