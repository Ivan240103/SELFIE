/**
 * Servizio di Time Machine per gestire lo sfasamento temporale degli utenti
 */
const User = require('../models/User')

/**
 * Calcola il tempo in vigore per l'utente al fuso orario UTC
 * 
 * @param {Number} offset millisecondi di sfasamento temporale
 * @returns tempo in vigore in formato ISO string (UTC)
 */
function calcDateISOstring(offset) {
  return new Date(Date.now() + offset).toISOString()
}

/**
 * Ritorna il tempo in vigore per l'utente UTC
 * 
 * @param {String} username username dell'utente
 * @returns datetime a cui si trova l'utente in ISO string (UTC)
 * @throws getTime in caso di fallimento
 */
const getTime = async (username) => {
  try {
    const user = await User.findOne({ username: username })
    if (!user) throw 'getTime'

    return calcDateISOstring(user.offset)
  } catch (err) {
    throw 'getTime'
  }
}

/**
 * Modifica l'offset temporale di un utente
 * 
 * @param {String} username username dell'utente
 * @param {String} date datetime a cui si vuole spostare in ISO string (UTC)
 * @returns datetime a cui si trova l'utente in ISO string (UTC)
 * @throws setTime in caso di fallimento
 */
const setTime = async (username, date) => {
  try {
    const user = await User.findOne({ username: username })
    if (!user) throw 'setTime'

    user.offset = Date.parse(date) - Date.now()
    await user.save()
    return calcDateISOstring(user.offset)
  } catch (err) {
    throw 'setTime'
  }
}

/**
 * Resetta l'offset temporale
 * 
 * @param {String} username username dell'utente
 * @returns datetime a cui si trova l'utente in ISO string (UTC)
 * @throws resetTime in caso di fallimento
 */
const resetTime = async (username) => {
  try {
    const user = await User.findOne({ username: username })
    if (!user) throw 'resetTime'

    user.offset = 0
    await user.save()
    return calcDateISOstring(user.offset)
  } catch (err) {
    throw 'resetTime'
  }
}

module.exports = { getTime, setTime, resetTime }
