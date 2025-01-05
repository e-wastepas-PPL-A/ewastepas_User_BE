const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const path = require("path");

const app = express();
const authRoutes = require("./routes/authRoutes");

// Middleware CORS
app.use(
  cors({
    origin: "http://localhost:5173", // URL frontend Anda
    methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE"], // Metode HTTP yang diizinkan
    credentials: true, // Mengizinkan pengiriman cookies dan kredensial
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
// Ekspor app untuk digunakan di file server.js
module.exports = app;
