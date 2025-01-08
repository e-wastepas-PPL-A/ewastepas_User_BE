const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { PrismaClient } = require("@prisma/client");
const logger = require("winston");

const prisma = new PrismaClient();

const login = async (req, res) => {
  try {
    const { email, password, rememberMe } = req.body;

    // Cari user berdasarkan email
    const user = await prisma.community.findUnique({
      where: { email },
    });

    if (!user) {
      logger.error("Pengguna tidak ditemukan");
      return res.status(400).json({ message: "Pengguna tidak ditemukan" });
    }

    // Periksa apakah user sudah diverifikasi
    if (!user.is_verified) {
      logger.error("Akun belum diverifikasi. Silakan periksa email Anda untuk OTP.");
      return res.status(400).json({
        message: "Akun belum diverifikasi. Silakan periksa email Anda untuk OTP.",
      });
    }

    // Periksa password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      logger.error("Password tidak valid");
      return res.status(400).json({ message: "Password tidak valid" });
    }

    // Generate token JWT
    const token = jwt.sign(
      { user: { id: user.community_id, email: user.email } },
      process.env.SECRET_KEY,
      { expiresIn: "1h" }
    );

    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
    };

    if (rememberMe) {
      cookieOptions.expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 hari
    } else {
      cookieOptions.expires = new Date(Date.now() + 60 * 60 * 1000); // 1 jam
    }

    // Simpan token di cookie
    res.cookie("auth_token", token, cookieOptions);

    res.json({ message: "Login berhasil", token });
  } catch (err) {
    logger.error(`Error: ${err.message}`);
    res
      .status(500)
      .json({ message: "Terjadi kesalahan pada server", error: err.message });
  }
};

// Endpoint logout
const logout = (req, res) => {
  res.clearCookie("auth_token", { httpOnly: true, secure: process.env.NODE_ENV === "production" });
  res.status(200).json({ message: "Logout berhasil" });
};

module.exports = {
  login,
  logout,
};
