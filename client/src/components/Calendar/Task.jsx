import React, { useState, useEffect } from 'react';
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

function Task({ onSaveTask, tasks, selectedTasks, taskToEdit }) {
    const [showModal, setShowModal] = useState(false);
    const [taskDetails, setTaskDetails] = useState({
        title: '',
        deadline: '',
        completed: false
    });

// Carica i dati della task selezionata per la modifica
    useEffect(() => {
        if (taskToEdit) {
        setTaskDetails({
            title: taskToEdit.title,
            deadline: taskToEdit.start.split('T')[0], // Formatta la data come 'YYYY-MM-DD'
            completed: taskToEdit.completed || false,
        });
        setShowModal(true);
        }
    }, [taskToEdit]);  

  function handleInputChange(e) {
    const { name, value } = e.target;
    setTaskDetails({ ...taskDetails, [name]: value });
  }

  async function handleSaveTask() {
    if (taskDetails.title && taskDetails.deadline) {
        try {
            // Preparazione della chiamata POST
            const response = await fetch(`${window.location.origin}/api/tasks/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}` // Se necessario
                },
                body: JSON.stringify({
                    title: taskDetails.title,
                    deadline: taskDetails.deadline,
                    completed: taskDetails.completed,
                })
            });

            if (response.ok) {
                const newTask = await response.json();
                // Aggiungi la task al calendario
                onSaveTask({ ...newTask, color: 'yellow' });
                setTaskDetails({ title: '', deadline: '', completed: false });
                setShowModal(false);
                return
            } else {
                alert('Errore durante il salvataggio della task!');
            }
      } catch (error) {
        console.error('Errore nella chiamata POST:', error);
      }
    } else {
        alert('Titolo e scadenza sono obbligatori!');
    }
  }

  async function handleUpdateTask() {
    if (taskToEdit && taskDetails.title && taskDetails.deadline) {
        try {
            const response = await fetch(`${window.location.origin}/api/tasks/${taskToEdit.id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({
                title: taskDetails.title,
                deadline: taskDetails.deadline,
                completed: taskDetails.completed,
            })
            });

            if (response.ok) {
                const updatedTask = await response.json();
                alert('Task aggiornata con successo!');
            // Puoi chiamare un metodo per aggiornare le task nella lista
            } else {
                alert('Errore durante l\'aggiornamento della task!');
            }
      } catch (error) {
        console.error('Errore nella chiamata PUT:', error);
        alert('Errore nella connessione al server.');
      }
    } else {
        alert('Titolo e scadenza sono obbligatori!');
    }
  }

  async function handleDeleteSelectedTasks() {
    if (selectedTasks.length > 0) {
        selectedTasks.forEach(async (taskId) => {
            try {
            const response = await fetch(`${window.location.origin}/api/tasks/${taskId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (response.ok) {
                alert(`Task con ID ${taskId} eliminata con successo!`);
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
  

  return (
    <div>
      <button onClick={() => setShowModal(true)}>Aggiungi Task</button>

      {showModal && (
        <div className="modal">
          <div className="modal-content">
            <h2>{taskToEdit ? 'Modifica Task' : 'Crea una nuova Task'}</h2>
            <form>
              <label>
                Titolo:
                <input
                  type="text"
                  name="title"
                  value={taskDetails.title}
                  onChange={handleInputChange}
                />
              </label>
              <label>
                Scadenza:
                <input
                  type="date"
                  name="deadline"
                  value={taskDetails.deadline}
                  onChange={handleInputChange}
                />
              </label>
            </form>
            {taskToEdit ? (
              <button onClick={handleUpdateTask}>Aggiorna Task</button>
            ) : (
              <button onClick={handleSaveTask}>Salva Task</button>
            )}
            <button onClick={() => setShowModal(false)}>Chiudi</button>
          </div>
        </div>
      )}

      <h3>Task</h3>
      <ul>
        {tasks.map(task => (
          <li key={task.id}>
            {task.title} - Scadenza: {new Date(task.start).toLocaleDateString()}
          </li>
        ))}
      </ul>

      {selectedTasks.length > 0 && (
        <button onClick={handleDeleteSelectedTasks}>
          Elimina {selectedTasks.length} task selezionate
        </button>
      )}
    </div>
  );
}

export default Task;