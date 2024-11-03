// User model for db
const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
  username: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  name: String,
  surname: String,
  birthday: { type: Date, max: Date.now }
})

module.exports = mongoose.model('User', userSchema)