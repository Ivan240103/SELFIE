/**
 * Note model for db
 */

const mongoose = require('mongoose')

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
    default: Date.now
  },
  modification: {
    type: Date,
    default: Date.now
  },
  categories: {
    type: [String],
    default: ['None']
  },
  length: {
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