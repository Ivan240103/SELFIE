/**
 * Routes for Event related operations
 */

const express = require('express')
const { auth } = require('../middleware/auth')
const { stringToRrule, rruleToString } = require('../services/RRule')
const { listEvents, getEvent } = require('../google/Services')
const Event = require('../models/Event')

const router = express.Router()

// creare un nuovo evento
// start, end := datetime in ISO string (UTC)
// rrule := oggetto rrule (FullCalendar) per eventi ricorrenti, null altrimenti
// reminders := lista di method:minutes concatenata da ,
router.post('/', auth, async (req, res) => {
  const { title, description, start, end, isAllDay, rrule, place, mapsLocated, reminders } = req.body
  const event = new Event({
    title: title,
    description: description,
    start: new Date(start),
    end: new Date(end),
    isAllDay: isAllDay,
    rrule: rrule ? rruleToString(rrule) : null,
    place: place,
    mapsLocated: mapsLocated,
    reminders: reminders,
    owner: req.user.username
  })

  try {
    await event.save()
    return res.json(event)
  } catch(err) {
    return res.status(500).send('Error while creating the event')
  }
})

// ottenere tutti gli eventi
router.get('/', auth, async (req, res) => {
  try {
    const events = await Event.find({ owner: req.user.username })
    const googleEvents = req.user.google ? await listEvents(req.user.username) : []
    return res.json(events.concat(googleEvents))
  } catch (err) {
    return res.status(500).send('Error while getting all events')
  }
})

// ottenere un evento specifico
router.get('/:id', auth, async (req, res) => {
  let event
  // cerca prima se è su google
  try {
    event = req.user.google ? await getEvent(req.params.id, req.user.username) : undefined
  } catch (error) {
    event = undefined
  }
  try {
    if (!event) {
      event = await Event.findById(req.params.id)
    }
    if (!event) {
      return res.status(404).send(`No event found with id ${req.params.id}`)
    }
    // per visualizzare un singolo evento serve la rrule in formato json
    const obj = event.toObject()
    obj.rrule = obj.rrule ? stringToRrule(obj.rrule) : null
    return res.json(obj)
  } catch (err) {
    return res.status(500).send('Error while getting specific event')
  }
})

// modificare un evento specifico
// start, end := datetime in ISO string (UTC)
// rrule := oggetto rrule (FullCalendar) per eventi ricorrenti, null altrimenti
// reminders := lista di method:minutes concatenata da ,
router.put('/:id', auth, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
    if (!event) {
      return res.status(404).send(`No event found with id ${req.params.id}`)
    }
    // modifiche
    const { title, description, start, end, isAllDay, rrule, place, mapsLocated, reminders } = req.body
    event.title = title || event.title
    event.description = description || event.description
    event.start = start ? new Date(start) : event.start
    event.end = end ? new Date(end) : event.end
    event.isAllDay = isAllDay ?? event.isAllDay
    event.rrule = rrule ? rruleToString(rrule) : null
    event.place = place ?? event.place
    event.mapsLocated = mapsLocated ?? event.mapsLocated
    event.reminders = reminders ?? event.reminders
    await event.save()
    return res.json(event)
  } catch (err) {
    return res.status(500).send('Error while updating event')
  }
})

// eliminare un evento specifico
router.delete('/:id', auth, async (req, res) => {
  try {
    const deletion = await Event.findByIdAndDelete(req.params.id)
    if (!deletion) {
      return res.status(404).send(`No event found with id ${req.params.id}`)
    }
    return res.send('ok')
  } catch (err) {
    res.status(500).send('Error while deleting event')
  }
})

module.exports = router
