import React, { useState } from "react"
import Modal from 'react-modal'
import { useTimeMachine } from "./TimeMachineContext"

import '../../css/TimeMachine.css'

// per accessibilità, scritto nella documentazione
Modal.setAppElement('#root');

function TimeMachine() {
  const { time, updateTime, resetTime } = useTimeMachine()
  const [modalIsOpen, setModalIsOpen] = useState(false)
  const [selectedTime, setSelectedTime] = useState(time)

  /**
   * Converte un datetime in una stringa leggibile da un input
   * di type="datetime-local"
   * @param {Date} datetime datetime da convertire
   * @returns Stringa formattata da passare ad un <input>
   */
  const datetimeToString = (datetime) => {
    // aggiungo lo zero prima dei numeri a cifra singola
    const pad = (num) => String(num).padStart(2, '0');
    
    const dd = pad(datetime.getDate());
    const mm = pad(datetime.getMonth() + 1);
    const yyyy = datetime.getFullYear();
    const h = pad(datetime.getHours());
    const m = pad(datetime.getMinutes());
    
    return `${yyyy}-${mm}-${dd}T${h}:${m}`;
}

  /**
   * Sposta il tempo in avanti o indietro
   */
  const backToTheFuture = async (e) => {
    e.preventDefault()
    await updateTime(selectedTime)
    setModalIsOpen(false)
  }

  /**
   * Riporta il tempo al presente
   */
  const reset = async () => {
    await resetTime()
    setModalIsOpen(false)
  }

  return(
    <div className="time-container">
      <button
        type="button"
        className="time-btn"
        onClick={() => setModalIsOpen(true)}>{time.toLocaleString('it-IT')}</button>

      <Modal
        isOpen={modalIsOpen}
        onAfterOpen={() => setSelectedTime(time)}
        onRequestClose={() => setModalIsOpen(false)}
        className='time-modal'
      >
        <h2>Time Machine</h2>
        <form
          onSubmit={(e) => backToTheFuture(e)}
        >
          <div>
            <label htmlFor="picker">
              Seleziona data e ora
            </label>
            <br />
            <input
              type="datetime-local"
              name="picker"
              value={datetimeToString(selectedTime)}
              onChange={(e) => setSelectedTime(new Date(e.target.value))} />
          </div>
          <button
            type="button"
            className="time-reset"
            onClick={reset}>Resetta</button>
          <button
            type="submit"
            className="time-submit">Viaggia</button>
        </form>
      </Modal>
    </div>
  )
}

export default TimeMachine
