const jwt = require('jsonwebtoken');

const authenticate = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1]; // Ambil token dari header Authorization

  console.log("Token received:", token); // Debugging token yang diterima

  if (!token) {
    return res.status(403).json({ message: 'Token tidak disertakan' });
  }

  jwt.verify(token, process.env.SECRET_KEY, (err, decoded) => {
    if (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ message: 'Token telah kedaluwarsa' });
      }
      return res.status(403).json({ message: 'Token tidak valid', error: err });
    }

    console.log("Decoded user:", decoded); // Debugging user data yang terdekode

    // Jika token valid
    req.user = decoded.user; // Menyimpan data user di req.user
    next(); // Lanjutkan ke route handler
  });
};

module.exports = authenticate;
