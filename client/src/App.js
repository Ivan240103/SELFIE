import React from 'react';
import Accesso from './components/Accesso';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';


function App() {
  return (
    <div className="App">
      <Router>
            <Routes>
                <Route path="/" element={<Accesso />} />
            </Routes>
        </Router>
    </div>
  );
}

export default App;
