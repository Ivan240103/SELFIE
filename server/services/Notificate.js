const {
  sendMail,
  sendPush
} = require('../routes/notifications')
const Event = require('../models/Event')
const User = require('../models/User')
const { getTime } = require('../services/TimeMachine')
const { RRule } = require('rrule')
require('dotenv').config()

/**
 * Trasforma lo start degli eventi ricorrenti nella loro prima occorrenza
 * @param {Array<Event>} events eventi estratti dal db
 * @returns array di eventi fissati
 */
async function mapRecurrentEvents(events) {
  return await Promise.all(events.map(async (e) => {
    if (e.rrule) {
      const r = RRule.fromString(e.rrule)
      e.start = r.after(new Date(await getTime(e.owner)))
    }
    return e
  }))
}

async function notificateEmail() {
  try {
    let events = await Event.find({
      $and: [
        { reminders: { $ne: '' } },
        { emailNotified: false }
      ]
    })
    events = events.filter(e => e.reminders.includes('email'))
    events = await mapRecurrentEvents(events)

    events.forEach(async (e) => {
      const owner = await User.findOne({ username: e.owner })
      if (!owner.notification) return

      const mailReminderMinutes = e.reminders.split(',').filter(r => r.includes('email'))[0].split(':')[1]
      const reminderInstant = (new Date(e.start)).getTime() - parseInt(mailReminderMinutes) * 60 * 1000
      if (Date.parse(await getTime(e.owner)) > reminderInstant) {
        await sendMail(
          owner.email,
          e.title,
          `Il tuo evento "${e.title}" è in programma per il ` + (new Date(e.start)).toLocaleString('it-IT')
        )
        await Event.findByIdAndUpdate(
          e._id,
          { $set: { emailNotified: true } }
        )
      }
    })
  } catch (err) {
    console.error(err)
  }
}

async function notificatePush() {
  try {
    let events = await Event.find({
      $and: [
        { reminders: { $ne: '' } },
        { pushNotified: false }
      ]
    })
    events = events.filter(e => e.reminders.includes('push'))
    events = await mapRecurrentEvents(events)

    events.forEach(async (e) => {
      const owner = await User.findOne({ username: e.owner })
      if (!owner.notification) return
      
      const pushReminderMinutes = e.reminders.split(',').filter(r => r.includes('push'))[0].split(':')[1]
      const reminderInstant = (new Date(e.start)).getTime() - parseInt(pushReminderMinutes) * 60 * 1000
      if (Date.parse(await getTime(e.owner)) > reminderInstant) {
        await sendPush(
          e.title,
          `Il tuo evento "${e.title}" è in programma per il ` + (new Date(e.start)).toLocaleString('it-IT'),
          e.owner
        )
        await Event.findByIdAndUpdate(
          e._id,
          { $set: { pushNotified: true } }
        )
      }
    })
  } catch (err) {
    console.error(err)
  }
}

// DEBUG: riportare a 60 * 1000 per fare il check ogni minuto
setInterval(notificateEmail, 10 * 1000)
setInterval(notificatePush, 10 * 1000)
