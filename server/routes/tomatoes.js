/**
 * Routes for Tomato-related operations
 */

const express = require('express')
const auth = require('../middleware/auth')
const Tomato = require('../models/tomato')

const router = express.Router()

// salvare nuovo pomodoro
router.post('/', auth, async (req, res) => {
  const newTomato = new Tomato({
    studyMinutes: req.body.studyMinutes,
    pauseMinutes: req.body.pauseMinutes,
    loops: req.body.loops,
    owner: req.user.username
  })

  try {
    await newTomato.save()
    return res.send('ok')
  } catch (err) {
    console.error(err)
    return res.status(500).send('Error while saving new tomato')
  }
})

// prendere i dati del pomodoro dell'utente
router.get('/', auth, async (req, res) => {
  try {
    const timer = await Tomato.findOne({ username: req.user.username })
    if (!timer) return res.status(404).send(`No tomato found for username ${req.user.username}`)
    return res.json(timer)
  } catch (err) {
    console.error(err)
    return res.status(500).send('Error while getting tomato')
  }
})

// modificare un pomodoro specifico
router.put('/:id', auth, async (req, res) => {
  try {
    const toUpdate = await Tomato.findById(req.params.id)
    if (!toUpdate) return res.status(404).send(`No tomato found with id ${req.params.id}`)
    // modifiche
    toUpdate.interrupted = req.body.interrupted || toUpdate.interrupted
    toUpdate.remainingMinutes = req.body.remainingMinutes || toUpdate.remainingMinutes
    toUpdate.remainingLoops = req.body.remainingLoops || toUpdate.remainingLoops
    await toUpdate.save()
    return res.send('ok')
  } catch (err) {
    console.error(err)
    return res.status(500).send('Error while updating tomato')
  }  
})

// eliminare un pomodoro specifico (finito o eliminato)
router.delete('/:id', auth, async (req, res) => {
  try {
    const deletion = await findByIdAndDelete(req.params.id)
    if (!deletion) return res.status(404).send(`No tomato found with id ${req.params.id}`)
    return res.send('ok')
  } catch (err) {
    console.error(err)
    return res.status(500).send('Error while deleting tomato')
  }
})

module.exports = router
