const bcrypt = require('bcrypt');
const Joi = require("joi");
const crypto = require("crypto");
const { query } = require("../config/db");
const { sendEmail } = require("../utils/email");
const winston = require("winston");

const logger = winston.createLogger({
    level: "info",
    format: winston.format.json(),
    transports: [
      new winston.transports.Console({ format: winston.format.simple() }),
      new winston.transports.File({ filename: "error.log", level: "error" }),
      new winston.transports.File({ filename: "combined.log" }),
    ],
  });

const register = async (req, res) => {
    try {
      const { name, email, password, confirmPassword } = req.body;
  
      const schema = Joi.object({
        name: Joi.string().min(3).required(),
        email: Joi.string().email().required(),
        password: Joi.string()
          .min(8)
          .pattern(
            new RegExp(
              "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&#])[A-Za-z\\d@$!%*?&#]{8,}$"
            )
          )
          .required(),
        confirmPassword: Joi.string().valid(Joi.ref("password")).required(),
      });
  
      const { error } = schema.validate(req.body);
      if (error) {
        logger.error(`Validation error: ${error.details[0].message}`);
        return res.status(400).json({ message: error.details[0].message });
      }
  
      const sqlCheckEmail = "SELECT * FROM community WHERE email = ?";
      const resultsCheckEmail = await query(sqlCheckEmail, [email]);
  
      if (resultsCheckEmail.length > 0) {
        logger.error("Email sudah digunakan");
        return res.status(400).json({ message: "Email sudah digunakan" });
      }
  
      const hashedPassword = await bcrypt.hash(password, 10);
  
      const otp = crypto.randomInt(100000, 999999).toString();
      const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
  
      const sqlInsertUser = `
        INSERT INTO community (name, email, password, otp_code, otp_expiry, is_verified)
        VALUES (?, ?, ?, ?, ?, ?)
      `;
      await query(sqlInsertUser, [
        name,
        email,
        hashedPassword,
        otp,
        otpExpiry,
        0,
      ]);
  
      await sendEmail(email, "Kode OTP Anda", `Kode OTP Anda adalah: ${otp}`);
  
      logger.info("Registrasi berhasil!");
      res
        .status(201)
        .json({ message: "Registrasi berhasil! OTP telah dikirim ke email." });
    } catch (err) {
      logger.error(`Error: ${err.message}`);
      res
        .status(500)
        .json({ message: "Terjadi kesalahan pada server.", error: err.message });
    }
  };

module.exports = { register };
