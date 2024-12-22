/**
 * Routes for Event-related operations
 */

const express = require('express')
const auth = require('../middleware/auth')
const Event = require('../models/Event')

const router = express.Router()

// TODO: SISTEMARE LA GESTIONE DEGLI EVENTI RIPETIBILI === chatGPT Rrule npm !!!

// TODO: sistemare le modifiche al model Event

// TODO: controllare uso delle date quando si ritorna il json al client

// creazione nuovo evento
// body.start e body.end sono datetime in ISO string (UTC)
/* 
body.recurrence = null per eventi non ripetibili
body.recurrence = {
  ... TODO: 
} per eventi ripetibili
*/
router.post('/', auth, async (req, res) => {
  // TODO: analizzare recurrence per creare la stringa RRULE (funzione a parte?)
  const { title, description, start, end, isAllDay, place } = req.body
  const newEvent = new Event({
    title: title,
    description: description,
    start: new Date(start),
    end: new Date(end),
    isAllDay: isAllDay,
    // recurrence: TODO: eventi ricorrenti ?!?!?!
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

// ottenere eventi in un intervallo di tempo dato
// request template: .../interval?s={startDatetime}&e={endDatetime}
// dove i datetime sono espressi in ISO string (UTC)
router.get('/interval', auth, async (req, res) => {
  try {
    const intervalEvents = await Event.find({
      start: { $gte: new Date(req.query.s) },
      end: { $lte: new Date(req.query.e) },
      owner: req.user.username
    })
    // se non ne trova nessuno invia un oggetto vuoto
    return res.json(intervalEvents)
  } catch (err) {
    console.error(err)
    return res.status(500).send('Error while getting events in a time interval')
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
/* 
body.recurrence = null per eventi non ripetibili
body.recurrence = {
  ... TODO: 
} per eventi ripetibili
*/
router.put('/:id', auth, async (req, res) => {
  try {
    const toUpdate = await Event.findById(req.params.id)
    if (!toUpdate) return res.status(404).send(`No event found with id ${req.params.id}`)
    // modifiche
    // TODO: analizzare recurrence per creare la stringa RRULE (funzione a parte?)
    const { title, description, start, end, isAllDay, place } = req.body
    toUpdate.title = title || toUpdate.title
    toUpdate.description = description || toUpdate.description
    toUpdate.start = start ? new Date(start) : toUpdate.start
    toUpdate.end = end ? new Date(end) : toUpdate.end
    toUpdate.isAllDay = isAllDay !== undefined ? isAllDay : toUpdate.isAllDay
    // toUpdate.recurrence = TODO: eventi ricorrenti
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
