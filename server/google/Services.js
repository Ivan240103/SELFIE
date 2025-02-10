/**
 * Chiamate all'API di Google Calendar
 */

const { google } = require('googleapis')
const { authorize } = require('./Auth')
const {
  eventFromGoogleToSelfie,
  eventFromSelfieToGoogle
} = require('./IO')

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

module.exports = {
  listEvents
}
