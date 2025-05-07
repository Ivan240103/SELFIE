import React, { useState, useEffect } from "react";
import axios from 'axios';
import { useTime } from '../../contexts/TimeContext'
import { useAuth } from '../../contexts/AuthenticationContext';
import { showError } from '../../utils/toasts'

import {
  Card,
  CardHeader,
  CardBody
} from '@heroui/react'

function TaskCard({ task }) {
  const { time } = useTime()

  const notDoneColor = () => time > new Date(task.deadline) ? '#f87171' : '#fde68a'

  return (
    <Card
      style={{ backgroundColor: task.isDone ? '#86efac' : notDoneColor()}}
      classNames={{
        base: 'w-full p-1 lg:p-3',
        header: 'pb-0 flex flex-row items-center gap-3'
      }}
    >
      <CardHeader>
        <h3 className="font-bold">{task.title}</h3>
        <span>|</span>
        <time className="text-sm text-gray-800">
          {(new Date(task.deadline)).toLocaleString('it-IT').slice(0, 10)}
        </time>
      </CardHeader>
      <CardBody>
        <span className="truncate">{task.description}</span>
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
          const response = await axios.get(`${process.env.REACT_APP_API ?? ''}/api/tasks/notdone`, {
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
    <div className='lg:my-3 size-full flex items-center justify-center'>
      {tasks.length === 0 ? (
        <span className='text-gray-700'>Nessuna attività prevista</span>
      ) : (
        <div className="size-full grid grid-rows-3 gap-2 lg:gap-4">
          {tasks.map(t => <TaskCard key={t._id} task={t}/>)}
        </div>
      )}
    </div>
  )
}
