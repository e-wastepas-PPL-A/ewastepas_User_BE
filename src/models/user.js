const db = require("../config/db"); // Pastikan ini adalah koneksi ke database MySQL

// Fungsi untuk menambahkan pengguna baru
const createUser = async (
  name,
  email,
  phone,
  address,
  photo,
  date_of_birth
) => {
  const sql =
    "INSERT INTO community (name, email, phone, address, photo, date_of_birth) VALUES (?, ?, ?, ?, ?, ?)";
  const params = [name, email, phone, address, photo, date_of_birth];
  return db.query(sql, params);
};

// Fungsi untuk memperbarui profil pengguna
const updateUserProfile = async (
  community_id,
  name,
  email,
  phone,
  address,
  photo,
  date_of_birth
) => {
  const sql =
    "UPDATE community SET name = ?, email = ?, phone = ?, address = ?, photo = ?, date_of_birth = ? WHERE community_id = ?";
  const params = [
    name,
    email,
    phone,
    address,
    photo,
    date_of_birth,
    community_id,
  ];
  return db.query(sql, params);
};

// Fungsi untuk mengambil data pengguna berdasarkan ID
const getUserById = async (id) => {
  const sql = "SELECT * FROM community WHERE community_id = ?";
  const params = [id];
  return db.query(sql, params);
};

// Fungsi untuk mendapatkan pengguna berdasarkan email (untuk login)
const getUserByEmail = async (email) => {
  const sql = "SELECT * FROM community WHERE email = ?";
  const params = [email];
  return db.query(sql, params);
};

// Fungsi untuk memeriksa apakah email sudah terdaftar
const isEmailExist = async (email) => {
  const sql = "SELECT * FROM community WHERE email = ?";
  const params = [email];
  return db.query(sql, params);
};

// Export semua fungsi untuk digunakan di controller
module.exports = {
  createUser,
  updateUserProfile,
  getUserById,
  getUserByEmail,
  isEmailExist,
};
