import React, { useState, useEffect } from 'react'
import { useNavigate } from "react-router-dom";
import axios from 'axios';
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import rrulePlugin from '@fullcalendar/rrule';
import { useTime } from '../../contexts/TimeContext'
import { useAuth } from '../../contexts/AuthenticationContext';
import { getDateString } from '../../utils/dates';
import { marked } from 'marked';
import Header from '../Header/Header'

import calendarIcon from "../../images/calendar-icon.png";
import notesIcon from "../../images/notebook-pen-icon.png";
import tomatoIcon from "../../images/speed-icon.png";
import logoutIcon from "../../images/door-check-out-icon.png";
import taskIcon from "../../images/checklist-icon.png";

import "../../css/Dashboard.css";

const Dashboard = () => {
  const navigate = useNavigate()
  const { isAuthenticated, logout } = useAuth()
  const { time, isTimeLoading } = useTime()

  const [user, setUser] = useState({})
  const [events, setEvents] = useState([])
  const [note, setNote] = useState({})
  const [tasks, setTasks] = useState([])
  const [tomato, setTomato] = useState({})
  const [error, setError] = useState('')

  marked.setOptions({
    gfm: true,       //Con true usa le specifiche markdown di Github (quelle classiche direi es: # a, *a*, - a, ecc)
    breaks: true,    //Con true aggiunge una singola linea di break
  });

  // recupera il profilo utente
  useEffect(() => {
    const fetchUser = async () => {
      if (isAuthenticated) {
        try {
          const response = await axios.get(`${process.env.REACT_APP_API}/api/users/`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
          })
          setUser(response.data)
          setError('')
        } catch (error) {
          setError(error.response?.data || 'Error fetchUser')
        }
      }
    }

    fetchUser()
  }, [isAuthenticated])

  // recupera gli eventi dal backend e li mappa
  useEffect(() => {
    const fetchEvents = async () => {
      if (isAuthenticated) {
        try {
          const response = await axios.get(`${process.env.REACT_APP_API}/api/events`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
          })
          const mapped = response.data.map(ev => ({
            ...ev,
            // color: #, TODO: impostare colore eventi nella preview
            id: ev._id,
            allDay: ev.isAllDay
          }))
          setEvents(mapped)
        } catch (error) {
          setError('Error while fetching events')
          setEvents([])
        }
      }
    }

    fetchEvents()
  }, [isAuthenticated])

  // recupera l'ultima nota modificata dal backend
  useEffect(() => {
    const fetchNote = async () => {
      if (isAuthenticated) {
        try {
          const response = await axios.get(`${process.env.REACT_APP_API}/api/notes/last`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
          })
          setNote(response.data)
        } catch (error) {
          setError('Error while fetching note')
          setNote({})
        }
      }
    }

    fetchNote()
  }, [isAuthenticated])

  // recupera i task dal backend
  useEffect(() => {
    const fetchTasks = async () => {
      if (isAuthenticated) {
        try {
          const response = await axios.get(`${process.env.REACT_APP_API}/api/tasks/notdone`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
          })
          setTasks(response.data)
        } catch (error) {
          setError('Error while fetching tasks')
          setTasks([])
        }
      }
    }

    fetchTasks()
  }, [isAuthenticated])

  // recupera l'ultimo pomodoro dal backend
  useEffect(() => {
    const fetchTomato = async () => {
      if (isAuthenticated) {
        try {
          const response = await axios.get(`${process.env.REACT_APP_API}/api/tomatoes/last`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
          });
          setTomato(response.data);
        } catch (error) {
          setError('Error while fetching tomato');
          setTomato({});
        }
      }
    };
  
    fetchTomato();
  }, [isAuthenticated]);

  return(
    <div>
      {isAuthenticated && <>
        <Header />
        {error && <p>{error}</p>}
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
            <div className='dash-card-preview'>
            {!isTimeLoading && <FullCalendar
                plugins={[timeGridPlugin, rrulePlugin]}
                headerToolbar={{left: '', center: '', right: ''}}
                initialView='timeGridDay'
                locale='it'
                initialDate={time}
                scrollTime={`${String(time.getHours() - 2).padStart(2, '0')}:00`}
                now={time}
                nowIndicator={true}
                events={[...events]}
            />}
            </div>
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
            <div className='dash-card-preview'>
              {Object.keys(note).length === 0 ? (
                <span className='dash-empty-prev'>Nessuna nota presente</span>
              ) : (
                <div className='dash-note-container'> {/*Container per dividere le note visualizzate normalmente e tradotte in Markdown*/}
                  {/*Visualizzazione in Markdown uguale a quello del listamento in Notes.jsx*/}
                  <div className='dash-note-markdown' dangerouslySetInnerHTML={{
                    __html: marked(`${note.title}\n\n${note.categories.split(',').map(c => `#${c.trim()}`).join(' ')}\n\n${note.text.substring(0, 200)}${note.text.length > 200 ? '...' : ''}`)
                  }}>
                  </div>
                </div>
              )}
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
              {tasks.length === 0 ? (
                <span className='dash-empty-prev'>Nessun task previsto</span>
              ) : (
                tasks.map((t) => (
                  <div
                    key={t._id}
                    className={`dash-task${Date.parse(t.deadline) < time.getTime() ? ' task-late' : ''}`}
                  >
                    <p>
                      <strong>{t.title}</strong> | <time>{getDateString(new Date(t.deadline))}</time>
                    </p>
                    <p>{t.description.substring(0, 45)}{t.description.length > 45 && '...'}</p>
                  </div>
                ))
              )}
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
              {Object.keys(tomato).length === 0 ? (
                <span className='dash-empty-prev'>Nessun timer presente</span>
              ) : (
                // TODO: finire preview pomodoro
                <div className='dash-tomato'>
                  <h3>Ultima sessione</h3>
                  <h4>{tomato.loops} {tomato.loops === 1 ? 'ciclo' : 'cicli'} di</h4>
                  <p><strong>Tempo di studio:</strong> {tomato.studyMinutes}
                  {tomato.studyMinutes === 1 ? 'minuto' : 'minuti'}</p>
                  <p><strong>Tempo di pausa:</strong> {tomato.pauseMinutes}
                  {tomato.pauseMinutes === 1 ? 'minuto' : 'minuti'}</p>
                  <p><strong>Stato:</strong> {tomato.interrupted === 'n' ? 'da iniziare' :
                    tomato.interrupted === 'f' ? 'concluso' : 'da concludere'}</p>
                </div>
              )}
            </div>
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
      </>}
    </div>
  );
}

export default Dashboard;
