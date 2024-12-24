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
  const freq = rrule.options.freq == RRule.DAILY ? 'daily' :
               rrule.options.freq == RRule.WEEKLY ? 'weekly' :
               rrule.options.freq == RRule.MONTHLY ? 'monthly' : 'yearly'
  return {
    freq: freq,
    interval: rrule.options.interval,
    dtstart: rrule.options.dtstart,
    until: rrule.options.until || undefined,
    count: rrule.options.count || undefined
  }
}

module.exports = { rruleToString, stringToRrule }
