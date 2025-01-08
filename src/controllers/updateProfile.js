const fs = require("fs");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const updateProfile = async (req, res) => {
  try {
    console.log("Request Body:", req.body);
    if (!req.user) {
      return res.status(401).json({ message: "Pengguna tidak terautentikasi" });
    }

    const { name, email, phone, address, date_of_birth } = req.body;
    const userEmail = req.user.email;

    // Validasi input
    if (!name || !email || !phone || !address || !date_of_birth) {
      return res.status(400).json({ message: "Semua kolom harus diisi" });
    }

    // Mengonversi tanggal ke format ISO
    const formattedDateOfBirth = new Date(date_of_birth).toISOString();

    // Tentukan path foto baru jika ada
    let photoPath = req.user.photo;
    if (req.file) {
      photoPath = req.file.path;
    }

    // Update data profil pengguna
    const updatedUser = await prisma.community.update({
      where: { email: userEmail },
      data: {
        name: name || req.user.name,
        email: email || req.user.email,
        phone: phone || req.user.phone,
        address: address || req.user.address,
        date_of_birth: formattedDateOfBirth || req.user.date_of_birth,
        photo: photoPath,
      },
    });

    // Jika ada foto yang diupload, hapus foto lama
    if (req.file) {
      const oldPhotoPath = req.user.photo;
      if (oldPhotoPath && fs.existsSync(oldPhotoPath)) {
        fs.unlinkSync(oldPhotoPath);
      }
    }

    return res.status(200).json({ message: "Profil berhasil diperbarui", user: updatedUser });
  } catch (error) {
    console.error("Error saat memperbarui profil:", error);
    return res.status(500).json({
      message: "Gagal memperbarui profil",
      error: error.message,
    });
  }
};


const getProfile = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Pengguna tidak terautentikasi" });
    }

    const userEmail = req.user.email; // Menggunakan email pengguna yang terautentikasi
    const user = await prisma.community.findUnique({
      where: { email: userEmail }, // Mengambil data pengguna berdasarkan email
    });

    if (!user) {
      return res.status(404).json({ message: "Pengguna tidak ditemukan" });
    }

    return res.status(200).json({ user }); // Mengirimkan data pengguna ke frontend
  } catch (error) {
    console.error("Error saat mengambil profil:", error);
    return res
      .status(500)
      .json({ message: "Gagal mengambil profil", error: error.message });
  }
};



module.exports = {
  updateProfile,
  getProfile,
};
