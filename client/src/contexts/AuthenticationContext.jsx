/**
 * Authentication handling context
 */
import React, { createContext, useState, useContext } from "react"

const AuthenticationContext = createContext({
  isAuthenticated: false,
  login: () => {},
  logout: () => {}
})

export const AuthenticationProvider = ({ children }) => {
  // stato dell'autenticazione dell'utente
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'))
  
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
  }

  return(
    <AuthenticationContext.Provider
      value={{ isAuthenticated, login, logout }}
    >
      {children}
    </AuthenticationContext.Provider>
  )
}

// custom hook per usare l'AuthenticationContext
export const useAuth = () => {
  return useContext(AuthenticationContext)
}
