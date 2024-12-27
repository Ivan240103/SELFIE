import React, { useEffect, useState } from 'react'
import { useNavigate } from "react-router-dom"
import axios from 'axios'
import TimeMachine from './TimeMachine/TimeMachine'

function Protected() {
  const API = `${process.env.REACT_APP_API}/api`
  const navigate = useNavigate()
  const [user, setUser] = useState({})
  const [note, setNote] = useState({})
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get(`${API}/users/`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        })
        setUser(response.data)
        setError('')
      } catch (error) {
        setError(error.response.data || 'Utente non autorizzato')
        setTimeout(() => {
          navigate('/login')
        }, 2000)
      }
    }

    fetchUser()
  }, [navigate, API])

  const logout = () => {
    localStorage.removeItem('token')
    navigate('/login')
  }

  // DEBUG:
  const createNote = async (e) => {
    e.preventDefault()
    const title = document.getElementById('title').value
    const text = document.getElementById('text').value
    const cat = document.getElementById('cat').value
    await axios.post(`${API}/notes/`, {
      title: title,
      text: text,
      categories: cat
    }, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })
  }

  const getNote = async () => {
    const res = await axios.get(`${API}/notes/last`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })
    setNote(res.data)
  }

  const deleteNote = async () => {
    await axios.delete(`${API}/notes/${note._id}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })
  }

  return(
    <div>
      <TimeMachine />
      <p>{error}</p>
      <p>Nome: {user.name || ''}</p>
      <p>Cognome: {user.surname || ''}</p>
      <br />
      <button type="button" onClick={logout}>Logout</button>
      <h3>Create note</h3>
      <form onSubmit={(e) => createNote(e)}>
        <input type="text" id="title" placeholder='title'/>
        <input type="text" id="text" placeholder='text'/>
        <input type="text" id="cat" placeholder='categories'/>
        <button type="submit">Crea</button>
      </form>
      <button type="button" onClick={getNote}>Get note</button>
      <button type="button" onClick={deleteNote}>Delete note</button>
      <p>{JSON.stringify(note) || ''}</p>
    </div>
  )
}

export default Protected;
