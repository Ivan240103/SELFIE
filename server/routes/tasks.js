/**
 * Routes for Task-related operations
 */

const express = require('express')

const auth = require('../middleware/auth')

const Task = require('../models/Task')

const router = express.Router()

// creazione nuovo task
// body.deadline è un datetime in ISO string (UTC)
// reminders = lista di method:minutes concatenata da ,
router.post('/', auth, async (req, res) => {
  const newTask = new Task({
    title: req.body.title,
    description: req.body.description,
    deadline: new Date(req.body.deadline),
    owner: req.user.username,
    reminders: req.body.reminders
  })

  try {
    await newTask.save()
    return res.send('ok')
  } catch(err) {
    return res.status(500).send('Error while creating task')
  }
})

// ottenere tutti i task
router.get('/', auth, async (req, res) => {
  try {
    const allTasks = await Task.find({ owner: req.user.username })
    // se non ne trova nessuno invia un oggetto vuoto
    return res.json(allTasks)
  } catch (err) {
    return res.status(500).send('Error while getting all tasks')
  }
})

// ottenere i 3 task non completati ordinati per scadenza
router.get('/notdone', auth, async (req, res) => {
  try {
    const notdoneTask = await Task.find({
      isDone: { $eq: false },
      owner: req.user.username
    }).sort({ deadline: 'asc' }).limit(3)
    // se non ne trova nessuno invia un oggetto vuoto
    return res.json(notdoneTask)
  } catch (err) {
    return res.status(500).send('Error while getting tasks not done')
  }
})

// ottenere un task specifico
router.get('/:id', auth, async (req, res) => {
  try {
    const singleTask = await Task.findById(req.params.id)
    if (!singleTask) return res.status(404).send(`No task found with id ${req.params.id}`)
    return res.json(singleTask)
  } catch (err) {
    return res.status(500).send('Error while getting specific task')
  }
})

// modificare un task specifico
// body.deadline è un datetime in ISO string (UTC)
// reminders = lista di method:minutes concatenata da ,
router.put('/:id', auth, async (req, res) => {
  try {
    const upd = await Task.findById(req.params.id)
    if (!upd) return res.status(404).send(`No task found with id ${req.params.id}`)
    // modifiche
    const { title, description, deadline } = req.body
    upd.title = title || upd.title
    upd.description = description || upd.description
    upd.deadline = deadline ? new Date(deadline) : upd.deadline
    upd.reminders = reminders ?? upd.reminders
    await upd.save()
    return res.send('ok')
  } catch (err) {
    return res.status(500).send('Error while updating task')
  }
})

// segnare un task come completato o non
router.put('/toggle/:id', auth, async (req, res) => {
  try {
    const toggle = await Task.findByIdAndUpdate(req.params.id, { 
      $set: { isDone: !req.body.isDone } 
    })
    if (!toggle) return res.status(404).send(`No task found with id ${req.params.id}`)
    return res.send('ok')
  } catch (err) {
    return res.status(500).send('Error while toggling task')
  }
})

// eliminare un task specifico
router.delete('/:id', auth, async (req, res) => {
  try {
    const deletion = await Task.findByIdAndDelete(req.params.id)
    if (!deletion) return res.status(404).send(`No task found with id ${req.params.id}`)
    return res.send('ok')
  } catch (err) {
    return res.status(500).send('Error while deleting task')
  }
})

module.exports = router
