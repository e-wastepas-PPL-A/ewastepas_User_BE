const multer = require('multer');
const path = require('path');

// Menyimpan file di folder 'uploads' dengan nama yang unik
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)); // Nama file unik dengan ekstensi asli
  }
});

const upload = multer({ storage: storage });

module.exports = upload;
