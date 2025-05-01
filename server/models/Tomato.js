/**
 * `Tomato` timer model for db
 */

const mongoose = require('mongoose')

/**
 * DOC:
 * - i possibili valori per interrupted sono:
 *   - 'n' = not interrupted
 *   - 's' = interrupted during study time
 *   - 'p' = interrupted during pause time
 *   - 'f' = finished
 * - remainingSeconds e remainingLoops hanno significato
 *   solo se interrupted != 'n'
 */
const tomatoSchema = mongoose.Schema({
  // tempo di studio in minuti
  studyMinutes: {
    type: Number,
    min: 1,
    required: true
  },
  // tempo di pausa in minuti
  pauseMinutes: {
    type: Number,
    min: 1,
    required: true
  },
  // numero di cicli totali (uno è studio + pausa)
  loops: {
    type: Number,
    min: 1,
    required: true
  },
  // stato del timer
  interrupted: {
    type: String,
    default: 'n'
  },
  // tempo rimanente in secondi
  remainingSeconds: {
    type: Number,
    default: -1
  },
  // numero di cicli rimanenti
  remainingLoops: {
    type: Number,
    default: -1
  },
  // data e ora dell'ultima modifica al timer
  modification: {
    type: Date,
    required: true
  },
  // username dell'utente che ha creato il timer
  owner: {
    type: String,
    required: true
  }
})

const Tomato = mongoose.model('Tomato', tomatoSchema)

module.exports = Tomato
