import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import CryptoJS from 'crypto-js'
import { useAuth } from '../../contexts/AuthenticationContext'
import { getDateString } from '../../utils/dates'
import { showError, showSuccess } from '../../utils/toasts'
import Header from '../Header/Header'
import Password from './Password'

import {
  Alert,
  Avatar,
  Form,
  Input,
  DatePicker,
  ButtonGroup,
  Button
} from '@heroui/react'
import { parseDate } from '@internationalized/date'

function GoogleButton({ isSync, onClick }) {
  return (
    <Button
      className={`flex items-center justify-center gap-3 bg-white ${isSync ? 'disabled:opacity-100' : 'border border-gray-300 hover:bg-gray-100'}`}
      onPress={onClick}
      isDisabled={isSync}
    >
      <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
        <g fill="none" fillRule="evenodd">
          <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4" />
          <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z" fill="#34A853" />
          <path d="M3.964 10.71c-.18-.54-.282-1.117-.282-1.71s.102-1.17.282-1.71V4.958H.957C.347 6.173 0 7.548 0 9s.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05" />
          <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335" />
        </g>
      </svg>
      <span>{isSync ? 'Google Calendar sincronizzato' : 'Sincronizza con Google Calendar'}</span>
    </Button>
  );
};

function Profile() {
  const navigate = useNavigate()
  const { isAuthenticated, logout } = useAuth()
  const [profile, setProfile] = useState({})
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')  // vecchia psw per validazione
  const [modifiedPsw, setModifiedPsw] = useState('12345678')  // nuova psw | mock
  const [name, setName] = useState('')
  const [surname, setSurname] = useState('')
  const [birthday, setBirthday] = useState(null)
  const [pic, setPic] = useState(null)
  const [google, setGoogle] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [isAlertVisible, setIsAlertVisible] = useState(false)
  
  // recupera i dati del profilo dal backend
  useEffect(() => {
    const fetchProfile = async () => {
      if (isAuthenticated) { 
        try {
          const response = await axios.get(`${process.env.REACT_APP_API}/api/users/`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
          })
          setProfile(response.data)
        } catch (err) {
          showError('fetchProfile error')
          setProfile({})
        }
      } else {
        setProfile({})
      }
    }

    fetchProfile()
  }, [isAuthenticated])

  // popola i campi
  useEffect(() => {
    const populate = () => {
      setUsername(profile.username || '???')
      setEmail(profile.email || '???')
      setPassword('')
      setModifiedPsw('12345678')
      setName(profile.name ?? '')
      setSurname(profile.surname ?? '')
      setBirthday(profile.birthday ? new Date(profile.birthday) : null)
      setGoogle(!!profile.google ?? false)
    }

    populate()
  }, [profile])

  /**
   * Reimposta i valori dei campi
   */
  function handleReset() {
    setIsEditing(false)
    setProfile(JSON.parse(JSON.stringify(profile)))
  }

  /**
   * Entrare in modalità di modifica
   */
  function enterEdit() {
    setModifiedPsw('')
    setIsEditing(true)
  }

  /**
   * Salvare le modifiche al profilo
   * 
   * @param e evento di submit
   */
  const handleUpdate = async (e) => {
    e.preventDefault()
    setIsEditing(false)
    // formData per poter inviare l'immagine
    const formData = new FormData()
    formData.append('email', email)
    if (password !== '') {
      formData.append('oldPsw', CryptoJS.SHA1(password).toString(CryptoJS.enc.Hex))
    }
    if (modifiedPsw !== '') {
      formData.append('newPsw', CryptoJS.SHA1(modifiedPsw).toString(CryptoJS.enc.Hex))
    }
    formData.append('name', name)
    formData.append('surname', surname)
    formData.append('birthday', birthday)
    formData.append('pic', pic)

    try {
      const response = await axios.put(`${process.env.REACT_APP_API}/api/users/`, formData, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      })
      setProfile(response.data)
      showSuccess('Profilo aggiornato')
    } catch (err) {
      showError("Errore nell'aggiornamento")
      handleReset()
    }
  }

  /**
   * Cancellare il profilo, previa conferma
   */
  const handleDelete = async () => {
    try {
      await axios.delete(`${process.env.REACT_APP_API}/api/users/`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      })
      logout()
      showSuccess('Profilo eliminato')
      navigate('/')
    } catch (err) {
      showError("Errore nell'eliminazione")
    }
  }

  const syncGoogle = async () => {
    try {
      await axios.put(`${process.env.REACT_APP_API}/api/users/google`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      })
      setProfile(prev => ({ ...prev, google: true }))
      showSuccess('Profilo Google associato')
    } catch (err) {
      showError('Profilo Google non associato')
    }
  }

  return (
    <div>
      <Header />
      {isAlertVisible && <Alert
        className='my-3 fade-in'
        title={<b>Stai eliminando il tuo profilo</b>}
        description="Se procedi non sarai più in grado di recuperarlo"
        color="danger"
        variant="faded"
        endContent={
          <>
            <Button color="danger" variant="light" onPress={() => setIsAlertVisible(false)}>
              Annulla
            </Button>
            <Button color="danger" variant="flat" onPress={handleDelete}>
              Elimina
            </Button>
          </>
        }
      />}
      <div>
        <h2>Ciao, {username}</h2>
        {!isEditing && <Avatar
          src={`${process.env.REACT_APP_API}/pics/${profile.picName || 'default.png'}`}
          className='w-32 h-32'
          alt='Profile'
          isBordered
        />}
        <Form
          className="flex flex-col items-center"
          validationBehavior="native"
          onSubmit={handleUpdate}
        >
          {isEditing && <Input
            type='file'
            label='Carica una foto profilo'
            description='Quadrata è meglio!'
            accept='.png,.jpg,.jpeg'
            onChange={(e) => setPic(e.target.files[0])}
          />}
          <Input
            type="email"
            label='Email'
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            isReadOnly={!isEditing}
          />
          <Input
            type="text"
            label='Nome'
            value={name}
            onChange={(e) => setName(e.target.value)}
            isReadOnly={!isEditing}
          />
          <Input
            type="text"
            label='Cognome'
            value={surname}
            onChange={(e) => setSurname(e.target.value)}
            isReadOnly={!isEditing}
          />
          <DatePicker
            label='Data di nascita'
            showMonthAndYearPickers
            firstDayOfWeek='mon'
            value={birthday ? parseDate(getDateString(birthday)) : null}
            onChange={(d) => setBirthday(d.toDate())}
            isReadOnly={!isEditing}
          />
          {isEditing && <Password
            label='Vecchia password'
            description='Lascia vuoto per non modificarla'
            value={password}
            setValue={setPassword}
          />}
          <Password
            label={isEditing ? 'Nuova password' : 'Password'}
            description={isEditing ? 'Lascia vuoto per non modificarla' : ''}
            value={modifiedPsw}
            setValue={setModifiedPsw}
            isReadOnly={!isEditing}
            isRequired={!!password}
          />
          {isEditing && (
            <ButtonGroup>
              <Button type='button' color='primary' variant='flat' onPress={handleReset}>
                Annulla modifiche
              </Button>
              <Button type='submit' color='primary' variant='solid'>
                Aggiorna profilo
              </Button>
            </ButtonGroup>
          )}
        </Form>
        {!isEditing && <div>
          <GoogleButton isSync={google} onClick={syncGoogle} />
          <ButtonGroup>
            <Button color='danger' variant='flat' onPress={() => setIsAlertVisible(true)}>
              Elimina profilo
            </Button>
            <Button color='primary' variant='solid' onPress={enterEdit}>
              Modifica profilo
            </Button>
          </ButtonGroup>
        </div>}
      </div>
    </div>
  )
}

export default Profile
