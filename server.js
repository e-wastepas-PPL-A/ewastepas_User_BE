const mysql = require('mysql2/promise'); 
const app = require('./src/app'); 
require('dotenv').config(); 

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0';

app.listen(PORT, HOST, () => {
    console.log(`Server berjalan di ${HOST}:${PORT}`);
});
