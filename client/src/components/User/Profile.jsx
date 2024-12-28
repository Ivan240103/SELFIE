import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import CryptoJS from 'crypto-js'
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
  const [password, setPassword] = useState('')  // vecchia psw per validazione
  const [modifiedPsw, setModifiedPsw] = useState('12345678')  // nuova psw | mock
  const [name, setName] = useState('')
  const [surname, setSurname] = useState('')
  const [birthday, setBirthday] = useState('')  // di tipo String
  const [pic, setPic] = useState(null)

  const [error, setError] = useState('')

  // recupera i dati del profilo dal backend
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const profile = await axios.get(`${process.env.REACT_APP_API}/api/users/`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        })
        setProfile(profile.data)
        setError('')
      } catch (err) {
        navigate('/login')
      }
    }

    fetchProfile()
  }, [navigate])

  // sincronizza gli stati
  useEffect(() => {
    setUsername(profile.username || '')
    setEmail(profile.email || '')
    setPassword('')
    setModifiedPsw('12345678')
    setName(profile.name || '')
    setSurname(profile.surname || '')
    setBirthday(profile.birthday ? datetimeToDateString(new Date(profile.birthday)) : '')
  }, [profile])

  /**
   * Reimposta i valori dei campi
   */
  const resetFields = () => {
    setUsername(profile.username)
    setEmail(profile.email)
    setPassword('')
    setModifiedPsw('12345678')
    setName(profile.name)
    setSurname(profile.surname)
    setBirthday(profile.birthday ? datetimeToDateString(new Date(profile.birthday)) : '')
  }

  /**
   * Entrare in modalità di modifica
   */
  const enterEdit = () => {
    document.getElementById('profile-toplevel').classList.add('profile-editmode')
    setModifiedPsw('')
    setEditMode(!editMode)
  }

  /**
   * Annullare le modifiche ai dati
   */
  const cancelEdit = () => {
    document.getElementById('profile-toplevel').classList.remove('profile-editmode')
    setEditMode(!editMode)
    resetFields()
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
    if (password !== '') formData.append('oldPsw', CryptoJS.SHA1(password).toString(CryptoJS.enc.Hex))
    if (modifiedPsw !== '') formData.append('newPsw', CryptoJS.SHA1(modifiedPsw).toString(CryptoJS.enc.Hex))
    formData.append('name', name)
    formData.append('surname', surname)
    formData.append('birthday', birthday)
    formData.append('pic', pic)

    try {
      const response = await axios.put(`${process.env.REACT_APP_API}/api/users/`, formData, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      })
      setProfile(response.data)
      setError('')
    } catch (err) {
      setError(err.response.data || 'Errore PUT')
      resetFields()
    }
  }

  /**
   * Cancellare il profilo, previa conferma
   */
  const deleteProfile = async () => {
    const proceed = window.confirm('Sei assolutamente sicuro di voler eliminare il profilo?')
    if (proceed === true) {
      try {
        await axios.delete(`${process.env.REACT_APP_API}/api/users/`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        })
        setError('')
        navigate('/login')
      } catch (err) {
        setError(err.response.data || 'Errore DELETE')
      }
    }
  }

  return (
    <div>
      {!error && <TimeMachine />}
      <p className='error'>{error}</p>
      <div className='profile-container' id='profile-toplevel'>
        <h2 className='profile-header'>Ciao, {username}</h2>
        <div className='profile-pic-container'>
          <img
            src={`${process.env.REACT_APP_API}/pics/${profile.picName}`}
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
          <div className='profile-form-group' hidden={!editMode}>
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
              {editMode ? 'Nuova password' : 'Password'}
            </label>
            <input
              type="password"
              className='profile-input'
              id='profile-psw'
              name="newPsw"
              placeholder='Lascia vuoto per non modificarla'
              value={modifiedPsw}
              onChange={(e) => setModifiedPsw(e.target.value)}
              readOnly={!editMode}
              required={password} />
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
