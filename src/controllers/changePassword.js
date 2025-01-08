const bcrypt = require("bcryptjs");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const changePassword = async (req, res) => {
  const { currentPassword, newPassword, confirmNewPassword } = req.body;

  try {
    // Cek apakah semua field sudah diisi
    if (!currentPassword || !newPassword || !confirmNewPassword) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Cek apakah password baru dan konfirmasi password sama
    if (newPassword !== confirmNewPassword) {
      return res
        .status(400)
        .json({ message: "New password and confirm password must match" });
    }

    // Mendapatkan data user berdasarkan email
    const user = await prisma.community.findUnique({
      where: { email: req.user.email },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Debugging password
    console.log("Comparing current password:", currentPassword);
    console.log("Stored password hash:", user.password);

    // Bandingkan password lama dengan password yang tersimpan
    const isPasswordValid = await bcrypt.compare(
      currentPassword,
      user.password
    );

    if (!isPasswordValid) {
      console.log("Password comparison failed");
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    // Hash password baru
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    // Update password di database menggunakan Prisma
    await prisma.community.update({
      where: { community_id: user.community_id },
      data: { password: hashedNewPassword },
    });

    return res.status(200).json({ message: "Password updated successfully" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  changePassword,
};
