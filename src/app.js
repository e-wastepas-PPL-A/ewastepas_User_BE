const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const { OAuth2Client } = require("google-auth-library");  // Import OAuth2Client
const dotenv = require("dotenv");  // Import dotenv
const jwt = require("jsonwebtoken");  // Import jsonwebtoken untuk membuat JWT
const axios = require("axios");  // Untuk melakukan HTTP request

dotenv.config();  // Memuat file .env

const app = express();
const authRoutes = require("./routes/authRoutes");

// Ambil CLIENT_ID dari environment variables
const CLIENT_ID = process.env.CLIENT_ID;  // Mengambil dari file .env
const oauthClient = new OAuth2Client(CLIENT_ID);

// Middleware CORS
app.use(
  cors({
    origin: "*", // Ganti dengan URL frontend Anda
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    credentials: true, // Izinkan pengiriman cookie lintas domain
  })
);

// Middleware untuk parsing JSON body
app.use(express.json());

// Middleware untuk parsing cookies
app.use(cookieParser());

// Rute untuk autentikasi
app.use("/auth", authRoutes);

// Melayani file statis di folder "uploads"
app.use('/uploads', express.static('uploads'));

// Fungsi untuk menghasilkan JWT
function generateJWT(user) {
  const payload = {
    community_id: user.community_id,
    email: user.email,
  };
  const options = { expiresIn: "1h" };

  return jwt.sign(payload, process.env.SECRET_KEY, options); // Gunakan SECRET_KEY dari environment
}

// Rute untuk menangani callback Google OAuth
app.get("/auth/google/callback", async (req, res) => {
  const code = req.query.code; // Mendapatkan kode dari query parameter

  try {
    // Tukar kode dengan token
    const { tokens } = await oauthClient.getToken(code);
    oauthClient.setCredentials(tokens);

    // Mendapatkan informasi pengguna dari Google
    const { data } = await axios.get("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });

    // Verifikasi jika data pengguna ada
    if (!data) {
      return res.status(404).json({ error: "Informasi pengguna tidak ditemukan" });
    }

    // Generate token JWT
    const token = generateJWT({
      community_id: data.id, // Anda bisa menggunakan id dari data pengguna Google
      email: data.email,
    });

    // Simpan token JWT di cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: false, // Gunakan true jika menggunakan HTTPS
      sameSite: "Strict", // Pastikan disesuaikan dengan kebutuhan (None untuk cross-origin)
      maxAge: 3600000, // 1 jam
    });    

    // Redirect ke halaman frontend setelah login berhasil
    res.redirect("http://localhost:5173/"); // Ganti dengan URL dashboard frontend Anda
  } catch (error) {
    console.error("Error during Google OAuth callback:", error);
    res.status(500).send("Internal Server Error");
  }
});

// Ekspor app untuk digunakan di file server.js
module.exports = app;
