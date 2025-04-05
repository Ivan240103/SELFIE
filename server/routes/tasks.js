/**
 * Routes for Task related operations
 */

const express = require('express')
const { auth } = require('../middleware/auth')
const Task = require('../models/Task')

const router = express.Router()

// creare un nuovo task
// deadline := datetime in ISO string (UTC)
// reminders := lista di method:minutes concatenata da ,
router.post('/', auth, async (req, res) => {
  const { title, description, deadline, reminders } = req.body
  const task = new Task({
    title: title,
    description: description,
    deadline: new Date(deadline),
    reminders: reminders,
    owner: req.user.username
  })

  try {
    await task.save()
    return res.json(task)
  } catch(err) {
    return res.status(500).send('Error while creating task')
  }
})

// ottenere tutti i task
router.get('/', auth, async (req, res) => {
  try {
    const tasks = await Task.find({ owner: req.user.username })
    return res.json(tasks)
  } catch (err) {
    return res.status(500).send('Error while getting all tasks')
  }
})

// ottenere 3 task non completati, ordinati per scadenza
router.get('/notdone', auth, async (req, res) => {
  try {
    const tasks = await Task.find({
      isDone: false,
      owner: req.user.username
    }).sort({ deadline: 'asc' }).limit(3)
    return res.json(tasks)
  } catch (err) {
    return res.status(500).send('Error while getting incomplete tasks')
  }
})

// ottenere un task specifico
router.get('/:id', auth, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
    if (!task) {
      return res.status(404).send(`No task found with id ${req.params.id}`)
    }
    return res.json(task)
  } catch (err) {
    return res.status(500).send('Error while getting specific task')
  }
})

// modificare un task specifico
// deadline := datetime in ISO string (UTC)
// reminders := lista di method:minutes concatenata da ,
router.put('/:id', auth, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
    if (!task) {
      return res.status(404).send(`No task found with id ${req.params.id}`)
    }
    // modifiche
    const { title, description, deadline, reminders } = req.body
    task.title = title || task.title
    task.description = description || task.description
    task.deadline = deadline ? new Date(deadline) : task.deadline
    task.reminders = reminders ?? task.reminders
    await task.save()
    return res.json(task)
  } catch (err) {
    return res.status(500).send('Error while updating task')
  }
})

// segnare un task come completato o non
// isDone := true se completato, false altrimenti
router.put('/toggle/:id', auth, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
    if (!task) {
      return res.status(404).send(`No task found with id ${req.params.id}`)
    }
    // modifica
    task.isDone = req.body.isDone ?? task.isDone
    await task.save()
    return res.json(task)
  } catch (err) {
    return res.status(500).send('Error while toggling task')
  }
})

// eliminare un task specifico
router.delete('/:id', auth, async (req, res) => {
  try {
    const deletion = await Task.findByIdAndDelete(req.params.id)
    if (!deletion) {
      return res.status(404).send(`No task found with id ${req.params.id}`)
    }
    return res.send('ok')
  } catch (err) {
    return res.status(500).send('Error while deleting task')
  }
})

module.exports = router
