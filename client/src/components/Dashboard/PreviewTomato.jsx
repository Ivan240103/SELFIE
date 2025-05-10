import React, { useState, useEffect } from 'react'
import axios from 'axios';
import { useAuth } from '../../contexts/AuthenticationContext';
import { showError } from '../../utils/toasts'

export default function PreviewTomato() {
  const { isAuthenticated } = useAuth()
  const [tomato, setTomato] = useState(null)

  // recupera l'ultimo pomodoro dal backend
  useEffect(() => {
    const fetchTomato = async () => {
      if (isAuthenticated) {
        try {
          const response = await axios.get(`${process.env.REACT_APP_API ?? ''}/api/tomatoes/last`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
          });
          setTomato(response.data);
        } catch (error) {
          if (error.response && error.response.status !== 401) {
            showError('fetchTomato error');
            setTomato(null);
          }
        }
      } else {
        setTomato(null)
      }
    };
  
    fetchTomato();
  }, [isAuthenticated]);

  return (
    <div className='size-full flex items-center justify-center'>
      {tomato ? (
        <div className='flex flex-col items-center justify-center gap-1 lg:gap-3 p-8 lg:p-16 rounded-full border-3 border-red-500 bg-red-200'>
          <span className='text-sm lg:text-base'>
            {tomato.loops} <b>{tomato.loops === 1 ? 'ciclo' : 'cicli'}</b> da
          </span>
          <span className='text-sm lg:text-base'>
            {tomato.studyMinutes} {tomato.studyMinutes === 1 ? 'minuto' : 'minuti'} di <b>studio</b>  
          </span>
          <span className='text-sm lg:text-base'>
            {tomato.pauseMinutes} {tomato.pauseMinutes === 1 ? 'minuto' : 'minuti'} di <b>pausa</b>  
          </span>
          <span className='text-sm lg:text-base'>
            <b>{tomato.interrupted === 'n' ? 'Creato' : tomato.interrupted === 'f' ? 'Concluso' : 'Cominciato'}</b>
          </span>
        </div>
      ) : (
        <span className='text-gray-700'>Nessun timer presente</span>
      )}
    </div>
  )
}
