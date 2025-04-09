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
          const response = await axios.get(`${process.env.REACT_APP_API}/api/tomatoes/last`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
          });
          setTomato(response.data);
        } catch (error) {
          showError('fetchTomato error');
          setTomato(null);
        }
      } else {
        setTomato(null)
      }
    };
  
    fetchTomato();
  }, [isAuthenticated]);

  return (
    <div className='dash-card-preview'>
      {tomato ? (
        // TODO: finire preview pomodoro
        <>
          <h3>Ultima sessione</h3>
          <h4>{tomato.loops} {tomato.loops === 1 ? 'ciclo' : 'cicli'} di</h4>
          <p><strong>Tempo di studio:</strong> {tomato.studyMinutes}
          {tomato.studyMinutes === 1 ? 'minuto' : 'minuti'}</p>
          <p><strong>Tempo di pausa:</strong> {tomato.pauseMinutes}
          {tomato.pauseMinutes === 1 ? 'minuto' : 'minuti'}</p>
          <p><strong>Stato:</strong> {tomato.interrupted === 'n' ? 'da iniziare' :
            tomato.interrupted === 'f' ? 'concluso' : 'da concludere'}</p>
        </>
      ) : (
        <span className='dash-empty-prev'>Nessun timer presente</span>
      )}
    </div>
  )
}
