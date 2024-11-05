import React, { useState } from 'react';

function Notes({ onNoteSave }) {
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState('');
  const [selectedDate, setSelectedDate] = useState('');

  function handleSaveNote() {
    if (newNote && selectedDate) {
      const updatedNotes = [...notes, { date: selectedDate, text: newNote }];
      setNotes(updatedNotes);
      setNewNote('');
      setSelectedDate('');
      onNoteSave(updatedNotes); // Passa le note aggiornate al calendario
    }
  }

  return (
    <div>
      <h3>Note</h3>
      <input
        type='date'
        value={selectedDate}
        onChange={(e) => setSelectedDate(e.target.value)}
      />
      <textarea
        value={newNote}
        onChange={(e) => setNewNote(e.target.value)}
        placeholder='Scrivi la tua nota qui...'
      />
      <button onClick={handleSaveNote}>Salva Nota</button>
      <ul>
        {notes.map((note, index) => (
          <li key={index}>
            <strong>{note.date}:</strong> {note.text}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Notes;
