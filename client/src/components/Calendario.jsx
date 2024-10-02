import React, { useState } from "react";
import "./Calendario.css";

function Calendario(){
    
    const [currentDate, setCurrentDate] = useState(new Date());

    // Funzione per ottenere il nome del mese corrente
    const getMonthName = (monthIndex) => {
        const months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
        ];
        return months[monthIndex];
    };

    // Funzione per ottenere il numero di giorni nel mese corrente
    const getDaysInMonth = (year, month) => {
        return new Date(year, month + 1, 0).getDate();
    };

    // Funzione per cambiare mese (incrementare o decrementare)
    const changeMonth = (direction) => {
        const newDate = new Date(currentDate);
        newDate.setMonth(newDate.getMonth() + direction);
        setCurrentDate(newDate);
    };

    // Funzione per ottenere il numero del primo giorno del mese corrente (0 = Domenica, 1 = Lunedì, ecc.)
    const getFirstDayOfMonth = (year, month) => {
        return new Date(year, month, 1).getDay();
    };

    // Creazione delle date da visualizzare nel calendario
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDayOfMonth = getFirstDayOfMonth(year, month);

    // Generazione delle celle del calendario
    const calendarDays = [];
    for (let i = 0; i < firstDayOfMonth; i++) {
        calendarDays.push(<div className="empty" key={`empty-${i}`}></div>); // Celle vuote per i giorni prima del primo giorno del mese
    }
    for (let day = 1; day <= daysInMonth; day++) {
        calendarDays.push(
        <button key={day} onClick={() => alert(`Selected date: ${year}-${month + 1}-${day}`)}>
            <time dateTime={`${year}-${month + 1}-${day}`}>{day}</time>
        </button>
        );
    }

    return (
        <main>
            <div className="calendar">
            {/* Navigazione tra i mesi */}
            <div className="month-indicator">
                <button onClick={() => changeMonth(-1)}>{"<"}</button>
                <h2>{getMonthName(month)} {year}</h2>
                <button onClick={() => changeMonth(1)}>{">"}</button>
            </div>
            <div className="lineab"></div>
            
            {/* Giorni della settimana */}
            <div className="day-of-week">
                <div>Su</div>
                <div>Mo</div>
                <div>Tu</div>
                <div>We</div>
                <div>Th</div>
                <div>Fr</div>
                <div>Sa</div>
            </div>

            {/* Griglia delle date */}
            <div className="date-grid">
                {calendarDays}
            </div>
            
            <div className="lineabfine"></div>
            </div>
        </main>
    );
}

export default Calendario;