/**
 * Routes for User-related operations
 */

const express = require('express')
const auth = require('../middleware/auth')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
require('dotenv').config()
const User = require('../models/User')
const tm = require('../services/TimeMachine')

const router = express.Router()

// registrare un nuovo utente
router.post('/register', async (req, res) => {
  const { username, email, password, name, surname, birthday } = req.body
  // FIXME: await bcrypt.hash(password, 10)
  const newUser = new User({
    username: username,
    email: email,
    password: password,
    name: name,
    surname: surname,
    birthday: birthday
  })

  try {
    await newUser.save()
    return res.send('ok')
  } catch(err) {
    console.error(err)
    return res.status(500).send('Error while registering new user')
  }
})

// login dell'utente
router.post('/login', async (req, res) => {
  const { username, password } = req.body
  try {
    const user = await User.findOne({ username: username })
    if (!user) return res.status(400).send('Incorrect username')
    // FIXME: const pswOk = await bcrypt.compare(password, user.password)
    const pswOk = password == user.password
    if (!pswOk) return res.status(400).send('Incorrect password')

    const tokenPayload = { userId: user._id, username: user.username }
    const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, { expiresIn: '24h' })
    return res.json(token)
  } catch (err) {
    console.error(err)
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
    console.error(err)
    res.status(500).send('Error while getting specific user')
  }
})

// ottenere il tempo in vigore per un utente in formato ISO string
router.get('/time', auth, async (req, res) => {
  try {
    const time = await tm.getTime(req.user.username)
    return res.json(time)
  } catch (err) {
    return res.status(500).send('Error while getting time')
  }
})

// aggiornare i dati di un utente
router.put('/', auth, async (req, res) => {
  try {
    const toUpdate = await User.findOne({ username: req.user.username })
    if (!toUpdate) return res.status(404).send(`No user found with username ${req.sur.username}`)
    // modifiche
    toUpdate.email = req.body.email || toUpdate.email
    toUpdate.name = req.body.name || toUpdate.name
    toUpdate.surname = req.body.surname || toUpdate.surname
    toUpdate.birthday = req.body.birthday || toUpdate.birthday
    await toUpdate.save()
    return res.json(toUpdate)
  } catch (err) {
    console.error(err)
    return res.status(500).send('Error while updating user info')
  }
})

// modificare l'offset di un utente
// body.time = data a cui ci si vuole spostare in formato ISO string
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
    const deletion = await User.findOneAndDelete({ username: req.user.username })
    if (!deletion) return res.status(404).send(`No user found with username ${req.user.username}`)
    return res.send('ok')
  } catch (err) {
    console.error(err)
    return res.status(500).send('Error while deleting user')
  }
})

module.exports = router
