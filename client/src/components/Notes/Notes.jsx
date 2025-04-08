import React, { useState, useEffect } from 'react';
import { marked } from 'marked';
import { useAuth } from '../../contexts/AuthenticationContext';
import { showError, showSuccess } from '../../utils/toasts';
import Header from '../Header/Header';

import {
  Card,
  CardHeader,
  CardBody,
  Form,
  Input,
  Textarea,
  ButtonGroup,
  Button,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Select,
  SelectItem
} from '@heroui/react'

marked.setOptions({
  gfm: true,       // usa le specifiche markdown di Github
  breaks: true,    // aggiunge una singola linea di break
});

const displayCategories = (cat) => cat.split(',').map(c => `#${c}`).join(' ')

function NoteCard({ note, onEdit, onDelete, onDuplicate, onCopy }) {
  const showTime = (d) => d.toLocaleString('it-IT').slice(0, 16).replace('T', ' alle ');
  {/* TODO: creare card con dropdown menu, pulsante per esportare in file .md  */}
  return (
    <Card key={note._id}>
      <CardHeader>
        <h3>{note.title}</h3>
      </CardHeader>
      <CardBody>
        <span>{note.categories ? displayCategories(note.categories) : 'Nessun tag'}</span>
        <div dangerouslySetInnerHTML={{ __html: marked(note.text) }} />
      </CardBody>
    </Card>
  )
}
{/* <strong>Creata il:</strong> {showTime(new Date(n.creation))}
    <strong>Ultima modifica:</strong> {showTime(new Date(n.modification))}
    <button onClick={() => handleStartEdit(index)}>Modifica</button>
    <button onClick={() => handleDelete(index)}>Elimina</button>
    <button onClick={() => handleDuplicate(index)}>Duplica</button>
    <button onClick={() => handleCopyText(index)}>Copia</button> */}

