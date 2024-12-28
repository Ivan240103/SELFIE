import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../Auth/AuthenticationContext';
import TimeMachine from '../TimeMachine/TimeMachine';

import '../../css/Note.css';

function Notes() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate()

  const [notes, setNotes] = useState([]);
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [categories, setCategories] = useState('');
  const [selectedNoteIndex, setSelectedNoteIndex] = useState(null);
  const [sortCriteria, setSortCriteria] = useState('title');
  const [fetchNotes, setFetchNotes] = useState(0) // per segnalare la necessità di un get
  const [error, setError] = useState('')

  // verifica l'autenticazione
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login')
    }
  }, [isAuthenticated, navigate])

  // Caricare le note al montaggio del componente
  useEffect(() => {
    if (isAuthenticated) {
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
      .then((data) => {
        setNotes(data)
        setError('')
      })
      .catch((error) => setError('Errore:', error.message));
    }
  }, [isAuthenticated, fetchNotes]);

  // cambia l'ordinamento delle note
  // TODO: quando viene inserita una nuova nota si trova in disordine
  useEffect(() => {
    if (notes.length > 0) {
      let sortedNotes = [...notes];
      if (sortCriteria === 'title') {
        sortedNotes.sort((a, b) => a.title.localeCompare(b.title));
      } else if (sortCriteria === 'date') {
        sortedNotes.sort((a, b) => new Date(b.creation) - new Date(a.creation));
      } else if (sortCriteria === 'length') {
        sortedNotes.sort((a, b) => a.text.length - b.text.length);
      }
      setNotes(sortedNotes);
    }
  }, [sortCriteria]);

  // Funzione per salvare una nuova nota
  async function handleSaveNote() {
    if (!title.trim()) {
      alert('Il titolo non può essere vuoto!');
      return;
    }
    const cleanCat = categories.split(',').map((c) => c.trim()).filter((c) => c !== '').join(',')
    const payload = {
      title: title.trim(),
      categories: cleanCat,
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
      setFetchNotes(prev => prev + 1)
      resetForm();
    } catch (error) {
      setError('Errore:', error.message);
    }
  }

  // Funzione per modificare una nota esistente
  async function handleEditNote(index) {
    if (!title.trim()) {
      alert('Il titolo non può essere vuoto!');
      return;
    }
    const noteId = notes[index]._id; // Assumi che ogni nota abbia un campo _id
    const cleanCat = categories.split(',').map((c) => c.trim()).filter((c) => c !== '').join(',')
    const payload = {
      title: title.trim(),
      categories: cleanCat,
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
      setFetchNotes(prev => prev + 1)
      resetForm();
    } catch (error) {
      setError('Errore:', error.message);
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
      setFetchNotes(prev => prev + 1)
    } catch (error) {
      setError('Errore nell\'eliminazione della nota:', error.message);
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
    setTitle(notes[index].title);
    setCategories(notes[index].categories);
    setText(notes[index].text);
    setSelectedNoteIndex(index);
  }

  /* TODO: copia e incolla del contenuto + duplicazione
  function handleDuplicateNote(index) {
    const note = notes[index];
    const now = new Date().toISOString();
    const duplicatedNote = {
      ...note,
      creationDate: now,
      lastModifiedDate: now,
    };
    const updatedNotes = [...notes, duplicatedNote];
    setNotes(updatedNotes);
    onNoteSave && onNoteSave(updatedNotes);
  }

  async function handleCopyContent(index) {
    const note = notes[index];
    try {
      await navigator.clipboard.writeText(note.text);
      alert('Contenuto copiato negli appunti!');
    } catch (error) {
      alert('Errore nella copia:', error.response.data || 'no response');
    }
  }

  function handlePasteContent() {
    navigator.clipboard.readText().then((clipText) => {
      setText(clipText);
    }).catch((error) => {
      alert('Errore nella lettura degli appunti:', error.response.data || 'no response');
    });
  } */

  return (
    <div>
      {isAuthenticated && <>
        <TimeMachine />
        <div className="notes-container">
          <h1 className="notes-header">Note</h1>
          <p>{error}</p>
          <div className="notes-form">
            <h4>{selectedNoteIndex === null ? 'Crea Nuova Nota' : 'Modifica Nota'}</h4>
            {/* TODO: trasformare textarea in input text */}
            <textarea
              placeholder="Titolo..."
              className="note-form-textarea"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            {/* TODO: campo input con bottone per aggiungerle alla stringa? */}
            <textarea
              placeholder="Categorie (separate da virgola)..."
              className="note-form-textarea"
              value={categories}
              onChange={(e) => setCategories(e.target.value)}
            />
            <textarea
              placeholder="Scrivi il contenuto della nota qui..."
              className="note-form-textarea"
              value={text}
              onChange={(e) => setText(e.target.value)}
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
            <select
              className="notes-sort-select"
              value={sortCriteria}
              onChange={(e) => setSortCriteria(e.target.value)}
            >
              <option value="title">Titolo (Alfabetico)</option>
              <option value="date">Data di Creazione</option>
              <option value="length">Lunghezza del Contenuto</option>
            </select>
          </div>

          <ul className="notes-list">
            {notes.map((n, index) => {
              const preview = n.text.length > 200 ? n.text.slice(0, 200) + '...' : n.text;
              const showTime = (d) => d.toLocaleString('it-IT').slice(0, 16).replace('T', ' alle ')
              return (
                <li key={n._id} className="note-item">
                  <div>
                    <strong>{n.title}</strong>
                  </div>
                  <div>
                    <p>Tags: {n.categories.split(',').map(n => `#${n}`).join(' ')}</p>
                  </div>
                  <div>
                    <p>Creata il: {showTime(n.creation)}</p>
                  </div>
                  <div>
                    <p>Ultima modifica: {showTime(n.modification)}</p>
                  </div>
                  <p>{preview}</p>
                  <button onClick={() => handleStartEdit(index)}>Modifica</button>
                  <button onClick={() => handleDeleteNote(index)}>Elimina</button>
                </li>
              );
            })}
          </ul>
        </div>
      </>}
    </div>
  );
}

export default Notes;
