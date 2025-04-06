import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import CryptoJS from 'crypto-js'
import { useAuth } from '../../contexts/AuthenticationContext'
import { getDateString } from '../../utils/dates'
import { showError, showSuccess } from '../../utils/toasts'
import Header from '../Header/Header'

import {
  Avatar,
  Form,
  Input,
  DatePicker,
  Button
} from '@heroui/react'
import { parseDate } from '@internationalized/date'

function Profile() {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const [profile, setProfile] = useState({})
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')  // vecchia psw per validazione
  const [modifiedPsw, setModifiedPsw] = useState('12345678')  // nuova psw | mock
  const [name, setName] = useState('')
  const [surname, setSurname] = useState('')
  const [birthday, setBirthday] = useState(new Date())
  const [pic, setPic] = useState(null)
  const [google, setGoogle] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  
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
      showSuccess('Profilo eliminato')
      navigate('/login')
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

  /* TODO: modale const proceed = window.confirm('Sei assolutamente sicuro di voler eliminare il profilo?') */

  return (
    <div>
      <Header />
      <div>
        <h2>Ciao, {username}</h2>
        <Form
          className="flex flex-col items-center"
          validationBehavior="native"
          onSubmit={handleUpdate}
        >
          {!isEditing && <Avatar
            src={`${process.env.REACT_APP_API}/pics/${profile.picName}`}
            className='w-32 h-32'
            alt='Profile'
          />}
        </Form>
            {/* TODO: ripartire da qui (scelta della pic) */}
          <form className='profile-form' onSubmit={handleUpdate}>
            <div className='profile-form-group' hidden={!isEditing}>
              <label className='profile-label' htmlFor='pic'>
                Carica una foto profilo (tip: quadrata!)
              </label>
              <input 
                type='file'
                className='profile-input'
                name='pic'
                accept='.png,.jpg,.jpeg'
                onChange={(e) => setPic(e.target.files[0])} />
            </div>
            <div className='profile-form-group'>
              <label className='profile-label' htmlFor='email'>
                Email
              </label>
              <input
                type='email'
                className='profile-input'
                name='email'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                readOnly={!isEditing} />
            </div>
            <div className='profile-form-group'>
              <label className='profile-label' htmlFor='name'>
                Nome
              </label>
              <input
                type='text'
                className='profile-input'
                name='name'
                value={name}
                onChange={(e) => setName(e.target.value)}
                readOnly={!isEditing} />
            </div>
            <div className='profile-form-group'>
              <label className='profile-label' htmlFor='surname'>
                Cognome
              </label>
              <input
                type='text'
                className='profile-input'
                name='surname'
                value={surname}
                onChange={(e) => setSurname(e.target.value)}
                readOnly={!isEditing} />
            </div>
            <div className='profile-form-group'>
              <label className='profile-label' htmlFor='bday'>
                Data di nascita
              </label>
              <input
                type='date'
                className='profile-input'
                name='bday'
                value={birthday}
                onChange={(e) => setBirthday(e.target.value)}
                readOnly={!isEditing} />
            </div>
            <div className='profile-form-group' hidden={!isEditing}>
              <label className='profile-label' htmlFor="oldPsw">
                Vecchia password
              </label>
              <input
                type="password"
                className='profile-input'
                id='profile-psw'
                name="oldPsw"
                placeholder='Lascia vuoto per non modificarla'
                value={password}
                onChange={(e) => setPassword(e.target.value)} />
            </div>
            <div className='profile-form-group'>
              <label className='profile-label' htmlFor="newPsw">
                {isEditing ? 'Nuova password' : 'Password'}
              </label>
              <input
                type="password"
                className='profile-input'
                id='profile-psw'
                name="newPsw"
                placeholder='Lascia vuoto per non modificarla'
                value={modifiedPsw}
                onChange={(e) => setModifiedPsw(e.target.value)}
                readOnly={!isEditing}
                required={password} />
            </div>
            <button
              type='button'
              className='profile-cancel-btn'
              onClick={handleReset}
              hidden={!isEditing}>Annulla</button>
            <button
              type='submit'
              className='profile-submit-btn'
              hidden={!isEditing}>Conferma</button>
          </form>
          <div className='profile-button-group'>
            {!isEditing && <>
              {google ? (
                <p>Google Calendar sincronizzato</p>
              ) : (
                <button
                  type='button'
                  className='profile-google'
                  onClick={syncGoogle}>Sincronizza con Google</button>
              )}
            </>}
            <button
              type='button'
              className='profile-edit-btn'
              onClick={enterEdit}
              hidden={isEditing}>Modifica</button>
            <button
              type='button'
              className='profile-delete-btn'
              onClick={handleDelete}
              hidden={isEditing}>Elimina profilo</button>
          </div>
        </div>
    </div>
  )
}

export default Profile
