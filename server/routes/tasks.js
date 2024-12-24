/**
 * Routes for Task-related operations
 */

const express = require('express')
const auth = require('../middleware/auth')
const Task = require('../models/Task')

const router = express.Router()

// creazione nuovo task
// body.deadline è un datetime in ISO string (UTC)
router.post('/', auth, async (req, res) => {
  const newTask = new Task({
    title: req.body.title,
    description: req.body.description,
    deadline: new Date(req.body.deadline),
    owner: req.user.username
  })

  try {
    await newTask.save()
    return res.send('ok')
  } catch(err) {
    console.error(err)
    return res.status(500).send('Error while creating the task')
  }
})

// ottenere tutti i task
router.get('/', auth, async (req, res) => {
  try {
    const allTasks = await Task.find({ owner: req.user.username })
    // se non ne trova nessuno invia un oggetto vuoto
    return res.json(allTasks)
  } catch (err) {
    console.error(err)
    return res.status(500).send('Error while getting all tasks')
  }
})

// ottenere tutti i task non completati
router.get('/notdone', auth, async (req, res) => {
  try {
    const notdoneTask = await Task.find({
      isDone: { $eq: false },
      owner: req.user.username
    })
    // se non ne trova nessuno invia un oggetto vuoto
    return res.json(notdoneTask)
  } catch (err) {
    console.error(err)
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
    console.error(err)
    return res.status(500).send('Error while getting specific task')
  }
})

// modificare un task specifico
// body.deadline è un datetime in ISO string (UTC)
router.put('/:id', auth, async (req, res) => {
  try {
    const toUpdate = await Task.findById(req.params.id)
    if (!toUpdate) return res.status(404).send(`No task found with id ${req.params.id}`)
    // modifiche
    const { title, description, deadline } = req.body
    toUpdate.title = title || toUpdate.title
    toUpdate.description = description || toUpdate.description
    toUpdate.deadline = deadline ? new Date(deadline) : toUpdate.deadline
    await toUpdate.save()
    return res.send('ok')
  } catch (err) {
    console.error(err)
    return res.status(500).send('Error while updating task')
  }
})

// segnare un task come completato o non
router.put('/toggle/:id', auth, async (req, res) => {
  try {
    const toggle = await Task.findByIdAndUpdate(req.params.id, { isDone: !isDone })
    if (!toggle) return res.status(404).send(`No task found with id ${req.params.id}`)
    return res.send('ok')
  } catch (err) {
    console.error(err)
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
    console.error(err)
    return res.status(500).send('Error while deleting task')
  }
})

module.exports = router
