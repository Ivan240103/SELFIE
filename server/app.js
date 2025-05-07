/**
 * Server's entry point
 */

const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const path = require('path')
require('dotenv').config()
require('./middleware/auth')
const {
  notificateEvents,
  notificateTasks,
  notificateLateTasks
} = require('./services/Notificate')

const app = express()
const port = 8000

// MIDDLEWARE
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cors())
// mette a disposizione del frontend le immagini del profilo
app.use('/pics', express.static(path.join(__dirname, './images/uploads')))
// applicazione frontend dopo il build
app.use(express.static(path.join(__dirname, "..", "client", "build")))

// ROUTES
const userRoutes = require('./routes/users')
const eventRoutes = require('./routes/events')
const taskRoutes = require('./routes/tasks')
const tomatoRoutes = require('./routes/tomatoes')
const noteRoutes = require('./routes/notes')
const notificationRoutes = require('./routes/notifications')

app.use('/api/users', userRoutes)
app.use('/api/events', eventRoutes)
app.use('/api/tasks', taskRoutes)
app.use('/api/tomatoes', tomatoRoutes)
app.use('/api/notes', noteRoutes)
app.use('/api/notifications', notificationRoutes)

// serve react app as static
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "client", "build", "index.html"))
})

// connessione al db mongo
const mongoURL = process.env.DB_URI
mongoose.connect(mongoURL)

// demoni per le notifiche
setInterval(notificateEvents, 60 * 1000)
setInterval(notificateTasks, 60 * 1000)
setInterval(notificateLateTasks, 3 * 60 * 1000)

app.listen(port)