function Notes() {
  const { isAuthenticated } = useAuth();
  const [notes, setNotes] = useState([]);
  const [sortCriteria, setSortCriteria] = useState('edit');
  const [noteId, setNoteId] = useState('');
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [categories, setCategories] = useState('');
  const [isEditorOpen, setIsEditorOpen] = useState(false);

  // Caricare le note dal backend
  useEffect(() => {
    const fetchNotes = async () => {
      if (isAuthenticated) {
        try {
          const response = await fetch(`${process.env.REACT_APP_API}/api/notes/`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          })

          if (response.ok) {
            const result = await response.json()
            setSortedNotes(result)
          } else {
            throw new Error()
          }
        } catch (error) {
          showError('fetchNotes error')
          setNotes([])
        }
      } else {
        setNotes([])
      }
    }
    
    fetchNotes()
  }, [isAuthenticated]);

  // Per l'ordinamento delle note
  function setSortedNotes(notes) {
    const sorted = notes.sort((a, b) => {
      if (sortCriteria === 'create') {
        return new Date(b.creation) - new Date(a.creation);
      } else if (sortCriteria === 'length') {
        return a.text.length - b.text.length;
      } else if (sortCriteria === 'title') {
        return a.title.replace(/[^a-zA-Z0-9]/g, '').localeCompare(b.title.replace(/[^a-zA-Z0-9]/g, ''));
      } else {
        return new Date(b.modification) - new Date(a.modification);
      }
    })
    setNotes(sorted)
  }

  const clearCategories = (cat) => cat.split('#').map(c => c.trim()).filter(c => c !== '')

  // salvare una nuova nota
  async function handleSave() {
    const noteData = {
      title: title.trim(),
      text: text,
      categories: clearCategories(categories).join(',')
    };

    try {
      // POST per creare una nuova nota
      const response = await fetch(`${process.env.REACT_APP_API}/api/notes/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(noteData)
      });

      if (!response.ok) {
        throw new Error();
      }
      // Aggiorna le note dopo il salvataggio
      const result = await response.json()
      showSuccess('Nota salvata')
      setIsEditorOpen(false)
      setSortedNotes([...notes, result])
    } catch (error) {
      showError('Errore nel salvataggio');
    }
  }

  // modificare una nota esistente
  async function handleEdit() {
    const noteData = {
      title: title.trim(),
      text: text,
      categories: clearCategories(categories).join(',')
    };

    try {
      // PUT per aggiornare una nota
      const response = await fetch(`${process.env.REACT_APP_API}/api/notes/${noteId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(noteData)
      });

      if (!response.ok) {
        throw new Error();
      }
      // Aggiorna le note dopo la modifica
      const result = await response.json()
      showSuccess('Nota aggiornata')
      setIsEditorOpen(false)
      const updatedNotes = notes.map(n => n._id === result._id ? result : n)
      setSortedNotes(updatedNotes)
    } catch (error) {
      showError("Errore nell'aggiornamento");
    }
  }

  // eliminare una nota
  async function handleDelete() {
    try {
      const response = await fetch(`${process.env.REACT_APP_API}/api/notes/${noteId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error();
      }
      // Aggiorna le note dopo l'eliminazione
      showSuccess('Nota eliminata')
      setIsEditorOpen(false)
      setSortedNotes(notes.filter(n => n._id !== noteId))
    } catch (error) {
      showError("Errore nell'eliminazione");
    }
  }

  // aprire l'editor di modifica
  function openEditor(note) {
    setNoteId(note?._id ?? null);
    setTitle(note?.title ?? '');
    setText(note?.text ?? '');
    setCategories(note ? displayCategories(note.categories) : '');
    setIsEditorOpen(true);
  }

  // duplicare una nota
  async function handleDuplicate(note) {
    // Prepara i dati per la nuova nota (copia il titolo, categorie e testo)
    setTitle(`Copia di ${note.title}`);
    setText(note.text);
    setCategories(displayCategories(note.categories));
    setIsEditorOpen(true);
  }
  
  // copiare il contenuto della nota negli appunti
  function handleCopyText(note) {
    navigator.clipboard.writeText(note.text)
      .then(() => showSuccess('Contenuto copiato'))
      .catch((error) => showError('Errore durante la copia'));
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (noteId) {
      await handleEdit()
    } else {
      await handleSave()
    }
  }
  
  // incollare il contenuto della nota
  /* async function handlePasteNoteContent() {
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
  } */

  return (
    <div>
      <Header />
      {isEditorOpen ? (
        <div>
          <h2>{noteId ? 'Crea' : 'Modifica'} nota</h2>
          <Form
            className="flex flex-col items-center"
            validationBehavior="native"
            onSubmit={handleSubmit}
          >
            <div>
              <Input
                type='text'
                label='Titolo'
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              <Input
                type='text'
                label='Categorie'
                description='Inserisci tutti i #tag che vuoi'
                value={categories}
                onChange={(e) => setCategories(e.target.value)}
              />
              <Textarea
                label='Contenuto'
                placeholder='Scrivi o incolla il contenuto della nota qui...'
                value={text}
                onChange={(e) => setText(e.target.value)}
                minRows={8}
                isRequired
              />
            </div>
            <div>
              <div dangerouslySetInnerHTML={{ __html: marked(`# ${title}`) }} />
              <div>
                <p>{categories ? clearCategories(categories).map(c => `#${c}`).join(' ') : 'Nessun tag'}</p>
              </div>
              <div dangerouslySetInnerHTML={{ __html: marked(text) }} />
            </div>
            <ButtonGroup>
              <Button type='button' color='primary' variant='flat' onPress={() => setIsEditorOpen(false)}>
                Annulla
              </Button>
              <Button type='submit' color='primary' variant='solid'>
                Salva nota
              </Button>
            </ButtonGroup>
          </Form>
        </div>
      ) : (
        <div>
          <div>
            {/* TODO: lista note: barra di ricerca per mostrare solo le note filtrate da un campo search sui campi */}
            <Select
              label='Ordina per'
              selectedKeys={[sortCriteria]}
              onChange={(e) => setSortCriteria(e.target.value)}
            >
              <SelectItem key="edit">Ultima modifica</SelectItem>
              <SelectItem key="title">Titolo</SelectItem>
              <SelectItem key="create">Data di creazione</SelectItem>
              <SelectItem key="length">Dimensione</SelectItem>
            </Select>
            <Button color='primary' variant='flat' onPress={() => openEditor()}>
              Crea nota
            </Button>
          </div>
          <div>
            {notes ? (
              notes.map(n => (
                <NoteCard
                  note={n}
                />
              ))
            ) : (
              <p>Nessuna nota presente</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Notes;
