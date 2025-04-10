/**
 * Authentication handling context
 */
import React, { createContext, useState, useContext, useRef } from "react"
import { showSuccess, showAuth } from "../utils/toasts"

const AuthenticationContext = createContext({
  isAuthenticated: false,
  login: () => {},
  logout: () => {},
  checkAuth: () => {}
})

export const AuthenticationProvider = ({ children }) => {
  // stato dell'autenticazione dell'utente
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'))
  // true se l'autenticazione è già stata verificata, false altrimenti
  const isChecked = useRef(false)
  
  /**
   * Effettua il login e imposta l'autenticazione
   */
  const login = (token) => {
    localStorage.setItem('token', token)
    setIsAuthenticated(true)
  }

  /**
   * Effettua il logout e reimposta l'autenticazione
   */
  const logout = () => {
    localStorage.removeItem('token')
    setIsAuthenticated(false)
    showSuccess('Logout effettuato')
  }

  /**
   * Verifica l'autenticazione. Se l'utente non è autenticato
   * viene mandato alla pagina di login
   * 
   * @param {Navigate} navigate funzione di navigazione di react-router-dom
   */
  const checkAuth = (navigate) => {
    if (!isChecked.current && !isAuthenticated) {
      isChecked.current = true
      showAuth()
      setTimeout(() => {
        navigate('/login')
      }, 5000);
    }
  }

  return(
    <AuthenticationContext.Provider
      value={{ isAuthenticated, login, logout, checkAuth }}
    >
      {children}
    </AuthenticationContext.Provider>
  )
}

// custom hook per usare l'AuthenticationContext
export const useAuth = () => {
  return useContext(AuthenticationContext)
}
