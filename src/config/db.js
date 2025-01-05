// db.js
const mysql = require('mysql2/promise');

// Membuat koneksi ke database MySQL
const connection = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'ppl_ewhale'
});

// Fungsi untuk query
async function query(sql, values) {
  const [results] = await connection.execute(sql, values);
  return results;
}

module.exports = {
  query,
};
