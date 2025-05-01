import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import rrulePlugin from '@fullcalendar/rrule';
import { useAuth } from '../../contexts/AuthenticationContext';
import { useTime } from '../../contexts/TimeContext';
import { mapEvent, mapTask } from '../../utils/calendar'
import { showError, showSuccess } from '../../utils/toasts';
import Header from '../Header/Header'
import Event from "./Event";
import Task from "./Task";

import { Spinner } from '@heroui/react'

function Calendar() {
  const { isAuthenticated, checkAuth } = useAuth()
  const { time, isTimeLoading } = useTime()
  const navigate = useNavigate()
  const [user, setUser] = useState({})
  const [weekendsVisible, setWeekendsVisible] = useState(true);
  const [calendarEvents, setCalendarEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [isEventOpen, setIsEventOpen] = useState(false);
  const [calendarTasks, setCalendarTasks] = useState([]);
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [isTaskOpen, setIsTaskOpen] = useState(!!localStorage.getItem('tomato') ?? false);

  // verifica dell'autenticazione
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => checkAuth(navigate), [])

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

  // Carica gli eventi dal backend
  useEffect(() => {
    async function fetchEvents() {
      if (isAuthenticated) {
        try {
          const response = await fetch(`${process.env.REACT_APP_API}/api/events/`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          });
          if (response.ok) {
            const events = await response.json();
            // Mappa _id come id
            const mappedEvents = events.map(event => mapEvent(event));
            setCalendarEvents(mappedEvents);
          } else {
            throw new Error()
          }
        } catch (error) {
          showError('fetchEvents error')
          setCalendarEvents([])
        }
      } else {
        setCalendarEvents([])
      }
    }

    fetchEvents();
  }, [isAuthenticated]);

  // Carica le task dal backend
  useEffect(() => {
    async function fetchTasks() {
      if (isAuthenticated) {
        try {
          const response = await fetch(`${process.env.REACT_APP_API}/api/tasks/`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          });
          if (response.ok) {
            const tasks = await response.json();
            const mappedTasks = tasks.map(task => mapTask(task, time))
            setCalendarTasks(mappedTasks);
          } else {
            throw new Error()
          }
        } catch (error) {
          showError('fetchTasks error')
          setCalendarTasks([])
        }
      } else {
        setCalendarTasks([])
      }
    }

    fetchTasks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  function handleEventSave(event) {
    setIsEventOpen(false)
    setCalendarEvents(prev => [...prev, mapEvent(event)]);
  }

  function handleEventUpdate(event) {
    setIsEventOpen(false)
    const mappedEvent = mapEvent(event)
    const updatedEvents = calendarEvents.map(e => e.id === mappedEvent.id ? mappedEvent : e)
    setCalendarEvents(updatedEvents);
  }

  function handleEventDelete(eventId) {
    setIsEventOpen(false)
    const updatedEvents = calendarEvents.filter(e => e.id !== eventId)
    setCalendarEvents(updatedEvents);
  }

  function handleTaskSave(task) {
    setIsTaskOpen(false)
    setCalendarTasks(prev => [...prev, mapTask(task, time)]);
  }

  function handleTaskUpdate(task) {
    setIsTaskOpen(false)
    const mappedTask = mapTask(task, time)
    const updatedTasks = calendarTasks.map(t => t.id === mappedTask.id ? mappedTask : t)
    setCalendarTasks(updatedTasks);
  }

  function handleTaskDelete(taskId) {
    setIsTaskOpen(false)
    const updatedTasks = calendarTasks.filter(t => t.id !== taskId)
    setCalendarTasks(updatedTasks);
  }

  function toggleWeekends() {
    setWeekendsVisible(prev => !prev)
  }

  function handleClick(info) {
    const clickedEvent = info.event;
    const type = clickedEvent.extendedProps.eventType
    // Se l'evento cliccato è una task
    if (type === 'task') {
      // Passa la task al componente Task
      setSelectedTaskId(clickedEvent.id)
      setIsTaskOpen(true)
    }
    // Se l'evento cliccato è un evento (non una task)
    else if (type === 'event') {
      // Passa l'evento al componente Event
      setSelectedEventId(clickedEvent.id);
      setIsEventOpen(true)
    }
  }

  // Gestisce il trascinamento dei task
  async function handleDrop(info) {
    const { event } = info;
    if (event.extendedProps.eventType === 'task') {
      const newDeadline = event.start ?? time;
      const taskId = event.id

      try {
        // Aggiorna la scadenza del task nel backend
        const response = await fetch(`${process.env.REACT_APP_API}/api/tasks/${taskId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({ deadline: newDeadline.toISOString() })
        });

        if (response.ok) {
          // Aggiorna lo stato locale
          const result = await response.json()
          handleTaskUpdate(result)
          showSuccess('Attività aggiornata')
        } else {
          throw new Error()
        }
      } catch (error) {
        showError('handleTaskDrop error')
        info.revert()
      }
    } else {
      showError('Operazione non consentita', 'Gli eventi non ammettono drag-and-drop')
      info.revert()
    }
  }

  return (
    <div>
      <Header />
      <div className='w-[96vw] mt-4 mx-auto pb-8'>
        {isTimeLoading ? (
          <div className='flex flex-col justify-center pt-32'>
            <Spinner color="secondary" variant='wave' label="Caricamento del calendario..." />
          </div>
        ) : (
          // TODO: rendere responsive la toolbar del calendario
          // TODO: visualizzazione di eventi allDay su più giorni non include la end date (forse problema con il salvataggio)
          <FullCalendar
            dayHeaderClassNames='bg-gray-100'
            eventDisplay='block'
            eventColor='#bae6fd'
            eventTextColor='black'
            height='94vh'
            eventTimeFormat={{
              hour: 'numeric',
              minute: '2-digit',
              meridiem: false
            }}
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, rrulePlugin]}
            headerToolbar={{
              left: 'prev,today,next addEventBtn,addTaskBtn',
              center: 'title',
              right: 'toggleWeekendsBtn dayGridMonth,timeGridWeek,timeGridDay'
            }}
            buttonText={{
              today: 'Oggi',
              month: 'Mese',
              week: 'Settimana',
              day: 'Giorno',
            }}
            customButtons={{
              addEventBtn: {
                text: 'Nuovo evento',
                click: function() {
                  setSelectedEventId(null)
                  setIsEventOpen(true)
                },
                hint: 'Crea un nuovo evento'
              },
              addTaskBtn: {
                text: 'Nuova attività',
                click: function() {
                  setSelectedTaskId(null)
                  setIsTaskOpen(true)
                },
                hint: 'Crea una nuova attività'
              },
              toggleWeekendsBtn: {
                text: weekendsVisible ? 'Nascondi weekend' : 'Mostra weekend',
                click: toggleWeekends
              }
            }}
            initialView='dayGridMonth'
            locale='it'
            firstDay={1}
            initialDate={time}
            scrollTime='07:00'
            now={time}
            nowIndicator={true}
            dayMaxEvents={true}
            showNonCurrentDates={false}
            weekends={weekendsVisible}
            events={[
              ...calendarEvents,
              ...calendarTasks
            ]}
            editable={true}
            selectable={false}
            droppable={true}
            eventClick={handleClick}
            eventDrop={handleDrop}
          />
        )}
        {isEventOpen && <Event
          eventId={selectedEventId}
          user={user}
          onSaveEvent={handleEventSave}
          onUpdateEvent={handleEventUpdate}
          onDeleteEvent={handleEventDelete}
          isModalOpen={isEventOpen}
          setIsModalOpen={setIsEventOpen}
        />}
        {isTaskOpen && <Task
          taskId={selectedTaskId}
          user={user}
          onSaveTask={handleTaskSave}
          onUpdateTask={handleTaskUpdate}
          onDeleteTask={handleTaskDelete}
          isModalOpen={isTaskOpen}
          setIsModalOpen={setIsTaskOpen}
        />}
      </div>
    </div>
  );
}

export default Calendar;
