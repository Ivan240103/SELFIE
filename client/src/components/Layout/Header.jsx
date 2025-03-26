import React, { useState, useEffect } from 'react'
import { useNavigate } from "react-router-dom"
import axios from 'axios'
import { useAuth } from '../Auth/AuthenticationContext'
import TimeMachine from '../TimeMachine/TimeMachine'
import '../../css/Header.css'

function Header() {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()

  const [notifyPermission, setNotifyPermission] = useState(false)
  const [error, setError] = useState('')

  // verifica l'autenticazione
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login')
    }
  }, [isAuthenticated, navigate])

  useEffect(() => {
    const registerServiceWorker = async () => {
      if ("serviceWorker" in navigator) {
        try {
          await navigator.serviceWorker.register('/sw.js')
          setError('')
        } catch (error) {
          setError('Service worker registration failed')
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
          setError('')
        } catch (error) {
          setError(error.response?.data || 'Error fetchUser')
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
      await axios.post(`${process.env.REACT_APP_API}/api/notification/push/subscribe`,
        { subscription: subscription },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      )
      setError('')
    } catch (error) {
      setError('subscribeToPush error')
    }
  }

  async function askNotifyPermission() {
    if (!notifyPermission) {
      const permission = await Notification.requestPermission()
      if (permission === "granted") {
        try {
          const response = await axios.put(`${process.env.REACT_APP_API}/api/users/notification`, {}, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
          })
          setError('')
          setNotifyPermission(response.data.notification)
        } catch (error) {
          setError(error.response?.data || 'Error in askNotifyPermission')
        }
        await subscribeToPush()
      }
    }
  }

  return (
    <header className='header-container'>
      <button onClick={() => navigate(-1)}>
        Go back
      </button>
      <TimeMachine />
      {error && <p>{error}</p>}
      {notifyPermission ? (
        <p>Notifiche attive</p>
      ) : (
        <button onClick={askNotifyPermission}>
          Attiva le notifiche
        </button>
      )}
      {/* TODO: aggiungere eventually timezone per geolocalizzazione */}
    </header>
  )
}

export default Header
