const { PrismaClient } = require("@prisma/client");
const jwt = require("jsonwebtoken");
const { google } = require("googleapis");
require("dotenv").config();

const prisma = new PrismaClient();
const { SECRET_KEY, CLIENT_ID, CLIENT_SECRET, REDIRECT_URI, FRONTEND_REDIRECT_URL } = process.env;

const oauth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);

// Fungsi untuk memulai login Google
const googleLogin = (req, res) => {
  try {
    console.log("Menginisiasi login Google...");
    const authorizationUrl = oauth2Client.generateAuthUrl({
      scope: [
        "openid",
        "https://www.googleapis.com/auth/userinfo.profile",
        "https://www.googleapis.com/auth/userinfo.email",
      ],
      access_type: "offline",
      prompt: "consent",
    });

    console.log("URL otorisasi:", authorizationUrl);
    res.redirect(authorizationUrl);
  } catch (error) {
    console.error("Error during Google login:", error);
    res.status(500).json({ error: "Gagal memulai login Google", details: error.message });
  }
};

// Callback setelah login Google
const googleCallback = async (req, res) => {
  try {
    const { code } = req.query;

    if (!code) {
      console.error("Authorization code tidak ditemukan");
      return res.status(400).json({ error: "Authorization code tidak ditemukan" });
    }

    console.log("Mendapatkan token dengan kode:", code);

    // Tukar authorization code dengan token
    const { tokens } = await oauth2Client.getToken(code);
    console.log("Token yang diterima:", tokens);

    oauth2Client.setCredentials(tokens);

    // Ambil informasi pengguna dari Google
    const oauth2 = google.oauth2({
      auth: oauth2Client,
      version: "v2",
    });

    const { data: userInfo } = await oauth2.userinfo.get();
    console.log("Informasi pengguna:", userInfo);

    if (!userInfo) {
      console.error("Informasi pengguna tidak ditemukan");
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
      console.log("Pengguna baru, membuat akun...");
      user = await prisma.community.create({
        data: {
          email: userInfo.email,
          name: userInfo.name,
          is_verified: true,
          photo: userInfo.picture,
          locale: userInfo.locale,
        },
      });
    } else {
      console.log("Pengguna sudah terdaftar, memperbarui data pengguna...");

      // Update hanya jika ada perubahan yang signifikan
      const updateData = {};
      if (user.name !== userInfo.name) updateData.name = userInfo.name;
      if (user.photo !== userInfo.picture) updateData.photo = userInfo.picture;
      
      if (Object.keys(updateData).length > 0) {
        await prisma.community.update({
          where: { community_id: user.community_id },
          data: updateData,
        });
      }
    }

    // Generate JWT untuk pengguna
    const token = generateJWT(user);
    console.log("JWT yang dihasilkan:", token);

    // Simpan token di cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",  // Hanya aktifkan jika di lingkungan produksi
      sameSite: "None",  // Untuk memungkinkan cookie digunakan di aplikasi terpisah
      maxAge: 3600000,  // 1 jam
    });

    // Redirect ke frontend
    const redirectUrl = FRONTEND_REDIRECT_URL || `http://localhost:5173/auth/google/callback?token=${token}`;
    console.log("Mengalihkan ke URL frontend:", redirectUrl);
    return res.redirect(redirectUrl);
  } catch (error) {
    console.error("Error during Google callback:", error);
    return res.status(500).json({
      error: "Failed to handle Google callback",
      details: error.message
    });
  }
};

// Fungsi untuk verifikasi token Google
const verifyGoogleToken = async (id_token) => {
  try {
    const client = new google.auth.OAuth2(CLIENT_ID);
    const ticket = await client.verifyIdToken({
      idToken: id_token,
      audience: CLIENT_ID,
    });
    return ticket.getPayload();
  } catch (error) {
    console.error("Error verifying Google token:", error);
    throw new Error("Invalid Google token: " + error.message);
  }
};

// Fungsi untuk menghasilkan JWT
function generateJWT(user) {
  const payload = {
    community_id: user.community_id,
    email: user.email,
    iat: Math.floor(Date.now() / 1000),
    iss: 'E-Whale',
  };
  const options = { 
    expiresIn: "1h",
    algorithm: 'HS256'
  };

  return jwt.sign(payload, SECRET_KEY, options);
}

// Fungsi logout
const logout = async (req, res) => {
  try {
    // Clear the cookie
    res.clearCookie('token');

    // Jika Anda memiliki akses ke refresh token pengguna, cabut token tersebut
    if (req.user && req.user.refresh_token) {
      await oauth2Client.revokeToken(req.user.refresh_token);
    }

    res.status(200).json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Error during logout:', error);
    res.status(500).json({ error: 'Failed to logout' });
  }
};

module.exports = {
  googleLogin,
  googleCallback,
  logout,
};
