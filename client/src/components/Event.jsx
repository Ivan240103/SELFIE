import React, { useState } from 'react';

function Event({ onSaveEvent, onUpdateEvent, onDeleteEvent, eventDetails }) {
    const [title, setTitle] = useState(eventDetails?.title || "");
    const [description, setDescription] = useState(eventDetails?.description || "");
    const [start, setStart] = useState(eventDetails?.start || "");
    const [end, setEnd] = useState(eventDetails?.end || "");
    const [isAllDay, setIsAllDay] = useState(eventDetails?.isAllDay || true);
    const [frequency, setFrequency] = useState(eventDetails?.frequency || "n");
    const [place, setPlace] = useState(eventDetails?.place || "");
    const [owner, setOwner] = useState(eventDetails?.owner || "pay");

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
              'Authorization': `Bearer ${localStorage.getItem('token')}` // Importante!
            },
            body: JSON.stringify(eventData),
        });
        if (!response.ok) {
            throw new Error(`Errore HTTP: ${response.status}`);
          }
      
          const result = await response.text();
          console.log('Evento salvato con successo:', result);
          alert('Evento salvato con successo!');
        } catch (err) {
          console.error('Errore nel salvataggio dell\'evento:', err);
          alert('Errore nel salvataggio dell\'evento.');
        }
  };

  const handleUpdate = async () => {
    if (!eventDetails || !eventDetails.id) {
      alert("Errore: ID evento non trovato.");
      return;
    }
    const updatedEventData = {
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
      const response = await fetch(`http://localhost:8000/api/events/${eventDetails.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(updatedEventData),
      });

      const result = await response.text();
      console.log('Evento aggiornato con successo:', result);
      alert('Evento aggiornato con successo!');
      onUpdateEvent({ ...updatedEventData, id: eventDetails.id });
    } catch (err) {
      console.error('Errore nell\'aggiornamento dell\'evento:', err);
      alert('Errore nell\'aggiornamento dell\'evento.');
    }
  };

  const handleDelete = async () => {
    if (!eventDetails || !eventDetails.id) {
      alert("Errore: ID evento non trovato.");
      return;
    }
    try {
        const response = await fetch(`http://localhost:8000/api/events/${eventDetails.id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        console.log(eventDetails.id);
        if (!response.ok) {
          throw new Error(`Errore HTTP: ${response.status}`);
        }
  
        console.log('Evento cancellato con successo');
        alert('Evento cancellato con successo!');
        onDeleteEvent(eventDetails.id);
      } catch (err) {
        console.error('Errore nella cancellazione dell\'evento:', err);
        alert('Errore nella cancellazione dell\'evento.');
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
        <button onClick={eventDetails ? handleUpdate : handleSave}>
            {eventDetails ? "Aggiorna Evento" : "Salva Evento"}
        </button>
        {eventDetails && (
        <>
          <button onClick={handleDelete}>Elimina Evento</button>
        </>
      )}
    </div>
  );
}

export default Event;
