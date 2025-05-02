import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthenticationContext';
import Header from '../Header/Header';

// usiamo un iframe perché il contenuto è completamente indipendente dal resto della react app
function Tomato() {
  const { isAuthenticated, checkAuth } = useAuth()
  const navigate = useNavigate()

  // verifica dell'autenticazione
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => checkAuth(navigate), [])

  return (
    <div>
      <Header />
      {isAuthenticated && <iframe
        src='/tomato/tomato.html'
        title='Timer pomodoro'
        style={{ width:'100%', height:'92vh', border: 'none' }}
      />}
    </div>
  );
}

export default Tomato;
