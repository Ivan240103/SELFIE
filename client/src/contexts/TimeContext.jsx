/**
 * Time handling context
 */
import React, { createContext, useState, useEffect, useContext } from "react"
import axios from 'axios'
import { useAuth } from "./AuthenticationContext"
import { showError } from '../utils/toasts'

const TimeContext = createContext({
  time: new Date(),
  isTimeLoading: true,
  updateTime: async () => {},
  resetTime: async () => {}
})

export const TimeProvider = ({ children }) => {
  const { isAuthenticated } = useAuth()
  // tempo in vigore
  const [time, setTime] = useState(new Date())
  // stato del caricamento del tempo dal backend
  const [isTimeLoading, setIsTimeLoading] = useState(true)

  // recuperare il tempo in vigore dell'utente
  useEffect(() => {
    const fetchTime = async () => {
      if (isAuthenticated) {
        try {
          const response = await axios.get(`${process.env.REACT_APP_API ?? ''}/api/users/time`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
          })
          setTime(new Date(response.data))
          setIsTimeLoading(false)
        } catch (error) {
          setTime(new Date())
          setIsTimeLoading(false)
          showError('fetchTime failed in context')
        }
      } else {
        setTime(new Date())
        setIsTimeLoading(false)
      }
    }

    fetchTime()
  }, [isAuthenticated])

  // interval per aggiornare il tempo ogni minuto
  useEffect(() => {
    const interval = setInterval(() => {
      setTime(prev => new Date(prev.getTime() + 60000))
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
      const response = await axios.put(
        `${process.env.REACT_APP_API ?? ''}/api/users/time`,
        { time: newTime.toISOString() },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      )

      setTime(new Date(response.data))
      setIsTimeLoading(false)
    } catch (error) {
      setIsTimeLoading(false)
      showError('updateTime failed in context')
    }
  }

  /**
   * Reimposta il tempo dell'utente a quello di sistema
   */
  const resetTime = async () => {
    try {
      setIsTimeLoading(true)
      const response = await axios.put(`${process.env.REACT_APP_API ?? ''}/api/users/time`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      })

      setTime(new Date(response.data))
      setIsTimeLoading(false)
    } catch (error) {
      setIsTimeLoading(false)
      showError('resetTime failed in context')
    }
  }

  return(
    <TimeContext.Provider
      value={{ time, isTimeLoading, updateTime, resetTime }}
    >
      {children}
    </TimeContext.Provider>
  )
}

// custom hook per usare il TimeContext
export const useTime = () => {
  return useContext(TimeContext)
}
