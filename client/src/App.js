import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { TimeMachineProvider } from './components/TimeMachine/TimeMachineContext';
import Access from './components/Access';
import Registration from './components/Registration';
import Calendar from './components/Calendar';
import Tomato from './components/Tomato/tomato';
import Notes from './components/Notes'
import Dashboard from './components/Dashboard';

import Debug from './components/Debug';
import Protected from './components/Protected';
import Unauthorized from './components/Unauthorized';

import './css/App.css'

function App() {

  return (
    <TimeMachineProvider>
      <div className="App">
        <Router>
          <Routes>
            <Route path="/login" element={<Access />} />
            <Route path="/register" element={<Registration />} />
            <Route path="/Calendar" element={<Calendar />} />
            <Route path="/tomato" element={<Tomato />} />
            <Route path="/Notes" element={<Notes />} />
            <Route path="/dashboard" element={<Dashboard/>} />

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
