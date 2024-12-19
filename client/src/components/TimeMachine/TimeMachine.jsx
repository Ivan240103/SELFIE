import React from "react"
import { useTimeMachine } from "./TimeMachineContext"

import '../../css/TimeMachine.css'

function TimeMachine() {
  const { time, updateTime, resetTime } = useTimeMachine()

  // TODO: aprire un modale per cambiare il tempo e/o resettarlo

  const backToTheFuture = async () => {
    const d = new Date(time.getTime() + 43200000)
    await updateTime(d)
  }

  return(
    <div className="time-container">
      <div className="time-display">
        <button
          type="button"
          className="time-btn"
          onClick={() => backToTheFuture()}>{time.toLocaleString('it-IT')}</button>
      </div>
    </div>
  )
}

export default TimeMachine
