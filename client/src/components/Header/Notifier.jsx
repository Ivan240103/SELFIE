import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { useAuth } from '../../contexts/AuthenticationContext'
import { showError, showSuccess } from '../../utils/toasts'

import { Switch, Tooltip } from '@heroui/react'

function BellOnIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      viewBox="0 0 24 24"
      height="1.1em"
      width="1.1em"
    >
      <path d="M20 18H4l2-2v-6a6 6 0 0 1 5-5.91V3a1 1 0 0 1 2 0v1.09a5.9 5.9 0 0 1 1.3.4A3.992 3.992 0 0 0 18 10v6zm-8 4a2 2 0 0 0 2-2h-4a2 2 0 0 0 2 2zm6-18a2 2 0 1 0 2 2 2 2 0 0 0-2-2z"/>
    </svg>
  )
}

function BellOffIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      viewBox="0 0 24 24"
      height="1em"
      width="1em"
    >
      <path d="M10 20h4a2 2 0 0 1-4 0zm2-18a1 1 0 0 0-1 1v1.093A5.961 5.961 0 0 0 9 4.8l9 9.2v-4a6 6 0 0 0-5-5.91V3a1 1 0 0 0-1-1zM6.417 7.831A5.967 5.967 0 0 0 6 10v6l-2 2h12.586l2.707 2.707a1 1 0 0 0 1.414-1.414l-16-16a1 1 0 0 0-1.414 1.414z"/>
    </svg>
  )
}

function Notifier() {
  const { isAuthenticated } = useAuth()
  
  const [notifyPermission, setNotifyPermission] = useState(false)

  useEffect(() => {
    const registerServiceWorker = async () => {
      if ("serviceWorker" in navigator) {
        try {
          await navigator.serviceWorker.register('/sw.js')
        } catch (error) {
          showError('Service worker registration failed')
        }
      }
    }

    registerServiceWorker()
  }, [])

  // recupera il profilo utente per il permesso delle notifiche
  useEffect(() => {
    const fetchUser = async () => {
      if (isAuthenticated) {
        try {
          const response = await axios.get(`${process.env.REACT_APP_API}/api/users/`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
          })
          setNotifyPermission(response.data.notification)
        } catch (error) {
          showError('Retrieve notification permission error')
          setNotifyPermission(false)
        }
      } else {
        setNotifyPermission(false)
      }
    }

    fetchUser()
  }, [isAuthenticated])

  async function subscribeToPush() {
    const registration = await navigator.serviceWorker.ready
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: process.env.REACT_APP_PUB_VAPID
    })

    try {
      await axios.post(`${process.env.REACT_APP_API}/api/notifications/push/subscribe`, {
        subscription: subscription
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      })
    } catch (error) {
      showError('Push subscription failed')
      throw new Error()
    }
  }

  async function askNotifyPermission() {
    const permission = await Notification.requestPermission()
    if (permission === "granted") {
      try {
        await subscribeToPush()
        await axios.put(`${process.env.REACT_APP_API}/api/users/notification`, {
          state: true
        }, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        })
        setNotifyPermission(true)
        showSuccess('Notifiche abilitate')
      } catch (error) {
        setNotifyPermission(false)
        showError('askNotifyPermission error')
      }
    } else {
      setNotifyPermission(false)
    }
  }

  async function revokeNotifyPermission() {
    try {
      await axios.put(`${process.env.REACT_APP_API}/api/users/notification`, {
        state: false
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      })
      setNotifyPermission(false)
      showSuccess('Notifiche disabilitate')
    } catch (error) {
      showError('revokeNotifyPermission error')
    }
  }

  async function handleSwitch(v) {
    if (v) {
      await askNotifyPermission()
    } else {
      await revokeNotifyPermission()
    }
  }

  return (
    <Tooltip
      content={`Notifiche ${notifyPermission ? 'abilitate' : 'disabilitate'}`}
    >
      <Switch
        className='justify-self-end'
        color='secondary'
        size='lg'
        isSelected={notifyPermission}
        onValueChange={handleSwitch}
        isDisabled={!isAuthenticated}
        thumbIcon={notifyPermission ? <BellOnIcon /> : <BellOffIcon />}
      />
    </Tooltip>
  )
}

export default Notifier
