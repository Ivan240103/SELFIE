import React, { useEffect, useState } from 'react'
import axios from 'axios'

function Protected() {
  const [username, setUsername] = useState('')
  const [user, setUser] = useState({})

  // ricava lo username dal token
  useEffect(() => {
    const fetchUsername = async () => {
      try {
        const response = await axios.get('http://localhost:8000/api/users/', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        })
        setUsername(response.data)
      } catch (error) {
        console.error(error)
      }
    }

    fetchUsername()
  }, [])

  useEffect(() => {
    const fetchProfile = async () => {
      if (username) {
        try {
          const response = await axios.get(`http://localhost:8000/api/users/${username}`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
          })
          setUser(response.data)
        } catch (error) {
          console.error('Error fetching user')
          return <div><p>Non autorizzato</p></div>
        }
      }
    }

    fetchProfile()
  }, [username])

  return(
    <div>
      <p>Nome: {user.name || ''}</p>
      <p>Cognome: {user.surname || ''}</p>
    </div>
  )
}

export default Protected;
