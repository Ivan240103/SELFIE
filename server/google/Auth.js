/**
 * OAuth authentication for Google (web application)
 */

const fs = require('fs').promises
const path = require('path')
const process = require('process')
const { google } = require('googleapis')

// se si modificano questi scope, eliminare i token
const SCOPES = ['https://www.googleapis.com/auth/calendar.readonly']
const CREDENTIALS_PATH = path.join(process.cwd(), 'google', 'credentials-web.json')

// salva le credenziali dell'utente
async function saveCredentials(user, code) {
  const content = await fs.readFile(CREDENTIALS_PATH)
  const { client_id, client_secret, redirect_uris } = JSON.parse(content).web

  const oAuth2Client = new google.auth.OAuth2(
    client_id,
    client_secret,
    redirect_uris[0]
  )
  const { tokens } = await oAuth2Client.getToken(code)
  oAuth2Client.setCredentials(tokens)

  const payload = JSON.stringify({
    type: 'authorized_user',
    client_id,
    client_secret,
    refresh_token: tokens.refresh_token
  })
  user.google = payload
  await user.save()

  return oAuth2Client
}

// genera l'URL per il login se l'utente non ha credenziali salvate
async function getAuthUrl() {
  const content = await fs.readFile(CREDENTIALS_PATH)
  const { client_id, client_secret, redirect_uris } = JSON.parse(content).web
  const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0])
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
    prompt: 'consent'
  })
  return authUrl
}

// autorizza l'utente usando credenziali già salvate
function authorize(user) {
  try {
    const credentials = JSON.parse(user.google)
    return google.auth.fromJSON(credentials)
  } catch (err) {
    return null
  }
}

module.exports = {
  authorize,
  getAuthUrl,
  saveCredentials
}
