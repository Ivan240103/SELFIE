import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { TimeMachineProvider } from './components/TimeMachine/TimeMachineContext';

import Accesso from './components/Accesso';

import Debug from './components/Debug';
import Protected from './components/Protected';
import Unauthorized from './components/Unauthorized';

function App() {
  return (
    <TimeMachineProvider>
      <div className="App">
        <Router>
          <Routes>
            <Route path="/" element={<Accesso />} />
            <Route path="/debug" element={<Debug />} />
            <Route path="/protected" element={<Protected />} />
            <Route path="/unauthorized" element={<Unauthorized />} />
          </Routes>
        </Router>
      </div>
    </TimeMachineProvider>
  );
}

export default App;
