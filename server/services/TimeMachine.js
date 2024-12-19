/**
 * Servizio di Time Machine per gestire lo sfasamento temporale degli utenti
 */
const User = require('../models/user')

/**
 * Ritorna il tempo in vigore per l'utente
 * 
 * @param {String} username username dell'utente
 * @returns Date a cui si trova l'utente
 * @throws 404 in caso non trovi l'utente
 * @throws 500 in caso di fallimento db
 */
export const getTime = async (username) => {
  try {
    const user = await User.findOne({ username: username })
    if (!user) throw 'getTime 404'
    return new Date(Date.now() + user.offset)
  } catch (err) {
    console.error(`getTime error: ${err}`)
    throw 'getTime 500'
  }
}

/**
 * Modifica l'offset temporale di un utente
 * 
 * @param {String} username username dell'utente
 * @param {Date} date data a cui ci si vuole spostare
 * @throws 404 in caso non trovi l'utente
 * @throws 500 in caso di fallimento db
 */
export const setTime = async (username, date) => {
  try {
    const user = await User.findOne({ username: username })
    if (!user) throw 'setTime 404'
    user.offset = date.valueOf() - Date.now()
    user.save()
  } catch (err) {
    console.error(`setTime error: ${err}`)
    throw 'setTime 500'
  }
}
