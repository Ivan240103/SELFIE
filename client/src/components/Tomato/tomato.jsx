import React from 'react';

function Tomato() {
  return (
    <iframe
      src={`${process.env.PUBLIC_URL}/tomato.html`}
      style={{ width: '100%', height: '100vh', border: 'none' }}
      title="Pomodoro Timer"
    />
  );
}

export default Tomato;
