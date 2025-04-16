import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios'
import clsx from 'clsx'
import { useTime } from '../../contexts/TimeContext';
import { useAuth } from '../../contexts/AuthenticationContext';
import { showError } from '../../utils/toasts'
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

function TaskCard({ task, onDetails }) {
  const { time } = useTime()

  const notDoneColor = () => time > new Date(task.deadline) ? '#f87171' : '#fde68a'

  return (
    <Card
      style={{ backgroundColor: task.isDone ? '#86efac' : notDoneColor()}}
      classNames={{
        base: 'w-full p-4 pb-2',
        header: 'font-bold text-lg p-1 ml-4',
        body: 'flex flex-col gap-1 px-4 py-2',
        footer: 'flex flex-row justify-end p-0'
      }}
    >
      <CardHeader>{task.title}</CardHeader>
      <CardBody>
        <DatePicker
          classNames={{
            inputWrapper: clsx({
              'bg-green-200': task.isDone,
              'bg-amber-100': !task.isDone && time <= new Date(task.deadline),
              'bg-red-300': !task.isDone && time > new Date(task.deadline)
            })
          }}
          label='Scadenza'
          value={parseDate(getDateString(new Date(task.deadline)))}
          isReadOnly
        />
        <Textarea
          classNames={{
            inputWrapper: clsx({
              'bg-green-200': task.isDone,
              'bg-amber-100': !task.isDone && time <= new Date(task.deadline),
              'bg-red-300': !task.isDone && time > new Date(task.deadline)
            })
          }}
          label='Descrizione'
          value={task.description}
          minRows={2}
          maxRows={4}
          isReadOnly
        />
      </CardBody>
      <CardFooter>
        <Button
          className='mr-4'
          color='primary'
          variant='light'
          onPress={() => onDetails(task._id)}
        >
          Dettagli
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
  const [doneCount, setDoneCount] = useState(0);
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

  useEffect(() => {
    setDoneCount(tasks.filter(t => t.isDone).length)
  }, [tasks])

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

  function openDetails(id) {
    setSelectedTaskId(id)
    setIsTaskOpen(true)
  }

  return (
    <div>
      <Header />
      <div className='w-[60vw] mx-auto mt-8 pb-8'>
        <h2 className='text-3xl'>Le tue attività</h2>
        <Tabs
          classNames={{
            base: 'w-full flex flex-row justify-center mt-8',
            panel: 'w-3/5 m-auto pt-6 flex flex-col items-center gap-4'
          }}
          color='secondary'
          variant='underlined'
        >
          <Tab title={`Da completare (${tasks.length - doneCount})`}>
            {doneCount < tasks.length ? (
              tasks.filter(t => !t.isDone).map(t => (
                <TaskCard
                  key={t._id}
                  task={t}
                  onDetails={openDetails}
                />
              ))
            ) : (
              <span className='text-gray-700 mt-[20vh]'>
                Nessuna attività da completare
              </span>
            )}
          </Tab>
          <Tab title='Completate'>
            {doneCount > 0 ? (
              tasks.filter(t => t.isDone).reverse().map(t => (
                <TaskCard
                  key={t._id}
                  task={t}
                  onDetails={openDetails}
                />
              ))
            ) : (
              <span className='text-gray-700 mt-[20vh]'>
                Nessuna attività completata
              </span>
            )}
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
