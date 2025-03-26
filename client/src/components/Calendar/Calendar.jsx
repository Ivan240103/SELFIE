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
import { useRef } from 'react';

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
  const [lastPomodoro, setLastPomodoro] = useState({});

  // verifica l'autenticazione
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login')
    }
  }, [isAuthenticated, navigate])

  
  // Funzione per calcolare il livello di urgenza
  const calculateUrgencyLevel = (deadline, isDone) => {
    if (isDone || !deadline) return 0;
    return Math.max(0, Math.floor((new Date(time) - new Date(deadline)) / (1000 * 60 * 60 * 24)));
  };


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
            id: event.googleId || event._id, // Mappa _id a id
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

  useEffect(() => {
    async function fetchLastPomodoro() {
      try {
        const response = await fetch(`${process.env.REACT_APP_API}/api/tomatoes/last`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        if (response.ok) {
          const pomodoro = await response.json();
          setLastPomodoro({
            id: pomodoro._id,
            title: `🍅 Pomodoro`,
            start: new Date(time),
            end: new Date(Date(time) + pomodoro.remainingMinutes * 60 * 1000), //Volevo cercare di mostrare la "barra arancione in day nel calendario" come tempo rimanente ma non mi sa che ho fallito
            allDay: false,
            color: 'orange',
            textColor: 'black',
            eventType: 'pomodoro'
          });
        }
      } catch (error) {
        console.error('Errore nel caricamento del pomodoro:', error);
      }
    }
    fetchLastPomodoro();
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
          setCalendarTasks(tasks.map(task => ({
            id: task._id,
            title: task.title,
            start: task.deadline,
            allDay: true,
            color: task.isDone ? 'green' : (calculateUrgencyLevel(task.deadline, task.isDone) > 0 ? 'red' : 'yellow'),
            textColor: 'black',
            eventType: 'task',
            urgencyLevel: calculateUrgencyLevel(task.deadline, task.isDone),
            isDone: task.isDone
          })));
        }else {
          alert('Errore durante il caricamento delle task.');
        }
      } catch (error) {
        alert('Errore nel caricamento delle task:', error.message || 'no response');
      }
    }
    fetchTasks();
  }, [time]);

  const notifiedTasksRef = useRef(new Set());

  useEffect(() => {
    calendarTasks.forEach(task => {
      if (task.urgencyLevel > 0 && !notifiedTasksRef.current.has(task.id)) {
        console.log(`Task "${task.title}" è scaduta da ${task.urgencyLevel} giorno/i.`);
        notifiedTasksRef.current.add(task.id); // Segna come notificata
      }
    });
  }, [calendarTasks]);
  

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

  //Chiamata PUT per eventDrop quando trascino l'evento, vado a prendere le info dell'evento selezionato e lo modifico con la data rilasciata
  const handleEventDrop = async (info) => {
    const { event } = info;

    const newStartDate = event.start
    const newEndDate = event.end ? new Date(event.end) : null; // Data di fine corretta
    const eventId=event.id

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
        body: JSON.stringify({ start: newStartDate.toISOString(), end: newEndDate ? newEndDate.toISOString() : null})
      });
  
      if (response.ok) {
        // Aggiorna lo stato locale
        setCalendarEvents(prevEvents =>
          prevEvents.map(ev =>
            ev.id === eventId ? { ...ev, start: newStartDate, end: newEndDate } : ev
          )
        );
      } else {
        alert('Errore durante l\'aggiornamento della data dell\'evento.');
        event.revert()
      }
    } catch (error) {
      alert('Errore nel caricamento degli eventi:', error.message || 'no response');
      event.revert()
    }
  };

  const handleTaskDrop = async (info) => {
    const { event } = info;

    const newEndDate = event.start; // Data di fine corretta
    const taskId=event.id

    console.log("Nuova data di fine (locale):", newEndDate ? newEndDate.toLocaleString('it-IT') : "Nessuna data di fine");
    
    try {
      // Aggiorna la data dell'evento nel backend
      const response = await fetch(`${process.env.REACT_APP_API}/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({deadline: newEndDate ? newEndDate.toISOString() : null})
      });

      if (response.ok) {
        // Aggiorna lo stato locale
        setCalendarTasks(prevTasks =>
          prevTasks.map(task =>
            task.id === taskId ? { ...task, start: newEndDate } : task
          )
        );
      } else {
        alert('Errore durante l\'aggiornamento della data dell\'evento.');
        event.revert()
      }
    } catch (error) {
      alert('Errore nel caricamento degli eventi:', error.message || 'no response');
      event.revert()
    }
  };


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
              droppable={true}
              dayMaxEvents={true}
              showNonCurrentDates={false}
              weekends={weekendsVisible}
              events={[
                ...calendarEvents,
                ...calendarTasks,
                lastPomodoro
              ]}
              eventClick={(info) => {
                const clickedEvent = info.event;
                // Se l'evento cliccato è una task
                if (clickedEvent.extendedProps.eventType === 'task') {
                  const clickedTask = calendarTasks.find(task => task.id === clickedEvent.id);
                  
                  // Passa la task da modificare al componente Task
                  if (clickedTask) {
                    setTaskToEdit(clickedTask); // Imposta la task da modificare
                  }
                }
                // Se l'evento cliccato è un evento (non una task)
                else if (clickedEvent.extendedProps.eventType === 'event') {
                  // Passa i dettagli dell'evento al componente Event per la modifica
                  setCurrentEvent(clickedEvent.id);  // Imposta l'evento da modificare
                }
              }}
              eventDrop={(info) => {  
                const { event } = info;
                if (event.extendedProps.eventType === 'event') {  //Si potrebbe fare anche con le task
                  handleEventDrop(info); // Gestisci il trascinamento degli eventi
                }
                else{  //Si potrebbe fare anche con le task
                  handleTaskDrop(info); // Gestisci il trascinamento degli eventi
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
                      {task.title} - Scadenza: {new Date(task.start).toLocaleDateString('it-IT')}
                      {task.isDone && <span style={{ color: 'green', marginLeft: '10px' }}>✅ Completata</span>}
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
  );
}

export default Calendar;
