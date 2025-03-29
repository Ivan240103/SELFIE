/**
 * Routes for notification related operations
 */

const express = require('express')
const { auth } = require('../middleware/auth')
const Sub = require('../models/PushSubscription')

const router = express.Router()

// sottoscrivere un servizio di notifiche push
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
    return res.send('ok')
  } catch (err) {
    return res.status(500).send('Error while attempting subscription')
  }
})

module.exports = router
