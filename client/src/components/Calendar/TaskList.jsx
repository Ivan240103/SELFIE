import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios'
import { useTime } from '../../contexts/TimeContext';
import { useAuth } from '../../contexts/AuthenticationContext';
import { showError, showSuccess } from '../../utils/toasts'
import { getDateString } from '../../utils/dates';
import Header from '../Header/Header'
import Task from "./Task";

import {
  Tabs,
  Tab,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  DatePicker,
  Textarea,
  Button
} from '@heroui/react'
import { parseDate } from "@internationalized/date";

function TaskCard({ task, onComplete, onDetails }) {
  const { time } = useTime()

  const notDoneColor = () => time > new Date(task.deadline) ? '#f87171' : '#fde68a'

  return (
    <Card
      style={{ backgroundColor: task.isDone ? '#86efac' : notDoneColor()}}
    >
      <CardHeader>
        <h3>{task.title}</h3>
      </CardHeader>
      <CardBody>
        <DatePicker
          label='Scadenza'
          value={parseDate(getDateString(new Date(task.deadline)))}
          isReadOnly
        />
        <Textarea
          label='Descrizione'
          value={task.description}
          minRows={2}
          maxRows={4}
          isReadOnly
        />
      </CardBody>
      <CardFooter>
        <Button color='primary' variant='light' onPress={() => onDetails(task._id)}>
          Dettagli
        </Button>
        <Button
          color={task.isDone ? 'default' : 'success'}
          variant='flat'
          onPress={() => onComplete(!task.isDone, task._id)}
        >
          {task.isDone ? "Non completata" : "Completata"}
        </Button>
      </CardFooter>
    </Card>
  )
}

function TaskList() {
  const { isAuthenticated, checkAuth } = useAuth();
  const navigate = useNavigate()
  const [user, setUser] = useState({})
  const [tasks, setTasks] = useState([]);
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [isTaskOpen, setIsTaskOpen] = useState(false);

  // verifica dell'autenticazione
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => checkAuth(navigate), [])

  // recupera il profilo utente
  useEffect(() => {
    const fetchUser = async () => {
      if (isAuthenticated) {
        try {
          const response = await axios.get(`${process.env.REACT_APP_API}/api/users/`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
          })
          setUser(response.data)
        } catch (error) {
          showError('fetchUser error')
          setUser({})
        }
      } else {
        setUser({})
      }
    }

    fetchUser()
  }, [isAuthenticated])

  // recupera tutti i task dell'utente
  useEffect(() => {
    const fetchTasks = async () => {
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
            const tasks = await response.json()
            setSortedTasks(tasks)
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

    fetchTasks()
  }, [isAuthenticated]);

  function setSortedTasks(tasks) {
    const sorted = tasks.sort((a, b) => {
      return new Date(a.deadline) - new Date(b.deadline)
    })
    setTasks(sorted)
  }

  function handleTaskSave(task) {
    setIsTaskOpen(false)
    setSortedTasks(prev => [...prev, task]);
  }

  function handleTaskUpdate(task) {
    setIsTaskOpen(false)
    const updatedTasks = tasks.map(t => t._id === task._id ? task : t)
    setSortedTasks(updatedTasks);
  }

  function handleTaskDelete(taskId) {
    setIsTaskOpen(false)
    const updatedTasks = tasks.filter(t => t._id !== taskId)
    setSortedTasks(updatedTasks);
  }

  async function handleComplete(v, id) {
    try {
      const response = await fetch(`${process.env.REACT_APP_API}/api/tasks/toggle/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ isDone: v })
      });

      if (!response.ok) {
        throw new Error()
      }
      const result = await response.json()
      setTimeout(() => {
        showSuccess(`Attività segnata come ${v ? '' : 'non'} completata`)
        handleTaskUpdate(result)
      }, 500);
    } catch (error) {
      showError("Errore nel completamento")
    }
  }

  function openDetails(id) {
    setSelectedTaskId(id)
    setIsTaskOpen(true)
  }

  return (
    <div>
      <Header />
      <div className='w-[60vw] mx-auto'>
        <h2 className='text-2xl'>Le tue attività</h2>
        <Tabs
          classNames={{
            base: 'w-full flex flex-row justify-center mt-8'
          }}
          color='secondary'
        >
          <Tab title={`Da completare (${tasks.filter(t => !t.isDone).length})`}>
            {tasks.filter(t => !t.isDone).map(t => (
              <TaskCard
                task={t}
                onComplete={handleComplete}
                onDetails={openDetails}
              />
            ))}
          </Tab>
          <Tab title='Completate'>
            {tasks.filter(t => t.isDone).map(t => (
              <TaskCard
                key={t._id}
                task={t}
                onComplete={handleComplete}
                onDetails={openDetails}
              />
            ))}
          </Tab>
        </Tabs>
        {isTaskOpen && <Task
          taskId={selectedTaskId}
          user={user}
          onSaveTask={handleTaskSave}
          onUpdateTask={handleTaskUpdate}
          onDeleteTask={handleTaskDelete}
          isModalOpen={isTaskOpen}
          setIsModalOpen={setIsTaskOpen}
        />}
      </div>
    </div>
  );
};

export default TaskList;
