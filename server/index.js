const express = require('express')
const app = express()
const path = require('path')

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