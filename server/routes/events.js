/**
 * Routes for Event-related operations
 */

const express = require('express')
const auth = require('../middleware/auth')
const Event = require('../models/event')

const router = express.Router()

// creazione nuovo evento
router.post('/', auth, async (req, res) => {
  const newEvent = new Event({
    title: req.body.title,
    description: req.body.description,
    start: req.body.start,
    end: req.body.end,
    isAllDay: req.body.isAllDay,
    isRepeatable: req.body.isRepeatable,
    frequency: req.body.frequency,
    repetitions: req.body.repetitions,
    place: req.body.place,
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
router.get('/interval', auth, async (req, res) => {
  try {
    const intervalEvents = await Event.find({
      start: { $gte: req.query.s },
      end: { $lte: req.query.e },
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
// la "ripetibilità" non è modificabile, si crea un nuovo evento
router.put('/:id', auth, async (req, res) => {
  try {
    const toUpdate = await Event.findById(req.params.id)
    if (!toUpdate) return res.status(404).send(`No event found with id ${req.params.id}`)
    // modifiche
    toUpdate.title = req.body.title || toUpdate.title
    toUpdate.description = req.body.description || toUpdate.description
    toUpdate.start = req.body.start || toUpdate.start
    toUpdate.end = req.body.end || toUpdate.end
    toUpdate.isAllDay = req.body.isAllDay || toUpdate.isAllDay
    toUpdate.place = req.body.place || toUpdate.place
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
