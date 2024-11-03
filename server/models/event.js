// Event model for db
const mongoose = require('mongoose')
const User = require('./user')

// TODO: pensare bene come salvare frequency e repetitions

// if allDay = false, start and end will store also the time as a timestamp
const eventSchema = mongoose.Schema({
  title: { type: String, default: 'Senza titolo' },
  description: String,
  start: { type: Date, min: Date.now, default: Date.now },
  end: { type: Date, min: Date.now, default: Date.now },
  isAllDay: { type: Boolean, default: true },
  isRepeatable: { type: Boolean, default: false },
  frequency: String,
  repetitions: String,
  place: String,
  user: { type: mongoose.ObjectId, ref: 'User', required: true }
})

module.exports = mongoose.model("Event", eventSchema)