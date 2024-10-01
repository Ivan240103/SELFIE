import React, { useState, useEffect } from 'react';
import './mesi.css';
import './indietro.css';

function Aprile() {
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(3); // 0 = Gennaio, 3 = Aprile
  const [daysInMonth, setDaysInMonth] = useState([]);
  const [firstDay, setFirstDay] = useState(0);

  useEffect(() => {
    // Funzione per ottenere i giorni in un mese
    const getDaysInMonth = (month, year) => {
      return new Date(year, month + 1, 0).getDate(); // Numero di giorni in un mese
    };

    // Funzione per ottenere il primo giorno del mese
    const getFirstDayOfMonth = (month, year) => {
      return new Date(year, month, 1).getDay(); // 0 = Domenica, 6 = Sabato
    };

    const days = getDaysInMonth(month, year); // Ottieni il numero di giorni in aprile
    const firstDayOfWeek = getFirstDayOfMonth(month, year); // Ottieni il giorno della settimana per il primo giorno del mese

    setDaysInMonth(Array.from({ length: days }, (_, i) => i + 1)); // Crea un array con i giorni
    setFirstDay(firstDayOfWeek); // Imposta il primo giorno della settimana
  }, [month, year]);

  const daysOfWeek = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

  return (
    <div className="impaginazione">
      <div className="immagine">
        <div>{year}</div>
        <div className="sottotitolo">calendar</div>
      </div>
      <div className="calendario">
        <div className="righe">
          <div className="mese">April</div>
          <div className="numeromese">
            0 <span>4</span>
          </div>
        </div>
        <div className="righe">
          {daysOfWeek.map((day, index) => (
            <div className="giorni" key={index}>
              {day}
            </div>
          ))}
        </div>
        <div className="righe">
          {/* Aggiungi bottoni vuoti prima del primo giorno del mese */}
          {Array(firstDay)
            .fill(null)
            .map((_, index) => (
              <button className="numeri" key={`empty-${index}`} hidden></button>
            ))}

          {/* Aggiungi i bottoni con i numeri dei giorni */}
          {daysInMonth.map((day) => (
            <button className="numeri" key={day}>
              <time dateTime={`2024-04-${String(day).padStart(2, '0')}`}>
                {day}
              </time>
            </button>
          ))}
        </div>
      </div>

      <button className="home-link" onClick={() => window.location.href = './Home.html'}>
        <span className="arrow"></span>
      </button>
    </div>
  );
}

export default Aprile;