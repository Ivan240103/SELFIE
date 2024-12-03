import React, { useEffect, useState } from 'react'
import { useNavigate } from "react-router-dom"
import axios from 'axios'

function Protected() {
  const navigate = useNavigate()
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
      <p>Nome: {user.name || ''}</p>
      <p>Cognome: {user.surname || ''}</p>
      <br />
      <button type="button" onClick={logout}>Logout</button>
    </div>
  )
}

export default Protected;
