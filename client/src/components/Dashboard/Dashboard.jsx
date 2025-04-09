import React, { useState, useEffect } from 'react'
import { useNavigate } from "react-router-dom";
import axios from 'axios';
import { useAuth } from '../../contexts/AuthenticationContext';
import { showError } from '../../utils/toasts';
import Header from '../Header/Header'
import PreviewCalendar from './PreviewCalendar'
import PreviewNote from './PreviewNote'
import PreviewTasks from './PreviewTasks'
import PreviewTomato from './PreviewTomato'

import calendarIcon from "../../images/calendar-icon.png";
import notesIcon from "../../images/notebook-pen-icon.png";
import tomatoIcon from "../../images/speed-icon.png";
import logoutIcon from "../../images/door-check-out-icon.png";
import taskIcon from "../../images/checklist-icon.png";

import "../../css/Dashboard.css";
import {
  Card,
  CardHeader,
  CardBody
} from '@heroui/react'

// TODO: creare PreviewCard
function PreviewCard({ children }) {
  return (
    <Card>
      <p>ciao</p>
    </Card>
  )
}

function Dashboard() {
  const navigate = useNavigate()
  const { isAuthenticated, logout } = useAuth()
  const [user, setUser] = useState({})

  // recupera il profilo utente
  useEffect(() => {
    const fetchUser = async () => {
      if (isAuthenticated) {
        try {
          const response = await axios.get(`${process.env.REACT_APP_API}/api/users/`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
          })
          setUser(response.data)
        } catch (error) {
          showError('fetchUser error')
          setUser({})
        }
      } else {
        setUser({})
      }
    }

    fetchUser()
  }, [isAuthenticated])

  return(
    <div>
      <Header />
      <div className='dash-container'>
        <div
          className='dash-card'
          id='dash-profile'
          onClick={() => navigate('/profile')}
        >
          <div className='dash-card-header'>
            <img
              src={`${process.env.REACT_APP_API}/pics/${user.picName || 'default.png'}`}
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
          onClick={() => navigate('/calendar')}
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
          <PreviewCalendar />
        </div>
        <div
          className='dash-card'
          id='dash-note'
          onClick={() => navigate('/notes')}
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
          <PreviewNote />
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
          <PreviewTasks />
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
          <PreviewTomato />
        </div>
        <div
          className='dash-card'
          id='dash-logout'
          onClick={() => { logout() }}
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
