const fs = require("fs");
const { PrismaClient } = require("@prisma/client");
const { getUserByEmail } = require('../models/user');  // Adjust path as needed

const prisma = new PrismaClient();

const updateProfile = async (req, res) => {
  try {
    console.log("Request Body:", req.body); // Debugging input

    if (!req.user) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const { name, email, phone, address, date_of_birth } = req.body;
    const userEmail = req.user.email;

    if (!name || !email || !phone || !address || !date_of_birth) {
      return res.status(400).json({ message: "All fields must be filled" });
    }

    // Convert date_of_birth to a valid ISO string with time if necessary
    let formattedDateOfBirth;
    try {
      formattedDateOfBirth = new Date(date_of_birth).toISOString(); // Full ISO format
    } catch (error) {
      return res.status(400).json({ message: "Invalid date format" });
    }

    let photoPath = req.user.photo;
    if (req.file) {
      photoPath = req.file.path;
    }

    // Update profile using Prisma
    const updatedUser = await prisma.community.update({
      where: { email: userEmail },
      data: {
        name: name || req.user.name,
        email: email || req.user.email,
        phone: phone || req.user.phone,
        address: address || req.user.address,
        date_of_birth: formattedDateOfBirth, // Use the formatted full date
        photo: photoPath,
      },
    });

    // Handle file deletion for old photo
    if (req.file) {
      const oldPhotoPath = req.user.photo;
      if (oldPhotoPath && fs.existsSync(oldPhotoPath)) {
        fs.unlinkSync(oldPhotoPath);
      }
    }

    return res.status(200).json({ message: "Profile updated successfully", data: updatedUser });
  } catch (error) {
    console.error("Error updating profile:", error); // Log the error
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

    const userEmail = req.user.email; // Use email from authenticated user
    const user = await getUserByEmail(userEmail); // Get user data by email

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({ user }); // Send user data to frontend
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
