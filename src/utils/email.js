const nodemailer = require("nodemailer");
const { google } = require("googleapis");
require("dotenv").config();

const { EMAIL, CLIENT_ID, CLIENT_SECRET, REFRESH_TOKEN } = process.env;

const oAuth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  "http://localhost:3000/auth/google/callback"
);

const sendEmail = async (to, subject, text) => {
  oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });
  const accessToken = await oAuth2Client.getAccessToken();

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      type: "OAuth2",
      user: EMAIL,
      clientId: CLIENT_ID,
      clientSecret: CLIENT_SECRET,
      refreshToken: REFRESH_TOKEN,
      accessToken: accessToken,
    },
  });

  const mailOptions = {
    from: EMAIL,
    to,
    subject,
    text,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Message sent: %s", info.messageId);
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
};

module.exports = { sendEmail }; // Ekspor fungsi dengan nama sendEmail
