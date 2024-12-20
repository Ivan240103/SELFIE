import React, { useState } from 'react';

function Task({ onSaveTask }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [deadline, setDeadline] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();

    const token = localStorage.getItem("token"); // Recupera il token
    console.log("Token recuperato:", token);

    if (!token) {
        alert("Token non trovato! Assicurati di essere autenticato.");
        return;
    }
    const newTask = {
        title: title,
        description: description,
        deadline: deadline,
        owner: token
      };

    try {
        const response = await fetch("http://localhost:8000/api/tasks/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: "Bearer ${token}", // Usa il token recuperato
            },
            body: JSON.stringify(newTask),
        });

        if (response.ok) {
            const createdTask = await response.json();
            onSaveTask(createdTask);
            setTitle("");
            setDescription("");
            setDeadline("");
        } else {
            const errorText = await response.text();
            console.error("Errore durante la creazione della task:", errorText);
            alert(`Errore: ${errorText}`);
        }
    } catch (error) {
            console.error("Errore nel salvataggio della task:", error);
            alert(`Errore: ${error.message}`);
        }
  }

  return (
    <form onSubmit={handleSubmit} className="task-form">
        <h3>Crea una nuova Task</h3>
        <div>
            <label>Titolo:</label>
            <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            />
        </div>
        <div>
            <label>Descrizione:</label>
            <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            />
        </div>
        <div>
            <label>Deadline:</label>
            <input
            type="date"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            required
            />
        </div>
        <button type="submit">Crea Task</button>
        </form>
    );
}

export default Task;
