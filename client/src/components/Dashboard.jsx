import React, { useState, useEffect } from 'react'
import { useNavigate, Link } from "react-router-dom";
import axios from 'axios';
import TimeMachine from './TimeMachine/TimeMachine'

import calendarIcon from "../images/calendar-icon.png";
import notesIcon from "../images/notebook-pen-icon.png";
import tomatoIcon from "../images/speed-icon.png";
import logoutIcon from "../images/door-check-out-icon.png";
// TODO: servono icone per profilo e task

import "../css/Dashboard.css";

function Dashboard() {
  const navigate = useNavigate()
  const [user, setUser] = useState({})

  // verifica delle credenziali
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API}/api/users/`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        })
        setUser(response.data)
      } catch (error) {
        console.error('Error fetching user')
        navigate('/login')
      }
    }

    fetchUser()
  }, [navigate])

  return(
    <div>
      <TimeMachine />
      <div className='dash-container'>
        <Link to='/profile'>
          <div className='dash-card' id='dash-profile'>
            <div className='dash-card-header'>
              <img
                // src={profileIcon}
                alt='icona del profilo' />
              <h2>Profilo personale</h2>
              <p>Personalizza il tuo profilo!</p>
            </div>
            <div className='dash-card-preview'>
              {/* preview profilo (qualche info: nome e cognome? email?) */}
            </div>
          </div>
        </Link>
        <Link to='/Calendar'>
          <div className='dash-card' id='dash-calendar'>
            <div className='dash-card-header'>
              <img
                src={calendarIcon}
                alt='icona del calendario' />
              <h2>Calendario</h2>
              <p>Organizza la tua routine!</p>
            </div>
            <div className='dash-card-preview'>
              {/* preview calendario (vista settimanale o giornaliera) */}
            </div>
          </div>
        </Link>
        <Link to='/Notes'>
          <div className='dash-card' id='dash-note'>
            <div className='dash-card-header'>
              <img
                src={notesIcon}
                alt='icona delle note' />
              <h2>Note</h2>
              <p>Scrivi qualunque appunto!</p>
            </div>
            <div className='dash-card-preview'>
              {/* preview ultima nota modificata */}
            </div>
          </div>
        </Link>
        <Link to='/task'>
          <div className='dash-card' id='dash-task'>
            <div className='dash-card-header'>
              <img
                // src={taskIcon}
                alt='icona dei task' />
              <h2>Task</h2>
              <p>Traccia le cose da fare!</p>
            </div>
            <div className='dash-card-preview'>
              {/* preview 3-5 task a scadenza più vicina */}
            </div>
          </div>
        </Link>
        <Link to='/tomato'>
          <div className='dash-card' id='dash-tomato'>
            <div className='dash-card-header'>
              <img
                src={tomatoIcon}
                alt='icona del timer' />
              <h2>Pomodoro</h2>
              <p>Imposta il tempo di studio!</p>
            </div>
            <div className='dash-card-preview'>
              {/* preview ultima sessione avviata */}
            </div>
          </div>
        </Link>
        <Link onClick={() => {
          localStorage.removeItem('token')
          navigate('/login')
        }}>
          <div className='dash-card' id='dash-logout'>
            <div className='dash-card-header'>
              <img
                src={logoutIcon}
                alt='icona del logout' />
              <h2>Logout</h2>
              <p>Esci dal profilo!</p>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}

export default Dashboard;
