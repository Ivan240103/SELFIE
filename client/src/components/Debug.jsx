import React from "react";
import axios from 'axios'

const API_BASE_URL = 'http://localhost:8000'

function Debug() {
  const getAllEvents = async () => {
    const r = await axios.get(`${API_BASE_URL}/events/`)
    document.getElementById('debug').innerHTML = JSON.stringify(r) // NON FUNZIONA
  }

  return(
    <div>
      <p id="debug"></p>
      <button type="button" onClick={getAllEvents}>Get all event</button>
      <form action="http://localhost:8000/events/create" method="post">
        <input type="date" name="start" />
        <input type="date" name="end" />
        <button type="submit">Create event</button>
      </form>
    </div>
  )
}

export default Debug;
