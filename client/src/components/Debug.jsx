import React from "react";
import axios from 'axios'

const API_BASE_URL = 'http://localhost:8000'

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

  return(
    <div>
      <p id="debug"></p>
      <button type="button" onClick={getAllEvents}>Get all event</button><br />
      <input type="text" name="id" id="id" />
      <button type="button" onClick={getSpecificEvent}>Get specific event</button>
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
