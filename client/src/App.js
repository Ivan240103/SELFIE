import React from 'react';
import Access from './components/Access';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Calendar from './components/Calendar';
import Tomato from './components/Tomato/Tomato';

function App() {
  return (
    <div className="App">
      <Router>
            <Routes>
                <Route path="/" element={<Access />} />
                <Route path="/Calendar" element={<Calendar />} />
                <Route path="/Tomato" element={<Tomato />} />
            </Routes>
        </Router>
    </div>
  );
}

export default App;
