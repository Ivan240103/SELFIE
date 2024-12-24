import React from 'react'
import { useNavigate } from "react-router-dom"

function Unauthorized() {
  const navigate = useNavigate()

  return(
    <div>
      <h1>Non sei autorizzato</h1>
      <button type="button" onClick={() => {
        navigate('/')
      }}>Vai al login</button>
    </div>
  )
}

export default Unauthorized;
