import React, { useState, useEffect } from 'react'
import { useNavigate } from "react-router-dom";
import axios from 'axios';
import { useAuth } from '../../contexts/AuthenticationContext';
import { showError, showWarning } from '../../utils/toasts';
import Header from '../Header/Header'
import PreviewCalendar from './PreviewCalendar'
import PreviewNote from './PreviewNote'
import PreviewTasks from './PreviewTasks'
import PreviewTomato from './PreviewTomato'

import {
  Card,
  CardHeader,
  CardBody,
  Avatar
} from '@heroui/react'

function PreviewCard({
  onClick, imgSrc, imgAlt, title, description, children
}) {
  return (
    <Card isPressable onPress={onClick}>
      <CardHeader>
        <Avatar
          src={imgSrc}
          alt={imgAlt}
          radius='sm'
          style={{ backgroundColor: 'white' }}
        />
        <div>
          <h2>{title}</h2>
          <span>{description}</span>
        </div>
      </CardHeader>
      <CardBody>
        {children}
      </CardBody>
    </Card>
  )
}

function Dashboard() {
  const navigate = useNavigate()
  const { isAuthenticated, logout } = useAuth()
  const [user, setUser] = useState({})

  // recupera il profilo utente
  useEffect(() => {
    const fetchUser = async () => {
      if (isAuthenticated) {
        try {
          const response = await axios.get(`${process.env.REACT_APP_API}/api/users/`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
          })
          setUser(response.data)
        } catch (error) {
          showError('fetchUser error')
          setUser({})
        }
      } else {
        setUser({})
      }
    }

    fetchUser()
  }, [isAuthenticated])

  function handleProfileClick() {
    if (isAuthenticated) {
      navigate('/profile')
    } else {
      navigate('/login')
    }
  }

  function authNav(path) {
    if (isAuthenticated) {
      navigate(path)
    } else {
      showWarning('Non sei autorizzato')
    }
  }

  return(
    <div>
      <Header />
      <div className='w-3/5 mx-auto mt-12 pb-12 grid grid-cols-2 gap-8'>
        <Card className='col-span-2' isPressable onPress={handleProfileClick}>
          <CardHeader>
            <Avatar
              src={`${process.env.REACT_APP_API}/pics/${user.picName || 'default.png'}`}
              alt='icona del profilo'
              className='w-24 h-24 bg-color-white'
            />
            {isAuthenticated ? (
              <div>
                <h2>Profilo personale</h2>
                <span>Personalizza il tuo profilo!</span>
                <span>{user.name || ''} {user.surname || ''}, {user.email || 'nessuna email'}</span>
              </div>
            ) : (
              <div>
                <h2>Login</h2>
                <span>Effettua il login o registrati!</span>
              </div>
            )}
          </CardHeader>
        </Card>
        <PreviewCard
          onClick={() => authNav('/calendar')}
          imgSrc="/images/calendar-icon.png"
          imgAlt="icona del calendario"
          title="Calendario"
          description="Organizza la tua routine!"
        >
          <PreviewCalendar />
        </PreviewCard>
        <PreviewCard
          onClick={() => authNav('/notes')}
          imgSrc='/images/note-icon.png'
          imgAlt='icona delle note'
          title='Note'
          description='Scrivi qualunque appunto!'
        >
          <PreviewNote />
        </PreviewCard>
        <PreviewCard
          onClick={() => authNav('/task')}
          imgSrc='/images/task-icon.png'
          imgAlt='icona dei task'
          title='Task'
          description='Traccia le cose da fare!'
        >
          <PreviewTasks />
        </PreviewCard>
        <PreviewCard
          onClick={() => authNav('/tomato')}
          imgSrc='/images/tomato-icon.png'
          imgAlt='icona del timer'
          title='Pomodoro'
          description='Imposta il tempo di studio!'
        >
          <PreviewTomato />
        </PreviewCard>
        {isAuthenticated && (
          <Card className='col-span-2' isPressable onPress={() => logout()}>
            <CardHeader>
              <Avatar
                src='/images/logout-icon.png'
                alt='icona del logout'
                radius='sm'
                style={{ backgroundColor: 'white' }}
              />
              <div>
                <h2>Logout</h2>
                <span>Esci dal profilo!</span>
              </div>
            </CardHeader>
          </Card>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
