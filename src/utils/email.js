const nodemailer = require("nodemailer");
require("dotenv").config();

const { EMAIL, GMAIL_PASSWORD } = process.env;

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: EMAIL,
    pass: GMAIL_PASSWORD,  
  },
});

const sendEmail = async (to, subject, text) => {
  try {
    const mailOptions = {
      from: EMAIL,
      to,
      subject,
      text,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Message sent: %s", info.messageId);
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
};

module.exports = { sendEmail };
