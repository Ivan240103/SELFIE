import React, { useState, useEffect } from "react";
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import rrulePlugin from '@fullcalendar/rrule';
import { useAuth } from '../../contexts/AuthenticationContext';
import { useTime } from '../../contexts/TimeContext'
import { mapEvent, mapTask } from '../../utils/calendar'
import { showError } from "../../utils/toasts";

export default function PreviewCalendar() {
  const { isAuthenticated } = useAuth()
  const { time, isTimeLoading } = useTime()
  const [events, setEvents] = useState([])
  const [tasks, setTasks] = useState([])

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
            setEvents(mappedEvents);
          } else {
            throw new Error()
          }
        } catch (error) {
          showError('fetchEvents error')
          setEvents([])
        }
      } else {
        setEvents([])
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
            setTasks(mappedTasks);
          } else {
            throw new Error()
          }
        } catch (error) {
          showError('fetchTasks error')
          setTasks([])
        }
      } else {
        setTasks([])
      }
    }

    fetchTasks();
  }, [isAuthenticated]);

  return (
    <div className='dash-card-preview'>
      {isTimeLoading ? (
        // TODO: add skeleton?
        <p>Skeleton</p>
      ) : (
        <FullCalendar
          plugins={[timeGridPlugin, rrulePlugin]}
          headerToolbar={{left: '', center: '', right: ''}}
          initialView='timeGridDay'
          locale='it'
          initialDate={time}
          scrollTime={`${String(time.getHours() - 2).padStart(2, '0')}:00`}
          now={time}
          nowIndicator={true}
          events={[
            ...events,
            ...tasks
          ]}
        />
      )}
    </div>
  )
}
