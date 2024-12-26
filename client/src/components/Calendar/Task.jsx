import React, { useState, useEffect } from 'react';
import { useTimeMachine } from '../TimeMachine/TimeMachineContext'
import { 
    datetimeToString,
    datetimeToDateString
} from '../../services/dateServices';

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

function Task({ onSaveTask, onUpdateTask, onDeleteTask, taskDetails, selectedTasks }) {
    const { time } = useTimeMachine();
    const [showModal, setShowModal] = useState(false);
    const [task, setTask] = useState({});
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [deadline, setDeadline] = useState(time);
    const [isDone, setIsDone] = useState(false);

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
                  console.error(error)
              }
          } else {
              setTask({})
          }
      }

      fetchTask()
  }, [taskDetails])

  // popola i campi per riempire il form
  useEffect(() => {
      const setFields = () => {
        if (taskDetails) {
          setTitle(taskDetails.title || "")
          setDescription(taskDetails.description || "")
          setDeadline(taskDetails.deadline ? new Date(taskDetails.deadline) : time)
        }
      }
      
      setFields()
  }, [task])

  function handleInputChange(e) {
    const { name, value } = e.target;
    setTask({ ...task, [name]: value });
  }

  const handleSaveTask = async () => {
    const taskData = {
      title: title,
      description: description,
      deadline: deadline.toISOString(),
    };
    try {
      // Preparazione della chiamata POST
      const response = await fetch(`${process.env.REACT_APP_API}/api/tasks/`, {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('token')}` // Se necessario
          },
          body: JSON.stringify(taskData)
      });

      const result = await response.json();
      setShowModal(false);
    } catch (error) {
      console.error('Errore nella chiamata POST:', error);
    }
  }

  async function handleUpdateTask() {
    const updatedTask = {
      title: title,
      description: description,
      deadline: deadline.toISOString(),
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
      console.error('Errore nella chiamata PUT:', error);
      alert('Errore nella connessione al server.');
    }
  }

  async function handleDeleteTask() {
    if (selectedTasks.length > 0) {
        selectedTasks.forEach(async (taskId) => {
            try {
            const response = await fetch(`${process.env.REACT_APP_API}/api/tasks/${taskDetails.id}`, {
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
                console.error('Errore nella chiamata DELETE:', error);
                alert('Errore nella connessione al server.');
            }
        });
    }
  }
  
  async function handleCompleteTask() {
    const completedTask = {
      title: title,
      description: description,
      deadline: deadline.toISOString(),
    };
    try {
      const response = await fetch(`${process.env.REACT_APP_API}/api/tasks/toggle/${taskDetails.id}`, {
      method: 'PUT',
      headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(completedTask)
      });
      const result = await response.json();
      alert('Task completata!');
      setIsDone(true);
    } catch (error) {
      console.error('Errore nella chiamata PUT:', error);
      alert('Errore nella connessione al server.');
    }
  }

  return (
    <div>
      <button onClick={() => setShowModal(true)}>Aggiungi Task</button>

      {showModal && (
        <div className="modal">
          <div className="modal-content">
            <h2>{taskDetails ? 'Modifica Task' : 'Crea una nuova Task'}</h2>
            <form>
              <label>
                Titolo:
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </label>
              <label>
                Scadenza:
                <input
                  type="datetime-local"
                  value={datetimeToString(deadline)}
                  onChange={(e) => setDeadline(new Date(e.target.value))}
                />
              </label>
              <label>
                Descrizione:
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </label>
            </form>
            <button onClick={taskDetails ? handleUpdateTask : handleSaveTask}>
              {taskDetails ? 'Aggiorna Task' : 'Salva Task'}
            </button>
            <button onClick={() => setShowModal(false)}>Chiudi</button>
          </div>
        </div>
      )}
      {selectedTasks.length > 0 && (
        <button onClick={handleDeleteTask}>Elimina Task Selezionate</button>
      )}
    </div>
  );
}

export default Task;