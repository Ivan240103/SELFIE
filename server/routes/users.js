// Route for user-related operations
const express = require('express');
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const passport = require('passport')
const router = express.Router();
const User = require('../models/user')

// registrare un nuovo utente
// TODO: la psw viaggia in chiaro
router.post('/register', async (req, res) => {
  // TODO: password non viene criptata nel db
  const { username, password, name, surname, birthday } = req.body
  await bcrypt.hash(password, 10)
  const newUser = User({
    username: username,
    password: password,
    name: name,
    surname: surname,
    birthday: birthday,
  })

  try {
    await newUser.save()
    res.send('ok')
  } catch(error) {
    console.error(error)
    res.status(500).send('Error while registering new user')
  }
})

// login dell'utente
// TODO: la psw viaggia in chiaro
router.post('/login', async (req, res) => {
  const { username, password } = req.body
  try {
    const user = await User.findOne({ username: username })
    if (!user) {
      res.status(404).send(`No user found with username ${username}`)
      return
    }
    // const pswOk = await bcrypt.compare(password, user.password)
    const pswOk = password == user.password
    if (!pswOk) {
      res.status(400).send('Password incorrect')
      return
    }

    const payload = { userId: user._id, username: user.username }
    const token = jwt.sign(payload, '6e1811f7f6040238567c4a280a1184c1', { expiresIn: '24h' })
    res.json({ token })
  } catch (error) {
    console.error(error)
    res.status(500).send('Error during authentication')
  }
})

// ottenere i dati di un utente specifico
router.get('/:username', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username })
    if (!user) res.status(404).send(`No user found with username ${req.params.username}`)
    res.json(user)
  } catch (error) {
    console.error(error)
    res.status(500).send('Error while getting specific user')
  }
})

module.exports = router;