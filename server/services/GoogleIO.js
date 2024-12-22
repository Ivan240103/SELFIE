/**
 * Servizio intermedio per fare import-export di eventi
 * e task da e verso Google Calendar
 */
const Event = require('../models/Event')

// TODO: implementare eventFromGoogleToSelfie
const eventFromGoogleToSelfie = (gEvent) => {
  return new Event({
    title: gEvent.summary || 'Titolo mancante',
    description: gEvent.description || 'Descrizione mancante',
    
  })
}

// TODO: implementare eventFromSelfieToGoogle
const eventFromSelfieToGoogle = (sEvent) => {
  return {
    'summary': sEvent.title,
    'description': sEvent.description
  }
}

const taskFromGoogleToSelfie = (gTask) => {
  // TODO: implementare taskFromGoogleToSelfie
}

const taskFromSelfieToGoogle = (sTask) => {
  // TODO: implementare taskFromSelfieToGoogle
}
