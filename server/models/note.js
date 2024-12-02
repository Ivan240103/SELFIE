// Note model for db
const mongoose = require('mongoose')
const User = require('./user')

const noteSchema = mongoose.Schema({
  title: { type: String, default: 'Senza titolo' },
  text: { type: String, required: true },
  creation: { type: Date, default: Date.now },
  modification: { type: Date, default: Date.now },
  categories: [String],
  length: { type: Number, default: -1 },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
})

module.exports = mongoose.model("Note", noteSchema)