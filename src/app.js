const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const dotenv = require("dotenv");  
const jwt = require("jsonwebtoken");  

dotenv.config();  

const app = express();
const authRoutes = require("./routes/authRoutes");


app.use(cors({
  origin: "http://localhost:5173",  
  credentials: true,
}));


app.use(express.json());


app.use(cookieParser());


app.use("/auth", authRoutes);


app.use('/uploads', express.static('uploads'));


function generateJWT(user) {
  const payload = {
    community_id: user.community_id,
    email: user.email,
  };
  const options = { expiresIn: "1h" };

  return jwt.sign(payload, process.env.SECRET_KEY, options); // Gunakan SECRET_KEY dari environment
}


app.post("/auth/login", (req, res) => {
  const { email, password } = req.body;


  if (email === process.env.EMAIL && password === process.env.PASSWORD) {
    const user = { community_id: 1, email }; 
    const token = generateJWT(user);

    
    res.cookie("token", token, {
      httpOnly: true,
      secure: false, 
      sameSite: "Strict", 
      maxAge: 3600000, 
    });

    return res.status(200).json({ message: "Login berhasil" });
  } else {
    return res.status(401).json({ error: "Email atau password salah" });
  }
});


app.post("/auth/register", (req, res) => {
  const { email, password } = req.body;

  
  const user = { community_id: 1, email };

  
  const token = generateJWT(user);

  
  res.cookie("token", token, {
    httpOnly: true,
    secure: false, 
    sameSite: "Strict",
    maxAge: 3600000, 
  });

  return res.status(201).json({ message: "Registrasi berhasil", user });
});

module.exports = app;
