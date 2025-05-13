/**
 * Routes for User related operations
 */

const express = require('express')
const fs = require('fs')
const path = require('path')
const { auth, getToken } = require('../middleware/auth')
const upload = require('../middleware/multer')
const { getTime, setTime } = require('../services/TimeMachine')
const { getBdayRrule } = require('../services/RRule')
const { resetUserTaskTs, sendMail } = require('../services/Notificate')
const { authorize, getAuthUrl, saveCredentials } = require('../google/Auth')
const User = require('../models/User')
const Event = require('../models/Event')
const Task = require('../models/Task')
const Note = require('../models/Note')
const Tomato = require('../models/Tomato')
const Sub = require('../models/PushSubscription')

const router = express.Router()

/**
 * Crea un evento per il compleanno dell'utente
 * 
 * @param {Date} bday data di nascita dell'utente
 * @param {String} username username dell'utente
 */
async function createBdayEvent(bday, username) {
  try {
    // cerca l'evento compleanno precedente e lo elimina
    await Event.findOneAndDelete({ owner: username, title: 'Compleanno' })
    // crea un nuovo evento compleanno
    await Event.create({
      title: 'Compleanno',
      description: `Buon compleanno ${username}!`,
      start: bday,
      end: bday,
      isAllDay: true,
      rrule: getBdayRrule(bday),
      owner: username
    })
  } catch (err) {
    throw 'Error while creating birthday event'
  }
}

/**
 * Elimina una foto profilo dal server
 * 
 * @param {String} name nome del file da eliminare
 */
function deletePic(name) {
  if (name !== 'default.png') {
    fs.unlink(path.resolve(__dirname, `../images/uploads/${name}`), () => {})
  }
}

// registrare un nuovo utente
// password := hash SHA1 della password
router.post('/register', async (req, res) => {
  const { username, email, password, name, surname } = req.body
  const user = new User({
    username: username,
    email: email,
    password: password,
    name: name,
    surname: surname
  })

  try {
    await user.save()
    sendMail(
      email,
      'Registrazione effettuata',
      `Ciao ${username},\nti confermiamo che la registrazione è andata a buon fine.\n
      Da questo momento puoi utilizzare tutte le funzioni offerte da SELFIE!`
    )
    return res.send('ok')
  } catch(err) {
    return res.status(500).send('Error while registering new user')
  }
})

// effettuare il login dell'utente
// password := hash SHA1 della password
router.post('/login', async (req, res) => {
  const { username, password } = req.body
  try {
    const user = await User.findOne({ username: username })
    if (!user) {
      return res.status(403).send('Invalid credentials')
    }
    if (password != user.password) {
      return res.status(403).send('Invalid credentials')
    }

    const token = getToken(user)
    return res.json(token)
  } catch (err) {
    return res.status(500).send('Error while performing login')
  }
})

// ottenere i dati di un utente specifico
router.get('/', auth, (req, res) => {
  try {
    return res.json(req.user)
  } catch (err) {
    return res.status(500).send('Error while getting specific user')
  }
})

// aggiornare i dati di un utente
// oldPsw, newPsw := hash SHA1 della password
// birthday := data in ISO string (UTC)
router.put('/', [auth, upload.single('pic')], async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
    if (!user) {
      return res.status(404).send(`No user found with username ${req.user.username}`)
    }
    // modifiche
    const { email, oldPsw, newPsw, name, surname, birthday } = req.body
    user.email = email || user.email
    if (oldPsw) {
      if (user.password != oldPsw) {
        return res.status(400).send('Old password incorrect')
      } else if (newPsw) {
        user.password = newPsw
      } else {
        return res.status(400).send('New password undefined')
      }
    }
    user.name = name || user.name
    user.surname = surname || user.surname
    // se cambia la data di nascita oppure non c'era, crea un nuovo evento di compleanno
    if (birthday && (user.birthday === undefined || user.birthday.toISOString().slice(0, 10) !== birthday)) {
      user.birthday = new Date(birthday)
      await createBdayEvent(new Date(birthday), req.user.username)
    }
    // sostituisce la foto profilo
    if (req.file?.filename) {
      deletePic(user.picName)
      user.picName = req.file.filename
    }
    await user.save()
    return res.json(user)
  } catch (err) {
    return res.status(500).send('Error while updating user info')
  }
})

// eliminare un utente
router.delete('/', auth, async (req, res) => {
  try {
    deletePic(req.user.picName)
    await User.findByIdAndDelete(req.user._id)
    await Event.deleteMany({ owner: req.user.username })
    await Task.deleteMany({ owner: req.user.username })
    await Note.deleteMany({ owner: req.user.username })
    await Tomato.deleteMany({ owner: req.user.username })
    await Sub.findOneAndDelete({ owner: req.user.username })
    return res.send('ok')
  } catch (err) {
    return res.status(500).send('Error while deleting user')
  }
})

// ottenere il tempo in vigore per un utente in ISO string (UTC)
router.get('/time', auth, (req, res) => {
  try {
    const time = getTime(req.user)
    return res.json(time)
  } catch (err) {
    return res.status(500).send('Error while getting current time')
  }
})

// modificare il tempo in vigore per un utente
// time := datetime a cui si vuole spostare in ISO string (UTC)
// senza body per resettare la data
router.put('/time', auth, async (req, res) => {
  try {
    // per controllare se l'utente si sposta indietro nel tempo
    const pre = Date.parse(getTime(req.user))
    const post = await setTime(req.user, req.body.time)
    if (Date.parse(post) < pre) {
      await resetUserTaskTs(req.user.username)
    }
    return res.json(post)
  } catch (err) {
    return res.status(500).send('Error while setting time')
  }
})

// effettuare l'accesso con google
router.put('/google', auth, async (req, res) => {
  try {
    const client = authorize(req.user)
    if (client) {
      return res.send('ok')
    }
    // se non autenticato il frontend farà redirect al login
    const authUrl = await getAuthUrl()
    return res.json({ url: authUrl })
  } catch (err) {
    return res.status(500).send('Error while initiating Google authentication')
  }
})

// callback dall'autenticazione google
router.post('/google/save', auth, async (req, res) => {
  try {
    await saveCredentials(req.user, req.body.code)
    return res.send('ok')
  } catch (err) {
    return res.status(500).send('Google authentication failed')
  }
})

// attivare o disattivare le notifiche
// state := true per attivare, false per disattivare
router.put('/notification', auth, async (req, res) => {
  try {
    await User.findByIdAndUpdate(
      req.user._id,
      { $set: { notification: req.body.state } }
    )
    if (req.body.state === false) {
      await Sub.findOneAndDelete({ owner: req.user.username })
    }
    return res.send('ok')
  } catch (err) {
    return res.status(500).send('Error while setting notification permission')
  }
})

module.exports = router
