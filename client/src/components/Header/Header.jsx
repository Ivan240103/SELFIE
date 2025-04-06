import React from 'react'
import { useNavigate, useLocation } from "react-router-dom"
import TimeMachine from './TimeMachine'
import Notifier from './Notifier'

import { Button } from '@heroui/react'

function Header() {
  const navigate = useNavigate()
  const { pathname } = useLocation()

  return (
    <header className='flex flex-row justify-between m-4'>
      {/* TODO: aggiungere icona freccia indietro */}
      <Button
        color='default'
        variant='solid'
        onPress={() => navigate(-1)}
        isDisabled={pathname === '/'}
        // isIconOnly
      >
        Indietro
      </Button>
      <TimeMachine />
      <Notifier />
    </header>
  )
}

export default Header
