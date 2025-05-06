/**
 * Notification service to send both email and push alert
 */

const webpush = require('web-push')
const nodemailer = require('nodemailer')
const Event = require('../models/Event')
const Task = require('../models/Task')
const User = require('../models/User')
const Sub = require('../models/PushSubscription')
const { getTime } = require('./TimeMachine')
const { getFirstOccurrence } = require('./RRule')
const dotenv = require('dotenv')
const path = require('path')

dotenv.config({ path: path.resolve(__dirname, "../.env") })

// testo della notifica per l'evento e
const eventMsg = (e) => {
  return `Il tuo evento "${e.title}" è in programma per il ${getReadableDate(e.start)}.`
}
// testo della notifica per il task t
const taskMsg = (t) => {
  return `Il tuo task "${t.title}" è in scadenza il ${getReadableDate(t.deadline)}.`
}
// titolo e testo della notifica per i task t in ritardo
// current := tempo attuale in millisecondi
const lateTaskMsg = (current, t) => {
  if (current > t.deadline.getTime() + 7 * 24 * 60 * 60 * 1000) {
    return {
      title: `RICORDATI DI ${t.title}`,
      body: `Il tuo task "${t.title}" è scaduto il ${getReadableDate(t.deadline)}, è più di una settimana fa!`
    }
  } else if (current > t.deadline.getTime() + 3 * 24 * 60 * 60 * 1000) {
    return {
      title: `!! ${t.title} !!`,
      body: `Il tuo task "${t.title}" è scaduto il ${getReadableDate(t.deadline)}, è già un po' che lo porti dietro.`
    }
  } else {
    return {
      title: t.title,
      body: `Il tuo task "${t.title}" è scaduto il ${getReadableDate(t.deadline)}.`
    }
  }
}

// configurazione notifiche email
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PSW,
  },
  secure: true,
  requireTLS: true,
  port: 465,
  secured: true
})

/**
 * Invia una notifica via mail
 * 
 * @param {String} email mail del destinatario
 * @param {String} subject oggetto della mail
 * @param {String} msg corpo del messaggio
 */
async function sendMail(email, subject, msg) {
  await transporter.sendMail({
    from: process.env.EMAIL,
    to: email,
    subject: subject,
    text: msg
  })
}

// configurazione notifiche push
webpush.setVapidDetails(
  `mailto:${process.env.EMAIL}`,
  process.env.VAPID_PUBLIC,
  process.env.VAPID_PRIVATE
)

/**
 * Invia una notifica push
 * 
 * @param {String} title intestazione del banner
 * @param {String} body messaggio del banner
 * @param {String} username username dell'utente a cui inviare la notifica
 */
async function sendPush(title, body, username) {
  try {
    const sub = await Sub.findOne({ owner: username })
    const payload = JSON.stringify({ title, body })
    await webpush.sendNotification(sub.subscription, payload)
  } catch (error) {}
}

/**
 * Trasforma un datetime in una stringa testuale equivalente con
 * sensibilità al minuto
 * 
 * @param {String | Number | Date} convertible valore convertibile in Date
 * @returns datetime in formato stringa con sensibilità al minuto
 */
function getDatetimeString(convertible) {
  return (new Date(convertible)).toLocaleString('it-IT').slice(0, -3)
}

/**
 * Trasforma un datetime in una stringa human-readable
 * 
 * @param {String | Number | Date} convertible valore convertibile in Date
 * @returns datetime in formato stringa leggibile
 */
function getReadableDate(convertible) {
  return getDatetimeString(convertible).replace(',', ' alle')
}

/**
 * Controlla se è il momento di inviare la notifica
 * 
 * @param {Event | Task} T impegno imminente
 * @param {Boolean} isPush true per reminder push, false per email
 * @param {Boolean} isEvent true se T è un Event, false se è un Task
 * @param {User} owner proprietario dell'impegno
 * @returns true se bisogna mandare la notifica, false altrimenti
 */
