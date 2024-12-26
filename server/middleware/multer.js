/**
 * Middleware per il caricamento dell'immagine profilo
 */

const multer = require('multer')
const path = require('path')

// configurazione di multer per salvare le immagini profilo
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // dove salvare i file
    const uploadPath = path.resolve(__dirname, '../uploads/images')
    cb(null, uploadPath)
  },
  filename: (req, file, cb) => {
    // creazione nome univoco
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, uniqueSuffix + path.extname(file.originalname))
  },
})

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 8000000
  }
})

module.exports = upload
