import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import TimeMachine from '../TimeMachine/TimeMachine'

import { datetimeToDateString } from '../../services/dateServices'

import '../../css/Profile.css'

function Profile() {
  const navigate = useNavigate()

  const [profile, setProfile] = useState({})
  // modalità di modifica del form
  const [editMode, setEditMode] = useState(false)
  // stati dei valori nel form
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [surname, setSurname] = useState('')
  const [birthday, setBirthday] = useState('')  // di tipo String
  const [pic, setPic] = useState(null)

  const [error, setError] = useState('')

  // recupera i dati del profilo dal backend
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const profile = await axios.get('http://localhost:8000/api/users/', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        })
        setProfile(profile.data)
        setError('')
      } catch (err) {
        setError(err.response.data || 'errore GET')
      }
    }

    fetchProfile()
  }, [])

  // sincronizza gli stati
  useEffect(() => {
    setUsername(profile.username || '')
    setEmail(profile.email || '')
    setPassword(profile.password || '')
    setName(profile.name || '')
    setSurname(profile.surname || '')
    setBirthday(profile.birthday ? datetimeToDateString(new Date(profile.birthday)) : '')
  }, [profile])

  /**
   * Entrare in modalità di modifica
   */
  const enterEdit = () => {
    document.getElementById('profile-toplevel').classList.add('profile-editmode')
    setEditMode(!editMode)
  }

  /**
   * Annullare le modifiche ai dati
   */
  const cancelEdit = () => {
    document.getElementById('profile-toplevel').classList.remove('profile-editmode')
    setEditMode(!editMode)
    setUsername(profile.username)
    setEmail(profile.email)
    setPassword(profile.password)
    setName(profile.name)
    setSurname(profile.surname)
    setBirthday(profile.birthday ? datetimeToDateString(new Date(profile.birthday)) : '')
  }

  /**
   * Salvare le modifiche al profilo
   * 
   * @param e evento di submit
   */
  const confirmEdit = async (e) => {
    e.preventDefault()
    document.getElementById('profile-toplevel').classList.remove('profile-editmode')
    setEditMode(!editMode)
    // formData per poter inviare l'immagine
    const formData = new FormData()
    formData.append('email', email)
    formData.append('name', name)
    formData.append('surname', surname)
    formData.append('birthday', birthday)
    formData.append('pic', pic)

    try {
      const response = await axios.put('http://localhost:8000/api/users/', formData, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      })
      setProfile(response.data)
      setError('')
    } catch (err) {
      setError(err.response.data || 'Errore PUT')
    }
  }

  /**
   * Cancellare il profilo, previa conferma
   */
  const deleteProfile = async () => {
    const proceed = window.confirm('Sei assolutamente sicuro di voler eliminare il profilo?')
    if (proceed === true) {
      try {
        await axios.delete('http://localhost:8000/api/users/', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        })
        setError('')
        navigate('/')
      } catch (err) {
        setError(err.response.data || 'Errore DELETE')
      }
    }
  }

  return (
    <div>
      <TimeMachine />
      <div className='profile-container' id='profile-toplevel'>
        <p className='error'>{error}</p>
        <h2 className='profile-header'>Ciao, {username}</h2>
        <div className='profile-pic-container'>
          <img
            src={`http://localhost:8000/pics/${profile.picName}`}
            className='profile-pic'
            hidden={editMode}
            alt='Profile' />
        </div>
        <form className='profile-form' onSubmit={confirmEdit}>
          <div className='profile-form-group' hidden={!editMode}>
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
              readOnly={!editMode} />
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
              readOnly={!editMode} />
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
              readOnly={!editMode} />
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
              readOnly={!editMode} />
          </div>
          <button
            type='button'
            className='profile-cancel-btn'
            onClick={cancelEdit}
            hidden={!editMode}>Annulla</button>
          <button
            type='submit'
            className='profile-submit-btn'
            hidden={!editMode}>Conferma</button>
        </form>
        <div className='profile-button-group'>
          <button
            type='button'
            className='profile-edit-btn'
            onClick={enterEdit}
            hidden={editMode}>Modifica</button>
          <button
            type='button'
            className='profile-delete-btn'
            onClick={deleteProfile}
            hidden={editMode}>Elimina profilo</button>
        </div>
      </div>
    </div>
  )
}

export default Profile