function isNotificationMoment(T, isPush, isEvent, owner) {
  const method = isPush ? 'push' : 'email'
  const reminder = T.reminders.split(',').filter(r => r.includes(method))[0]
  const minutes = parseInt(reminder.split(':')[1])
  const activityDate = isEvent ? T.start : T.deadline
  const reminderInstant = activityDate.getTime() - minutes * 60 * 1000
  return getDatetimeString(reminderInstant) == getDatetimeString(getTime(owner))
}

/**
 * Invia le notifiche per gli eventi
 */
async function notificateEvents() {
  try {
    // prende tutti gli eventi con notifiche
    const events = await Event.find({ reminders: { $ne: '' } })
    for (const e of events) {
      const owner = await User.findOne({ username: e.owner })
      if (!owner.notification) {
        // se non ha le notifiche attive passa all'evento successivo
        continue
      }
      if (e.rrule) {
        // se è ricorrente prende la prima occorrenza futura
        const ownerTime = new Date(getTime(owner))
        e.start = getFirstOccurrence(e, ownerTime) ?? new Date(0)
      }

      // push notification
      if (e.reminders.includes('push')) {
        if (isNotificationMoment(e, true, true, owner)) {
          await sendPush(e.title, eventMsg(e), e.owner)
        }
      }
      // email notification
      if (e.reminders.includes('email')) {
        if (isNotificationMoment(e, false, true, owner)) {
          await sendMail(owner.email, e.title, eventMsg(e))
        }
      }
    }
  } catch (err) {}
}

/**
 * Invia le notifiche per i task
 */
async function notificateTasks() {
  try {
    // prende tutti i task non completati aventi notifiche
    const tasks = await Task.find({
      reminders: { $ne: '' },
      isDone: false
    })
    for (const t of tasks) {
      const owner = await User.findOne({ username: t.owner })
      if (!owner.notification) {
        // se non ha le notifiche attive passa al task successivo
        continue
      }
      // push notification
      if (t.reminders.includes('push')) {
        if (isNotificationMoment(t, true, false, owner)) {
          await sendPush(t.title, taskMsg(t), t.owner)
        }
      }
      // email notification
      if (t.reminders.includes('email')) {
        if (isNotificationMoment(t, false, false, owner)) {
          await sendMail(owner.email, t.title, taskMsg(t))
        }
      }
    }
  } catch (err) {}
}

/**
 * Invia le notifiche per i task in ritardo
 */
async function notificateLateTasks() {
  try {
    // prende tutti i task non completati aventi notifiche
    const tasks = await Task.find({
      reminders: { $ne: '' },
      isDone: false
    })
    for (const t of tasks) {
      const owner = await User.findOne({ username: t.owner })
      if (!owner.notification) {
        // se non ha le notifiche attive passa al task successivo
        continue
      }
      const ownerTime = Date.parse(getTime(owner))
      // considera solo i task scaduti da almeno un giorno
      if (ownerTime > t.deadline.getTime() + 24 * 60 * 60 * 1000) {
        if (t.lateTs === -1 || ownerTime > t.lateTs + 24 * 60 * 60 * 1000) {
          const lateMsg = lateTaskMsg(ownerTime, t)
          // push notification
          if (t.reminders.includes('push')) {
            await sendPush(lateMsg.title, lateMsg.body, t.owner)
          }
          // email notification
          if (t.reminders.includes('email')) {
            await sendMail(owner.email, lateMsg.title, lateMsg.body)
          }
          // aggiorna il timestamp della notifica di ritardo
          await Task.findByIdAndUpdate(
            t._id,
            { $set: { lateTs: ownerTime } }
          )
        }
      }
    }
  } catch (err) {}
}

/**
 * Resetta i timestamp delle notifiche di ritardo per i task dell'utente.  
 * _Quando un utente viaggia indietro nel tempo, non possiamo sapere quanto avanti fosse,
 * quindi resettiamo i timestamp di tutti i suoi task non completati, in modo che quelli
 * in ritardo possano essere nuovamente notificati_
 * 
 * @param {String} username username dell'utente di cui resettare i ts
 */
async function resetUserTaskTs(username) {
  await Task.updateMany(
    { 
      isDone: false,
      owner: username
    }, 
    { $set: { lateTs: -1 } }
  )
}

module.exports = {
  notificateEvents,
  notificateTasks,
  notificateLateTasks,
  resetUserTaskTs
}
