/**
 * `Event` model for db
 */

const mongoose = require('mongoose')

/**
 * DOC:
 * - se isAllDay == true, start e end conterranno solo la data  
 *   se isAllDay == false, start e end conterranno anche l'orario
 * - rrule segue lo standard iCalendar  
 *   RRULE:FREQ=f;INTERVAL=i;COUNT=c oppure RRULE:FREQ=f;INTERVAL=i;UNTIL=u
 * - mapsLocated = true se place viene impostato tramite l'API di LocationIQ
 * - googleId ha significato solo se l'evento arriva da Google
 * - reminders si trova nella forma method:minutes,method:minutes  
 *   dove method := email | push, minutes sono i minuti di anticipo
 */
const eventSchema = mongoose.Schema({
  title: {
    type: String,
    default: 'Senza titolo'
  },
  description: {
    type: String,
    default: 'Nessuna descrizione'
  },
  // data (e orario) di inizio
  start: {
    type: Date,
    required: true
  },
  // data (e orario) di fine
  end: {
    type: Date,
    required: true
  },
  // flag se l'evento dura tutto il giorno
  isAllDay: {
    type: Boolean,
    default: true
  },
  // regola di ricorrenza
  rrule: {
    type: String,
    default: null
  },
  // luogo dell'evento
  place: {
    type: String,
    default: ''
  },
  // flag se il luogo è geolocalizzato
  mapsLocated: {
    type: Boolean,
    default: false
  },
  // ID dell'evento Google Calendar
  googleId: {
    type: String,
    default: ''
  },
  // promemoria per l'evento
  reminders: {
    type: String,
    default: ''
  },
  // username dell'utente che ha creato l'evento
  owner: {
    type: String,
    required: true 
  }
})

const Event = mongoose.model('Event', eventSchema)

module.exports = Event
