/**
 * Task model for db
 */

const mongoose = require('mongoose')

const taskSchema = mongoose.Schema({
  title: {
    type: String,
    default: 'Senza titolo'
  },
  description: {
    type: String,
    default: 'Nessuna descrizione'
  },
  deadline: {
    type: Date,
    required: true
  },
  isDone: {
    type: Boolean,
    default: false
  },
  // username dell'utente che ha creato l'attività
  owner: {
    type: String,
    required: true
  },
  // promemoria per l'evento
  // method:minutes,method:minutes
  reminders: {
    type: String,
    default: ""
  },
  // timestamp dell'ultima notifica di ritardo
  lateTs: {
    type: Number,
    default: -1
  }
})

module.exports = mongoose.model("Task", taskSchema)