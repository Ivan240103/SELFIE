/**
 * `Note` model for db
 */

const mongoose = require('mongoose')

/**
 * DOC:
 * - le categorie sono salvate in una stringa unica, separate da virgole
 */
const noteSchema = mongoose.Schema({
  title: {
    type: String,
    default: 'Senza titolo'
  },
  text: {
    type: String,
    required: true
  },
  // data e ora di creazione
  creation: {
    type: Date,
    required: true
  },
  // data e ora dell'ultima modifica
  modification: {
    type: Date,
    required: true
  },
  // categorie associate
  categories: {
    type: String,
    default: ''
  },
  // username dell'utente che ha creato la nota
  owner: {
    type: String,
    required: true
  }
})

const Note = mongoose.model('Note', noteSchema)

module.exports = Note
