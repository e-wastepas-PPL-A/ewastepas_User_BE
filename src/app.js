require('dotenv').config();
const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const path = require('path');
const jwt = require('jsonwebtoken');

// Middleware dan konfigurasi tambahan
const { testConnection } = require('./config/database');
const { logger, checkApiKey, errorHandler } = require('./middleware/apiMiddleware');

// Import rute-rute
const authRoutes = require('./routes/authRoutes');
const wasteRoutes = require('./routes/wasteRoutes');
const wasteTypeRoutes = require('./routes/wasteTypeRoutes');
// const pengirimanRoutes = require('./routes/pengirimanRoutes');
// const penjemputanRoutes = require('./routes/penjemputanRoutes');
const apiKeyRoutes = require('./routes/apiKeyRoutes');
const cartRoutes = require('./routes/cartRoutes');
const checkoutRoutes = require('./routes/checkoutRoutes');
const ordersRoutes = require('./routes/ordersRoutes');

const app = express();

// Konfigurasi untuk proxy
app.set('trust proxy', 1);

// Test koneksi database
testConnection();

// Middleware global
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());
app.use(logger);

// Serve static files
app.use(express.static(path.join(__dirname, '../public')));
app.use('/uploads', express.static('uploads'));

// Rute tanpa autentikasi
app.use('/api/keys', apiKeyRoutes);

// Middleware API key
app.use('/api', checkApiKey);

// Rute-rute utama
app.use('/api/auth', authRoutes);
// app.use('/api', pengirimanRoutes);
app.use('/api', wasteTypeRoutes);
// app.use('/api', penjemputanRoutes);
app.use('/api', wasteRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/checkout', checkoutRoutes);
app.use('/api/orders', ordersRoutes);

// Error handler untuk rute yang tidak ditemukan
app.use((req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

// Error handler global
app.use(errorHandler);

// Fungsi untuk menghasilkan JWT
function generateJWT(user) {
  const payload = {
    community_id: user.community_id,
    email: user.email,
  };
  const options = { expiresIn: '1h' };

  return jwt.sign(payload, process.env.SECRET_KEY, options);
}

// Endpoint login dan registrasi sederhana
app.post('/auth/login', (req, res) => {
  const { email, password } = req.body;

  if (email === process.env.EMAIL && password === process.env.PASSWORD) {
    const user = { community_id: 1, email };
    const token = generateJWT(user);

    res.cookie('token', token, {
      httpOnly: true,
      secure: false,
      sameSite: 'Strict',
      maxAge: 3600000,
    });

    return res.status(200).json({ message: 'Login berhasil' });
  } else {
    return res.status(401).json({ error: 'Email atau password salah' });
  }
});

app.post('/auth/register', (req, res) => {
  const { email, password } = req.body;

  const user = { community_id: 1, email };
  const token = generateJWT(user);

  res.cookie('token', token, {
    httpOnly: true,
    secure: false,
    sameSite: 'Strict',
    maxAge: 3600000,
  });

  return res.status(201).json({ message: 'Registrasi berhasil', user });
});

module.exports = app;
