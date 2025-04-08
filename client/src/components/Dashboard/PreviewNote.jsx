import React, { useState, useEffect } from 'react'
import axios from 'axios';
import { useAuth } from '../../contexts/AuthenticationContext';
import { marked } from 'marked';

marked.setOptions({
  gfm: true,       //Con true usa le specifiche markdown di Github (quelle classiche direi es: # a, *a*, - a, ecc)
  breaks: true,    //Con true aggiunge una singola linea di break
});

export default function PreviewNote() {
  const { isAuthenticated } = useAuth()
  const [note, setNote] = useState({})

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
          setError('Error while fetching note')
          setNote({})
        }
      }
    }

    fetchNote()
  }, [isAuthenticated])

  return (
    <div className='dash-card-preview'>
      {Object.keys(note).length === 0 ? (
        <span className='dash-empty-prev'>Nessuna nota presente</span>
      ) : (
        <div className='dash-note-container'> {/*Container per dividere le note visualizzate normalmente e tradotte in Markdown*/}
          {/*Visualizzazione in Markdown uguale a quello del listamento in Notes.jsx*/}
          <div className='dash-note-markdown' dangerouslySetInnerHTML={{
            __html: marked(`${note.title}\n\n${note.categories.split(',').map(c => `#${c.trim()}`).join(' ')}\n\n${note.text.substring(0, 200)}${note.text.length > 200 ? '...' : ''}`)
          }}>
          </div>
        </div>
      )}
    </div>
  )
}
