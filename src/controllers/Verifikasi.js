const { PrismaClient } = require("@prisma/client");
const logger = require("winston");

const prisma = new PrismaClient();

const verifyOtp = async (req, res) => {
  try {
    const { email, otp_code } = req.body;

    // Validasi input
    if (!email || !otp_code) {
      logger.error("Email dan kode OTP wajib diisi.");
      return res
        .status(400)
        .json({ message: "Email dan kode OTP wajib diisi." });
    }

    // Cek apakah email dan otp_code ada di database
    const user = await prisma.community.findUnique({
      where: { email },
    });

    if (!user || user.otp_code !== otp_code) {
      logger.error("OTP tidak valid atau email salah.");
      return res
        .status(400)
        .json({ message: "OTP tidak valid atau email salah." });
    }

    const now = new Date();

    // Periksa apakah OTP sudah kedaluwarsa (3 menit)
    if (new Date(user.otp_expiry) < now) {
      logger.error("OTP sudah kedaluwarsa.");
      return res.status(400).json({ message: "OTP sudah kedaluwarsa." });
    }

    // Update status pengguna menjadi terverifikasi
    await prisma.community.update({
      where: { email },
      data: {
        is_verified: true,
        otp_code: null,
        otp_expiry: null,
      },
    });

    logger.info("Akun berhasil diverifikasi!");
    res.status(200).json({ message: "Akun berhasil diverifikasi!" });
  } catch (err) {
    logger.error(`Error: ${err.message}`);
    res.status(500).json({
      message: "Terjadi kesalahan pada server.",
      error: err.message,
    });
  }
};

module.exports = {
  verifyOtp,
};
