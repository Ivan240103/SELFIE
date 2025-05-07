import React, { useState, useEffect } from "react";
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import rrulePlugin from '@fullcalendar/rrule';
import { useAuth } from '../../contexts/AuthenticationContext';
import { useTime } from '../../contexts/TimeContext'
import { mapEvent, mapTask } from '../../utils/calendar'
import { showError } from "../../utils/toasts";

import { Spinner } from "@heroui/react";

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
          const response = await fetch(`${process.env.REACT_APP_API ?? ''}/api/events/`, {
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
          const response = await fetch(`${process.env.REACT_APP_API ?? ''}/api/tasks/`, {
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  return (
    <div className="size-full lg:p-3">
      {isTimeLoading ? (
        <div className='h-full flex flex-col items-center justify-center'>
          <Spinner color="secondary" variant='wave' label="Caricamento del calendario..." />
        </div>
      ) : (
        <FullCalendar
          height='100%'
          eventDisplay='block'
          eventColor='#bae6fd'
          eventTextColor='black'
          eventTimeFormat={{
            hour: 'numeric',
            minute: '2-digit',
            meridiem: false
          }}
          plugins={[timeGridPlugin, rrulePlugin]}
          headerToolbar={false}
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
