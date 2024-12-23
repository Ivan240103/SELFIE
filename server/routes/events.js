/**
 * Routes for Event-related operations
 */

const express = require('express')
const auth = require('../middleware/auth')
const { RRule } = require('rrule')
const { getTime } = require('../services/TimeMachine')
const Event = require('../models/Event')

const router = express.Router()

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

// creazione nuovo evento
// body.start e body.end sono datetime in ISO string (UTC)
// body.rrule = null per eventi non ricorrenti
// body.rrule = oggetto rrule (FullCalendar) per eventi ricorrenti
router.post('/', auth, async (req, res) => {
  const { title, description, start, end, isAllDay, rrule, place } = req.body
  const newEvent = new Event({
    title: title,
    description: description,
    start: new Date(start),
    end: new Date(end),
    isAllDay: isAllDay,
    rrule: rrule ? await rruleToString(rrule) : null,
    place: place,
    owner: req.user.username
  })

  try {
    await newEvent.save()
    return res.send('ok')
  } catch(err) {
    console.error(err)
    return res.status(500).send('Error while creating the event')
  }
})

// ottenere tutti gli eventi
router.get('/', auth, async (req, res) => {
  try {
    const allEvents = await Event.find({ owner: req.user.username })
    // se non ne trova nessuno invia un oggetto vuoto
    return res.json(allEvents)
  } catch (err) {
    console.error(err)
    return res.status(500).send('Error while getting all events')
  }
})

// ottenere un evento specifico
router.get('/:id', auth, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
    if (!event) return res.status(404).send(`No event found with id ${req.params.id}`)
    // per visualizzare un singolo evento serve la ricorrenza in formato json
    const obj = event.toObject()
    obj.rrule = obj.rrule ? stringToRrule(obj.rrule) : null
    return res.json(obj)
  } catch (err) {
    console.error(err)
    return res.status(500).send('Error while getting specific event')
  }
})

// modificare un evento specifico
// body.start e body.end sono datetime in ISO string (UTC)
// body.rrule = null per eventi non ricorrenti
// body.rrule = oggetto rrule (FullCalendar) per eventi ricorrenti
router.put('/:id', auth, async (req, res) => {
  try {
    const toUpdate = await Event.findById(req.params.id)
    if (!toUpdate) return res.status(404).send(`No event found with id ${req.params.id}`)
    // modifiche
    const { title, description, start, end, isAllDay, rrule, place } = req.body
    toUpdate.title = title || toUpdate.title
    toUpdate.description = description || toUpdate.description
    toUpdate.start = start ? new Date(start) : toUpdate.start
    toUpdate.end = end ? new Date(end) : toUpdate.end
    toUpdate.isAllDay = isAllDay !== undefined ? isAllDay : toUpdate.isAllDay
    toUpdate.rrule = rrule ? await rruleToString(rrule) : null
    toUpdate.place = place !== undefined ? place : toUpdate.place
    await toUpdate.save()
    return res.send('ok')
  } catch (err) {
    console.error(err)
    return res.status(500).send('Error while updating event')
  }
})

// eliminare un evento specifico
router.delete('/:id', auth, async (req, res) => {
  try {
    const deletion = await Event.findByIdAndDelete(req.params.id)
    if (!deletion) return res.status(404).send(`No event found with id ${req.params.id}`)
    return res.send('ok')
  } catch (err) {
    console.error(err)
    res.status(500).send('Error while deleting event')
  }
})

module.exports = router
