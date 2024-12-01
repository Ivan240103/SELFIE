// Route for event-related operations
const express = require('express');
const router = express.Router();
const Event = require('../models/event')

// creazione nuovo evento
router.post('/', async (req, res) => {
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
    user: req.body.user
  })

  try {
    await newEvent.save()
    res.send('ok')
  } catch(error) {
    console.error(error)
    res.status(500).send('Error while creating the event')
  }
})

// ottenere tutti gli eventi
router.get('/', async (req, res) => {
  try {
    // TODO: aggiungere filtro user
    const allEvents = await Event.find({})
    // se non ne trova nessuno invia un oggetto vuoto
    res.json(allEvents)
  } catch (error) {
    console.error(error)
    res.status(500).send('Error while getting all events')
  }
})

// ottenere eventi in un intervallo di tempo dato
// request template: .../interval?s={startDatetime}&e={endDatetime}
router.get('/interval', async (req, res) => {
  try {
    const intervalEvents = await Event.find({
      start: { $gte: req.query.s },
      end: { $lte: req.query.e }
      // TODO: aggiungere filtro user
    })
    // se non ne trova nessuno invia un oggetto vuoto
    res.json(intervalEvents)
  } catch (error) {
    console.error(error)
    res.status(500).send('Error while getting events in a time interval')
  }
})

// ottenere un evento specifico
router.get('/:id', async (req, res) => {
  try {
    const singleEvent = await Event.findById(req.params.id, {user:0})
    if (singleEvent) {
      res.json(singleEvent)
    } else {
      res.status(404).send(`No event found with id ${req.params.id}`)
    }
  } catch (error) {
    console.error(error)
    res.status(500).send('Error while getting specific event')
  }
})

// modificare un evento specifico
// la "ripetibilità" non è modificabile, si crea un nuovo evento
router.put('/:id', async (req, res) => {
  try {
    const toUpdate = await Event.findById(req.params.id)
    if (!toUpdate) res.status(404).send(`No event found with id ${req.params.id}`)
    // modifiche
    toUpdate.title = req.body.title
    toUpdate.description = req.body.description
    toUpdate.start = req.body.start
    toUpdate.end = req.body.end
    toUpdate.isAllDay = req.body.isAllDay
    toUpdate.place = req.body.place
    await toUpdate.save()
    res.send('ok')
  } catch (error) {
    console.error(error)
    res.status(500).send('Error while updating event')
  }
})

// eliminare un evento specifico
router.delete('/:id', async (req, res) => {
  try {
    const deletion = await Event.findByIdAndDelete(req.params.id)
    if (!deletion) res.status(404).send(`No event found with id ${req.params.id}`)
    res.send('ok')
  } catch (error) {
    console.error(error)
    res.status(500).send('Error while deleting event')
  }
})

module.exports = router;
