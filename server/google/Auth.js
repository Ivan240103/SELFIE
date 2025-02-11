/**
 * Autenticazione OAuth per Google
 * Codice preso dall'esempio di Google dev
 */

const fs = require('fs').promises
const path = require('path')
const process = require('process')
const { authenticate } = require('@google-cloud/local-auth')
const { google } = require('googleapis')
const User = require('../models/User')

// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/calendar.readonly']
const CREDENTIALS_PATH = path.join(process.cwd(), 'google', 'credentials.json')

function loadSavedCredentialsIfExist(user) {
  try {
    const credentials = JSON.parse(user.google)
    return google.auth.fromJSON(credentials)
  } catch (err) {
    return null
  }
}

async function saveCredentials(client, user) {
  const content = await fs.readFile(CREDENTIALS_PATH)
  const keys = JSON.parse(content)
  const key = keys.installed || keys.web
  const payload = JSON.stringify({
    type: 'authorized_user',
    client_id: key.client_id,
    client_secret: key.client_secret,
    refresh_token: client.credentials.refresh_token,
  })
  user.google = payload
  await user.save()
}

async function authorize(username) {
  const user = await User.findOne({ username: username })
  if (!user) return null
  let client = loadSavedCredentialsIfExist(user)
  if (client) {
    return client
  }
  client = await authenticate({
    scopes: SCOPES,
    keyfilePath: CREDENTIALS_PATH,
  })
  if (client.credentials) {
    await saveCredentials(client, user)
  }
  return client
}

module.exports = { authorize }
