/**
 * Authentication middleware based on Passport.js
 */

const passport = require('passport')
const { Strategy: JwtStrategy, ExtractJwt } = require('passport-jwt')
const User = require('../models/User')
require('dotenv').config()

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

module.exports = auth
