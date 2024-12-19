import React, { useEffect, useState } from 'react'
import { useNavigate } from "react-router-dom"
import axios from 'axios'
import TimeMachine from './TimeMachine/TimeMachine'
import { useTimeMachine } from './TimeMachine/TimeMachineContext'

function Protected() {
  const navigate = useNavigate()
  const { resetTime } = useTimeMachine()
  const [user, setUser] = useState({})

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get('http://localhost:8000/api/users/', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        })
        setUser(response.data)
      } catch (error) {
        console.error('Error fetching user')
        navigate('/unauthorized')
      }
    }

    fetchUser()
  }, [])

  const logout = () => {
    localStorage.removeItem('token')
    navigate('/')
  }

  return(
    <div>
      <TimeMachine />
      <p>Nome: {user.name || ''}</p>
      <p>Cognome: {user.surname || ''}</p>
      <br />
      <button type="button" onClick={logout}>Logout</button>
      <button type="button" onClick={resetTime}>Reset time</button>
    </div>
  )
}

export default Protected;
