const jwt = require("jsonwebtoken");
const { sendEmail } = require("../utils/email");
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");
require("dotenv").config();

const prisma = new PrismaClient();

const forgotPassword = async (req, res) => {
  const { email } = req.body;

  console.log("Forgot password request received for email:", email);

  try {
    // Cek apakah email ada di database menggunakan Prisma
    const user = await prisma.community.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(404).json({ message: "Email tidak ditemukan" });
    }

    console.log("Email found in database:", email);

    // Generate token reset password
    const token = jwt.sign({ email }, process.env.SECRET_KEY, {
      expiresIn: "3m", // Token valid selama 3 menit
    });

    const resetUrl = `http://localhost:5173/NewPasswordPage/${token}`;
    const subject = "Password Reset";
    const text = `Anda telah meminta untuk mengatur ulang password. Klik link ini untuk mengatur ulang password Anda: ${resetUrl}`;

    // Kirim email reset password
    await sendEmail(email, subject, text);

    res.status(200).json({ message: "Email reset password telah dikirim" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

const resetPassword = async (req, res) => {
  const token = req.params.token;
  const { newPassword } = req.body;

  if (!newPassword) {
    return res.status(400).json({ message: "Password baru harus diisi" });
  }

  try {
    // Verifikasi token
    const decoded = jwt.verify(token, process.env.SECRET_KEY);

    if (!decoded || !decoded.email) {
      return res
        .status(400)
        .json({ message: "Token tidak valid atau telah kadaluarsa" });
    }

    const email = decoded.email;

    // Hash password baru
    const hashedPassword = await bcrypt.hash(newPassword, 8);

    // Update password di database menggunakan Prisma
    await prisma.community.update({
      where: { email },
      data: { password: hashedPassword },
    });

    res.status(200).json({ message: "Password berhasil diperbarui" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  forgotPassword,
  resetPassword,
};
