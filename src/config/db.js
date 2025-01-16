require('dotenv').config(); 

const mysql = require('mysql2/promise');

const connection = mysql.createPool({
  host: process.env.DB_HOST, 
  user: process.env.DB_USER, 
  password: process.env.DB_PASS, 
  database: process.env.DB_NAME, 
  port: process.env.DB_PORT || 3306, 
});

const pool = mysql.createPool(dbConfig);

async function query(sql, values) {
  try {
    const [results] = await pool.execute(sql, values);
    return results;
  } catch (error) {
    console.error('Error executing query:', error);
    throw error;
  }
}

async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('Berhasil terhubung ke database MySQL');
    connection.release();
  } catch (error) {
    console.error('Gagal terhubung ke database MySQL:', error);
  }
}

module.exports = {
  query,
  pool,
  testConnection,
};