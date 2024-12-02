// Tomato model for db
const mongoose = require('mongoose')
const User = require('./user')

const tomatoSchema = mongoose.Schema({
  studyMinutes: { type: Number, min: 1, required: true },
  pauseMinutes: { type: Number, min: 1, required: true },
  loops: { type: Numeber, min: 1, required: true },
  // 'n' = not interrupted, 's' = interrupted during study time, 'p' = interrupted during pause time
  interrupted: { type: String, default: 'n' },
  remainingMinutes: Number,
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
})

module.exports = mongoose.model("Tomato", tomatoSchema)