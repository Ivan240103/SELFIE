/**
 * User model for db
 */

const mongoose = require('mongoose')
const bcrypt = require('bcrypt')

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    unique: true,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  name: {
    type: String,
    default: 'Nome'
  },
  surname: {
    type: String,
    default: 'Cognome'
  },
  birthday: {
    type: Date,
    max: Date.now
  },
  // spostamento del datetime
  offset: {
    type: Number,
    default: 0
  }
})

// della password viene salvato l'hash nel db
/* userSchema.pre('save', async () => {
  this.password = await bcrypt.hash(this.password, 10)
}) */

module.exports = mongoose.model('User', userSchema)