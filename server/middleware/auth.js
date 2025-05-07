/**
 * Authentication middleware based on Passport.js
 */

const passport = require('passport')
const { Strategy: JwtStrategy, ExtractJwt } = require('passport-jwt')
const jwt = require('jsonwebtoken')
const User = require('../models/User')
const dotenv = require('dotenv')
const path = require('path')

dotenv.config({ path: path.resolve(__dirname, "../.env") })

// configurazione strategia
const opts = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET
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

// middleware
const auth = passport.authenticate('jwt', { session: false })

/**
 * Genera un JWT per l'utente
 * 
 * @param {User} user utente per cui generare il token
 * @returns token firmato
 */
function getToken(user) {
  const payload = { userId: user._id, username: user.username }
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '24h' } )
}

module.exports = { auth, getToken }
