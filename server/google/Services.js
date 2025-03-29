/**
 * Service to handle Google Calendar API calls
 */

const { google } = require('googleapis')
const { authorize } = require('./Auth')
const {
  eventFromGoogleToSelfie
} = require('./IO')

/**
 * Prende tutti gli eventi dell'utente
 * 
 * @param {String} owner username dell'utente
 * @returns array di oggetti Event di selfie
 */
async function listEvents(owner) {
  try {
    const auth = await authorize(owner)
    const calendar = google.calendar({ version: 'v3', auth })
    const res = await calendar.events.list({
      calendarId: 'primary'
    })
    return res.data.items?.map(e => eventFromGoogleToSelfie(e, owner))
  } catch (error) {
    return []
  }
}

/**
 * Prende uno specifico evento dell'utente
 * 
 * @param {String} id identificativo dell'evento
 * @param {String} owner username dell'utente
 * @returns oggetto Event di selfie
 */
async function getEvent(id, owner) {
  try {
    const auth = await authorize(owner)
    const calendar = google.calendar({ version: 'v3', auth })
    const res = await calendar.events.get({
      calendarId: 'primary',
      eventId: id
    })
    return eventFromGoogleToSelfie(res.data, owner)
  } catch (error) {
    return undefined
  }
}

module.exports = {
  listEvents,
  getEvent
}
