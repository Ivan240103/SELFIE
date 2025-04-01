import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { useAuth } from '../../contexts/AuthenticationContext'

function Notifier() {
  const { isAuthenticated } = useAuth()
  
  const [notifyPermission, setNotifyPermission] = useState(false)

  useEffect(() => {
    const registerServiceWorker = async () => {
      if ("serviceWorker" in navigator) {
        try {
          await navigator.serviceWorker.register('/sw.js')
          // setError('')
        } catch (error) {
          // setError('Service worker registration failed')
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
          // setError('')
        } catch (error) {
          // setError(error.response?.data || 'Error fetchUser')
        }
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
      await axios.post(`${process.env.REACT_APP_API}/api/notifications/push/subscribe`,
        { subscription: subscription },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      )
      // setError('')
    } catch (error) {
      // setError('subscribeToPush error')
    }
  }

  async function askNotifyPermission() {
    if (!notifyPermission) {
      const permission = await Notification.requestPermission()
      if (permission === "granted") {
        setNotifyPermission(true)
        try {
          await axios.put(`${process.env.REACT_APP_API}/api/users/notification`, {
            state: true
          }, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
          })
          // setError('')
        } catch (error) {
          // setError(error.response?.data || 'Error in askNotifyPermission')
        }
        await subscribeToPush()
      }
    }
  }

  async function revokeNotifyPermission() {
    if (notifyPermission) {
      setNotifyPermission(false)
      try {
        await axios.put(`${process.env.REACT_APP_API}/api/users/notification`, {
          state: false
        }, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        })
        // setError('')
      } catch (error) {
        // setError(error.response?.data || 'Error in revokeNotifyPermission')
      }
    }
  }

  return (
    <div>
      {notifyPermission ? (
        <button onClick={revokeNotifyPermission}>
          Disattiva le notifiche
        </button>
      ) : (
        <button onClick={askNotifyPermission}>
          Attiva le notifiche
        </button>
      )}
    </div>
  )
}

export default Notifier
