import React, { useState, useEffect } from 'react'
import axios from 'axios';
import { marked } from 'marked';
import { useAuth } from '../../contexts/AuthenticationContext';
import { showError } from '../../utils/toasts';

export default function PreviewNote() {
  const { isAuthenticated } = useAuth()
  const [note, setNote] = useState(null)

  marked.setOptions({
    gfm: true,       // usa le specifiche markdown di Github
    breaks: true,    // aggiunge una singola linea di break
  });

  // recupera l'ultima nota modificata dal backend
  useEffect(() => {
    const fetchNote = async () => {
      if (isAuthenticated) {
        try {
          const response = await axios.get(`${process.env.REACT_APP_API}/api/notes/last`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
          })
          setNote(response.data)
        } catch (error) {
          showError('fetchNote error')
          setNote(null)
        }
      } else {
        setNote(null)
      }
    }

    fetchNote()
  }, [isAuthenticated])

  const displayCategories = (cat) => cat.split(',').map(c => `#${c}`).join(' ')

  return (
    <div className='dash-card-preview'>
      {note ? (
        <>
          <div dangerouslySetInnerHTML={{ __html: marked(`# ${note.title}`) }}/>
          <div>
            <span>{note.categories ? displayCategories(note.categories) : 'Nessun tag'}</span>
          </div>
          <div dangerouslySetInnerHTML={{ __html: marked(note.text) }}/>
        </>
      ) : (
        <span className='dash-empty-prev'>Nessuna nota presente</span>
      )}
    </div>
  )
}
