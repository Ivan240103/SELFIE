import React, { useState, useEffect } from 'react';
import { useTimeMachine } from '../../contexts/TimeContext'
import { getDatetimeString } from '../../utils/dates';

import '../../css/Task.css';

/* X PAYAM
Fai una cosa come ho fatto in Event.jsx --> alla selezione del task
passa l'id al componente. Nel componente metti uno useEffect che prende
i dati dalla route specifica e un secondo useEffect che imposta i valori
degli state (da creare uno per ogni campo del task ESCLUSO owner).

Come in Event.jsx creare un <Modal> da 'react-modal' che abbia
le stesse funzionalità, e in più solo in modalità visualizzazione 
mettere un button per segnarlo come completato (usare la route)
*/

function Task({ onSaveTask, onUpdateTask, onDeleteTask, taskDetails, selectedTasks, user }) {
  const { time } = useTimeMachine();

  const [showModal, setShowModal] = useState(false);
  const [task, setTask] = useState({});
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [deadline, setDeadline] = useState(time);
  const [isDone, setIsDone] = useState(false);
  const [emailReminder, setEmailReminder] = useState(
    { checked: false, method: 'email', before: 15, time: 'm' }
  )
  const [pushReminder, setPushReminder] = useState(
    { checked: false, method: 'push', before: 15, time: 'm' }
  )

  useEffect(() => {
    const fetchTask = async () => {
      if (taskDetails) {
        try {
          const response = await fetch(`${process.env.REACT_APP_API}/api/tasks/${taskDetails}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          });
          const task = await response.json();
          setTask(task)
        } catch (error) {
          alert(error.message || 'no response')
        }
      } else {
        setTask({})
      }
    }

    fetchTask()
  }, [taskDetails])

  useEffect(() => {
    if (taskDetails) {
      setShowModal(true); // Apri il Modal automaticamente quando c'è un task selezionato
    }
  }, [taskDetails]);

  // popola i campi per riempire il form
  useEffect(() => {
    const setFields = () => {
      setTitle(task.title || "")
      setDescription(task.description || "")
      setDeadline(task.deadline ? new Date(task.deadline) : time)
      if (task?.reminders) {
        task.reminders.split(',').forEach(reminder => {
          const r = reminder.split(':')
          const calc = calcReminder(parseInt(r[1]))
          if (r[0] === "email") {
            setEmailReminder({ checked: true, method: r[0], ...calc })
          } else if (r[0] === "push") {
            setPushReminder({ checked: true, method: r[0], ...calc })
          }
        })
      }
    }

    setFields()
  }, [task])

  function calcReminder(minutes) {
    if (minutes < 60) {
      return { before: minutes, time: 'm' }
    } else if (minutes < 60*24) {
      return { before: minutes / 60, time: 'h' }
    } else {
      return { before: minutes / (60*24), time: 'd'}
    }
  }

  function remindersToString() {
    const rem = []
    if (emailReminder.checked) {
      const minutes = emailReminder.time === 'm' ? emailReminder.before :
        emailReminder.time === 'h' ? emailReminder.before * 60 : emailReminder.before * 60 * 24
      rem.push(`${emailReminder.method}:${minutes}`)
    }
    if (pushReminder.checked) {
      const minutes = pushReminder.time === 'm' ? pushReminder.before :
        pushReminder.time === 'h' ? pushReminder.before * 60 : pushReminder.before * 60 * 24
      rem.push(`${pushReminder.method}:${minutes}`)
    }
    return rem.length > 0 ? rem.join(',') : ''
  }

  function handleInputChange(e) {
    const { name, value } = e.target;
    setTask({ ...task, [name]: value });
  }

  const handleSaveTask = async () => {
    const reminders = remindersToString()
    const taskData = {
      title: title,
      description: description,
      deadline: deadline.toISOString(),
      reminders: reminders
    };
    try {
      // Preparazione della chiamata POST
      const response = await fetch(`${process.env.REACT_APP_API}/api/tasks/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(taskData)
      });

      setShowModal(false);
    } catch (error) {
      alert('Errore nella chiamata POST:', error.message || 'no response');
    }
  }

  async function handleUpdateTask() {
    const reminders = remindersToString()
    const updatedTask = {
      title: title,
      description: description,
      deadline: deadline.toISOString(),
      reminders: reminders
    };
    try {
      const response = await fetch(`${process.env.REACT_APP_API}/api/tasks/${taskDetails.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(updatedTask)
      });
      const result = await response.json();
      alert('Task aggiornata con successo!');
      onUpdateTask({ ...updatedTask, id: taskDetails });
    } catch (error) {
      alert('Errore nella chiamata PUT:', error.message || 'no response');
    }
  }

  async function handleDeleteTask() {
    if (selectedTasks.length > 0) {
      selectedTasks.forEach(async (taskId) => {
        try {
          const response = await fetch(`${process.env.REACT_APP_API}/api/tasks/${taskId}`, {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          });

          if (response.ok) {
            alert(`Task con ID ${taskId} eliminata con successo!`);
            onDeleteTask(taskDetails);
            // Puoi inviare una richiesta GET per aggiornare la lista delle task
          } else {
            alert('Errore durante l\'eliminazione delle task!');
          }
        } catch (error) {
          alert('Errore nella chiamata DELETE:', error.message || 'no response');
        }
      });
    }
  }

  async function handleCompleteTask() {
    const completedTask = {
      isDone: isDone
    };
    if (selectedTasks.length > 0) {
      selectedTasks.forEach(async (taskId) => {
        try {
          const response = await fetch(`${process.env.REACT_APP_API}/api/tasks/toggle/${taskId}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(completedTask)
          });
          if (response.ok) {
            const result = await response.json();
            // Aggiorna il colore e lo stato della task localmente
            onUpdateTask({ id: taskId, color: 'green', isDone: true })
            alert('Task completata con successo!');
          }
        } catch (error) {
          alert('Errore nella chiamata PUT:', error.message || 'no response');
        }
      });
    }
  }

  return (
    <div>
      <button onClick={() => setShowModal(true)}>Aggiungi Task</button>

      {showModal && (
        // TODO: passare ad un tag Modal
        <div className="modal">
          <div className="modal-content">
            <h2>{taskDetails ? 'Modifica Task' : 'Crea una nuova Task'}</h2>
            <form>
              <label>Titolo:</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              <label>Scadenza:</label>
              <input
                type="datetime-local"
                value={getDatetimeString(deadline)}
                onChange={(e) => setDeadline(new Date(e.target.value))}
              />
              <label>Descrizione:</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
              {user.notification && <div>
                <label>Promemoria</label>
                <br />
                <input
                  type="checkbox"
                  checked={emailReminder.checked}
                  onChange={e => setEmailReminder(prev => ({
                    ...prev,
                    checked: e.target.checked
                  }))}
                /> Email
                <input
                  type="number"
                  min={emailReminder.time === 'm' ? 5 : 1}
                  disabled={!emailReminder.checked}
                  value={emailReminder.before}
                  onChange={e => setEmailReminder(prev => ({
                    ...prev,
                    before: e.target.value
                  }))}
                />
                <select
                  disabled={!emailReminder.checked}
                  value={emailReminder.time}
                  onChange={e => setEmailReminder(prev => ({
                    ...prev,
                    time: e.target.value
                  }))}
                >
                  <option value='m'>{emailReminder.before === '1' ? 'Minuto' : 'Minuti'}</option>
                  <option value='h'>{emailReminder.before === '1' ? 'Ora' : 'Ore'}</option>
                  <option value='d'>{emailReminder.before === '1' ? 'Giorno' : 'Giorni'}</option>
                </select> prima
                <br />
                <input
                  type="checkbox"
                  checked={pushReminder.checked}
                  onChange={e => setPushReminder(prev => ({
                    ...prev,
                    checked: e.target.checked
                  }))}
                /> Push
                <input
                  type="number"
                  min={pushReminder.time === 'm' ? 5 : 1}
                  disabled={!pushReminder.checked}
                  value={pushReminder.before}
                  onChange={e => setPushReminder(prev => ({
                    ...prev,
                    before: e.target.value
                  }))}
                />
                <select
                  disabled={!pushReminder.checked}
                  value={pushReminder.time}
                  onChange={e => setPushReminder(prev => ({
                    ...prev,
                    time: e.target.value
                  }))}
                >
                  <option value='m'>{pushReminder.before === '1' ? 'Minuto' : 'Minuti'}</option>
                  <option value='h'>{pushReminder.before === '1' ? 'Ora' : 'Ore'}</option>
                  <option value='d'>{pushReminder.before === '1' ? 'Giorno' : 'Giorni'}</option>
                </select> prima
              </div>}
            </form>
            <button onClick={taskDetails ? handleUpdateTask : handleSaveTask}>
              {taskDetails ? 'Aggiorna Task' : 'Salva Task'}
            </button>
            <button onClick={() => setShowModal(false)}>Chiudi</button>
          </div>
        </div>
      )}
      {selectedTasks.length > 0 && (
        <div>
          <button onClick={handleDeleteTask}>Elimina Task Selezionate</button>
          <button onClick={handleCompleteTask}>Task Completata</button>
        </div>
      )}
    </div>
  );
}

export default Task;