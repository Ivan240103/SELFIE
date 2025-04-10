import React from 'react';
import { useAuth } from '../../contexts/AuthenticationContext';
import Header from '../Header/Header';

// usiamo un iframe perché il contenuto è completamente indipendente dal resto della react app
function Tomato() {
  const { isAuthenticated } = useAuth()
  return (
    <div>
      <Header />
      {isAuthenticated && <iframe
        src='/tomato/tomato.html'
        title='Timer pomodoro'
        style={{ width:'100%', height:'100vh', border: 'none' }}
      />}
    </div>
  );
}

export default Tomato;
