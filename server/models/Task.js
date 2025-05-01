/**
 * `Task` model for db
 */

const mongoose = require('mongoose')

/**
 * DOC:
 * - reminders si trova nella forma method:minutes,method:minutes  
 *   dove method := email | push, minutes sono i minuti di anticipo
 */
const taskSchema = mongoose.Schema({
  title: {
    type: String,
    default: 'Senza titolo'
  },
  description: {
    type: String,
    default: 'Nessuna descrizione'
  },
  // termine dell'attività
  deadline: {
    type: Date,
    required: true
  },
  // flag se il task è completato
  isDone: {
    type: Boolean,
    default: false
  },
  // promemoria per l'attività
  reminders: {
    type: String,
    default: ''
  },
  // timestamp dell'ultima notifica di ritardo
  lateTs: {
    type: Number,
    default: -1
  },
  // id del timer pomodoro pianificato
  tomatoId: {
    type: String,
    default: null
  },
  // username dell'utente che ha creato l'attività
  owner: {
    type: String,
    required: true
  }
})

const Task = mongoose.model('Task', taskSchema)

module.exports = Task
