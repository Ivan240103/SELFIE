/**
 * Servizio intermedio per fare import-export di eventi
 * e task da e verso Google Calendar
*/

const Event = require('../models/Event')
const { addStartToRrule, removeStartFromRrule } = require('../services/RRule')

/**
 * Traduce un evento google in un evento selfie
 * 
 * @param gEvent event resource from google
 * @param owner utente che lo importa
 * @returns event object selfie
 */
const eventFromGoogleToSelfie = async (gEvent, owner) => {
  const { summary, description, start, end, recurrence, location } = gEvent
  return new Event({
    title: summary || 'Senza titolo',
    description: description || 'Nessuna descrizione',
    start: start.date || start.dateTime,
    end: end.date || end.dateTime,
    isAllDay: 'date' in start,
    rrule: recurrence ? await addStartToRrule(recurrence[0], start) : null,
    place: location || undefined,
    owner: owner
  })
}

/**
 * Traduce un evento selfie in un evento google
 * 
 * @param sEvent event object selfie
 * @param owner utente che lo esporta
 * @returns event resource for google
 */
const eventFromSelfieToGoogle = (sEvent) => {
  const { title, description, start, end, isAllDay, rrule, place } = sEvent
  return {
    summary: title,
    description: description,
    start: isAllDay ? { date: start } : { dateTime: start },
    end: isAllDay ? { date: end } : { dateTime: end },
    recurrence: rrule ? [removeStartFromRrule(rrule)] : undefined,
    location: place
  }
}

module.exports = { eventFromGoogleToSelfie, eventFromSelfieToGoogle }
