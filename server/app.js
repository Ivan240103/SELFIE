const express = require('express')
const app = express()
const path = require('path')

// per accedere i campi JSON
app.use(express.json())
// per accedere i campi nel body del POST
app.use(express.urlencoded({ extended: true }))

// routes
const userRoutes = require('./routes/users')
app.use('/users', userRoutes)

const mongoUsr = 'ivan'
const mongoPsw = 'eP3C9N8S9nRkK6TS'
const mongoURL = `mongodb+srv://${mongoUsr}:${mongoPsw}@selfie.qv0gx.mongodb.net/?retryWrites=true&w=majority&appName=SELFIE`

// DEBUG: test docker sulle macchine di laboratorio
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'html', 'create.html'))
})

app.listen(8000, () => {
  console.log('Server online on port 8000')
})