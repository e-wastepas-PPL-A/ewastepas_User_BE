const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// Fungsi untuk menambahkan pengguna baru
const createUser = async (name, email, phone, address, photo, date_of_birth) => {
  try {
    return await prisma.community.create({
      data: {
        name,
        email,
        phone,
        address,
        photo,
        date_of_birth,
      },
    });
  } catch (error) {
    throw new Error(error.message);
  }
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
  try {
    return await prisma.community.update({
      where: { community_id },
      data: {
        name,
        email,
        phone,
        address,
        photo,
        date_of_birth,
      },
    });
  } catch (error) {
    throw new Error(error.message);
  }
};

// Fungsi untuk mengambil data pengguna berdasarkan ID
const getUserById = async (id) => {
  try {
    return await prisma.community.findUnique({
      where: { community_id: id },
    });
  } catch (error) {
    throw new Error(error.message);
  }
};

// Fungsi untuk mendapatkan pengguna berdasarkan email (untuk login)
const getUserByEmail = async (email) => {
  try {
    return await prisma.community.findUnique({
      where: { email },
    });
  } catch (error) {
    throw new Error(error.message);
  }
};

// Fungsi untuk memeriksa apakah email sudah terdaftar
const isEmailExist = async (email) => {
  try {
    const user = await prisma.community.findUnique({
      where: { email },
    });
    return user !== null;
  } catch (error) {
    throw new Error(error.message);
  }
};

// Export semua fungsi untuk digunakan di controller
module.exports = {
  createUser,
  updateUserProfile,
  getUserById,
  getUserByEmail,
  isEmailExist,
};
