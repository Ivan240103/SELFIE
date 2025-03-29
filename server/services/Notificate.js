/**
 * Notification service to send both email and push alert
 */

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

function getDateForMsg(convertible) {
  return getDatetimeString(convertible).replace(',', ' alle')
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
            `Il tuo evento "${e.title}" è in programma per il ${getDateForMsg(e.start)}.`,
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
            `Il tuo evento "${e.title}" è in programma per il ${getDateForMsg(e.start)}.`
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
            `Il tuo task "${t.title}" è in scadenza il ${getDateForMsg(t.deadline)}.`,
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
            `Il tuo task "${t.title}" è in scadenza il ${getDateForMsg(t.deadline)}.`
          )
        }
      }
    })
  } catch (err) {
    console.error(err)
  }
}

function getUrgencyMessage(current, deadline, task) {
  if (current > deadline + 7 * 24 * 60 * 60 * 1000) {
    return {
      title: `RICORDATI DI ${task.title}`,
      body: `Il tuo task "${task.title}" è scaduto il ${getDateForMsg(task.deadline)}, è più di una settimana fa!`
    }
  } else if (current > deadline + 3 * 24 * 60 * 60 * 1000) {
    return {
      title: `!! ${task.title} !!`,
      body: `Il tuo task "${task.title}" è scaduto il ${getDateForMsg(task.deadline)}, è già un po' che lo porti dietro.`
    }
  } else {
    return {
      title: task.title,
      body: `Il tuo task "${task.title}" è scaduto il ${getDateForMsg(task.deadline)}.`
    }
  }
}

async function notificateLateTasks() {
  try {
    const tasks = await Task.find({
      reminders: { $ne: '' },
      isDone: false
    })
    // tengo solo quelli scaduti da almeno un giorno
    const lateTasks = tasks.filter(
      async (t) => Date.parse(await getTime(t.owner)) > t.deadline.getTime() + 24 * 60 * 60 * 1000
    )

    lateTasks.forEach(async (t) => {
      const owner = await User.findOne({ username: t.owner })
      if (!owner.notification) return

      const ownerTimeMs = Date.parse(await getTime(t.owner))
      if (t.lateTs === -1 || ownerTimeMs > t.lateTs + 24 * 60 * 60 * 1000) {
        const deadlineMs = t.deadline.getTime()
        const lateMsg = getUrgencyMessage(ownerTimeMs, deadlineMs, t)
      
        if (t.reminders.includes('push')) {
          await sendPush(lateMsg.title, lateMsg.body, t.owner)
        }

        if (t.reminders.includes('email')) {
          await sendMail(owner.email, lateMsg.title, lateMsg.body)
        }

        await Task.findByIdAndUpdate(
          t._id,
          { $set: { lateTs: ownerTimeMs } }
        )
      }
    })
  } catch (err) {
    console.error(err)
  }
}

/* quando un utente torna indietro nel tempo, non potendo sapere quanto avanti fosse,
resettiamo i timestamp di tutti i suoi task non completati in modo che quelli in ritardo
possano essere nuovamente notificati se necessario */
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
