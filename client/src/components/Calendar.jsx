import React, { useState } from 'react'
import { formatDate } from '@fullcalendar/core'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'

function Calendar() {
  const [weekendsVisible, setWeekendsVisible] = useState(true)

  function handleWeekendsToggle() {
    setWeekendsVisible(!weekendsVisible)
  }

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
        />
      </div>
    </div>
  )
}


function Sidebar({ weekendsVisible, handleWeekendsToggle}) {
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
  )
}

export default Calendar;