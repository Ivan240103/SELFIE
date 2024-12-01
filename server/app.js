/**
 * Server's entry point
 */

const express = require('express')
const mongoose = require('mongoose')
const passport = require('passport')
const { Strategy: JwtStrategy, ExtractJwt } = require('passport-jwt')
const User = require('./models/user')
const cors = require('cors')

const app = express()
const port = 8000

// MIDDLEWARE
// per accedere i campi JSON
app.use(express.json())
// per accedere i campi nel body del POST
app.use(express.urlencoded({ extended: true }))
// per accettare le richieste da domini esterni
app.use(cors())
// per gestire l'autenticazione
app.use(passport.initialize())

// configurazione passport.js
const opts = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: '6e1811f7f6040238567c4a280a1184c1'
}

passport.use(
  new JwtStrategy(opts, async (jwtPayload, done) => {
    try {
      const user = await User.findById(jwtPayload.userId)
      return done(null, user || false)
    } catch (error) {
      return done(error, false)
    }
  })
)

// ROUTES
const userRoutes = require('./routes/users')
app.use('/api/users', userRoutes)
const eventRoutes = require('./routes/events')
app.use('/api/events', eventRoutes)
const taskRoutes = require('./routes/tasks')
app.use('/api/tasks', taskRoutes)

// connessione al db
const mongoURL = 'mongodb+srv://ivan:eP3C9N8S9nRkK6TS@selfie.qv0gx.mongodb.net/?retryWrites=true&w=majority&appName=SELFIE'
mongoose.connect(mongoURL)

app.listen(port, () => {
  console.log(`Server online on port ${port}`)
})