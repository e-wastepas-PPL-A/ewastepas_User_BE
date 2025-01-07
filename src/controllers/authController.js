const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { query } = require("../config/db");
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

// login Google
const googleLogin = (req, res) => {
  const authorizationUrl = oauth2Client.generateAuthUrl({
    scope: [
      "openid",
      "https://www.googleapis.com/auth/userinfo.profile",
      "https://www.googleapis.com/auth/userinfo.email",
    ],
    prompt: "consent",
  });

  res.redirect(authorizationUrl);
};

const googleCallback = async (req, res) => {
  const { code } = req.query;

  try {
    // menukar authorization code dengan token akses
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    // Mendapatkan informasi pengguna dari Google
    const oauth2 = google.oauth2({
      auth: oauth2Client,
      version: "v2",
    });

    const { data } = await oauth2.userinfo.get();

    if (!data) {
      return res.status(404).json({ error: "Informasi pengguna tidak ada" });
    }

    // Verifikasi ID token
    const userPayload = await verifyGoogleToken(tokens.id_token);

    // Cek apakah pengguna sudah ada di database
    let user = await prisma.community.findUnique({
      where: { email: data.email },
    });

    if (!user) {
      // Jika pengguna belum ada, buat pengguna baru
      user = await prisma.community.create({
        data: {
          email: data.email,
          name: data.name,
          is_verified: true,
        },
      });

      
      await sendEmail(data.email, "Email Verification", "Your OTP is 123456");
    }

    const payload = {
      id: user.community_id,
      email: user.email,
      name: user.name,
    };

    const token = generateJWT(payload);

    res.redirect(`http://localhost:5173/?token=${token}`);
  } catch (error) {
    console.error("Error during Google callback:", error.message);
    res.status(500).json({ error: "Failed to handle Google callback" });
  }
};


// Fungsi untuk verifikasi token Google
const verifyGoogleToken = async (id_token) => {
  const client = new OAuth2Client(process.env.CLIENT_ID);
  const ticket = await client.verifyIdToken({
    idToken: id_token,
    audience: process.env.CLIENT_ID,
  });
  return ticket.getPayload(); 
};

// Fungsi untuk menghasilkan JWT
function generateJWT(user) {
  const payload = {
    userId: user.community_id,
    email: user.email,
  };
  const options = { expiresIn: "1h" };

  return jwt.sign(payload, process.env.SECRET_KEY, options); // Gunakan SECRET_KEY dari environment
};


module.exports = {
  googleLogin,
  googleCallback,
  verifyGoogleToken,
  generateJWT,
};
