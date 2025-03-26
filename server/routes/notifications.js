/**
 * Routes for notification-related operations
 */

const express = require('express')
const webpush = require('web-push')
const nodemailer = require('nodemailer')
require('dotenv').config()
const auth = require('../middleware/auth')
const Sub = require('../models/PushSubscription')

const router = express.Router()

const selfieMail = 'selfie242515@gmail.com'

// configurazione notifiche email
const transporter = nodemailer.createTransport({
  service: 'gmail', 
  auth: {
    user: selfieMail,
    pass: 'cikkjfehbcbtewmz',
  },
  secure: true,
  requireTLS: true,
  port: 465,
  secured: true
})

const sendMail = async (email, subject, msg) => {
  await transporter.sendMail({
    from: selfieMail,
    to: email,
    subject: subject,
    text: msg
  })
}

// configurazione notifiche push
webpush.setVapidDetails(
  `mailto:${selfieMail}`,
  process.env.VAPID_PUBLIC,
  process.env.VAPID_PRIVATE
)

const sendPush = async (title, body, username) => {
  try {
    const sub = await Sub.findOne({ owner: username })
    const payload = JSON.stringify({ title, body })
    await webpush.sendNotification(sub.subscription, payload)
  } catch (err) {}
}

router.post('/push/subscribe', auth, async (req, res) => {
  try {
    const sub = await Sub.findOne({ owner: req.user.username })
    if (sub) {
      sub.subscription = req.body.subscription
      await sub.save()
    } else {
      await Sub.create({
        subscription: req.body.subscription,
        owner: req.user.username
      })
    }
    res.send('ok')
  } catch (err) {
    res.status(500).send('Error while attempting subscription')
  }
})

exports.notificationRoutes = router
exports.sendMail = sendMail
exports.sendPush = sendPush
