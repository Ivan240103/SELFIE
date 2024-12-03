import React from 'react';
import Accesso from './components/Accesso';
import Debug from './components/Debug';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Protected from './components/Protected';


function App() {
  return (
    <div className="App">
      <Router>
            <Routes>
                <Route path="/" element={<Accesso />} />
                <Route path="/debug" element={<Debug />} />
                <Route path="/protected" element={<Protected />} />
            </Routes>
        </Router>
    </div>
  );
}

export default App;
