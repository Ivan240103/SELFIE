/**
 * USO DI Claude PER LA GENERAZIONE DEL CONTEXT TEMPLATE
 */
import React, { createContext, useState, useEffect, useContext } from "react"
import axios from 'axios'

const TimeMachineContext = createContext({
  time: new Date(),
  isTimeLoading: true,
  updateTime: async () => {},
  resetTime: async () => {}
})

export const TimeMachineProvider = ({ children }) => {
  // stato per il tempo in vigore
  const [time, setTime] = useState(new Date())
  // stato per il caricamento del tempo dal backend
  const [isTimeLoading, setIsTimeLoading] = useState(true)

  // recuperare il tempo in vigore dell'utente
  useEffect(() => {
    const fetchTime = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API}/api/users/time`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        })
        setTime(new Date(response.data))
        setIsTimeLoading(false)
      } catch (err) {
        alert('Fetch time failed in context')
      }
    }

    fetchTime()
  }, [])

  // interval per aggiornare il tempo ogni minuto
  useEffect(() => {
    const interval = setInterval(() => {
      setTime(prevTime => {
        return new Date(prevTime.getTime() + 60000)
      })
    }, 59990)

    return () => clearInterval(interval)
  }, [])
  
  /**
   * Modifica il tempo in vigore per l'utente
   * 
   * @param {Date} newTime tempo da impostare per l'utente
   */
  const updateTime = async (newTime) => {
    try {
      setIsTimeLoading(true)
      const response = await axios.put(`${process.env.REACT_APP_API}/api/users/time`, {
        time: newTime.toISOString()
      },
      {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      })

      setTime(new Date(response.data))
      setIsTimeLoading(false)
    } catch (error) {
      alert('Time update failed in context')
    }
  }

  /**
   * Reimposta il tempo dell'utente a quello di sistema
   */
  const resetTime = async () => {
    try {
      setIsTimeLoading(true)
      const response = await axios.put(`${process.env.REACT_APP_API}/api/users/time`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      })

      setTime(new Date(response.data))
      setIsTimeLoading(false)
    } catch (error) {
      alert('Time reset failed in context')
    }
  }

  return(
    <TimeMachineContext.Provider 
      value={{ time, isTimeLoading, updateTime, resetTime }} >
      {children}
    </TimeMachineContext.Provider>
  )
}

// custom hook per usare il TimeMachineContext
export const useTimeMachine = () => {
  return useContext(TimeMachineContext)
}
