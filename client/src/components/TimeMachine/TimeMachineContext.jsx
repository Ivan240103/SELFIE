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
        const response = await axios.get('http://localhost:8000/api/users/time', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        })
        setTime(new Date(response.data))
        setIsTimeLoading(false)
      } catch (err) {
        console.error(err)
      }
    }

    fetchTime()
  }, [])

  // interval per aggiornare il tempo
  useEffect(() => {
    const interval = setInterval(() => {
      setTime(prevTime => {
        return new Date(prevTime.getTime() + 1000)
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [])
  
  /**
   * Modifica il tempo in vigore per l'utente
   * 
   * @param {Date} newTime tempo da impostare per l'utente
   */
  const updateTime = async (newTime) => {
    try {
      const response = await axios.put('http://localhost:8000/api/users/time', {
        time: newTime.toISOString()
      },
      {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      })

      setTime(new Date(response.data))
    } catch (error) {
      console.error(error)
    }
  }

  /**
   * Reimposta il tempo dell'utente a quello di sistema
   */
  const resetTime = async () => {
    try {
      const response = await axios.put('http://localhost:8000/api/users/time', {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      })

      setTime(new Date(response.data))
    } catch (error) {
      console.error(error)
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
