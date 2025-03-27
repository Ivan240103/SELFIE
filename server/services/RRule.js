/**
 * Servizio per convertire regole di ricorrenza
 */

const { RRule } = require('rrule')

const { getTime } = require('./TimeMachine')

/**
 * Converte un oggetto rrule compatibile con FullCalendar in
 * una stringa rappresentante una RRule
 * 
 * @param {JSON} rrule oggetto rrule compatibile con FullCalendar
 * @returns regola RRule in formato stringa
 */
const rruleToString = async (rrule) => {
  const freq = rrule.freq === 'daily' ? RRule.DAILY :
               rrule.freq === 'weekly' ? RRule.WEEKLY :
               rrule.freq === 'monthly' ? RRule.MONTHLY : RRule.YEARLY
  const r = new RRule({
    freq: freq,
    interval: rrule.interval || 1,
    dtstart: rrule.dtstart ? new Date(rrule.dtstart) : new Date((await getTime())),
    until: rrule.until || undefined,
    count: rrule.count || undefined,
  })
  return r.toString()
}

/**
 * Converte una stringa rappresentante una RRule in un
 * oggetto JSON compatibile con il plugin di FullCalendar
 *  
 * @param {String} str regola RRule in formato stringa
 * @returns oggetto rrule compatibile con FullCalendar
 */
const stringToRrule = (str) => {
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
 * @param {JSON} start inizio dell'evento ricorrente
 * @returns stringa RRule con l'inizio aggiornato
 */
async function addStartToRrule(rruleStr, start) {
  const rrule = stringToRrule(rruleStr)
  rrule.dtstart = start.date || start.dateTime
  return await rruleToString(rrule)
}

/**
 * Rimuove il campo dtstart dalla stringa RRule
 * 
 * @param {String} rruleStr regola RRule in formato stringa
 * @returns stringa RRule con l'inizio aggiornato
 */
async function removeStartFromRrule(rruleStr) {
  return rruleStr.split('\n')[1]
}

module.exports = {
  rruleToString,
  stringToRrule,
  addStartToRrule,
  removeStartFromRrule
}
