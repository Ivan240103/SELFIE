import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTime } from '../../contexts/TimeContext';
import TitleDescription from './FormFields/TitleDescription';
import Reminder from './FormFields/Reminder';
import { getDateString } from '../../utils/dates';
import { calcReminder, remindersToString } from '../../utils/reminders';
import { showError, showSuccess } from '../../utils/toasts';

import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  Form,
  DatePicker,
  Checkbox,
  ButtonGroup,
  Button
} from "@heroui/react";
import { parseDate } from "@internationalized/date";

function Task({
  taskId, user, onSaveTask, onUpdateTask, onDeleteTask, isModalOpen, setIsModalOpen
}) {
  // tempo in vigore per l'utente (fuso orario UTC)
  const { time } = useTime();
  const navigate = useNavigate()
  const [task, setTask] = useState({});
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [deadline, setDeadline] = useState(new Date());
  const [isDone, setIsDone] = useState(false);
  const [emailReminder, setEmailReminder] = useState({})
  const [pushReminder, setPushReminder] = useState({})
  const [tomatoId, setTomatoId] = useState(null)
  const [isEditing, setIsEditing] = useState(!!!taskId)
  const tomato = localStorage.getItem('tomato') ?? null

  // recupera il task specifico dal backend
  useEffect(() => {
    const fetchTask = async () => {
      if (taskId) {
        try {
          const response = await fetch(`${process.env.REACT_APP_API}/api/tasks/${taskId}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          });
          if (response.ok) { 
            const task = await response.json();
            setTask(task)
          } else {
            throw new Error()
          }
        } catch (error) {
          showError("Couldn't retrieve task")
          setTask({})
        }
      } else {
        setTask({})
      }
    }

    fetchTask()
  }, [taskId])

  // popola i campi
  useEffect(() => {
    const setFields = () => {
      setTitle(tomato ? "Pomodoro" : task.title || "")
      setDescription(tomato ? getTomatoDescription(tomato) : task.description || "")
      setDeadline(task.deadline ? new Date(task.deadline) : time)
      setIsDone(task.isDone ?? false)
      if (task.reminders) {
        task.reminders.split(',').forEach(reminder => {
          const r = reminder.split(':')
          const calc = calcReminder(parseInt(r[1]))
          if (r[0] === "email") {
            setEmailReminder({ checked: true, method: r[0], ...calc })
          } else if (r[0] === "push") {
            setPushReminder({ checked: true, method: r[0], ...calc })
          }
        })
      } else {
        setEmailReminder({ checked: false, method: 'email', before: 15, time: 'm' })
        setPushReminder({ checked: false, method: 'push', before: 15, time: 'm' })
      }
      setTomatoId(task.tomatoId ?? null)
    }

    setFields()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [task])

  function getTomatoDescription(t) {
    return `${t.loops} ${t.loops === 1 ? 'ciclo' : 'cicli'} da ${t.studyMinutes} ${tomato.studyMinutes === 1 ? 'minuto ' : 'minuti '}
      di studio + ${t.pauseMinutes} ${tomato.pauseMinutes === 1 ? 'minuto' : 'minuti'} di pausa`
  }

  const saveTomato = async (t) => {
    const tomatoData = {
      studyMinutes: t.studyMinutes,
      pauseMinutes: t.pauseMinutes,
      loops: t.loops
    }

    try {
      const response = await fetch(`${process.env.REACT_APP_API}/api/tomatoes/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(tomatoData)
      });

      if (!response.ok) {
        throw new Error();
      }
      const result = await response.json()
      return result._id
    } catch (error) {
      showError('Errore nel salvataggio del pomodoro')
    }
  }

  const handleSave = async () => {
    const tomatoId = tomato ? await saveTomato(tomato) : null

    const taskData = {
      title: title,
      description: description,
      deadline: deadline.toISOString(),
      reminders: remindersToString(emailReminder, pushReminder),
      tomatoId: tomatoId
    };

    try {
      const response = await fetch(`${process.env.REACT_APP_API}/api/tasks/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(taskData)
      });

      if (!response.ok) {
        throw new Error();
      }
      const result = await response.json()
      showSuccess(tomato ? 'Pomodoro salvato' : 'Attività salvata')
      if (tomato) {
        localStorage.removeItem('tomato')
      }
      onSaveTask(result)
    } catch (error) {
      showError("Errore nel salvataggio dell'attività")
    }
  }

  const handleUpdate = async () => {
    const taskData = {
      title: title,
      description: description,
      deadline: deadline.toISOString(),
      reminders: remindersToString(emailReminder, pushReminder)
    };

    try {
      const response = await fetch(`${process.env.REACT_APP_API}/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(taskData)
      });

      if (!response.ok) {
        throw new Error();
      }
      const result = await response.json();
      showSuccess('Attività aggiornata');
      onUpdateTask(result);
    } catch (error) {
      showError("Errore nell'aggiornamento")
      handleReset()
    }
  }

  const handleDelete = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API}/api/tasks/${taskId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error();
      }
      showSuccess('Attività eliminata');
      onDeleteTask(taskId);
    } catch (error) {
      showError("Errore nell'eliminazione")
    }
  }

  const handleComplete = async (v) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API}/api/tasks/toggle/${taskId}`, {
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
      setIsDone(v)
      setTimeout(() => {
        showSuccess(`Attività segnata come ${v ? '' : 'non'} completata`)
        onUpdateTask(result)
      }, 500);
    } catch (error) {
      showError("Errore nel completamento")
    }
  }

  // artificio per resettare i campi del form
  const handleReset = () => {
    setIsEditing(false)
    setTask(JSON.parse(JSON.stringify(task)))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setIsEditing(false)
    if (taskId) {
      await handleUpdate()
    } else {
      await handleSave()
    }
  }

  return (
    <Modal
      className='min-w-[32vw] lg:px-5 py-3'
      classNames={{ header: 'text-xl' }}
      isOpen={isModalOpen}
      onClose={() => setIsModalOpen(false)}
      draggable
      tabIndex={2}
    >
      <ModalContent>
        <ModalHeader>
          {tomato ? 'Pomodoro' : 'Attività'}
        </ModalHeader>
        <ModalBody className='w-full lg:w-[88%] m-auto'>
          {!isEditing && <Checkbox
            className='ml-2 mb-2'
            color='success'
            isSelected={isDone}
            onValueChange={handleComplete}
          >
            Completata
          </Checkbox>}
          <Form
            className="flex flex-col items-center"
            validationBehavior="native"
            onSubmit={handleSubmit}
          >
            <TitleDescription
              title={title}
              setTitle={setTitle}
              description={description}
              setDescription={setDescription}
              isEditing={isEditing}
            />
            <DatePicker
              label='Scadenza'
              description='Entro quando deve essere completata'
              showMonthAndYearPickers
              firstDayOfWeek='mon'
              value={parseDate(getDateString(deadline))}
              onChange={(d) => setDeadline(d.toDate())}
              isRequired
              isReadOnly={!isEditing}
            />
            {tomatoId && !isEditing && <Button
              className='w-40'
              type='button'
              color='danger'
              variant='solid'
              onPress={() => {
                localStorage.setItem('taskId', taskId)
                navigate('/tomato')
              }}
            >
              Vai alla sessione
            </Button>}
            {user.notification && <div className='self-start w-full ml-1'>
              <span className='block text-gray-800 self-start'>Promemoria</span>
              <Reminder
                type='Email'
                reminder={emailReminder}
                setReminder={setEmailReminder}
                isEditing={isEditing}
              />
              <Reminder
                type='Push'
                reminder={pushReminder}
                setReminder={setPushReminder}
                isEditing={isEditing}
              />
            </div>}
            {!taskId ? (
              <ButtonGroup>
                <Button className='w-32' type='submit' color='primary' variant='solid'>
                  Crea attività
                </Button>
              </ButtonGroup>
            ) : isEditing && (
              <ButtonGroup className='mt-1'>
                <Button className='w-36 lg:w-40' type='button' color='primary' variant='flat' onPress={handleReset}>
                  Annulla modifiche
                </Button>
                <Button className='w-36 lg:w-40' type='submit' color='primary' variant='solid'>
                  Aggiorna attività
                </Button>
              </ButtonGroup>
            )}
          </Form>
          {taskId && !isEditing && (
            <ButtonGroup>
              <Button className='w-36 lg:w-40' color='danger' variant='flat' onPress={handleDelete}>
                Elimina attività
              </Button>
              <Button className='w-36 lg:w-40' color='primary' variant='solid' onPress={() => setIsEditing(true)}>
                Modifica attività
              </Button>
            </ButtonGroup>
          )}
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}

export default Task;
