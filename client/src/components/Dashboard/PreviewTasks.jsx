import React, { useState, useEffect } from "react";
import axios from 'axios';
import { useTime } from '../../contexts/TimeContext'
import { useAuth } from '../../contexts/AuthenticationContext';
import { showError } from '../../utils/toasts'
import { getDateString } from '../../utils/dates';

import {
  Card,
  CardHeader,
  CardBody,
} from '@heroui/react'

function TaskCard({ task }) {
  const { time } = useTime()

  const notDoneColor = () => time > new Date(task.deadline) ? '#ff8080' : '#ffff80'

  return (
    <Card style={{ backgroundColor: notDoneColor()}}>
      <CardHeader>
        <h3>{task.title}</h3>
      </CardHeader>
      <CardBody>
        <time>{getDateString(new Date(task.deadline))}</time>
        <span>{task.description.slice(0, 45)}{task.description.length > 45 && '...'}</span>
      </CardBody>
    </Card>
  )
}

export default function PreviewTasks() {
  const { isAuthenticated } = useAuth()
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
          showError('fetchTasks error')
          setTasks([])
        }
      } else {
        setTasks([])
      }
    }

    fetchTasks()
  }, [isAuthenticated])

  return (
    <div className='dash-card-preview'>
      {tasks.length === 0 ? (
        <span className='dash-empty-prev'>Nessun task previsto</span>
      ) : (
        tasks.map(t => <TaskCard key={t._id} task={t}/>)
      )}
    </div>
  )
}
