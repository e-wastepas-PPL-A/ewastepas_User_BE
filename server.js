const mysql = require('mysql2/promise'); // Menggunakan mysql2 dengan promise
const app = require('./src/app');  // Jika file app.js memiliki ekstensi .js
require('dotenv').config();  // Menginisialisasi dotenv untuk memuat variabel lingkungan

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0';

app.listen(PORT, HOST, () => {
    console.log(`Server berjalan di ${HOST}:${PORT}`);
});
