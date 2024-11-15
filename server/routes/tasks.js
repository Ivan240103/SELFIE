// Route for task-related operations
const express = require('express');
const router = express.Router();
const Task = require('../models/task')

// creazione nuovo task
router.post('/', async (req, res) => {
  const newTask = new Task({
    title: req.body.title,
    description: req.body.description,
    deadline: req.body.deadline,
    isDone: req.body.isDone,
    user: req.body.user
  })

  try {
    await newTask.save()
    res.status(200).send('ok')
  } catch(error) {
    console.error(error)
    res.status(500).send('Error while creating the task')
  }
})

// ottenere tutti i task
router.get('/', async (req, res) => {
  try {
    // TODO: aggiungere filtro user
    const allTasks = await Task.find({})
    // se non ne trova nessuno invia un oggetto vuoto
    res.status(200).json(allTasks)
  } catch (error) {
    console.error(error)
    res.status(500).send('Error while getting all tasks')
  }
})

// ottenere task in un intervallo di tempo dato
// request template: .../interval?s={startDatetime}&e={endDatetime}
router.get('/interval', async (req, res) => {
  try {
    const intervalTasks = await Task.find({
      deadline: { $gte: req.query.s, $lte: req.query.e }
      // TODO: aggiungere filtro user
    })
    // se non ne trova nessuno invia un oggetto vuoto
    res.status(200).json(intervalTasks)
  } catch (error) {
    console.error(error)
    res.status(500).send('Error while getting tasks in a time interval')
  }
})

// ottenere tutti i task non completati
router.get('/notdone', async (req, res) => {
  try {
    const notdoneTask = await Task.find({
      isDone: { $eq: false }
      // TODO: aggiungere filtro user
    })
    // se non ne trova nessuno invia un oggetto vuoto
    res.status(200).json(notdoneTask)
  } catch (error) {
    console.error(error)
    res.status(500).send('Error while getting tasks not done')
  }
})

// ottenere un task specifico
router.get('/:id', async (req, res) => {
  try {
    const singleTask = await Task.findById(req.params.id, {user:0})
    if (singleTask) {
      res.status(200).json(singleTask)
    } else {
      res.status(404).send(`No task found with id ${req.params.id}`)
    }
  } catch (error) {
    console.error(error)
    res.status(500).send('Error while getting specific task')
  }
})

// modificare un task specifico
router.put('/:id', async (req, res) => {
  try {
    const toUpdate = await Task.findById(req.params.id)
    if (!toUpdate) res.status(404).send(`No task found with id ${req.params.id}`)
    // modifiche
    toUpdate.title = req.body.title
    toUpdate.description = req.body.description
    toUpdate.deadline = req.body.deadline
    await toUpdate.save()
    res.status(200).send('ok')
  } catch (error) {
    console.error(error)
    res.status(500).send('Error while updating task')
  }
})

// segnare un task come completato o non
router.put('/toggle/:id', async (req, res) => {
  try {
    const toggle = await Task.findByIdAndUpdate(req.params.id, { isDone: !isDone })
    if (!toggle) res.status(404).send(`No task found with id ${req.params.id}`)
    res.status(200).send('ok')
  } catch (error) {
    console.error(error)
    res.status(500).send('Error while toggling task')
  }
})

// eliminare un task specifico
router.delete('/:id', async (req, res) => {
  try {
    const deletion = await Task.findByIdAndDelete(req.params.id)
    if (!deletion) res.status(404).send(`No task found with id ${req.params.id}`)
    res.status(200).send('ok')
  } catch (error) {
    console.error(error)
    res.status(500).send('Error while deleting task')
  }
})

module.exports = router;
