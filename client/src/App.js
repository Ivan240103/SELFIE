import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { TimeMachineProvider } from './components/TimeMachine/TimeMachineContext';
import Access from './components/User/Access';
import Registration from './components/User/Registration';
import Profile from './components/User/Profile';
import Calendar from './components/Calendar/Calendar';
import Tomato from './components/Tomato/tomato';
import Notes from './components/Notes/Notes'
import Dashboard from './components/Dashboard';

import Protected from './components/Protected';
import Unauthorized from './components/User/Unauthorized';

import './css/App.css'

function App() {

  return (
    <TimeMachineProvider>
      <div className="App">
        <Router>
          <Routes>
            <Route path="/" element={<Access />} />
            <Route path="/register" element={<Registration />} />
            <Route path="/Calendar" element={<Calendar />} />
            <Route path="/tomato" element={<Tomato />} />
            <Route path="/Notes" element={<Notes />} />
            <Route path="/dashboard" element={<Dashboard/>} />
            <Route path="/profile" element={<Profile/>} />

            <Route path="/protected" element={<Protected />} />
            <Route path="/unauthorized" element={<Unauthorized />} />
          </Routes>
        </Router>
      </div>
    </TimeMachineProvider>
  );
}

export default App;
