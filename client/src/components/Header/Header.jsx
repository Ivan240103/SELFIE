import React from 'react'
import { useNavigate, useLocation } from "react-router-dom"
import TimeMachine from './TimeMachine'
import Notifier from './Notifier'

import { Button } from '@heroui/react'

function Header() {
  const navigate = useNavigate()
  const { pathname: p } = useLocation()

  return (
    <header className='flex flex-row justify-between m-4'>
      <Button
        color='secondary'
        isIconOnly
        onPress={() => navigate(-1)}
        isDisabled={p === '/' || p === '/login'}
        className='disabled:bg-transparent'
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
          <path d="M20,10c-2.3-0.2-10,0-10,0V6c0-0.8-0.8-1.3-1.4-0.8l-6.3,6c-0.5,0.4-0.5,1.2,0,1.6l6.3,6c0.6,0.5,1.4,0,1.4-0.8 v-4c0,0,7.6,0.2,10,0c1.1-0.1,2-0.9,2-2C22,10.9,21.1,10.1,20,10z" fill='#FFFFFF'/>
        </svg>
      </Button>
      <TimeMachine />
      <Notifier />
    </header>
  )
}

export default Header
