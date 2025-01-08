const { sendEmail } = require("../utils/email");
require("dotenv").config();


const contactUs = async (req, res) => {
  const { name, contact, email, message } = req.body;

  // Validasi input
  if (!name || !contact || !email || !message) {
    return res.status(400).json({ error: "Semua data harus diisi" });
  }

  // Format email yang akan dikirim
  const subject = "Pesan Baru dari Form Kontak";
  const text = `
    Anda menerima pesan baru dari form kontak:

    Nama: ${name}
    Kontak: ${contact}
    Email: ${email}
    Pesan: ${message}
  `;

  try {
    await sendEmail(process.env.RECEIVER_EMAIL, subject, text);
    res.status(200).json({ message: "Pesan berhasil dikirim" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Gagal mengirim pesan" });
  }
};

module.exports = { contactUs };
