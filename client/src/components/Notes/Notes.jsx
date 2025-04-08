import React, { useState, useEffect } from 'react';
import { marked } from 'marked';
import { useAuth } from '../../contexts/AuthenticationContext';
import { getDatetimeString } from '../../utils/dates';
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
  const displayTime = (d) => getDatetimeString(d).replace('T', ' alle ');
  const creationStr = `Creata il ${displayTime(new Date(note.creation))}`
  const modificationStr = `ultima modifica il ${displayTime(new Date(note.modification))}`

  async function handleAction(k) {
    switch (k) {
      case 'edit':
        await onEdit(note)
        break;
      case 'copy':
        onCopy(note)
        break
      case 'duplicate':
        onDuplicate(note)
        break
      case 'down':
        // genera un "file virtuale" temporaneo
        const blob = new Blob([note.text], { type: "text/markdown" })
        // crea un url ed un link per il download
        const url = URL.createObjectURL(blob)
        const link = document.createElement("a")
        link.href = url
        link.download = `${note.title}.md`
        document.body.appendChild(link)
        link.click()
        // dopo il download elimina entrambi
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
        break
      case 'del':
        await onDelete(note)
        break
      default:
        showError("Dropdown menu error")
        break;
    }
  }

  return (
    <Card>
      <CardHeader>
        <h3>{note.title}</h3>
        <Dropdown>
          <DropdownTrigger>
            {/* TODO: icona trigger dei tre puntini */}
            <Button color='default' variant='light'>
              ...
            </Button>
          </DropdownTrigger>
          <DropdownMenu onAction={handleAction}>
            <DropdownItem key='edit'>Modifica</DropdownItem>
            <DropdownItem key='copy'>Copia testo</DropdownItem>
            <DropdownItem key='duplicate'>Duplica</DropdownItem>
            <DropdownItem key='down'>Scarica</DropdownItem>
            <DropdownItem key='del'>Elimina</DropdownItem>
          </DropdownMenu>
        </Dropdown>
      </CardHeader>
      <CardBody>
        <span>{note.categories ? displayCategories(note.categories) : 'Nessun tag'}</span>
        <div dangerouslySetInnerHTML={{ __html: marked(note.text) }} />
        <span>{creationStr}, {modificationStr}</span>
      </CardBody>
    </Card>
  )
}

function Notes() {
  const { isAuthenticated } = useAuth();
  const [notes, setNotes] = useState([]);
  const [sortCriteria, setSortCriteria] = useState('edit');
  const [search, setSearch] = useState('');
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
            setSortedNotes(result, sortCriteria)
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
  function setSortedNotes(notes, order) {
    const sorted = notes.sort((a, b) => {
      if (order === 'create') {
        return new Date(b.creation) - new Date(a.creation);
      } else if (order === 'length') {
        return a.text.length - b.text.length;
      } else if (order === 'title') {
        return a.title.replace(/[^a-zA-Z0-9]/g, '').localeCompare(b.title.replace(/[^a-zA-Z0-9]/g, ''));
      } else {
        return new Date(b.modification) - new Date(a.modification);
      }
    })
    setNotes(sorted)
  }

  const clearCategories = (cat) => cat.split('#').map(c => c.trim()).filter(c => c !== '')

  const checkSearch = (n, s) => n.title.includes(s) || n.text.includes(s) || n.categories.includes(s)

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
      setSortedNotes([...notes, result], sortCriteria)
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
      setSortedNotes(updatedNotes, sortCriteria)
    } catch (error) {
      showError("Errore nell'aggiornamento");
    }
  }

  // eliminare una nota
  async function handleDelete(note) {
    try {
      const response = await fetch(`${process.env.REACT_APP_API}/api/notes/${note._id}`, {
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
      setSortedNotes(notes.filter(n => n._id !== note._id), sortCriteria)
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
  function handleDuplicate(note) {
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

  return (
    <div>
      <Header />
      {isEditorOpen ? (
        <div>
          <h2>{noteId ? 'Modifica' : 'Crea'} nota</h2>
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
            {/* TODO: icona della lente */}
            <Input
              type='text'
              label='Cerca'
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Select
              label='Ordina per'
              selectedKeys={[sortCriteria]}
              onChange={(e) => {
                setSortCriteria(e.target.value)
                setSortedNotes(notes, e.target.value)
              }}
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
              notes.filter(n => checkSearch(n, search)).map(n => (
                <NoteCard
                  key={n._id}
                  note={n}
                  onEdit={openEditor}
                  onCopy={handleCopyText}
                  onDuplicate={handleDuplicate}
                  onDelete={handleDelete}
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
