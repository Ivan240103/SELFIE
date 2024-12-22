/**
 * Routes for Event-related operations
 */

const express = require('express')
const auth = require('../middleware/auth')
const Event = require('../models/Event')

const router = express.Router()

// creazione nuovo evento
// body.start e body.end sono datetime in ISO string (UTC)
// body.recurrence = null per eventi non ricorrenti
// body.recurrence = stringa RRule per eventi ricorrenti
router.post('/', auth, async (req, res) => {
  const { title, description, start, end, isAllDay, recurrence, place } = req.body
  const newEvent = new Event({
    title: title,
    description: description,
    start: new Date(start),
    end: new Date(end),
    isAllDay: isAllDay,
    recurrence: recurrence,
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
    const singleEvent = await Event.findById(req.params.id)
    if (!singleEvent) return res.status(404).send(`No event found with id ${req.params.id}`)
    return res.json(singleEvent)
  } catch (err) {
    console.error(err)
    return res.status(500).send('Error while getting specific event')
  }
})

// modificare un evento specifico
// body.start e body.end sono datetime in ISO string (UTC)
// body.recurrence = null per eventi non ricorrenti
// body.recurrence = stringa RRule per eventi ricorrenti
router.put('/:id', auth, async (req, res) => {
  try {
    const toUpdate = await Event.findById(req.params.id)
    if (!toUpdate) return res.status(404).send(`No event found with id ${req.params.id}`)
    // modifiche
    const { title, description, start, end, isAllDay, recurrence, place } = req.body
    toUpdate.title = title || toUpdate.title
    toUpdate.description = description || toUpdate.description
    toUpdate.start = start ? new Date(start) : toUpdate.start
    toUpdate.end = end ? new Date(end) : toUpdate.end
    toUpdate.isAllDay = isAllDay !== undefined ? isAllDay : toUpdate.isAllDay
    toUpdate.recurrence = recurrence !== undefined ? recurrence : toUpdate.recurrence
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
