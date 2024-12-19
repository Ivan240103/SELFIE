import React from "react"
import { useTimeMachine } from "./TimeMachineContext"

import '../../css/TimeMachine.css'

function TimeMachine() {
  const { time, updateTime, resetTime } = useTimeMachine()

  const backToTheFuture = async () => {
    // TODO: aprire un modale per cambiare il tempo
    const d = new Date(Date.now() + 43200000)
    await updateTime(d)
  }

  return(
    <div className="time-container">
      <button type="button"
        onClick={() => backToTheFuture()}>
        {time.toUTCString()}
      </button>
      <button type="button"
        onClick={() => resetTime()}>
        Reset
      </button>
    </div>
  )
}

export default TimeMachine
