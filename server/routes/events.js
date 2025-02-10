/**
 * Routes for Event-related operations
 */

const express = require('express')

const auth = require('../middleware/auth')
const { stringToRrule, rruleToString } = require('../services/RRule')
const { listEvents } = require('../google/Services')

const Event = require('../models/Event')

const router = express.Router()

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
    return res.status(500).send('Error while creating the event')
  }
})

// ottenere tutti gli eventi
router.get('/', auth, async (req, res) => {
  try {
    const allEvents = await Event.find({ owner: req.user.username })
    const googleEvents = req.user.google ? await listEvents(req.user.username) : []
    // se non ne trova nessuno invia un oggetto vuoto
    return res.json(allEvents.concat(googleEvents))
  } catch (err) {
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
    return res.status(500).send('Error while getting specific event')
  }
})

// modificare un evento specifico
// body.start e body.end sono datetime in ISO string (UTC)
// body.rrule = null per eventi non ricorrenti
// body.rrule = oggetto rrule (FullCalendar) per eventi ricorrenti
router.put('/:id', auth, async (req, res) => {
  try {
    const upd = await Event.findById(req.params.id)
    if (!upd) return res.status(404).send(`No event found with id ${req.params.id}`)
    // modifiche
    const { title, description, start, end, isAllDay, rrule, place } = req.body
    upd.title = title || upd.title
    upd.description = description || upd.description
    upd.start = start ? new Date(start) : upd.start
    upd.end = end ? new Date(end) : upd.end
    upd.isAllDay = isAllDay !== undefined ? isAllDay : upd.isAllDay
    upd.rrule = rrule ? await rruleToString(rrule) : null
    upd.place = place !== undefined ? place : upd.place
    await upd.save()
    return res.send('ok')
  } catch (err) {
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
    res.status(500).send('Error while deleting event')
  }
})

module.exports = router
