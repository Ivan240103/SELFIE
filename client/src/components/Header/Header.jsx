import React, { useState, useEffect } from 'react'
import { useNavigate } from "react-router-dom"
import { useAuth } from '../../contexts/AuthenticationContext'
import TimeMachine from './TimeMachine'
import Notifier from './Notifier'

import '../../css/Header.css'

function Header() {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()

  const [error, setError] = useState('')

  // verifica l'autenticazione
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login')
    }
  }, [])

  return (
    <header className='header-container'>
      <button onClick={() => navigate(-1)}>
        Go back
      </button>
      <TimeMachine />
      <Notifier />
      {error && <p>{error}</p>}
    </header>
  )
}

export default Header
