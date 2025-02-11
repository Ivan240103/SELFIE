/**
 * Chiamate all'API di Google Calendar
 */

const { google } = require('googleapis')
const { authorize } = require('./Auth')
const {
  eventFromGoogleToSelfie
} = require('./IO')

// prendere tutti gli eventi dell'utente
async function listEvents(owner) {
  try {
    const auth = await authorize(owner)
    const calendar = google.calendar({version: 'v3', auth})
    const res = await calendar.events.list({
      calendarId: 'primary'
    })
    const promises = res.data.items?.map(e => eventFromGoogleToSelfie(e, owner))
    return await Promise.all(promises)
  } catch (error) {
    return []
  }
}

// prendere uno specifico evento
async function getEvent(id, owner) {
  try {
    const auth = await authorize(owner)
    const calendar = google.calendar({version: 'v3', auth})
    const res = await calendar.events.get({
      calendarId: 'primary',
      eventId: id
    })
    return await eventFromGoogleToSelfie(res.data, owner)
  } catch (error) {
    return undefined
  }
}

// prendere la notifica default del calendario
// TODO: pensare ai reminder da google
async function getDefaultReminder(owner) {
  try {
    const auth = await authorize(owner)
    const calendar = google.calendar({version: 'v3', auth})
    const res = await calendar.settings.get({
      setting: 'reminders'
    })
    console.log('Default Reminders:', res.data)
  } catch (error) {
    return undefined
  }
}

module.exports = {
  listEvents,
  getEvent
}
