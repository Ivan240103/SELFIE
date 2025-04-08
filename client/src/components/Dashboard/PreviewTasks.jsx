import React, { useState, useEffect } from "react";
import axios from 'axios';
import { useTime } from '../../contexts/TimeContext'
import { useAuth } from '../../contexts/AuthenticationContext';
import { getDateString } from '../../utils/dates';

export default function PreviewTasks() {
  const { isAuthenticated } = useAuth()
  const { time } = useTime()
  const [tasks, setTasks] = useState([])

  // recupera i task dal backend
  useEffect(() => {
    const fetchTasks = async () => {
      if (isAuthenticated) {
        try {
          const response = await axios.get(`${process.env.REACT_APP_API}/api/tasks/notdone`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
          })
          setTasks(response.data)
        } catch (error) {
          setError('Error while fetching tasks')
          setTasks([])
        }
      }
    }

    fetchTasks()
  }, [isAuthenticated])

  return (
    <div className='dash-card-preview'>
      {tasks.length === 0 ? (
        <span className='dash-empty-prev'>Nessun task previsto</span>
      ) : (
        tasks.map((t) => (
          <div
            key={t._id}
            className={`dash-task${Date.parse(t.deadline) < time.getTime() ? ' task-late' : ''}`}
          >
            <p>
              <strong>{t.title}</strong> | <time>{getDateString(new Date(t.deadline))}</time>
            </p>
            <p>{t.description.substring(0, 45)}{t.description.length > 45 && '...'}</p>
          </div>
        ))
      )}
    </div>
  )
}
