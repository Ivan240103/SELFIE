import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../Auth/AuthenticationContext';
import TimeMachine from '../TimeMachine/TimeMachine';
import { marked } from 'marked';

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

  marked.setOptions({
    gfm: true,       //Con true usa le specifiche markdown di Github (quelle classiche direi es: # a, *a*, - a, ecc)
    breaks: true,    //Con true aggiunge una singola linea di break
  });

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

  //Per l'ordinamento delle note
  const sortedNotes = [...notes].sort((a, b) => {
    if (sortCriteria === 'title') {
      return a.title.replace(/[^a-zA-Z0-9]/g, '').localeCompare(b.title.replace(/[^a-zA-Z0-9]/g, ''));
    } else if (sortCriteria === 'date') {
      return new Date(b.creation) - new Date(a.creation);
    } else if (sortCriteria === 'length') {
      return a.text.length - b.text.length;
    }
    return 0;
  });

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

  async function handleDuplicateNote(index) {
    const noteToDuplicate = notes[index];
  
    // Prepara i dati per la nuova nota (copia il titolo, categorie e testo)
    const payload = {
      title: noteToDuplicate.title,
      categories: noteToDuplicate.categories,
      text: noteToDuplicate.text
    };
  
    try {
      // POST per creare una nuova nota con i dati duplicati
      const response = await fetch(`${process.env.REACT_APP_API}/api/notes/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error('Errore nella duplicazione della nota');
  
      // Aggiorna le note dopo la duplicazione
      setFetchNotes(prev => prev + 1);
    } catch (error) {
      setError('Errore:', error.message);
    }
  }
  
  // Funzione per copiare il contenuto della nota negli appunti
  function handleCopyNoteContent(index) {
    const noteToCopy = notes[index];
    const contentToCopy = `${noteToCopy.title}\n\n${noteToCopy.categories}\n\n${noteToCopy.text}`;
  
    // Copia il contenuto negli appunti
    navigator.clipboard.writeText(contentToCopy).then(() => {
      alert('Contenuto copiato negli appunti!');
    }).catch((error) => {
      alert('Errore durante la copia del contenuto:', error);
    });
  }
  
  // Funzione per incollare il contenuto negli input del form
  async function handlePasteNoteContent() {
    try {
      const pastedContent = await navigator.clipboard.readText();
      const lines = pastedContent.split('\n').map(line => line.trim());
  
      // Rimuove eventuali righe vuote all'inizio
      const filteredLines = lines.filter(line => line !== '');
  
      setTitle(filteredLines[0] || '');
  
      // La seconda riga viene considerata come categorie
      setCategories(filteredLines[1] || '');
  
      // Tutte le righe successive alla seconda diventano il contenuto
      setText(filteredLines.slice(2).join('\n') || '');
    } catch (error) {
      alert('Errore durante l\'incolla del contenuto: ' + error.message);
    }
  }

  return (
    <div>
      {isAuthenticated && <>
        <TimeMachine />
        <div className="notes-container">
          <h1 className="notes-header">Note</h1>
          <p>{error}</p>
          <div className='notes-form-container'>
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
              <button onClick={handlePasteNoteContent} className="note-paste-button">
                Incolla
              </button>
            </div>
            <div className="markdown-preview">
              <h4>Anteprima Markdown:</h4>
              <div dangerouslySetInnerHTML={{ __html: marked(title) }} />
              <div dangerouslySetInnerHTML={{ __html: marked(categories.split(',').map(c => `#${c.trim()}`).join(' ')) }}  />
              <div dangerouslySetInnerHTML={{ __html: marked(text) }} />
            </div>
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
          <div className="notes-view-container">
              <div className="notes-list-container">
                <ul className="notes-list">
                  {sortedNotes.map((n, index) => {
                    const showTime = (d) => d.toLocaleString('it-IT').slice(0, 16).replace('T', ' alle ');
                    const markdownContent = marked(`${n.title}\n\n${n.categories.split(',').map(c => `#${c.trim()}`).join(' ')}\n\n${n.text}`);
                    return (
                      <li key={n._id} className="note-item">
                        <div className="note-textual-info">
                          <div>
                            <strong>Titolo:</strong> {n.title}
                          </div>
                          <div>
                            <strong>Categorie:</strong> {n.categories.split(',').map(c => `#${c.trim()}`).join(' ')}
                          </div>
                          <div>
                            <strong>Creata il:</strong> {showTime(new Date(n.creation))}
                          </div>
                          <div>
                            <strong>Ultima modifica:</strong> {showTime(new Date(n.modification))}
                          </div>
                        </div>

                        <div className="note-markdown-preview">
                          <h4>Anteprima Markdown:</h4>
                          <div dangerouslySetInnerHTML={{ __html: markdownContent }} />
                        </div>
                        <button onClick={() => handleStartEdit(index)}>Modifica</button>
                        <button onClick={() => handleDeleteNote(index)}>Elimina</button>
                        <button onClick={() => handleDuplicateNote(index)}>Duplica</button>
                        <button onClick={() => handleCopyNoteContent(index)}>Copia</button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
        </div>
      </>}
    </div>
  );
}

export default Notes;
