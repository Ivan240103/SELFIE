/**
 * Event model for db
 */

const mongoose = require('mongoose')

// TODO: pensare bene come salvare frequency e repetitions

const eventSchema = mongoose.Schema({
  title: {
    type: String,
    default: 'Senza titolo'
  },
  description: {
    type: String,
    default: 'Nessuna descrizione'
  },
  // se il giorno di start e end coincide, l'evento si svolge solo in quel giorno
  start: {
    type: Date,
    default: Date.now
  },
  end: {
    type: Date,
    default: Date.now
  },
  // se isAllDay = false, start e end conterranno anche l'orario in formato timestamp
  isAllDay: {
    type: Boolean,
    default: true
  },
  isRepeatable: {
    type: Boolean,
    default: false
  },
  // n = no repetition, d = daily, w = weekly, m = monthly, y = yearly
  frequency: {
    type: String,
    default: 'n'
  },
  repetitions: {
    type: String
  },
  place: String,
  // username dell'utente che ha creato l'evento
  owner: {
    type: String,
    required: true 
  }
})

module.exports = mongoose.model("Event", eventSchema)