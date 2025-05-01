/**
 * Routes for Tomato related operations
 */

const express = require('express')
const { auth } = require('../middleware/auth')
const { getTime } = require('../services/TimeMachine')
const Tomato = require('../models/Tomato')

const router = express.Router()

// creare un nuovo pomodoro
router.post('/', auth, async (req, res) => {
  const { studyMinutes, pauseMinutes, loops } = req.body
  const tomato = new Tomato({
    studyMinutes: studyMinutes,
    pauseMinutes: pauseMinutes,
    loops: loops,
    modification: new Date(getTime(req.user)),
    owner: req.user.username
  })
  
  try {
    await tomato.save()
    return res.json(tomato)
  } catch (err) {
    return res.status(500).send('Error while creating tomato')
  }
})

// ottenere il pomodoro modificato per ultimo
router.get('/last', auth, async (req, res) => {
  try {
    const tomato = await Tomato.find({
      owner: req.user.username
    }).sort({ modification: 'desc' }).limit(1)
    return res.json(tomato[0])
  } catch (err) {
    return res.status(500).send('Error while getting last tomato')
  }
})

// ottenere un pomodoro specifico
router.get('/:id', auth, async (req, res) => {
  try {
    const tomato = await Tomato.findById(req.params.id)
    if (!tomato) {
      return res.status(404).send(`No tomato found with id ${req.params.id}`)
    }
    return res.json(tomato)
  } catch (err) {
    return res.status(500).send('Error while getting specific tomato')
  }
})

// modificare un pomodoro specifico
// interrupted := 'n' (not interrupted), 's' (interrupted during study time),
// 'p' (interrupted during pause time), 'f' (finished)
router.put('/:id', auth, async (req, res) => {
  try {
    const tomato = await Tomato.findById(req.params.id)
    if (!tomato) {
      return res.status(404).send(`No tomato found with id ${req.params.id}`)
    }
    // modifiche
    const { interrupted, remainingSeconds, remainingLoops } = req.body
    tomato.interrupted = interrupted || tomato.interrupted
    tomato.remainingSeconds = remainingSeconds ?? tomato.remainingSeconds
    tomato.remainingLoops = remainingLoops ?? tomato.remainingLoops
    tomato.modification = new Date(getTime(req.user))
    await tomato.save()
    return res.json(tomato)
  } catch (err) {
    return res.status(500).send('Error while updating tomato')
  }  
})

// eliminare un pomodoro specifico
router.delete('/:id', auth, async (req, res) => {
  try {
    const deletion = await findByIdAndDelete(req.params.id)
    if (!deletion) {
      return res.status(404).send(`No tomato found with id ${req.params.id}`)
    }
    return res.send('ok')
  } catch (err) {
    return res.status(500).send('Error while deleting tomato')
  }
})

module.exports = router
