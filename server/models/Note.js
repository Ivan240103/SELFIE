/**
 * Note model for db
 */

const mongoose = require('mongoose')

// TODO: togliere il textLength

const noteSchema = mongoose.Schema({
  title: {
    type: String,
    default: 'Senza titolo'
  },
  text: {
    type: String,
    required: true
  },
  creation: {
    type: Date,
    required: true
  },
  modification: {
    type: Date,
    required: true
  },
  // categorie separate da virgole ','
  categories: {
    type: String,
    default: ''
  },
  textLength: {
    type: Number,
    default: -1
  },
  // username dell'utente che ha creato la nota
  owner: {
    type: String,
    required: true
  }
})

module.exports = mongoose.model("Note", noteSchema)