/**
 * User model for db
 */

const mongoose = require('mongoose')

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
  // hash SHA1 della password
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
    type: Date
  },
  picName: {
    type: String,
    default: 'default.png'
  },
  // spostamento del datetime
  offset: {
    type: Number,
    default: 0
  }
})

module.exports = mongoose.model('User', userSchema)