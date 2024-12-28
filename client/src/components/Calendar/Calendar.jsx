import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import rrulePlugin from '@fullcalendar/rrule';
import { useAuth } from '../Auth/AuthenticationContext';
import { useTimeMachine } from '../TimeMachine/TimeMachineContext';
import Event from "./Event";
import Task from "./Task";
import TimeMachine from '../TimeMachine/TimeMachine';

/* TODO: X PAYAM
PER I TASK. CONFRONTARE DEADLINE CON time, SE PASSATA COLORARE DI ROSSO.
I TASK IN ROSSO VANNO PROPOSTI TEMPORANEAMENTE ANCHE NEL GIORNO ATTUALE
(OLTRE A QUELLO IN CUI AVEVANO LA DEADLINE)
*/

function Calendar() {
  const { isAuthenticated } = useAuth()
  const { time, isTimeLoading } = useTimeMachine()
  const navigate = useNavigate()

  const [weekendsVisible, setWeekendsVisible] = useState(true);
  const [calendarEvents, setCalendarEvents] = useState([]);
  const [currentEvent, setCurrentEvent] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [calendarTasks, setCalendarTasks] = useState([]);
  const [selectedTasks, setSelectedTasks] = useState([]);
  const [taskToEdit, setTaskToEdit] = useState(null);

  // verifica l'autenticazione
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login')
    }
  }, [isAuthenticated, navigate])

  // Carica gli eventi dal backend
  useEffect(() => {
    async function fetchEvents() {
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
          const mappedEvents = events.map(event => ({
            ...event,
            id: event._id, // Mappa _id a id
            eventType: 'event',
            allDay: event.isAllDay
          }));
          setCalendarEvents(mappedEvents);
        } else {
          alert('Errore durante il caricamento degli eventi.');
        }
      } catch (error) {
        alert('Errore nel caricamento degli eventi:', error.message || 'no response');
      }
    }
    fetchEvents();
  }, []);

  // Carica le task dal backend
  useEffect(() => {
    async function fetchTasks() {
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
          const mappedTasks = tasks.map(task => ({
            id: task._id,
            title: task.title,
            start: task.deadline,
            allDay: true, // FullCalendar richiede questa proprietà
            color: task.isDone ? 'green' : 'yellow', // Colore specifico per le task
            textColor: 'black', // Per visibilità
            eventType: 'task'
          }));
          setCalendarTasks(mappedTasks);
        } else {
          alert('Errore durante il caricamento delle task.');
        }
      } catch (error) {
        alert('Errore nel caricamento delle task:', error.message || 'no response');
      }
    }
    fetchTasks();
  }, []);

  function handleTaskSave(newTask) {
    setTasks([...tasks, newTask]);
    setCalendarTasks([
      ...calendarTasks,
      {
        id: newTask.id,
        title: newTask.title,
        start: newTask.deadline,
        allDay: true,
        color: 'yellow', // Colore diverso per le attività
        textColor: 'black' //Perchè in bianco non si vedeva
      },
    ]);
  }

  function handleTaskSelect(taskId) {
    setSelectedTasks(prevSelectedTasks => {
      if (prevSelectedTasks.includes(taskId)) {
        return prevSelectedTasks.filter(id => id !== taskId); // Deseleziona
      } else {
        return [...prevSelectedTasks, taskId]; // Seleziona
      }
    });
  }

  function handleTaskClick(task) {
    // Impostiamo la task da modificare quando l'utente la seleziona per modificarla
    setTaskToEdit(task.id);
  }

  function handleWeekendsToggle() {
    setWeekendsVisible(!weekendsVisible);
  }

  function handleEventSave(newEvent) {
    setCalendarEvents([...calendarEvents, newEvent]);
  }

  function handleEventUpdate(updatedEvent) {
    setCalendarEvents(calendarEvents.map(event => event.id === updatedEvent.id ? updatedEvent : event));
  }

  function handleEventDelete(eventId) {
    setCalendarEvents(calendarEvents.filter(event => event.id !== eventId));
  }

  function handleTaskUpdate(updatedTask) {
    setCalendarEvents(calendarTasks.map(task => task.id === updatedTask.id ? updatedTask : task));
  }

  function handleTaskDelete(taskId) {
    setCalendarEvents(calendarTasks.filter(task => task.id !== taskId));
  }

  // TODO: USARE LA PROPRIETÀ EDITABLE PER MODIFICARE LA DATA DI EVENTI E TASK
  // TRASCINANDOLI. Attualmente si può però la data resta invariata nel nuovo giorno.
  // leggendo un po' la docs mi sembra si chiami eventDrop la proprietà necessaria.

  return (
      <div className='demo-app'>
        {isAuthenticated && <>
          <TimeMachine />
          <Sidebar
            weekendsVisible={weekendsVisible}
            handleWeekendsToggle={handleWeekendsToggle}
          />
          <div className='demo-app-main'>
            {!isTimeLoading && <FullCalendar
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, rrulePlugin]}
              headerToolbar={{
                left: 'prevYear,prev,today,next,nextYear',
                center: 'title',
                right: 'dayGridMonth,timeGridWeek,timeGridDay'
              }}
              initialView='dayGridMonth'
              locale='it'
              initialDate={time}
              scrollTime='07:00'
              now={time}
              nowIndicator={true}
              editable={true}
              selectable={true}
              dayMaxEvents={true}
              showNonCurrentDates={false}
              weekends={weekendsVisible}
              events={[
                ...calendarEvents,
                ...calendarTasks, // Assicurati di aggiungere le task qui
              ]}
              eventClick={(info) => {
                const clickedEvent = info.event;
                // Se l'evento cliccato è una task
                if (clickedEvent.extendedProps.eventType === 'task') {
                  alert('Task cliccata:', clickedEvent);
                  const clickedTask = calendarTasks.find(task => task.id === clickedEvent.id);
                  
                  // Passa la task da modificare al componente Task
                  if (clickedTask) {
                    setTaskToEdit(clickedTask); // Imposta la task da modificare
                  }
                }
                // Se l'evento cliccato è un evento (non una task)
                else if (clickedEvent.extendedProps.eventType === 'event') {
                  alert('Evento cliccato:', clickedEvent);
                  
                  // Passa i dettagli dell'evento al componente Event per la modifica
                  setCurrentEvent(clickedEvent.id);  // Imposta l'evento da modificare
                }
              }}
            />}
            <Event 
              onSaveEvent={handleEventSave}
              onUpdateEvent={handleEventUpdate} 
              onDeleteEvent={handleEventDelete} 
              eventDetails={currentEvent}
            />
            <div>
              <h3>Lista Attività</h3>
              <ul>
                {calendarTasks.map(task => (
                    <li key={task.id}>
                      <input
                        type="checkbox"
                        checked={selectedTasks.includes(task.id)}
                        onChange={() => handleTaskSelect(task.id)}
                      />
                      {task.title} - Scadenza: {new Date(task.start).toLocaleDateString()}
                    </li>
                ))}
              </ul>
              {/* Mostra il bottone di modifica solo se una singola task è selezionata */}
              {selectedTasks.length === 1 && (
                <button onClick={() => handleTaskClick(calendarTasks.find(task => task.id === selectedTasks[0]))}>
                  Modifica Task
                </button>
              )}
            </div>
            <Task 
              onSaveTask={handleTaskSave} 
              onUpdateTask={handleTaskUpdate}
              onDeleteTask={handleTaskDelete}
              taskDetails={taskToEdit} // Passiamo la task da modificare
              selectedTasks={selectedTasks}
            />
          </div>
        </>}
      </div>
  );
}

function Sidebar({ weekendsVisible, handleWeekendsToggle }) {
  return (
    <div className='demo-app-sidebar'>
      <nav className="navbar">
          <div className="navbar-container">
              <ul className="navbar-menu">
                  <li className="navbar-item">Calendario</li>
                  <li className="navbar-item">Note</li>
                  <li className="navbar-item">Pomodoro</li>
                  <li className="navbar-item">Contatti</li>
              </ul>
          </div>
      </nav>
      <div className='demo-app-sidebar-section'>
        <label>
          <input
            type='checkbox'
            checked={weekendsVisible}
            onChange={handleWeekendsToggle}
          ></input>
          toggle weekends
        </label>
      </div>
    </div>
  );
}

export default Calendar;
