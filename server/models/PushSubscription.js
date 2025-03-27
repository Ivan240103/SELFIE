/**
 * Push subscription model for db
 */

const mongoose = require('mongoose')

const subSchema = mongoose.Schema({
  subscription: {
    type: Object,
    required: true
  },
  // username dell'utente che ha effettuato la subscription
  owner: {
    type: String,
    required: true
  }
})

module.exports = mongoose.model("Sub", subSchema)