const nodemailer = require("nodemailer");
const { google } = require("googleapis");
require("dotenv").config();

// Konfigurasi OAuth2
const { CLIENT_ID, CLIENT_SECRET, REFRESH_TOKEN, EMAIL } = process.env;
const oauth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET);

// Fungsi untuk mengirim email
const sendEmail = async (to, subject, text) => {
  try {
    oauth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });
    const accessToken = await oauth2Client.getAccessToken();

    if (!accessToken) {
      throw new Error("Failed to obtain access token");
    }

    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        type: "OAuth2",
        user: EMAIL,
        clientId: CLIENT_ID,
        clientSecret: CLIENT_SECRET,
        refreshToken: REFRESH_TOKEN,
        accessToken: accessToken.token,
      },
    });

    const mailOptions = {
      from: EMAIL,
      to,
      subject,
      text,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Message sent successfully. Message ID:", info.messageId);
    return info;
  } catch (error) {
    console.error("Error in sendEmail:", error);
    throw new Error(`Failed to send email: ${error.message}`);
  }
};

module.exports = {
  sendEmail,
};
