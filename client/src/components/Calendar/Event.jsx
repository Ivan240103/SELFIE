import React, { useState, useEffect } from 'react';
import { useTimeMachine } from '../TimeMachine/TimeMachineContext'
import {
  datetimeToString,
  datetimeToDateString
} from '../../utils/dates';
import Modal from 'react-modal'

import '../../css/Event.css';

// per accessibilità, scritto nella documentazione
Modal.setAppElement('#root');

/* PER PAYAM
Trasformare il componente ritornato in un <Modal> che mostri il form con i
campi dell'evento (prendi spunto da TimeMachine.jsx se serve).
Interazioni dell'utente (il form deve essere sempre lo stesso):
- quando l'utente clicca su un evento si apre con i campi readOnly (già riempiti). Devono
  esserci due bottoni: per entrare in modalità di modifica e per eliminare l'evento.
- per la modalità di modifica consiglio uno useState boolean, il cui valore viene assegnato
  negato agli attr readOnly, così gestisci i campi modificabili. In modifica ci devono
  essere i button annulla e salva.
- mettere una modalità su Calendar per creare un evento (bottone?, click sulle caselle?), che
  fa aprire il Modal con i campi vuoti editabili e due bottoni per salvare o annullare.
Quando il Modal viene chiuso in Calendar rimettere eventDetails a null, così che i campi
tornino ai valori default.
*/

