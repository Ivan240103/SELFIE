import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { marked } from 'marked';
import { useAuth } from '../../contexts/AuthenticationContext';
import { showError, showSuccess } from '../../utils/toasts';
import Header from '../Header/Header';

import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
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
  SelectItem,
  ScrollShadow
} from '@heroui/react'

// TODO: non funzionano i titoli con i cancelletti e gli elenchi
marked.setOptions({
  gfm: true,       // usa le specifiche markdown di Github
  breaks: true,    // aggiunge una singola linea di break
});

const displayCategories = (cat) => cat.split(',').map(c => `#${c}`).join(' ')

function NoteCard({ note, onEdit, onDelete, onDuplicate, onCopy }) {
  const displayTime = (d) => d.toLocaleString('it-IT').slice(0, 17).replace(',', ' alle');
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
    <Card
      classNames={{
        base: 'p-3',
        header: 'pt-1 flex flex-row items-center justify-between'
      }}
    >
      <CardHeader>
        <h3 className='font-bold text-lg'>{note.title}</h3>
        <Dropdown>
          <DropdownTrigger>
            <Button color='default' variant='light' radius='full' isIconOnly>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className='fill-gray-600'>
                <circle cx="8" cy="12" r="1"/>
                <circle cx="12" cy="12" r="1"/>
                <circle cx="16" cy="12" r="1"/>
              </svg>
            </Button>
          </DropdownTrigger>
          <DropdownMenu onAction={handleAction} variant='flat'>
            <DropdownItem key='edit'>Modifica</DropdownItem>
            <DropdownItem key='copy'>Copia testo</DropdownItem>
            <DropdownItem key='duplicate'>Duplica</DropdownItem>
            <DropdownItem key='down'>Scarica</DropdownItem>
            <DropdownItem key='del' className='text-danger' color='danger'>Elimina</DropdownItem>
          </DropdownMenu>
        </Dropdown>
      </CardHeader>
      <CardBody>
        <span className='pb-4 text-gray-700'>
          {note.categories ? displayCategories(note.categories) : 'Nessun tag'}
        </span>
        <ScrollShadow className='h-48'>
          <div dangerouslySetInnerHTML={{ __html: marked(note.text) }} />
        </ScrollShadow>
      </CardBody>
      <CardFooter>
        <span className='text-gray-600 text-sm'>
          {creationStr}, {modificationStr}
        </span>
      </CardFooter>
    </Card>
  )
}

function Notes() {
  const { isAuthenticated, checkAuth } = useAuth();
  const navigate = useNavigate()
  const [notes, setNotes] = useState([]);
  const [sortCriteria, setSortCriteria] = useState('edit');
  const [search, setSearch] = useState('');
  const [noteId, setNoteId] = useState('');
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [categories, setCategories] = useState('');
  const [isEditorOpen, setIsEditorOpen] = useState(false);

  // verifica dell'autenticazione
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => checkAuth(navigate), [])

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  // Per l'ordinamento delle note
  function setSortedNotes(notes, sortingOrder) {
    const order = sortingOrder || sortCriteria
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
      setSortedNotes(notes.filter(n => n._id !== note._id))
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
    setNoteId('')
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
    <div className='pb-8'>
      <Header />
      {isEditorOpen ? (
        <div className='w-3/5 mx-auto mt-8 pb-8'>
          <h2 className='text-3xl'>
            {noteId ? 'Modifica' : 'Crea'} nota
          </h2>
          <Form
            className="w-full flex flex-col items-center mt-8"
            validationBehavior="native"
            onSubmit={handleSubmit}
          >
            <div className='w-full flex flex-row items-start justify-between gap-10'>
              <div className='w-1/2 flex flex-col gap-3'>
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
              <div className='w-1/2 flex flex-col gap-3 pl-4'>
                <h3 className='font-bold text-xl pt-4'>{title || 'Senza titolo'}</h3>
                <span className='text-gray-700 pt-2'>
                  {categories ? clearCategories(categories).map(c => `#${c}`).join(' ') : 'Nessun tag'}
                </span>
                <div className='w-full mt-3' dangerouslySetInnerHTML={{ __html: marked(text) }} />
              </div>
            </div>
            <ButtonGroup className='mt-6'>
              <Button className='w-40' type='button' color='primary' variant='flat' onPress={() => setIsEditorOpen(false)}>
                Annulla
              </Button>
              <Button className='w-40' type='submit' color='primary' variant='solid'>
                Salva nota
              </Button>
            </ButtonGroup>
          </Form>
        </div>
      ) : (
        <div className='w-3/5 mx-auto mt-8 pb-8'>
          <h2 className='text-3xl'>Le tue note</h2>
          <div className='w-full mt-8 flex flex-row items-center gap-4'>
            <Input
              className='w-full'
              type='search'
              label='Cerca'
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              endContent={
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 40" width={28} height={28} className='fill-gray-600'>
                  <path d="M27.414,24.586l-5.077-5.077C23.386,17.928,24,16.035,24,14c0-5.514-4.486-10-10-10S4,8.486,4,14  s4.486,10,10,10c2.035,0,3.928-0.614,5.509-1.663l5.077,5.077c0.78,0.781,2.048,0.781,2.828,0  C28.195,26.633,28.195,25.367,27.414,24.586z M7,14c0-3.86,3.14-7,7-7s7,3.14,7,7s-3.14,7-7,7S7,17.86,7,14z" />
                </svg>
              }
            />
            <Select
              className='w-72'
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
            <Button className='w-32 py-7' color='primary' variant='flat' onPress={() => openEditor()}>
              Crea nota
            </Button>
          </div>
          <div className='mt-12 grid grid-cols-3 gap-10'>
            {notes.length > 0 ? (
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
              <span className='text-gray-700 mt-[20vh] text-center col-start-2'>
                Nessuna nota presente
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Notes;
