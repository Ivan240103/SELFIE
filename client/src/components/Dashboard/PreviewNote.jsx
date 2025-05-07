import React, { useState, useEffect } from 'react'
import axios from 'axios';
import { marked } from 'marked';
import 'github-markdown-css/github-markdown-light.css';
import { useAuth } from '../../contexts/AuthenticationContext';
import { showError } from '../../utils/toasts';

import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  ScrollShadow
} from '@heroui/react'

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
          const response = await axios.get(`${process.env.REACT_APP_API ?? ''}/api/notes/last`, {
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
  const displayTime = (d) => d.toLocaleString('it-IT').slice(0, -3).replace(',', ' alle');
  
  return (
    <div className="size-full flex flex-col items-center justify-center">
      {note ? (
        <Card
          classNames={{
            base: 'w-[88%] p-3 lg:p-5 shadow-none border-1 border-gray-300 bg-[#fafafa]',
            header: 'pt-2',
            body: 'py-0 lg:py-3'
          }}
        >
          <CardHeader>
            <h3 className='font-bold lg:text-lg'>{note.title}</h3>
          </CardHeader>
          <CardBody>
            <span className='pb-1 lg:pb-4 text-gray-700 text-sm lg:text-base'>
              {note.categories ? displayCategories(note.categories) : 'Nessun tag'}
            </span>
            <ScrollShadow className='lg:h-48'>
              <div className='markdown-body notes-container' dangerouslySetInnerHTML={{ __html: marked(note.text) }} />
            </ScrollShadow>
          </CardBody>
          <CardFooter>
            <span className='text-gray-600 text-xs lg:text-sm'>
              {`Ultima modifica il ${displayTime(new Date(note.modification))}`}  
            </span>
          </CardFooter>
        </Card>
      ) : (
        <span className='text-gray-700'>Nessuna nota presente</span>
      )}
    </div>
  )
}
