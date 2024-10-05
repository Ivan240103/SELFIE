import React from 'react';
import Accesso from './components/Accesso';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Calendario from './components/Calendario';


function App() {
  return (
    <div className="App">
      <Router>
            <Routes>
                <Route path="/" element={<Accesso />} />
                <Route path="/calendario" element={<Calendario />} />
            </Routes>
        </Router>
    </div>
  );
}

export default App;
