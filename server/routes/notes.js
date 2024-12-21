/**
 * Routes for Note-related operations
 */

const express = require('express')
const auth = require('../middleware/auth')
const Note = require('../models/Note')
const tm = require('../services/TimeMachine')

const router = express.Router()

// creare una nuova nota
router.post('/', auth, async (req, res) => {
  const newNote = new Note({
    title: req.body.title,
    text: req.body.text,    
    creation: new Date(await tm.getTime(req.user.username)),
    modification: new Date(await tm.getTime(req.user.username)),
    categories: req.body.categories.trim(),
    textLength: req.body.text.length,
    owner: req.user.username    
  })

  try {
    await newNote.save()
    return res.send('ok')
  } catch (err) {
    console.error(err)
    return res.status(500).send('Error while creating note')
  }
})

// ottenere tutte le note
router.get('/', auth, async (req, res) => {
  try {
    const allNotes = await Note.find({ owner: req.user.username })
    // se non ne trova nessuna invia un oggetto vuoto
    return res.json(allNotes)
  } catch (err) {
    console.error(err)
    return res.status(500).send('Error while getting all notes')
  }
})

// ottenere ultima nota modificata
router.get('/last', auth, async (req, res) => {
  try {
    const lastNote = await Note.find({ owner: res.user.username }).sort({ modification: 'desc' }).limit(1)
    // se non ne trova nessuna invia un oggetto vuoto
    return res.json(lastNote)
  } catch (err) {
    console.error(err)
    return res.status(500).send('Error while getting last modified note')
  }
})

// ottenere una nota specifica
router.get('/:id', auth, async (req, res) => {
  try {
    const note = await Note.findById(req.params.id)
    if (!note) return res.status(404).send(`No note found with id ${req.params.id}`)
    return res.json(note)
  } catch (err) {
    console.error(err)
    return res.status(500).send('Error while getting specific note')
  }
})

// modificare una nota
router.put('/:id', auth, async (req, res) => {
  try {
    const toUpdate = await Note.findById(req.params.id)
    if (!toUpdate) return res.status(404).send(`No note found with id ${req.params.id}`)
    // modifiche
    toUpdate.title = req.body.title || toUpdate.title
    toUpdate.text = req.body.text || toUpdate.text
    toUpdate.modification = new Date(await tm.getTime(req.user.username))
    toUpdate.textLength = req.body.text.length || toUpdate.textLength
    if (req.body.categories !== undefined) {
      if (req.body.categories === '') {
        toUpdate.categories = ''
      } else {
        toUpdate.categories = req.body.categories
      }
    }
    await toUpdate.save()
    return res.send('ok')
  } catch (err) {
    console.error(err)
    return res.status(500).send('Error while updating note')
  }
})

// eliminare una nota
router.delete('/:id', auth, async (req, res) => {
  try {
    const deletion = await Note.findByIdAndDelete(req.params.id)
    if (!deletion) return res.status(404).send(`No note found with id ${req.params.id}`)
    return res.send('ok')
  } catch (err) {
    console.error(err)
    return res.status(500).send('Error while deleting note')
  }
})

module.exports = router
