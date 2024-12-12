import React, { useState } from 'react';
import { useEffect } from "react";
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import Event from "./Event";
import Task from "./Task"

function Calendar() {
  const [weekendsVisible, setWeekendsVisible] = useState(true);
  const [calendarEvents, setCalendarEvents] = useState([]);

  function handleWeekendsToggle() {
    setWeekendsVisible(!weekendsVisible);
  }

  function handleEventSave(newEvent) {
    setCalendarEvents([...calendarEvents, newEvent]);
  }

  function handleTaskSave(newTask) {
    const taskEvent = {
      title: newTask.title,
      start: newTask.deadline,
      allDay: false, // Puoi modificare in base ai requisiti
    };
    setCalendarEvents([...calendarEvents, taskEvent]);
  }


  useEffect(() => {
    // Carica gli eventi dal backend
    async function fetchEvents() {
      try {
        const response = await fetch("http://localhost:8000/api/events/");
        if (response.ok) {
          const events = await response.json();
          setCalendarEvents(events);
        } else {
          console.error('Errore durante il caricamento degli eventi.');
        }
        } catch (error) {
        console.error('Errore nel caricamento degli eventi:', error);
        }
    }
    fetchEvents();
  }, []);

  return (
    <div className='demo-app'>
      <Sidebar
        weekendsVisible={weekendsVisible}
        handleWeekendsToggle={handleWeekendsToggle}
      />
      <div className='demo-app-main'>
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          headerToolbar={{
            left: 'prevYear,prev,today,next,nextYear',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay'
          }}
          initialView='dayGridMonth'
          editable={true}
          selectable={true}
          selectMirror={true}
          dayMaxEvents={true}
          showNonCurrentDates={false}
          weekends={weekendsVisible}
          events={calendarEvents} // Imposta gli eventi nel calendario
        />
        <Event onSaveEvent={handleEventSave} />
        <Task onSaveTask={handleTaskSave} /> {/* Aggiunge il form per le task */}
      </div>
    </div>
  );
}

function Sidebar({ weekendsVisible, handleWeekendsToggle }) {
  return (
    <div className='demo-app-sidebar'>
      <nav className="navbar">
          <div className="navbar-container">
              <a href="#" className="navbar-logo">MyLogo</a>
              <ul className="navbar-menu">
                  <li className="navbar-item"><a href="#" className="navbar-link">Calendario</a></li>
                  <li className="navbar-item"><a href="#" className="navbar-link">Note</a></li>
                  <li className="navbar-item"><a href="#" className="navbar-link">Pomodoro</a></li>
                  <li className="navbar-item"><a href="#" className="navbar-link">Contatti</a></li>
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
