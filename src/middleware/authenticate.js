const jwt = require('jsonwebtoken');

const authenticate = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1]; 
  
    if (!token) {
      return res.status(403).json({ message: 'Token tidak disertakan' });
    }
  
    jwt.verify(token, process.env.SECRET_KEY, (err, decoded) => {
      if (err) {
        return res.status(403).json({ message: 'Token tidak valid', error: err });
      }
  
      
      if (!decoded || !decoded.user) {
        return res.status(403).json({ message: 'Token tidak mengandung data user yang valid' });
      }
  
      req.user = decoded.user; 
      next(); 
    });
  };
  
  
module.exports = authenticate;
