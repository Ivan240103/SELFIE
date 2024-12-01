import React from "react";
import axios from 'axios'

const API_BASE_URL = 'http://localhost:8000/api'

function Debug() {
  const getAllEvents = async () => {
    const r = await axios.get(`${API_BASE_URL}/events/`)
    document.getElementById('debug').innerHTML = JSON.stringify(r.data)
  }

  const getSpecificEvent = async () => {
    const id = document.getElementById('id').value
    const r = await axios.get(`${API_BASE_URL}/events/${id}`)
    document.getElementById('debug').innerHTML = JSON.stringify(r.data)
  }
  
  const deleteSpecificEvent = async () => {
    const id = document.getElementById('id').value
    const r = await axios.delete(`${API_BASE_URL}/events/${id}`)
    document.getElementById('debug').innerHTML = JSON.stringify(r.data)
  }
  
  const getSpecificUser = async () => {
    const usr = document.getElementById('username').value
    const r = await axios.get(`${API_BASE_URL}/users/${usr}`)
    document.getElementById('debug').innerHTML = JSON.stringify(r.data)
  }

  const registerUser = async () => {
    const body = {
        username: 'desi',
        password: 'desi',
        name: 'ivan',
        surname: 'de simone'
    }
    await axios.post(`${API_BASE_URL}/users/register`, body)
  }

  return(
    <div>
      <button type="button" onClick={registerUser}>Registra</button>
      <p id="debug"></p>
      <button type="button" onClick={getAllEvents}>Get all event</button><br />
      <input type="text" name="id" id="id" />
      <button type="button" onClick={getSpecificEvent}>Get specific event</button>
      <input type="text" name="username" id="username" />
      <button type="button" onClick={getSpecificUser}>Get specific user</button>
      <button type="button" onClick={deleteSpecificEvent}>Delete event</button>
      <form action="http://localhost:8000/events/" method="post">
        <input type="date" name="start" />
        <input type="date" name="end" />
        <button type="submit">Create event</button>
      </form>
    </div>
  )
}

export default Debug;
