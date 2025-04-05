import React, { useState, useEffect } from 'react';
import axios from 'axios';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import rrulePlugin from '@fullcalendar/rrule';
import { useAuth } from '../../contexts/AuthenticationContext';
import { useTime } from '../../contexts/TimeContext';
import { showError } from '../../utils/toasts';
import Header from '../Header/Header'
import Event from "./Event";
import Task from "./Task";

import {
  Checkbox
} from "@heroui/react"

function Sidebar({ weekendsVisible, handleWeekendsToggle }) {
  return (
    <div>
      <Checkbox
        color="primary"
        isSelected={weekendsVisible}
        onValueChange={handleWeekendsToggle}
      >
        Mostra weekend
      </Checkbox>
    </div>
  );
}

function Calendar() {
  const { isAuthenticated } = useAuth()
  const { time, isTimeLoading } = useTime()
  const [user, setUser] = useState({})
  const [weekendsVisible, setWeekendsVisible] = useState(true);
  const [calendarEvents, setCalendarEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [isEventOpen, setIsEventOpen] = useState(false);
  const [calendarTasks, setCalendarTasks] = useState([]);
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [isTaskOpen, setIsTaskOpen] = useState(false);

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
            const mappedTasks = tasks.map(task => mapTask(task))
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
  }, [isAuthenticated]);

  function mapEvent(event) {
    // TODO: customize color?
    return {
      ...event,
      id: event.googleId || event._id,
      eventType: 'event',
      allDay: event.isAllDay
    }
  }

  function mapTask(task) {
    return {
      id: task._id,
      title: task.title,
      start: task.deadline,
      allDay: false,
      // TODO: change colors accordingly
      color: task.isDone ? 'green' : (getUrgency(task) > 0 ? 'red' : 'yellow'),
      textColor: 'black',
      eventType: 'task',
      urgencyLevel: getUrgency(task),
      isDone: task.isDone
    }
  }

  // Funzione per calcolare il livello di urgenza di un task
  const getUrgency = (task) => {
    // TODO: check urgency levels
    const { deadline, isDone } = task
    if (isDone || !deadline) {
      return 0;
    }
    return Math.max(0, Math.floor((time - deadline) / (1000 * 60 * 60 * 24)));
  };

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
    setCalendarTasks(prev => [...prev, mapTask(task)]);
  }

  function handleTaskUpdate(task) {
    setIsTaskOpen(false)
    const mappedTask = mapTask(task)
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

  async function handleDrop(info) {
    const { event } = info;
    if (event.extendedProps.eventType === 'event') {
      // Gestisci il trascinamento degli eventi
      await handleEventDrop(event);
    } else {
      // Gestisci il trascinamento dei task
      await handleTaskDrop(event);
    }
  }

  // TODO: check function forse togliere
  //Chiamata PUT per eventDrop quando trascino l'evento, vado a prendere le info dell'evento selezionato e lo modifico con la data rilasciata
  const handleEventDrop = async (event) => {
    const newStartDate = event.start
    const newEndDate = event.end ? new Date(event.end) : null; // Data di fine corretta
    const eventId = event.id

    console.log("Nuova data di inizio (locale):", newStartDate.toLocaleString('it-IT'));
    console.log("Nuova data di fine (locale):", newEndDate ? newEndDate.toLocaleString('it-IT') : "Nessuna data di fine");

    try {
      // Aggiorna la data dell'evento nel backend
      const response = await fetch(`${process.env.REACT_APP_API}/api/events/${eventId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ start: newStartDate.toISOString(), end: newEndDate ? newEndDate.toISOString() : null })
      });

      if (response.ok) {
        // Aggiorna lo stato locale
        setCalendarEvents(prevEvents =>
          prevEvents.map(ev =>
            ev.id === eventId ? { ...ev, start: newStartDate, end: newEndDate } : ev
          )
        );
      } else {
        throw new Error()
      }
    } catch (error) {
      showError('handleEventDrop error')
      event.revert()
    }
  };

  // TODO: check function
  const handleTaskDrop = async (task) => {
    const newEndDate = task.start; // Data di fine corretta
    const taskId = task.id

    try {
      // Aggiorna la data dell'evento nel backend
      const response = await fetch(`${process.env.REACT_APP_API}/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ deadline: newEndDate ? newEndDate.toISOString() : null })
      });

      if (response.ok) {
        // Aggiorna lo stato locale
        setCalendarTasks(prevTasks =>
          prevTasks.map(task =>
            task.id === taskId ? { ...task, start: newEndDate } : task
          )
        );
      } else {
        throw new Error()
      }
    } catch (error) {
      showError('handleTaskDrop error')
      task.revert()
    }
  };

  return (
    <div>
      <Header />
      <Sidebar
        weekendsVisible={weekendsVisible}
        handleWeekendsToggle={toggleWeekends}
      />
      <button
        type="button"
        onClick={() => {
          setSelectedEventId(null)
          setIsEventOpen(true)
        }}
      >
        Crea evento
      </button>
      <button
        type="button"
        onClick={() => {
          setSelectedTaskId(null)
          setIsTaskOpen(true)
        }}
      >
        Crea task
      </button>
      {isTimeLoading ? (
        // TODO: add skeleton?
        <p>Skeleton</p>
      ) : (
        // TODO: visualizzazione di eventi su più giorni non include la end date (forse problema con il salvataggio)
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, rrulePlugin]}
          headerToolbar={{
            left: 'prevYear,prev,today,next,nextYear',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay'
          }}
          initialView='dayGridMonth'
          locale='it'
          firstDay={1}
          initialDate={time}
          scrollTime='07:00'
          now={time}
          nowIndicator={true}
          editable={true}
          selectable={true}
          droppable={true}
          dayMaxEvents={true}
          showNonCurrentDates={false}
          weekends={weekendsVisible}
          events={[
            ...calendarEvents,
            ...calendarTasks
          ]}
          eventClick={(info) => handleClick(info)}
          eventDrop={async (info) => await handleDrop(info)}
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
  );
}

export default Calendar;
