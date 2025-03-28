/**
 * Push subscription model for db
 */

const mongoose = require('mongoose')

const subSchema = mongoose.Schema({
  // sottoscrizione al servizio di notifica
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

const Sub = mongoose.model('Sub', subSchema)

module.exports = Sub
