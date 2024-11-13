// Route for event-related operations
const express = require('express');
const router = express.Router();
const Event = require('../models/event')

// creazione nuovo evento
router.post('/create', async (req, res) => {
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

// prendi tutti gli eventi
router.get('/', async (req, res) => {
  try {
    const allEvents = await Event.find({})
    res.json(allEvents)
  } catch (error) {
    console.error(error)
    res.status(500).send('Error while getting all events')
  }
})

module.exports = router;