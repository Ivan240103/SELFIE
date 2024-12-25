import React, { useState, useEffect } from 'react'
import { useNavigate } from "react-router-dom";
import axios from 'axios';
import TimeMachine from './TimeMachine/TimeMachine'
import { useTimeMachine } from './TimeMachine/TimeMachineContext'

import calendarIcon from "../images/calendar-icon.png";
import notesIcon from "../images/notebook-pen-icon.png";
import tomatoIcon from "../images/speed-icon.png";
import logoutIcon from "../images/door-check-out-icon.png";
import taskIcon from "../images/checklist-icon.png";

import "../css/Dashboard.css";

function Dashboard() {
  const navigate = useNavigate()
  const { time } = useTimeMachine()
  const [user, setUser] = useState({})
  const [tasks, setTasks] = useState([])

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

  // recupera i task dal backend
  useEffect(() => {
    const fetchTasks = async () => {
      if (user?.username) {
        try {
          const response = await axios.get(`${process.env.REACT_APP_API}/api/tasks/notdone`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
          })
          setTasks(response.data)
        } catch (error) {
          alert('Error while fetching tasks')
        }
      }
    }

    fetchTasks()
  }, [user])

  return(
    <div>
      <TimeMachine />
      <div className='dash-container'>
        <div
          className='dash-card'
          id='dash-profile'
          onClick={() => navigate('/profile')}
        >
          <div className='dash-card-header'>
            <img
              src={`${process.env.REACT_APP_API}/pics/${user.picName}`}
              alt='icona del profilo'
              className='dash-icon' />
            <div className='dash-text'>
              <h2>Profilo personale</h2>
              <p>Personalizza il tuo profilo!</p>
              <p>{user.name || ''} {user.surname || ''}, {user.email || 'nessuna email'}</p>
            </div>
          </div>
        </div>
        <div
          className='dash-card'
          id='dash-calendar'
          onClick={() => navigate('/Calendar')}
        >
          <div className='dash-card-header'>
            <img
              src={calendarIcon}
              alt='icona del calendario'
              className='dash-icon' />
            <div className='dash-text'>
              <h2>Calendario</h2>
              <p>Organizza la tua routine!</p>
            </div>
          </div>
          <div className='dash-card-preview'>
            {/* preview calendario (vista settimanale o giornaliera) */}
          </div>
        </div>
        <div
          className='dash-card'
          id='dash-note'
          onClick={() => navigate('/Notes')}
        >
          <div className='dash-card-header'>
            <img
              src={notesIcon}
              alt='icona delle note'
              className='dash-icon' />
            <div className='dash-text'>
              <h2>Note</h2>
              <p>Scrivi qualunque appunto!</p>
            </div>
          </div>
          <div className='dash-card-preview'>
            {/* preview ultima nota modificata */}
          </div>
        </div>
        <div
          className='dash-card'
          id='dash-task'
          onClick={() => navigate('/task')}
        >
          <div className='dash-card-header'>
            <img
              src={taskIcon}
              alt='icona dei task'
              className='dash-icon' />
            <div className='dash-text'>
              <h2>Task</h2>
              <p>Traccia le cose da fare!</p>
            </div>
          </div>
          <div className='dash-card-preview'>
            {tasks.length === 0 && <p>Nessun task previsto</p>}
            {tasks.length > 0 && tasks.map((t) => (
              <div
                key={t._id}
                className={`dash-task${Date.parse(t.deadline) < time.getTime() ? ' task-late' : ''}`}
              >
                <p><b>{t.title}</b> - {(new Date(t.deadline)).toLocaleString('it-IT')}</p>
                <p>{t.description.substring(0, 45)}{t.description.length > 45 && '...'}</p>
              </div>
            ))}
          </div>
        </div>
        <div
          className='dash-card'
          id='dash-tomato'
          onClick={() => navigate('/tomato')}
        >
          <div className='dash-card-header'>
            <img
              src={tomatoIcon}
              alt='icona del timer'
              className='dash-icon' />
            <div className='dash-text'>
              <h2>Pomodoro</h2>
              <p>Imposta il tempo di studio!</p>
            </div>
          </div>
          <div className='dash-card-preview'>
            {/* preview ultima sessione avviata */}
          </div>
        </div>
        <div
          className='dash-card'
          id='dash-logout'
          onClick={() => {
            localStorage.removeItem('token')
            navigate('/login')
          }}
        >
          <div className='dash-card-header'>
            <img
              src={logoutIcon}
              alt='icona del logout'
              className='dash-icon' />
            <div className='dash-text'>
              <h2>Logout</h2>
              <p>Esci dal profilo!</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
