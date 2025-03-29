/**
 * RRule service to handle recurrence rules
 */

const { RRule } = require('rrule')

/**
 * Converte una regola di ricorrenza compatibile con FullCalendar in
 * una stringa rappresentante una RRule
 * 
 * @param {JSON} rrule regola di ricorrenza compatibile con FullCalendar
 * @returns regola RRule equivalente in formato stringa
 */
function rruleToString(rrule) {
  const frequency = rrule.freq === 'daily' ? RRule.DAILY :
                    rrule.freq === 'weekly' ? RRule.WEEKLY :
                    rrule.freq === 'monthly' ? RRule.MONTHLY : RRule.YEARLY
  const ruleStart = rrule.dtstart ? new Date(rrule.dtstart) : new Date()
  const r = new RRule({
    freq: frequency,
    interval: rrule.interval || 1,
    dtstart: ruleStart,
    until: rrule.until || undefined,
    count: rrule.count || undefined
  })
  return r.toString()
}

/**
 * Converte una stringa rappresentante una RRule in una regola di
 * ricorrenza in formato JSON, compatibile con FullCalendar
 *  
 * @param {String} str regola RRule in formato stringa
 * @returns regola di ricorrenza compatibile con FullCalendar
 */
function stringToRrule(str) {
  const rrule = RRule.fromString(str)
  const { freq, interval, dtstart, until, count } = rrule.options
  const frequency = freq == RRule.DAILY ? 'daily' :
                    freq == RRule.WEEKLY ? 'weekly' :
                    freq == RRule.MONTHLY ? 'monthly' : 'yearly'
  return {
    freq: frequency,
    interval: interval || 1,
    dtstart: dtstart,
    until: until || undefined,
    count: count || undefined
  }
}

/**
 * Aggiunge il campo dtstart alla stringa RRule
 * 
 * @param {String} rruleStr regola RRule in formato stringa
 * @param {JSON} start data di inizio dell'evento ricorrente
 * @returns stringa RRule con aggiunto il campo dtstart
 */
function addDtstartToRrule(rruleStr, start) {
  const rrule = stringToRrule(rruleStr)
  rrule.dtstart = start.date || start.dateTime
  return rruleToString(rrule)
}

/**
 * Rimuove il campo dtstart dalla stringa RRule
 * 
 * @param {String} rruleStr regola RRule in formato stringa
 * @returns stringa RRule senza il campo dtstart
 */
function removeDtstartFromRrule(rruleStr) {
  // il campo dtstart è salvato nella prima riga della stringa
  return rruleStr.split('\n')[1]
}

/**
 * Trova la prima occorrenza dell'evento dopo la data fornita
 * 
 * @param {Event} event evento ricorrente
 * @param {Date} instant momento da cui partire a cercare l'occorrenza
 * @returns prima occorrenza dell'evento
 */
function getFirstOccurrence(event, instant) {
  const r = RRule.fromString(event.rrule)
  return r.after(instant)
}

module.exports = {
  rruleToString,
  stringToRrule,
  addDtstartToRrule,
  removeDtstartFromRrule,
  getFirstOccurrence
}
