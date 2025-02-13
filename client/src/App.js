import React from 'react';
<<<<<<< HEAD
import Accesso from './components/Accesso'
import Tomato from './components/Tomato/tomato' 


function App() {
  return (
    <div className="App">
      <Tomato />
    </div>
=======
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { TimeMachineProvider } from './components/TimeMachine/TimeMachineContext';
import { AuthenticationProvider } from './components/Auth/AuthenticationContext';
import Dashboard from './components/Dashboard';
import Access from './components/User/Access';
import Registration from './components/User/Registration';
import Profile from './components/User/Profile';
import Calendar from './components/Calendar/Calendar';
import Notes from './components/Notes/Notes';
import Tomato from './components/Tomato/tomato';

import './css/App.css'

function App() {

  return (
    <AuthenticationProvider>
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
            </Routes>
          </Router>
        </div>
      </TimeMachineProvider>
    </AuthenticationProvider>
>>>>>>> 2db00811234cda54ccd19de39cc9cd9b82873e7d
  );
}

export default App;
