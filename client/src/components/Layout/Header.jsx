import React, { useState, useEffect } from 'react'
import { useNavigate } from "react-router-dom";
import axios from 'axios';
import TimeMachine from '../TimeMachine/TimeMachine'
import { useTimeMachine } from '../TimeMachine/TimeMachineContext'
import { useAuth } from '../Auth/AuthenticationContext'

function Header() {
const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const { time } = useTimeMachine()

  const [notification, setNotification] = useState(false)
  const [events, setEvents] = useState([])
  const [error, setError] = useState('')
  
  const activeTimeout = []

  // verifica l'autenticazione
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login')
    }
  }, [isAuthenticated, navigate])

  // recupera il profilo utente
  useEffect(() => {
    const fetchUser = async () => {
      if (isAuthenticated) {
        try {
          const response = await axios.get(`${process.env.REACT_APP_API}/api/users/`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
          })
          setNotification(response.data.notification)
          setError('')
        } catch (error) {
          setError(error.response?.data || 'Error fetchUser')
        }
      }
    }

    fetchUser()
  }, [isAuthenticated])

  // recuperare gli eventi con notifica
  useEffect(() => {
    const fetchEvents = async () => {
      if (isAuthenticated && notification) {
        try {
          const response = await axios.get(`${process.env.REACT_APP_API}/api/events/`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
          })
          // TODO: filter solo gli eventi con notifiche
          setEvents(response.data)
          setError('')
        } catch (error) {
          setError(error.response?.data || 'Error fetchEvents')
        }
      }
    }

    fetchEvents()
  }, [isAuthenticated, notification])

  useEffect(() => {
    // TODO: attivare un timeout per ogni evento con notifica
  })

  const askNotification = async () => {
    if (!notification) {
      const permission = await Notification.requestPermission()
      if (permission === "granted") {
        try {
          const response = await axios.put(`${process.env.REACT_APP_API}/api/users/notification`, {}, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
          })
          setError('')
          setNotification(response.data.notification)
        } catch (error) {
          setError(error.response?.data || 'Error notification')
        }
      }
    }
  }

  return (
    <header>
      {error && <p>{error}</p>}
      {/* TODO: aggiungere qui time machine */}
      {/* TODO: aggiungere timezone per geolocalizzazione */}
      {notification ? (
        <p>Notifiche attive</p>
      ) : (
        <button onClick={askNotification}>
          Attiva le notifiche
        </button>
      )}
    </header>
  )
}

export default Header
