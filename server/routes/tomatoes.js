/**
 * Routes for Tomato-related operations
 */

const express = require('express')

const auth = require('../middleware/auth')
const { getTime } = require('../services/TimeMachine')

const Tomato = require('../models/Tomato')

const router = express.Router()

// salvare nuovo pomodoro
router.post('/', auth, async (req, res) => {
  const newTomato = new Tomato({
    studyMinutes: req.body.studyMinutes,
    pauseMinutes: req.body.pauseMinutes,
    loops: req.body.loops,
    modification: new Date(await getTime(req.user.username)),
    owner: req.user.username
  })
  
  try {
    await newTomato.save()
    return res.send('ok')
  } catch (err) {
    return res.status(500).send('Error while saving new tomato')
  }
})

// prendere i dati dell'ultimo pomodoro dell'utente
router.get('/last', auth, async (req, res) => {
  try {
    const timer = await Tomato.find({
      owner: req.user.username
    }).sort({ modification: 'desc' }).limit(1);
    // se non ne trova nessuno invia un oggetto vuoto
    return res.json(timer)
  } catch (err) {
    return res.status(500).send('Error while getting last tomato')
  }
})

// prendere i dati di un pomodoro specifico
router.get('/:id', auth, async (req, res) => {
  try {
    const timer = await Tomato.findById(req.params.id)
    if (!timer) return res.status(404).send(`No tomato found with id ${req.params.id}`)
    return res.json(timer)
  } catch (err) {
    return res.status(500).send('Error while getting specific tomato')
  }
})

// modificare un pomodoro specifico
router.put('/:id', auth, async (req, res) => {
  try {
    const upd = await Tomato.findById(req.params.id)
    if (!upd) return res.status(404).send(`No tomato found with id ${req.params.id}`)
    // modifiche
    upd.interrupted = req.body.interrupted || upd.interrupted
    upd.remainingMinutes = req.body.remainingMinutes || upd.remainingMinutes
    upd.remainingLoops = req.body.remainingLoops || upd.remainingLoops
    upd.modification = new Date(await getTime(req.user.username))
    await upd.save()
    return res.send('ok')
  } catch (err) {
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
    return res.status(500).send('Error while deleting tomato')
  }
})

module.exports = router
