/**
 * Event model for db
 */

const mongoose = require('mongoose')

const eventSchema = mongoose.Schema({
  title: {
    type: String,
    default: 'Senza titolo'
  },
  description: {
    type: String,
    default: 'Nessuna descrizione'
  },
  // se la data di start e end coincide, l'evento si svolge solo in quel giorno
  start: {
    type: Date,
    required: true
  },
  end: {
    type: Date,
    required: true
  },
  // se isAllDay = false, start e end conterranno anche l'orario
  isAllDay: {
    type: Boolean,
    default: true
  },
  /*
  standard iCalendar
  RRULE:FREQ=f;INTERVAL=i;COUNT=c
  RRULE:FREQ=f;INTERVAL=i;UNTIL=u
  */
  rrule: {
    type: String,
    default: null
  },
  place: String,
  // username dell'utente che ha creato l'evento
  owner: {
    type: String,
    required: true 
  },
  // id dell'evento google
  googleId: {
    type: String,
    default: ""
  },
  // promemoria per l'evento
  // method:minutes,method:minutes
  reminders: {
    type: String,
    default: ""
  }
})

module.exports = mongoose.model("Event", eventSchema)