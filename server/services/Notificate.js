const {
  sendMail,
  sendPush
} = require('../routes/notifications')
const Event = require('../models/Event')
const User = require('../models/User')
const { getTime } = require('../services/TimeMachine')
const { RRule } = require('rrule')
require('dotenv').config()

async function sendEmail() {
  try {
    let events = await Event.find({
      $and: [
        { reminders: { $ne: '' } },
        { emailNotified: false }
      ]
    })
    events = events.filter(e => e.reminders.includes('email'))
    events = await Promise.all(events.map(async (e) => {
      if (e.rrule) {
        const r = RRule.fromString(e.rrule)
        e.start = r.after(new Date(await getTime(e.owner)))
      }
      return e
    }))

    events.forEach(async (e) => {
      const mailReminderMin = e.reminders.split(',').filter(r => r.includes('email'))[0].split(':')[1]
      const reminderInstant = (new Date(e.start)).getTime() - parseInt(mailReminderMin) * 60 * 1000
      if (Date.parse(await getTime(e.owner)) > reminderInstant) {
        const owner = await User.findOne({ username: e.owner })
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

// DEBUG: riportare a 60 * 1000 per fare il check ogni minuto
setInterval(sendEmail, 10 * 1000)