function Event({ onSaveEvent, onUpdateEvent, onDeleteEvent, eventDetails, user }) {
  // tempo in vigore per l'utente (fuso orario UTC)
  const { time } = useTimeMachine();

  const [event, setEvent] = useState({})
  const [modalIsOpen, setModalIsOpen] = useState(false)

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [start, setStart] = useState(time); // di tipo Date
  const [end, setEnd] = useState(time);   // di tipo Date
  const [isAllDay, setIsAllDay] = useState(true);
  const [place, setPlace] = useState("");
  const [googleId, setGoogleId] = useState('')
  const [isRecurrent, setIsRecurrent] = useState(false);
  const [freq, setFreq] = useState('daily');
  const [interval, setInterval] = useState(1);
  const [term, setTerm] = useState('n')
  const [until, setUntil] = useState(time.toISOString().substring(0, 10))
  const [count, setCount] = useState(1)
  const [reminders, setReminders] = useState([])

  // recupera l'evento specifico dal backend
  useEffect(() => {
    const fetchEvent = async () => {
      if (eventDetails) {
        try {
          const response = await fetch(`${process.env.REACT_APP_API}/api/events/${eventDetails}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          });
          const event = await response.json();
          setEvent(event)
        } catch (error) {
          alert(error.message || 'no response')
        }
      } else {
        setEvent({})
      }
    }

    fetchEvent()
  }, [eventDetails])

  // popola i campi per riempire il form
  useEffect(() => {
    const setFields = () => {
      setTitle(event.title || "")
      setDescription(event.description || "")
      setStart(event.start ? new Date(event.start) : time)
      setEnd(event.end ? new Date(event.end) : time)
      setIsAllDay(event.isAllDay === false ? false : true)
      setPlace(event.place || "")
      setGoogleId(event.googleId || '')
      setIsRecurrent(event?.rrule ? true : false)
      setFreq(event?.rrule?.freq || 'daily')
      setInterval(event?.rrule?.interval || 1)
      if (event?.rrule?.until) {
        setTerm('u')
        setUntil(event?.rrule?.until)
        setCount(1)
      } else if (event?.rrule?.count) {
        setTerm('c')
        setUntil(time.toISOString().substring(0, 10))
        setCount(event?.rrule?.count)
      } else {
        setTerm('n')
        setUntil(time.toISOString().substring(0, 10))
        setCount(1)
      }
      if (event?.reminders) {
        const remindersArray = event.reminders.split(',').map(reminder => {
          const r = reminder.split(':')
          return { method: r[0], minutes: r[1] }
        })
        setReminders(remindersArray)
      } else {
        setReminders([])
      }
    }

    setFields()
  }, [event])

  /**
   * Crea un oggetto rrule che rispetti il formato per il
   * plugin di FullCalendar, usando gli state
   * 
   * @returns oggetto rappresentante una RRule
   */
  const createRRule = () => {
    if (term === 'n') {
      return {
        freq: freq,
        interval: interval,
        dtstart: start
      }
    } else if (term === 'u') {
      return {
        freq: freq,
        interval: interval,
        dtstart: start,
        until: until
      }
    } else {
      return {
        freq: freq,
        interval: interval,
        dtstart: start,
        count: count
      }
    }
  }

  function remindersToString() {
    return reminders.map(r => `${r.method}:${r.minutes}`).join(',')
  }

  const handleSave = async () => {
    const rrule = isRecurrent ? createRRule() : null
    const reminders = remindersToString()
    const eventData = {
      title: title,
      description: description,
      start: start.toISOString(),
      end: end.toISOString(),
      isAllDay: isAllDay,
      rrule: rrule,
      place: place,
      reminders: reminders
    };

    try {
      const response = await fetch(`${process.env.REACT_APP_API}/api/events/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}` // Importante!
        },
        body: JSON.stringify(eventData),
      });
      if (!response.ok) {
        throw new Error(`Errore HTTP: ${response.text}`);
      }

      const result = await response.text();
      alert('Evento salvato con successo:', result);
    } catch (err) {
      alert('Errore nel salvataggio dell\'evento:', err.message || 'no response');
    }
  };

  const handleUpdate = async () => {
    if (!eventDetails) {
      alert("Errore: ID evento non trovato.");
      return;
    }
    const rrule = isRecurrent ? createRRule() : null
    const reminders = remindersToString()
    const updatedEventData = {
      title: title,
      description: description,
      start: start.toISOString(),
      end: end.toISOString(),
      isAllDay: isAllDay,
      rrule: rrule,
      place: place,
      reminders: reminders
    };

    try {
      const response = await fetch(`${process.env.REACT_APP_API}/api/events/${eventDetails}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(updatedEventData),
      });

      const result = await response.text();
      alert('Evento aggiornato con successo:', result);
      onUpdateEvent({ ...updatedEventData, id: eventDetails });
    } catch (err) {
      alert('Errore nell\'aggiornamento dell\'evento:', err.message || 'no response');
    }
  };

  const handleDelete = async () => {
    if (!eventDetails) {
      alert("Errore: ID evento non trovato.");
      return;
    }
    try {
      const response = await fetch(`${process.env.REACT_APP_API}/api/events/${eventDetails}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      alert('ID evento da eliminare:', eventDetails);
      if (!response.ok) {
        throw new Error(`Errore HTTP: ${response.status}`);
      }

      alert('Evento cancellato con successo!');
      onDeleteEvent(eventDetails);
    } catch (err) {
      alert('Errore nella cancellazione dell\'evento:', err.message || 'no response');
    }
  };

  return (
    <div className="event-form">
      <h3>{!eventDetails ? 'Crea' : googleId ? 'Visiona' : 'Modifica'} Evento</h3>
      <button onClick={() => setModalIsOpen(true)}> Dettagli Evento</button>
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={() => setModalIsOpen(false)}
        className='event-modal'
      >
        <div>
          <label>Titolo:</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
        <div>
          <label>Descrizione:</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          ></textarea>
        </div>
        <div>
          <label>Evento per tutto il giorno:</label>
          <input
            type="checkbox"
            checked={isAllDay}
            onChange={(e) => setIsAllDay(e.target.checked)}
          />
        </div>
        <div hidden={!isAllDay}>
          <label>Giorno:</label>
          <input
            type="date"
            value={datetimeToDateString(start)}
            onChange={(e) => {
              setStart(new Date(e.target.value))
              setEnd(new Date(e.target.value))
            }}
          />
        </div>
        <div hidden={isAllDay}>
          <label>
            Inizio:
          </label>
          <input
            type="datetime-local"
            value={datetimeToString(start)}
            onChange={(e) => setStart(new Date(e.target.value))}
          />
        </div>
        <div hidden={isAllDay}>
          <label>Fine:</label>
            <input
              type="datetime-local"
              value={datetimeToString(end)}
              onChange={(e) => setEnd(new Date(e.target.value))}
            />
        </div>
        <div>
          <label>Evento ricorrente:</label>
          <input
            type="checkbox"
            checked={isRecurrent}
            onChange={(e) => setIsRecurrent(e.target.checked)}
          />
        </div>
        <div hidden={!isRecurrent}>
          <label>Ripeti ogni:</label>
          <input
            type="number"
            min='1'
            value={interval}
            onChange={(e) => setInterval(e.target.value)}
          />
          <select
            value={freq}
            onChange={(e) => setFreq(e.target.value)}
          >
            <option value='daily'>{interval === 1 ? 'Giorno' : 'Giorni'}</option>
            <option value='weekly'>{interval === 1 ? 'Settimana' : 'Settimane'}</option>
            <option value='monthly'>{interval === 1 ? 'Mese' : 'Mesi'}</option>
            <option value='yearly'>{interval === 1 ? 'Anno' : 'Anni'}</option>
          </select>
          <label>Scade...</label>
          <input
            type="radio"
            name="end"
            value='n'
            checked={term === 'n'}
            onChange={(e) => setTerm(e.target.value)}
          /> Mai
          <br />
          <input
            type="radio"
            name="end"
            value='u'
            checked={term === 'u'}
            onChange={(e) => setTerm(e.target.value)}
          /> Il <input
            type="date"
            value={until}
            onChange={(e) => setUntil(e.target.value)}
          />
          <br />
          <input
            type="radio"
            name="end"
            value='c'
            checked={term === 'c'}
            onChange={(e) => setTerm(e.target.value)}
          /> Dopo <input
            type="number"
            value={count}
            onChange={(e) => setCount(e.target.value)}
          /> {count === 1 ? 'ripetizione' : 'ripetizioni'}
        </div>
        <div>
          <label>Luogo:</label>
          <input
            type="text"
            value={place}
            onChange={(e) => setPlace(e.target.value)}
          />
        </div>
        {user.notification && <div>
          {/* <label> TODO: fix reminders creation
                Promemoria
            </label>
            <input
                type="number"
                min='1'
            />
            <select>
                <option value='daily'>{ === 1 ? 'Minuto' : 'Minuti'}</option>
                <option value='daily'>{ === 1 ? 'Ora' : 'Ore'}</option>
                <option value='daily'>{ === 1 ? 'Giorno' : 'Giorni'}</option>
            </select>
            prima, tramite
            <input
                type="radio"
                name="method-rem1"
                value='email'
                checked={}
            /> Email
            <input
                type="radio"
                name="method-rem1"
                value='popup'
                checked={}
            /> Popup */}
        </div>}
        {!googleId && <>
          {eventDetails ? (
            <>
              <button onClick={handleUpdate}>
                Aggiorna Evento
              </button>
              <button onClick={handleDelete}>
                Elimina Evento
              </button>
            </>
          ) : (
            <button onClick={handleSave}>
              Salva Evento
            </button>
          )}
        </>}
      </Modal>
    </div>
  );
}

export default Event;
