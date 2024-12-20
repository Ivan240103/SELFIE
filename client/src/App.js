import React, { useState } from 'react';
import Access from './components/Access';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Calendar from './components/Calendar';
import Tomato from './components/Tomato/tomato';
import Notes from './components/Notes'
import Registration from './components/Registration';
import Dashboard from './components/Dashboard';

function App() {

  return (
    <div className="App">
      <Router>
            <Routes>
                <Route path="/login" element={<Access />} />
                <Route path="/register" element={<Registration />} />
                <Route path="/Calendar" element={<Calendar />} />
                <Route path="/tomato" element={<Tomato />} />
                <Route path="/Notes" element={<Notes />} />
                <Route path="/dashboard" element={<Dashboard/>} />
            </Routes>
        </Router>
    </div>
  );
}

export default App;
