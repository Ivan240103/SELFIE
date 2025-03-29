/**
 * Profile pic upload middleware based on Multer
 */

const multer = require('multer')
const path = require('path')

// configurazione per salvare le immagini
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // dove salvare i file
    const uploadPath = path.resolve(__dirname, '../images/uploads')
    cb(null, uploadPath)
  },
  filename: (req, file, cb) => {
    // creazione nome univoco
    const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, uniqueName + path.extname(file.originalname))
  },
})

// middleware
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 8000000
  }
})

module.exports = upload
