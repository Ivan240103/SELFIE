import React, { useState, useEffect } from 'react';
import '../css/Note.css';

function Notes({ onNoteSave }) {
  const [notes, setNotes] = useState([]);
  const [title, setTitle] = useState('');
  const [categories, setCategories] = useState('');
  const [text, setText] = useState('');
  const [selectedNoteIndex, setSelectedNoteIndex] = useState(null);

  const [sortCriteria, setSortCriteria] = useState('title');

  useEffect(() => {
    sortNotes();
  }, [sortCriteria]);

  function handleSaveNote() {
    if (!title.trim()) {
      alert('Il titolo non può essere vuoto!');
      return;
    }

    const now = new Date().toISOString();
    if (selectedNoteIndex === null) {
      const newNote = {
        title: title.trim(),
        categories: categories.split(',').map(cat => cat.trim()).filter(Boolean),
        creationDate: now,
        lastModifiedDate: now,
        text: text,
      };
      const updatedNotes = [...notes, newNote];
      setNotes(updatedNotes);
      onNoteSave && onNoteSave(updatedNotes);
    } else {
      const updatedNotes = [...notes];
      updatedNotes[selectedNoteIndex] = {
        ...updatedNotes[selectedNoteIndex],
        title: title.trim(),
        categories: categories.split(',').map(cat => cat.trim()).filter(Boolean),
        text: text,
        lastModifiedDate: now,
      };
      setNotes(updatedNotes);
      onNoteSave && onNoteSave(updatedNotes);
    }

    setTitle('');
    setCategories('');
    setText('');
    setSelectedNoteIndex(null);
  }

  function handleEditNote(index) {
    const note = notes[index];
    setTitle(note.title);
    setCategories(note.categories.join(', '));
    setText(note.text);
    setSelectedNoteIndex(index);
  }

  function handleDeleteNote(index) {
    const updatedNotes = notes.filter((_, i) => i !== index);
    setNotes(updatedNotes);
    onNoteSave && onNoteSave(updatedNotes);
  }

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
      console.error('Errore nella copia:', error);
      alert('Impossibile copiare il contenuto!');
    }
  }

  function handlePasteContent() {
    navigator.clipboard.readText().then((clipText) => {
      setText(clipText);
    }).catch((error) => {
      console.error('Errore nella lettura degli appunti:', error);
      alert('Impossibile leggere dagli appunti!');
    });
  }

  function handleSortChange(e) {
    setSortCriteria(e.target.value);
  }

  function sortNotes() {
    let sortedNotes = [...notes];
    if (sortCriteria === 'title') {
      sortedNotes.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortCriteria === 'date') {
      sortedNotes.sort((a, b) => new Date(a.creationDate) - new Date(b.creationDate));
    } else if (sortCriteria === 'length') {
      sortedNotes.sort((a, b) => a.text.length - b.text.length);
    }
    setNotes(sortedNotes);
  }

  return (
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
          placeholder='Scrivi il contenuto della nota qui...'
          className="note-form-textarea"
        />
        <button onClick={handleSaveNote} className="note-save-button">
          {selectedNoteIndex === null ? 'Salva Nota' : 'Aggiorna Nota'}
        </button>
        <button onClick={handlePasteContent} className="note-paste-button">Incolla Contenuto</button>
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
          const preview = note.text.length > 200 ? note.text.slice(0, 200) + '...' : note.text;
          return (
            <li key={index} className="note-item">
              <h4 className="note-title">{note.title}</h4>
              <div><strong>Categorie:</strong> {note.categories.join(', ')}</div>
              <div><strong>Creata il:</strong> {new Date(note.creationDate).toLocaleString()}</div>
              <div><strong>Ultima modifica:</strong> {new Date(note.lastModifiedDate).toLocaleString()}</div>
              <p><strong>Anteprima:</strong> {preview}</p>

              <button onClick={() => handleEditNote(index)}>Modifica</button>
              <button onClick={() => handleDeleteNote(index)}>Elimina</button>
              <button onClick={() => handleDuplicateNote(index)}>Duplica</button>
              <button onClick={() => handleCopyContent(index)}>Copia Contenuto</button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default Notes;
