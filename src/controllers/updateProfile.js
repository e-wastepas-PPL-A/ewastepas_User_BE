const fs = require("fs");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const updateProfile = async (req, res) => {
  try {
    console.log("Request Body:", req.body); // Debugging input
    if (!req.user) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const { name, email, phone, address, date_of_birth } = req.body;
    const userEmail = req.user.email;

    // Validasi input
    if (!name || !email || !phone || !address || !date_of_birth) {
      return res.status(400).json({ message: "All fields must be filled" });
    }

    // Mengonversi tanggal menjadi format ISO jika perlu
    const formattedDateOfBirth = new Date(date_of_birth).toISOString();

    // Tentukan path foto baru jika ada
    let photoPath = req.user.photo;
    if (req.file) {
      photoPath = req.file.path;
    }

    // Update user profile using Prisma
    const updatedUser = await prisma.community.update({
      where: { email: userEmail },
      data: {
        name: name || req.user.name,
        email: email || req.user.email,
        phone: phone || req.user.phone,
        address: address || req.user.address,
        date_of_birth: formattedDateOfBirth || req.user.date_of_birth, // Menggunakan tanggal yang diformat
        photo: photoPath,
      },
    });

    // Jika foto diperbarui, hapus foto lama
    if (req.file) {
      const oldPhotoPath = req.user.photo;
      if (oldPhotoPath && fs.existsSync(oldPhotoPath)) {
        fs.unlinkSync(oldPhotoPath);
      }
    }

    return res.status(200).json({ message: "Profile updated successfully", user: updatedUser });
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

    const userEmail = req.user.email; // Menggunakan email dari user yang terautentikasi
    const user = await prisma.community.findUnique({
      where: { email: userEmail },
    }); // Ambil data user berdasarkan email

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({ user }); // Mengirimkan data user ke frontend
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
