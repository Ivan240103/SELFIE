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

  // Funzione per calcolare il livello di urgenza
  const calculateUrgencyLevel = (deadline, isDone) => {
    if (isDone) {
      return 0; // Se la task è completata, ritorna 0 e non viene segnalata come scaduta
    }
    const now = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = now - deadlineDate;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays <= 0) {
      return 0; // Non scaduta
    } else if (diffDays <= 1) {
      return 1; // Scaduta da 1 giorno
    } else if (diffDays <= 3) {
      return 2; // Scaduta da 2-3 giorni
    } else {
      return 3; // Scaduta da più di 3 giorni
    }
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
          const mappedTasks = tasks.map(task => {
            const urgencyLevel = calculateUrgencyLevel(task.deadline, task.isDone);
            const color = task.isDone ? 'green' : (urgencyLevel > 0 ? 'red' : 'yellow');
            return{
              id: task._id,
              title: task.title,
              start: task.deadline,
              allDay: true, // FullCalendar richiede questa proprietà
              color: color,
              textColor: 'black', // Per visibilità
              eventType: 'task',
              urgencyLevel, urgencyLevel,
              isDone: task.isDone
            };
          });
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

  // Notifiche di urgenza crescente
  useEffect(() => {
    const urgentTasks = calendarTasks.filter(task => task.urgencyLevel > 0);
    if (urgentTasks.length > 0) {
      urgentTasks.forEach(task => {
        const urgencyMessage = `Task "${task.title}" è scaduta da ${task.urgencyLevel} giorno/i.`;
        console.log(urgencyMessage);
      });
    }
  }, [calendarTasks]);

  // Aggiorna le task scadute quando cambia il tempo
  useEffect(() => {
    const updatedTasks = calendarTasks.map(task => {
      const urgencyLevel = calculateUrgencyLevel(task.start);
      return {
        ...task,
        color: urgencyLevel > 0 ? 'red' : (task.isDone ? 'green' : 'yellow'),
        urgencyLevel: urgencyLevel
      };
    });
    setCalendarTasks(updatedTasks);
  }, [time]);

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

    console.log("Nuova data di inizio (locale):", newStartDate.toLocaleString());
    console.log("Nuova data di fine (locale):", newEndDate ? newEndDate.toLocaleString() : "Nessuna data di fine");
    
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
              eventDrop={(info) => {  
                const { event } = info;
                if (event.extendedProps.eventType === 'event') {  //Si potrebbe fare anche con le task
                  handleEventDrop(info); // Gestisci il trascinamento degli eventi
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
                        disabled={task.isDone} // Disabilita la checkbox se la task è completata
                      />
                      {task.title} - Scadenza: {new Date(task.start).toLocaleDateString()}
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
