/**
 * Intermediate service to handle import-export of events
 * between SELFIE and Google Calendar
*/

const Event = require('../models/Event')
const {
  addDtstartToRrule,
  removeDtstartFromRrule
} = require('../services/RRule')

/**
 * Traduce un evento Google in un evento selfie
 * 
 * @param gEvent event resource da Google
 * @param owner username dell'utente che lo importa
 * @returns oggetto Event di selfie
 */
function eventFromGoogleToSelfie(gEvent, owner) {
  const { id, summary, description, start, end, recurrence, location } = gEvent
  return new Event({
    title: summary || 'Senza titolo',
    description: description || 'Nessuna descrizione',
    start: start.date || start.dateTime,
    end: end.date || end.dateTime,
    isAllDay: 'date' in start,
    rrule: recurrence ? addDtstartToRrule(recurrence[0], start) : null,
    place: location || undefined,
    googleId: id,
    reminders: '',
    owner: owner
  })
}

/**
 * Traduce un evento selfie in un evento Google
 * 
 * @param sEvent oggetto Event di selfie
 * @returns event resource per Google
 */
function eventFromSelfieToGoogle(sEvent) {
  const { title, description, start, end, isAllDay, rrule, place, googleId } = sEvent
  return {
    id: googleId,
    summary: title,
    description: description,
    start: isAllDay ? { date: start } : { dateTime: start },
    end: isAllDay ? { date: end } : { dateTime: end },
    recurrence: rrule ? [removeDtstartFromRrule(rrule)] : undefined,
    location: place
  }
}

module.exports = { eventFromGoogleToSelfie, eventFromSelfieToGoogle }
