import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { TimeMachineProvider } from './components/TimeMachine/TimeMachineContext';
import Dashboard from './components/Dashboard';
import Access from './components/User/Access';
import Registration from './components/User/Registration';
import Profile from './components/User/Profile';
import Calendar from './components/Calendar/Calendar';
import Notes from './components/Notes/Notes';
import Tomato from './components/Tomato/tomato';

import Protected from './components/Protected';

import './css/App.css'

function App() {

  return (
    <TimeMachineProvider>
      <div className="App">
        <Router>
          <Routes>
            <Route path="/" element={<Dashboard/>} />
            <Route path="/login" element={<Access />} />
            <Route path="/register" element={<Registration />} />
            <Route path="/profile" element={<Profile/>} />
            <Route path="/Calendar" element={<Calendar />} />
            <Route path="/Notes" element={<Notes />} />
            <Route path="/tomato" element={<Tomato />} />

            <Route path="/protected" element={<Protected />} />
          </Routes>
        </Router>
      </div>
    </TimeMachineProvider>
  );
}

export default App;
