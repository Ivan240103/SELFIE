import React, { useState, useEffect } from 'react';
import '../../css/Note.css';
import { useTimeMachine } from '../TimeMachine/TimeMachineContext'
import TimeMachine from '../TimeMachine/TimeMachine';
import { 
  datetimeToString,
  datetimeToDateString
} from '../../services/dateServices';

function Notes({ onNoteSave }) {
  const { time } = useTimeMachine();
  const [notes, setNotes] = useState([]);
  const [title, setTitle] = useState('');
  const [categories, setCategories] = useState('');
  const [text, setText] = useState('');
  const [selectedNoteIndex, setSelectedNoteIndex] = useState(null);
  const [sortCriteria, setSortCriteria] = useState('title');

  const now = new Date().toISOString(); // Data attuale in formato ISO

  // Caricare le note al montaggio del componente
  useEffect(() => {
    fetch(`${process.env.REACT_APP_API}/api/notes/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`, // Includi il token se necessario
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Errore nel recupero delle note');
        }
        return response.json();
      })
      .then((data) => setNotes(data))
      .catch((error) => console.error('Errore:', error));
  }, []);

  // Funzione per salvare una nuova nota
  async function handleSaveNote() {
    if (!title.trim()) {
      alert('Il titolo non può essere vuoto!');
      return;
    }
    const payload = {
      title: title.trim(),
      categories: categories.split(',').map((cat) => cat.trim()).filter(Boolean),
      creation: now,
      modification: null,
      text: text
    };

    try {
      // POST per creare una nuova nota
      const response = await fetch(`${process.env.REACT_APP_API}/api/notes/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error('Errore nella creazione della nota');

      // Aggiorna le note dopo la modifica
      await fetchNotes();
      resetForm();
    } catch (error) {
      console.error('Errore:', error);
    }
  }

  // Funzione per modificare una nota esistente
  async function handleEditNote(index) {
    if (!title.trim()) {
      alert('Il titolo non può essere vuoto!');
      return;
    }
    const noteId = notes[index]._id; // Assumi che ogni nota abbia un campo _id
    const payload = {
      title: title.trim(),
      categories: categories.split(',').map((cat) => cat.trim()).filter(Boolean),
      modification: now,
      text: text,
    };

    try {
      // PUT per aggiornare una nota
      const response = await fetch(`${process.env.REACT_APP_API}/api/notes/${noteId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error('Errore nell\'aggiornamento della nota');

      // Aggiorna le note dopo la modifica
      await fetchNotes();
      resetForm();
    } catch (error) {
      console.error('Errore:', error);
    }
  }

  // Funzione per eliminare una nota
  async function handleDeleteNote(index) {
    const noteId = notes[index]._id; // Assumi che ogni nota abbia un campo _id
    try {
      const response = await fetch(`${process.env.REACT_APP_API}/api/notes/${noteId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (!response.ok) throw new Error('Errore nell\'eliminazione della nota');

      // Aggiorna le note dopo l'eliminazione
      await fetchNotes();
    } catch (error) {
      console.error('Errore nell\'eliminazione della nota:', error);
    }
  }

  // Funzione per aggiornare le note dal server
  async function fetchNotes() {
    try {
      const response = await fetch(`${process.env.REACT_APP_API}/api/notes/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`, // Includi il token se necessario
        },
      });
      if (!response.ok) {
        throw new Error('Errore nel recupero delle note');
      }
      const data = await response.json();
      setNotes(data);
    } catch (error) {
      console.error('Errore:', error);
    }
  }

  // Funzione per reimpostare il modulo
  function resetForm() {
    setTitle('');
    setCategories('');
    setText('');
    setSelectedNoteIndex(null);
  }

  // Funzione per gestire la modifica di una nota esistente (apre il form con i dati della nota)
  function handleStartEdit(index) {
    const note = notes[index];
    setTitle(note.title);
    setCategories(Array.isArray(note.categories) ? note.categories.join(', ') : note.categories || '');
    setText(note.text);
    setSelectedNoteIndex(index);
  }

  // Funzione per gestire l'ordinamento delle note
  function handleSortChange(e) {
    setSortCriteria(e.target.value);
  }

  useEffect(() => {
    let sortedNotes = [...notes];
    if (sortCriteria === 'title') {
      sortedNotes.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortCriteria === 'date') {
      sortedNotes.sort((a, b) => new Date(a.creationDate) - new Date(b.creationDate));
    } else if (sortCriteria === 'length') {
      sortedNotes.sort((a, b) => a.text.length - b.text.length);
    }
    setNotes(sortedNotes);
  }, [sortCriteria]);

  return (
    <div>
      <TimeMachine />
      <div className="notes-container">
        <h1 className="notes-header">Note</h1>

        <div className="notes-form">
          <h4>{selectedNoteIndex === null ? 'Crea Nuova Nota' : 'Modifica Nota'}</h4>
          <textarea
            placeholder="Titolo..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="note-form-textarea"
          />
          <textarea
            placeholder="Categorie (separate da virgola)..."
            value={categories}
            onChange={(e) => setCategories(e.target.value)}
            className="note-form-textarea"
          />
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Scrivi il contenuto della nota qui..."
            className="note-form-textarea"
          />
          <button
            onClick={() => (selectedNoteIndex === null ? handleSaveNote() : handleEditNote(selectedNoteIndex))}
            className="note-save-button"
          >
            {selectedNoteIndex === null ? 'Salva Nota' : 'Aggiorna Nota'}
          </button>
        </div>

        <div className="notes-sort-controls">
          <label>Ordina per: </label>
          <select value={sortCriteria} onChange={handleSortChange} className="notes-sort-select">
            <option value="title">Titolo (Alfabetico)</option>
            <option value="date">Data di Creazione</option>
            <option value="length">Lunghezza del Contenuto</option>
          </select>
        </div>

        <ul className="notes-list">
          {notes.map((note, index) => {
            const categoriesDisplay = Array.isArray(note.categories)
            ? note.categories.join(', ')
            : note.categories || ''; // Se categories non è un array, mostra una stringa
            const preview = note.text.length > 200 ? note.text.slice(0, 200) + '...' : note.text;
            return (
              <li key={index} className="note-item">
                <div>
                  <strong>Titolo:</strong> {note.title}
                </div>
                <div>
                  <strong>Categorie:</strong> {categoriesDisplay}
                </div>
                <div>
                  <strong>Creata il:</strong> {note.creation}
                </div>
                <div>
                  <strong>Ultima modifica:</strong> {note.modification}
                </div>
                <p>
                  <strong>Anteprima:</strong> {preview}
                </p>
                <button onClick={() => handleStartEdit(index)}>Modifica</button>
                <button onClick={() => handleDeleteNote(index)}>Elimina</button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

export default Notes;
