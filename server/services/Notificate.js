const {
  sendMail,
  sendPush
} = require('../routes/notifications')
const Event = require('../models/Event')
const Task = require('../models/Task')
const User = require('../models/User')
const { getTime } = require('../services/TimeMachine')
const { RRule } = require('rrule')

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

/**
 * Fornisce una stringa rappresentante la data passata come argomento
 * (con sensibilità al minuto)
 * @param convertible qualcosa di convertibile in un Date (ms, stringa...)
 */
function getDatetimeString(convertible) {
  return (new Date(convertible)).toLocaleString('it-IT').slice(0, -3)
}

async function isNotificationMoment(T, isPush, isEvent) {
  const method = isPush ? 'push' : 'email'
  const reminder = T.reminders.split(',').filter(r => r.includes(method))[0]
  const minutes = parseInt(reminder.split(':')[1])
  const activityDate = isEvent ? new Date(T.start) : new Date(T.deadline)
  const reminderInstant = activityDate.getTime() - minutes * 60 * 1000
  return getDatetimeString(reminderInstant) == getDatetimeString(await getTime(T.owner))
}

async function notificateEvents() {
  try {
    const events = await Event.find({ reminders: { $ne: '' } })
    const futureEvents = (await mapRecurrentEvents(events)).filter(
      async (e) => (new Date(e.start)).getTime() > Date.parse(await getTime(e.owner))
    )

    futureEvents.forEach(async (e) => {
      const owner = await User.findOne({ username: e.owner })
      if (!owner.notification) return

      if (e.reminders.includes('push')) {
        // push notification
        if (await isNotificationMoment(e, true, true)) {
          await sendPush(
            e.title,
            `Il tuo evento "${e.title}" è in programma per il ` + getDatetimeString(e.start),
            e.owner
          )
        }
      }

      if (e.reminders.includes('email')) {
        // email notification
        if (await isNotificationMoment(e, false, true)) {
          await sendMail(
            owner.email,
            e.title,
            `Il tuo evento "${e.title}" è in programma per il ` + getDatetimeString(e.start)
          )
        }
      }
    })
  } catch (err) {
    console.error(err)
  }
}

async function notificateTasks() {
  try {
    const tasks = await Task.find({ reminders: { $ne: '' } })
    const futureTasks = tasks.filter(
      async (t) => (new Date(t.deadline)).getTime() > Date.parse(await getTime(t.owner))
    )

    futureTasks.forEach(async (t) => {
      const owner = await User.findOne({ username: t.owner })
      if (!owner.notification) return

      if (t.reminders.includes('push')) {
        // push notification
        if (await isNotificationMoment(t, true, false)) {
          await sendPush(
            t.title,
            `Il tuo task "${t.title}" è in scadenza il ${getDatetimeString(t.deadline)}.`,
            t.owner
          )
        }
      }

      if (t.reminders.includes('email')) {
        // email notification
        if (await isNotificationMoment(t, false, false)) {
          await sendMail(
            owner.email,
            t.title,
            `Il tuo task "${t.title}" è in scadenza il ${getDatetimeString(t.deadline)}.`
          )
        }
      }
    })
  } catch (err) {
    console.error(err)
  }
}

/* tasks.forEach(async (t) => {
  const mailReminderMinutes = t.reminders.split(',').filter(r => r.includes('email'))[0].split(':')[1]
  const deadlineMs = (new Date(t.deadline)).getTime()
  const reminderInstant = deadlineMs - parseInt(mailReminderMinutes) * 60 * 1000
  const ownerTimeMs = Date.parse(await getTime(t.owner))
  if (ownerTimeMs > reminderInstant) {
    // needs notification
    if (ownerTimeMs > deadlineMs + 7 * 24 * 60 * 60 * 1000) {
      await sendMail(
        owner.email,
        `RICORDATI DI ${t.title} !`,
        `Il tuo task "${t.title}" è scaduto il ` + (new Date(t.deadline)).toLocaleString('it-IT') + ', è più di una settimana fa!'
      )
    } else if (ownerTimeMs > deadlineMs + 24 * 60 * 60 * 1000) {
      await sendMail(
        owner.email,
        `!!! ${t.title} !!!`,
        `Il tuo task "${t.title}" è scaduto il ` + (new Date(t.deadline)).toLocaleString('it-IT') + ", è già un po' che lo porti dietro."
      )
    } else if (ownerTimeMs > deadlineMs) {
      await sendMail(
        owner.email,
        `${t.title}`,
        `Il tuo task "${t.title}" è scaduto il ` + (new Date(t.deadline)).toLocaleString('it-IT')
      )
    }
  }
}) */

module.exports = {
  notificateEvents,
  notificateTasks
}
