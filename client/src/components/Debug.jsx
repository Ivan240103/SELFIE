import React from "react";
import axios from 'axios'

const API_BASE_URL = 'http://localhost:8000/api'

function Debug() {
  const createEvent = async () => {
    await axios.post(`${API_BASE_URL}/events/`,
      {
        title: 'TITOLO',
        description: 'DESCRIZIONE'
      },
      {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      }
    )
  }
  
  const getAllEvents = async () => {
    const r = await axios.get(`${API_BASE_URL}/events/`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })
    document.getElementById('debug').innerHTML = JSON.stringify(r.data)
  }

  const getSpecificEvent = async () => {
    const id = document.getElementById('id').value
    const r = await axios.get(`${API_BASE_URL}/events/${id}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })
    document.getElementById('debug').innerHTML = JSON.stringify(r.data)
  }
  
  const deleteSpecificEvent = async () => {
    const id = document.getElementById('id').value
    const r = await axios.delete(`${API_BASE_URL}/events/${id}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })
    document.getElementById('debug').innerHTML = JSON.stringify(r.data)
  }

  return(
    <div>
      <h1>Debug</h1>
      <p id="debug"></p>
      <button type="button" onClick={getAllEvents}>Get all event</button>
      <br />
      <input type="text" name="id" id="id" />
      <button type="button" onClick={getSpecificEvent}>Get specific event</button>
      <br />
      <input type="text" name="username" id="username" />
      <button type="button" onClick={deleteSpecificEvent}>Delete event</button>
      <br />
      <button type="button" onClick={createEvent}>Create event</button>
    </div>
  )
}

export default Debug;
