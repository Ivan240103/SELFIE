// Task model for db
const mongoose = require('mongoose')
const User = require('./user')

const taskSchema = mongoose.Schema({
  title: { type: String, default: 'Senza titolo' },
  description: String,
  deadline: { type: Date, default: Date.now() + 7 },
  isDone: { type: Boolean, default: false },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
})

module.exports = mongoose.model("Task", taskSchema)