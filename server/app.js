/**
 * Start this server with `npx nodemon app.js` inside server/
 */

const express = require('express')
const app = express()
const path = require('path')
const cors = require('cors')
const mongoose = require('mongoose')

// per accedere i campi JSON
app.use(express.json())
// per accedere i campi nel body del POST
app.use(express.urlencoded({ extended: true }))
// per accettare le richieste da domini esterni
app.use(cors())

// routes
const userRoutes = require('./routes/users')
app.use('/users', userRoutes)
const eventRoutes = require('./routes/events')
app.use('/events', eventRoutes)

// connessione al db
const mongoURL = 'mongodb+srv://ivan:eP3C9N8S9nRkK6TS@selfie.qv0gx.mongodb.net/?retryWrites=true&w=majority&appName=SELFIE'
mongoose.connect(mongoURL)

// DEBUG: test docker sulle macchine di laboratorio
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'html', 'create.html'))
})

app.listen(8000, () => {
  console.log('Server online on port 8000')
})