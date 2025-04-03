import React, { useState, useEffect, useCallback } from 'react';
import _ from 'lodash';
import { useTime } from '../../contexts/TimeContext'
import {
  getDatetimeString,
  getDateString
} from '../../utils/dates';
import {
  showError,
  showSuccess
} from '../../utils/toasts';

import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody
} from "@heroui/react";

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

// FIXME: la scelta della data inizialmente non rispetta il tempo dell'utente

function Event({
  eventId, user, onSaveEvent, onUpdateEvent, onDeleteEvent, isModalOpen, setIsModalOpen
}) {
  // tempo in vigore per l'utente (fuso orario UTC)
  const { time } = useTime();
  const [event, setEvent] = useState({})
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [start, setStart] = useState(new Date());
  const [end, setEnd] = useState(new Date());
  const [isAllDay, setIsAllDay] = useState(true);
  const [place, setPlace] = useState('');
  const [suggestions, setSuggestions] = useState([])
  const [mapsLocated, setMapsLocated] = useState(false)
  const [googleId, setGoogleId] = useState('')
  const [isRecurrent, setIsRecurrent] = useState(false);
  const [freq, setFreq] = useState('');
  const [interval, setInterval] = useState('');
  const [term, setTerm] = useState('');
  const [until, setUntil] = useState(new Date())
  const [count, setCount] = useState('')
  const [emailReminder, setEmailReminder] = useState({})
  const [pushReminder, setPushReminder] = useState({})

  // recupera l'evento specifico dal backend
  useEffect(() => {
    const fetchEvent = async () => {
      if (eventId) {
        try {
          const response = await fetch(`${process.env.REACT_APP_API}/api/events/${eventId}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          });
          if (response.ok) { 
            const event = await response.json();
            setEvent(event)
          } else {
            throw new Error()
          }
        } catch (error) {
          showError('fetchEvent error')
          setEvent({})
        }
      } else {
        setEvent({})
      }
    }

    fetchEvent()
  }, [eventId])

  // popola i campi
  useEffect(() => {
    const setFields = () => {
      setTitle(event.title || "Senza titolo")
      setDescription(event.description || "Nessuna descrizione")
      setStart(event.start ? new Date(event.start) : time)
      setEnd(event.end ? new Date(event.end) : time)
      setIsAllDay(event.isAllDay ?? true)
      setPlace(event.place ?? "")
      setMapsLocated(event.mapsLocated ?? false)
      setGoogleId(event.googleId ?? '')
      setIsRecurrent(event.rrule ? true : false)
      setFreq(event.rrule?.freq || 'daily')
      setInterval(event.rrule?.interval || '1')
      if (event.rrule?.until) {
        setTerm('u')
        setUntil(event.rrule.until)
        setCount('1')
      } else if (event.rrule?.count) {
        setTerm('c')
        setUntil(getDateString(time))
        setCount(event.rrule.count)
      } else {
        setTerm('n')
        setUntil(getDateString(time))
        setCount('1')
      }
      if (event.reminders) {
        event.reminders.split(',').forEach(reminder => {
          const r = reminder.split(':')
          const calc = calcReminder(parseInt(r[1]))
          if (r[0] === "email") {
            setEmailReminder({ checked: true, method: r[0], ...calc })
          } else if (r[0] === "push") {
            setPushReminder({ checked: true, method: r[0], ...calc })
          }
        })
      } else {
        setEmailReminder({ checked: false, method: 'email', before: 15, time: 'm' })
        setPushReminder({ checked: false, method: 'push', before: 15, time: 'm' })
      }
    }

    setFields()
  }, [event])

  /**
   * Crea un oggetto rrule che rispetti il formato per il
   * plugin di FullCalendar
   * 
   * @returns oggetto rappresentante una RRule
   */
  function createRRule() {
    const base = {
      freq: freq,
      interval: interval,
      dtstart: start
    }
    if (term === 'n') {
      return base
    } else if (term === 'u') {
      return { ...base, until: until }
    } else {
      return { ...base, count: count }
    }
  }

  function calcReminder(minutes) {
    if (minutes < 60) {
      return { before: minutes, time: 'm' }
    } else if (minutes < 60*24) {
      return { before: minutes / 60, time: 'h' }
    } else {
      return { before: minutes / (60*24), time: 'd' }
    }
  }

  function remindersToString() {
    const calcMinutes = (t, b) => t === 'm' ? b : (t === 'h' ? b * 60 : b * 60 * 24)
    const rem = []
    if (emailReminder.checked) {
      const minutes = calcMinutes(emailReminder.time, emailReminder.before)
      rem.push(`${emailReminder.method}:${minutes}`)
    }
    if (pushReminder.checked) {
      const minutes = calcMinutes(pushReminder.time, pushReminder.before)
      rem.push(`${pushReminder.method}:${minutes}`)
    }
    return rem.length > 0 ? rem.join(',') : ''
  }

  const handleSave = async () => {
    const eventData = {
      title: title,
      description: description,
      start: start.toISOString(),
      end: end.toISOString(),
      isAllDay: isAllDay,
      rrule: isRecurrent ? createRRule() : null,
      place: place,
      mapsLocated: mapsLocated,
      reminders: remindersToString()
    };

    try {
      const response = await fetch(`${process.env.REACT_APP_API}/api/events/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(eventData)
      });

      if (!response.ok) {
        throw new Error();
      }
      const result = await response.json()
      showSuccess('Evento salvato')
      onSaveEvent(result)
    } catch (err) {
      showError('Errore nel salvataggio')
    }
  }

  const handleUpdate = async () => {
    const eventData = {
      title: title,
      description: description,
      start: start.toISOString(),
      end: end.toISOString(),
      isAllDay: isAllDay,
      rrule: isRecurrent ? createRRule() : null,
      place: place,
      mapsLocated: mapsLocated,
      reminders: remindersToString()
    };

    try {
      const response = await fetch(`${process.env.REACT_APP_API}/api/events/${eventId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(eventData)
      });

      if (!response.ok) {
        throw new Error();
      }
      const result = await response.json();
      showSuccess('Evento aggiornato')
      onUpdateEvent(result);
    } catch (err) {
      showError("Errore nell'aggiornamento")
    }
  }

  const handleDelete = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API}/api/events/${eventId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error();
      }
      showSuccess('Evento eliminato')
      onDeleteEvent(eventId);
    } catch (err) {
      showError("Errore nell'eliminazione")
    }
  }

  const debouncedFetchSuggestions = useCallback(
    _.debounce(async (loc) => {
      if (loc.length < 3) {
        setSuggestions([])
        return
      }
      
      // usa LocationIQ (OpenStreetMap) che è gratis
      try {
        const response = await fetch(
          `https://us1.locationiq.com/v1/search?key=pk.7116bbd07a01adaf5eb1e5740b977e7e&q=${encodeURIComponent(loc)}&format=json`
        )

        if (!response.ok) {
          throw new Error()
        }
        const data = await response.json()
        setSuggestions(data)
      } catch (error) {
        setSuggestions([])
      }
    }, 300),
    []
  )

  // apre google maps alla destinazione impostata
  const openMaps = () => {
    const encodedDest = encodeURIComponent(place)
    // se siamo su un mobile usa il geo protocol
    const isMobile = /Android|webOS|iPhone|iPad/i.test(navigator.userAgent)
    
    const url = isMobile ? `geo:0,0?q=${encodedDest}` : `https://www.google.com/maps/search/?api=1&query=${encodedDest}`
    window.open(url, '_blank')
  }

  return (
    <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
      <ModalContent>
        <ModalHeader>Evento</ModalHeader>
        <ModalBody>
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
              value={getDateString(start)}
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
              value={getDatetimeString(start)}
              onChange={(e) => setStart(new Date(e.target.value))}
            />
          </div>
          <div hidden={isAllDay}>
            <label>Fine:</label>
            <input
              type="datetime-local"
              value={getDatetimeString(end)}
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
              <option value='daily'>{interval === '1' ? 'Giorno' : 'Giorni'}</option>
              <option value='weekly'>{interval === '1' ? 'Settimana' : 'Settimane'}</option>
              <option value='monthly'>{interval === '1' ? 'Mese' : 'Mesi'}</option>
              <option value='yearly'>{interval === '1' ? 'Anno' : 'Anni'}</option>
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
            /> {count === '1' ? 'ripetizione' : 'ripetizioni'}
          </div>
          <div>
            <label>Luogo:</label>
            <input
              type="text"
              value={place}
              onChange={(e) => {
                setPlace(e.target.value);
                setMapsLocated(false)
                debouncedFetchSuggestions(e.target.value);
              }}
              placeholder="Enter location"
            />
            {suggestions.length > 0 && (
              <ul>
                {suggestions.map((s) => (
                  <li
                    key={s.place_id}
                    onClick={() => {
                      setPlace(s.display_name);
                      setMapsLocated(true)
                      setSuggestions([]);
                    }}
                  >
                    {s.display_name}
                  </li>
                ))}
              </ul>
            )}
            {mapsLocated && <button type="button" onClick={() => openMaps()}>Mappa</button>}
          </div>
          {user.notification && <div>
            <label>Promemoria</label>
            <br />
            <input
              type="checkbox"
              checked={emailReminder.checked}
              onChange={e => setEmailReminder(prev => ({
                ...prev,
                checked: e.target.checked
              }))}
            /> Email
            <input
              type="number"
              min={emailReminder.time === 'm' ? 5 : 1}
              disabled={!emailReminder.checked}
              value={emailReminder.before}
              onChange={e => setEmailReminder(prev => ({
                ...prev,
                before: e.target.value
              }))}
            />
            <select
              disabled={!emailReminder.checked}
              value={emailReminder.time}
              onChange={e => setEmailReminder(prev => ({
                ...prev,
                time: e.target.value
              }))}
            >
              <option value='m'>{emailReminder.before === '1' ? 'Minuto' : 'Minuti'}</option>
              <option value='h'>{emailReminder.before === '1' ? 'Ora' : 'Ore'}</option>
              <option value='d'>{emailReminder.before === '1' ? 'Giorno' : 'Giorni'}</option>
            </select> prima
            <br />
            <input
              type="checkbox"
              checked={pushReminder.checked}
              onChange={e => setPushReminder(prev => ({
                ...prev,
                checked: e.target.checked
              }))}
            /> Push
            <input
              type="number"
              min={pushReminder.time === 'm' ? 5 : 1}
              disabled={!pushReminder.checked}
              value={pushReminder.before}
              onChange={e => setPushReminder(prev => ({
                ...prev,
                before: e.target.value
              }))}
            />
            <select
              disabled={!pushReminder.checked}
              value={pushReminder.time}
              onChange={e => setPushReminder(prev => ({
                ...prev,
                time: e.target.value
              }))}
            >
              <option value='m'>{pushReminder.before === '1' ? 'Minuto' : 'Minuti'}</option>
              <option value='h'>{pushReminder.before === '1' ? 'Ora' : 'Ore'}</option>
              <option value='d'>{pushReminder.before === '1' ? 'Giorno' : 'Giorni'}</option>
            </select> prima
          </div>}
          {!googleId && <>
            {eventId ? (
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
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}

export default Event;
