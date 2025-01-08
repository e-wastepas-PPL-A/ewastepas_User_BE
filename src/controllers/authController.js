const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");
const { google } = require("googleapis");
require("dotenv").config();
const { sendEmail } = require("../utils/email");
const { PrismaClient } = require("@prisma/client");

const SECRET_KEY = process.env.SECRET_KEY;
const prisma = new PrismaClient();

// Setup OAuth2Client untuk Google OAuth
const oauth2Client = new google.auth.OAuth2(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  process.env.REDIRECT_URI
);

// Fungsi untuk memulai login Google
const googleLogin = (req, res) => {
  const authorizationUrl = oauth2Client.generateAuthUrl({
    scope: [
      "openid",
      "https://www.googleapis.com/auth/userinfo.profile",
      "https://www.googleapis.com/auth/userinfo.email",
    ],
    access_type: "offline", // Meminta refresh token
    prompt: "consent", // Memastikan izin selalu diberikan
  });

  res.redirect(authorizationUrl);
};

// Callback setelah login Google
const googleCallback = async (req, res) => {
  const { code } = req.query;

  if (!code) {
    return res.status(400).json({ error: "Authorization code tidak ditemukan" });
  }

  try {
    console.log("Mendapatkan token dengan kode:", code);

    // Tukar authorization code dengan token
    const { tokens } = await oauth2Client.getToken(code);
    console.log("Token yang diterima:", tokens);

    oauth2Client.setCredentials(tokens); // Menyimpan kredensial

    // Ambil informasi pengguna dari Google
    const oauth2 = google.oauth2({
      auth: oauth2Client,
      version: "v2",
    });

    const { data: userInfo } = await oauth2.userinfo.get();
    console.log("Informasi pengguna:", userInfo);

    if (!userInfo) {
      return res.status(404).json({ error: "Informasi pengguna tidak tersedia" });
    }

    // Verifikasi token Google
    const userPayload = await verifyGoogleToken(tokens.id_token);
    console.log("Payload dari token Google:", userPayload);

    // Cek apakah pengguna sudah terdaftar
    let user = await prisma.community.findUnique({
      where: { email: userInfo.email },
    });

    if (!user) {
      // Daftar pengguna baru
      user = await prisma.community.create({
        data: {
          email: userInfo.email,
          name: userInfo.name,
          is_verified: true,
        },
      });
    }

    // Generate JWT untuk pengguna
    const token = generateJWT({
      community_id: user.community_id,
      email: user.email,
    });

    // Redirect ke frontend dengan JWT
    const redirectUrl = process.env.FRONTEND_REDIRECT_URL || "http://localhost:5173/auth/google/callback";
    return res.redirect(`${redirectUrl}?token=${token}`);
  } catch (error) {
    console.error("Error during Google callback:", error.message);
    return res.status(500).json({ error: "Failed to handle Google callback" });
  }
};

// Fungsi untuk verifikasi token Google
const verifyGoogleToken = async (id_token) => {
  try {
    const client = new OAuth2Client(process.env.CLIENT_ID);
    const ticket = await client.verifyIdToken({
      idToken: id_token,
      audience: process.env.CLIENT_ID,
    });
    return ticket.getPayload();
  } catch (error) {
    console.error("Error verifying Google token:", error.message);
    throw new Error("Invalid Google token");
  }
};

// Fungsi untuk menghasilkan JWT
function generateJWT(user) {
  const payload = {
    community_id: user.community_id,
    email: user.email,
  };
  const options = { expiresIn: "1h" };

  return jwt.sign(payload, SECRET_KEY, options);
}

module.exports = {
  googleLogin,
  googleCallback,
  verifyGoogleToken,
  generateJWT,
};
