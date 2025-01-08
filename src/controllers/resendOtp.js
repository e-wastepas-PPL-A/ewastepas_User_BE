const { sendEmail } = require("../utils/email");
const { PrismaClient } = require("@prisma/client");
const crypto = require("crypto");

const prisma = new PrismaClient();

const resendOtp = async (req, res) => {
  const { email } = req.body;

  try {
    // Cek apakah email ada di database dan belum diverifikasi
    const user = await prisma.community.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(404).json({ message: "Email tidak ditemukan" });
    }

    if (user.is_verified === 1) {
      return res.status(400).json({ message: "Akun sudah diverifikasi" });
    }

    // Generate OTP baru
    const otp = crypto.randomInt(100000, 999999).toString();
    const otpExpiry = new Date(Date.now() + 3 * 60 * 1000); // OTP berlaku 3 menit

    // Update OTP dan waktu kedaluwarsa di database menggunakan Prisma
    await prisma.community.update({
      where: { email },
      data: {
        otp_code: otp,
        otp_expiry: otpExpiry,
      },
    });

    // Kirim OTP ke email pengguna
    await sendEmail(email, "Kode OTP Anda", `Kode OTP Anda yang baru adalah: ${otp}`);

    res.status(200).json({ message: "OTP baru telah dikirim ke email." });
  } catch (err) {
    return res.status(500).json({ message: "Terjadi kesalahan pada server.", error: err.message });
  }
};

module.exports = { resendOtp };
