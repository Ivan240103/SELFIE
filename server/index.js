// Test fatto per avviare docker sulle macchine di laboratorio
const express = require('express')
const app = express()
const path = require('path')

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'html', 'create.html'))
})

app.listen(8000, () => {
  console.log('Server online on port 8000')
})