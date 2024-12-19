/**
 * Servizio di Time Machine per gestire lo sfasamento temporale degli utenti
 */
const User = require('../models/User')

/**
 * Calcola il tempo in vigore per l'utente
 * 
 * @param {Number} offset millisecondi di sfasamento temporale
 * @returns tempo in vigore in formato ISO String
 */
function calcDateString(offset) {
  return new Date(Date.now() + offset).toISOString()
}

/**
 * Ritorna il tempo in vigore per l'utente
 * 
 * @param {String} username username dell'utente
 * @returns data a cui si trova l'utente in formato ISO string
 * @throws 404 in caso non trovi l'utente
 * @throws 500 in caso di fallimento db
 */
const getTime = async (username) => {
  try {
    const user = await User.findOne({ username: username })
    if (!user) throw 'getTime 404'
    return calcDateString(user.offset)
  } catch (err) {
    console.error(`getTime error: ${err}`)
    throw 'getTime 500'
  }
}

/**
 * Modifica l'offset temporale di un utente
 * 
 * @param {String} username username dell'utente
 * @param {String} date data a cui ci si vuole spostare in formato ISO string
 * @returns data a cui si trova l'utente in formato ISO string
 * @throws 404 in caso non trovi l'utente
 * @throws 500 in caso di fallimento db
 */
const setTime = async (username, date) => {
  try {
    const user = await User.findOne({ username: username })
    if (!user) throw 'setTime 404'
    user.offset = Date.parse(date) - Date.now()
    await user.save()
    return calcDateString(user.offset)
  } catch (err) {
    console.error(`setTime error: ${err}`)
    throw 'setTime 500'
  }
}

/**
 * Resetta l'offset temporale
 * 
 * @param {String} username username dell'utente
 * @returns data a cui si trova l'utente in formato ISO string
 * @throws 404 in caso non trovi l'utente
 * @throws 500 in caso di fallimento db
 */
const resetTime = async (username) => {
  try {
    const user = await User.findOne({ username: username })
    if (!user) throw 'resetTime 404'
    // di base si è a +1h sul GMT
    user.offset = 3600000
    await user.save()
    return calcDateString(user.offset)
  } catch (err) {
    console.error(`resetTime error: ${err}`)
    throw 'resetTime 500'
  }
}

module.exports = { getTime, setTime, resetTime }