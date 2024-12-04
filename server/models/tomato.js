/**
 * Tomato-timer model for db
 */

const mongoose = require('mongoose')

const tomatoSchema = mongoose.Schema({
  studyMinutes: {
    type: Number,
    min: 1,
    required: true
  },
  pauseMinutes: {
    type: Number,
    min: 1,
    required: true
  },
  loops: {
    type: Number,
    min: 1,
    required: true
  },
  // 'n' = not interrupted, 's' = interrupted during study time, 'p' = interrupted during pause time
  interrupted: {
    type: String,
    default: 'n'
  },
  // ha valore solo se interrupted != 'n'
  remainingMinutes: {
    type: Number,
    default: -1
  },
  // un loop è inteso come studio + pausa
  remainingLoops: {
    type: Number,
    default: -1
  },
  // username dell'utente che ha creato il timer
  owner: {
    type: String,
    required: true
  }
})

module.exports = mongoose.model("Tomato", tomatoSchema)