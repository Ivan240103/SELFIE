/**
 * `User` model for db
 */

const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
  // username univoco
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
  // nome salvato dell'immagine del profilo
  picName: {
    type: String,
    default: 'default.png'
  },
  // spostamento del datetime rispetto a quello reale
  offset: {
    type: Number,
    default: 0
  },
  // token per google API
  google: {
    type: String,
    default: ''
  },
  // permesso di inviare notifiche
  notification: {
    type: Boolean,
    default: false
  }
})

const User = mongoose.model('User', userSchema)

module.exports = User
