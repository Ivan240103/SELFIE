import React, { useState, useEffect } from "react";
import axios from 'axios';
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import rrulePlugin from '@fullcalendar/rrule';
import { useTime } from '../../contexts/TimeContext'
import { useAuth } from '../../contexts/AuthenticationContext';
import { showError } from "../../utils/toasts";

export default function PreviewCalendar() {
  const { isAuthenticated } = useAuth()
  const { time, isTimeLoading } = useTime()
  const [events, setEvents] = useState([])

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

  // TODO: fetchare anche i task per il calendario

  return (
    <div className='dash-card-preview'>
      {!isTimeLoading && (
        <FullCalendar
          plugins={[timeGridPlugin, rrulePlugin]}
          headerToolbar={{left: '', center: '', right: ''}}
          initialView='timeGridDay'
          locale='it'
          initialDate={time}
          scrollTime={`${String(time.getHours() - 2).padStart(2, '0')}:00`}
          now={time}
          nowIndicator={true}
          events={[...events]}
        />
      )}
    </div>
  )
}
