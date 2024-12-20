import React, { useState } from 'react';

function Event({ onSaveEvent }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [isAllDay, setIsAllDay] = useState(true);
  const [frequency, setFrequency] = useState("n");
  const [place, setPlace] = useState("");
  const [owner, setOwner] = useState("desi"); // Ci andrebbe l'username dell'owner 

  const handleSave = async () => {
    const eventData = {
      title: title,
      description: description,
      start: start,
      end: end,
      isAllDay: isAllDay,
      frequency: frequency,
      place: place,
      owner: owner,
    };

    try {
        const response = await fetch("http://localhost:8000/api/events/", {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(eventData),
        });
        if (!response.ok) {
            throw new Error(`Errore HTTP: ${response.status}`);
          }
      
          // Uso .text() se il backend restituisce una stringa come "ok"
          const result = await response.text();
          console.log('Evento salvato con successo:', result);
          alert('Evento salvato con successo!');
        } catch (err) {
          console.error('Errore nel salvataggio dell\'evento:', err);
          alert('Errore nel salvataggio dell\'evento.');
        }
  };

  return (
    <div className="event-form">
        <h3>Crea un nuovo evento</h3>
        <div>
            <label>
            Titolo:
            <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
            />
            </label>
        </div>
        <div>
            <label>
            Descrizione:
            <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
            ></textarea>
            </label>
        </div>
        <div>
            <label>
            Inizio:
            <input
                type="date"
                value={start}
                onChange={(e) => setStart(e.target.value)}
            />
            </label>
        </div>
        <div>
            <label>
            Fine:
            <input
                type="date"
                value={end}
                onChange={(e) => setEnd(e.target.value)}
            />
            </label>
        </div>
        <div>
            <label>
            Evento per tutto il giorno:
            <input
                type="checkbox"
                checked={isAllDay}
                onChange={(e) => setIsAllDay(e.target.checked)}
            />
            </label>
        </div>
        <div>
            <label>
            Frequenza:
            <select
                value={frequency}
                onChange={(e) => setFrequency(e.target.value)}
            >
                <option value="n">Nessuna</option>
                <option value="d">Giornaliera</option>
                <option value="w">Settimanale</option>
                <option value="m">Mensile</option>
                <option value="y">Annuale</option>
            </select>
            </label>
        </div>
        <div>
            <label>
            Luogo:
            <input
                type="text"
                value={place}
                onChange={(e) => setPlace(e.target.value)}
            />
            </label>
        </div>
        <button onClick={handleSave}>Salva Evento</button>
    </div>
  );
}

export default Event;
