const express = require('express')
const app = express()
const path = require('path')

const mongoUsr = 'ivan'
const mongoPsw = 'eP3C9N8S9nRkK6TS'
const mongoURL = `mongodb+srv://${mongoUsr}:${mongoPsw}@selfie.qv0gx.mongodb.net/?retryWrites=true&w=majority&appName=SELFIE`

// DEBUG: test docker sulle macchine di laboratorio
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'html', 'create.html'))
})

// verifica delle credenziali
app.post('/login', (req, res) => {
  res.send("<h1>Attendi prego</h1><p>Stiamo verificando le credenziali...</p>")
})

app.listen(8000, () => {
  console.log('Server online on port 8000')
})