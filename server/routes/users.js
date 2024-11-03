// Route for user-related operations
const express = require('express');
const router = express.Router();

router.post('/login', (req, res) => {
  res.send(`<h1>Attendi, ${req.body.usr}</h1><p>Stiamo verificando le credenziali...</p>`)
})

module.exports = router;