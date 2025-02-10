/**
 * Routes for User-related operations
 */

const express = require('express')
const jwt = require('jsonwebtoken')
const { RRule } = require('rrule')
const fs = require('fs')
const path = require('path')
require('dotenv').config()

const auth = require('../middleware/auth')
const upload = require('../middleware/multer')
const tm = require('../services/TimeMachine')
const { authorize } = require('../google/Auth')

const User = require('../models/User')
const Event = require('../models/Event')
const Task = require('../models/Task')
const Note = require('../models/Note')
const Tomato = require('../models/Tomato')

const router = express.Router()

/**
 * Crea un evento per il compleanno dell'utente
 * 
 * @param {Date} bday data di nascita dell'utente
 * @param {String} username username dell'utente
 */
const createBdayEvent = async (bday, username) => {
  try {
    // cerca il compleanno precedente e lo elimina
    await Event.findOneAndDelete({ owner: username, title: 'Compleanno' })
    // crea un nuovo evento compleanno
    const rep = new RRule({
      freq: RRule.YEARLY,
      interval: 1,
      dtstart: bday
    })
    const bdayEvent = new Event({
      title: 'Compleanno',
      description: `Oggi è il compleanno di ${username}!`,
      start: bday,
      end: bday,
      isAllDay: true,
      rrule: rep.toString(),
      owner: username
    })
    await bdayEvent.save()
  } catch (err) {
    throw 'Error while creating birthday event'
  }
}

// registrare un nuovo utente
// della password passare l'hash SHA1
router.post('/register', async (req, res) => {
  const { username, email, password, name, surname } = req.body
  const newUser = new User({
    username: username,
    email: email,
    password: password,
    name: name,
    surname: surname
  })

  try {
    await newUser.save()
    return res.send('ok')
  } catch(err) {
    return res.status(500).send('Error while registering new user')
  }
})

// login dell'utente
// della password passare l'hash SHA1
router.post('/login', async (req, res) => {
  const { username, password } = req.body
  try {
    const user = await User.findOne({ username: username })
    if (!user) return res.status(400).send('Incorrect username')
    const pswOk = password == user.password
    if (!pswOk) return res.status(400).send('Incorrect password')

    const tokenPayload = { userId: user._id, username: user.username }
    // DEBUG: token non scade mai
    const token = jwt.sign(tokenPayload, process.env.JWT_SECRET/*, { expiresIn: '24h' } */)
    return res.json(token)
  } catch (err) {
    res.status(500).send('Error during login')
  }
})

// ottenere i dati di un utente specifico
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findOne({ username: req.user.username })
    if (!user) return res.status(404).send(`No user found with username ${req.user.username}`)
    return res.json(user)
  } catch (err) {
    res.status(500).send('Error while getting specific user')
  }
})

// ottenere il tempo in vigore per un utente in ISO string (UTC)
router.get('/time', auth, async (req, res) => {
  try {
    const time = await tm.getTime(req.user.username)
    return res.json(time)
  } catch (err) {
    return res.status(500).send('Error while getting time')
  }
})

router.put('/google', auth, async (req, res) => {
  try {
    const user = await User.findOne({ username: req.user.username })
    const client = await authorize()
    if (!client) return res.status(400).send('Authentication failed')
    if (!user) return res.status(404).send(`No user found with username ${req.user.username}`)
    user.google = true
    await user.save()
    return res.json(user)
  } catch (err) {
    return res.status(500).send('Problems during Google authentication')
  }
})

// aggiornare i dati di un utente
// delle password passare l'hash SHA1
// body.birthday è una data in ISO string (UTC)
router.put('/', [auth, upload.single('pic')], async (req, res) => {
  try {
    const upd = await User.findOne({ username: req.user.username })
    if (!upd) return res.status(404).send(`No user found with username ${req.sur.username}`)
    // modifiche
    const { email, oldPsw, newPsw, name, surname, birthday } = req.body
    upd.email = email || upd.email
    if (oldPsw) {
      if (upd.password != oldPsw) {
        return res.status(400).send('Old password incorrect')
      } else if (newPsw) {
        upd.password = newPsw
      } else {
        return res.status(400).send('New password undefined')
      }
    }
    upd.name = name || upd.name
    upd.surname = surname || upd.surname
    // se cambia la data di nascita crea un nuovo evento di compleanno
    if (birthday && (upd.birthday === undefined || birthday !== upd.birthday.toISOString().substring(0, 10))) {
      upd.birthday = new Date(birthday)
      await createBdayEvent(new Date(birthday), req.user.username)
    }
    // elimina la vecchia foto quando viene rimpiazzata
    if (req.file?.filename) {
      if (upd.picName !== 'default.png') {
        fs.unlink(path.resolve(__dirname, `../uploads/images/${upd.picName}`), () => {})
      }
      upd.picName = req.file.filename
    }
    await upd.save()
    return res.json(upd)
  } catch (err) {
    return res.status(500).send('Error while updating user info')
  }
})

// modificare l'offset di un utente
// body.time = datetime a cui ci si vuole spostare in ISO string (UTC)
// senza body per resettare la data
router.put('/time', auth, async (req, res) => {
  try {
    if (req.body.time) {
      const time = await tm.setTime(req.user.username, req.body.time)
      return res.json(time)
    } else {
      const time = await tm.resetTime(req.user.username)
      return res.json(time)
    }
  } catch (err) {
    return res.status(500).send('Error while setting time')
  }
})

// eliminare un utente
router.delete('/', auth, async (req, res) => {
  try {
    const del = await User.findOne({ username: req.user.username })
    if (!del) return res.status(404).send(`No user found with username ${req.user.username}`)
    // elimina a cascata tutte le risorse dell'utente
    if (del.picName !== 'default.png') {
      fs.unlink(path.resolve(__dirname, `../uploads/images/${del.picName}`), () => {})
    }
    await del.deleteOne()
    await Event.deleteMany({ owner: req.user.username })
    await Task.deleteMany({ owner: req.user.username })
    await Note.deleteMany({ owner: req.user.username })
    await Tomato.deleteMany({ owner: req.user.username })
    return res.send('ok')
  } catch (err) {
    return res.status(500).send('Error while deleting user')
  }
})

module.exports = router
