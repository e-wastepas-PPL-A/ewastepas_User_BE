const mysql = require('mysql2/promise'); // Menggunakan mysql2 dengan promise
const app = require('./src/app');  // Jika file app.js memiliki ekstensi .js
require('dotenv').config();  // Menginisialisasi dotenv untuk memuat variabel lingkungan

console.log('Memulai koneksi ke database dan server...');

async function connectDatabase() {
    try {
        // Membuat koneksi ke database menggunakan mysql2 dengan promise
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASS,
            database: process.env.DB_NAME,
        });

        console.log('Berhasil terhubung ke database.');

        // Menjalankan query untuk memastikan koneksi berfungsi
        const [rows, fields] = await connection.execute('SELECT 1 + 1 AS result');
        console.log(rows); // Harus menampilkan hasil query

        // Setup server setelah koneksi berhasil
        const PORT = process.env.PORT || 3000;
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });

    } catch (err) {
        console.error('Koneksi ke database gagal:', err.message);
        process.exit(1); // Berhenti jika koneksi gagal
    }
}

// Panggil fungsi untuk menghubungkan ke database dan menjalankan server
connectDatabase();
