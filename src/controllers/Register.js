const bcrypt = require('bcrypt');
const Joi = require("joi");
const crypto = require("crypto");
const { PrismaClient } = require("@prisma/client");
const { sendEmail } = require("../utils/email");
const winston = require("winston");

const prisma = new PrismaClient();

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

    // Check if email already exists using Prisma
    const existingUser = await prisma.community.findUnique({
      where: { email },
    });

    if (existingUser) {
      logger.error("Email sudah digunakan");
      return res.status(400).json({ message: "Email sudah digunakan" });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate OTP
    const otp = crypto.randomInt(100000, 999999).toString();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

    // Create new user using Prisma
    await prisma.community.create({
      data: {
        name,
        email,
        password: hashedPassword,
        otp_code: otp,
        otp_expiry: otpExpiry,
        is_verified: false,
      },
    });

    // Send OTP email
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
