/**
 * Routes for Note related operations
 */

const express = require('express')
const { auth } = require('../middleware/auth')
const { getTime } = require('../services/TimeMachine')
const Note = require('../models/Note')

const router = express.Router()

// creare una nuova nota
// categories := stringa di categorie separate da virgole
router.post('/', auth, async (req, res) => {
  const { title, text, categories } = req.body
  const note = new Note({
    title: title,
    text: text,   
    creation: new Date(getTime(req.user)),
    modification: new Date(getTime(req.user)),
    categories: categories,
    owner: req.user.username    
  })

  try {
    await note.save()
    return res.json(note)
  } catch (err) {
    return res.status(500).send('Error while creating note')
  }
})

// ottenere tutte le note
router.get('/', auth, async (req, res) => {
  try {
    const notes = await Note.find({ owner: req.user.username })
    return res.json(notes)
  } catch (err) {
    return res.status(500).send('Error while getting all notes')
  }
})

// ottenere l'ultima nota modificata
router.get('/last', auth, async (req, res) => {
  try {
    const note = await Note.find({
      owner: req.user.username
    }).sort({ modification: 'desc' }).limit(1)
    return res.json(note[0])
  } catch (err) {
    return res.status(500).send('Error while getting last modified note')
  }
})

// modificare una nota specifica
// categories := stringa di categorie separate da virgole
router.put('/:id', auth, async (req, res) => {
  try {
    const note = await Note.findById(req.params.id)
    if (!note) {
      return res.status(404).send(`No note found with id ${req.params.id}`)
    }
    // modifiche
    const { title, text, categories } = req.body
    note.title = title || note.title
    note.text = text || note.text
    note.modification = new Date(getTime(req.user))
    note.categories = categories ?? note.categories
    await note.save()
    return res.json(note)
  } catch (err) {
    return res.status(500).send('Error while updating note')
  }
})

// eliminare una nota specifica
router.delete('/:id', auth, async (req, res) => {
  try {
    const deletion = await Note.findByIdAndDelete(req.params.id)
    if (!deletion) {
      return res.status(404).send(`No note found with id ${req.params.id}`)
    }
    return res.send('ok')
  } catch (err) {
    return res.status(500).send('Error while deleting note')
  }
})

module.exports = router
