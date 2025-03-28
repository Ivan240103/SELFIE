/**
 * Time Machine service to handle temporal offset of users
 */

const User = require('../models/User')

/**
 * Calcola il tempo in vigore per l'utente nel fuso orario UTC
 * 
 * @param {Number} offset millisecondi di sfasamento temporale
 * @returns tempo in vigore in formato ISO string (UTC)
 */
function calcDateISOstring(offset) {
  return new Date(Date.now() + offset).toISOString()
}

/**
 * Ritorna il tempo in vigore per l'utente nel fuso orario UTC
 * 
 * @param {User} user utente di cui si vuole il tempo
 * @returns datetime a cui si trova l'utente in ISO string (UTC)
 */
function getTime(user) {
  return calcDateISOstring(user.offset)
}

/**
 * Modifica l'offset temporale di un utente.  
 * Se non viene passato l'argomento dateISO, resetta l'offset a zero
 * 
 * @param {User} user utente di cui modificare l'offset
 * @param {String?} dateISO datetime a cui si vuole spostare in ISO string (UTC)
 * @returns nuovo datetime a cui si trova l'utente in ISO string (UTC)
 * @throws setTime in caso di fallimento
 */
async function setTime(user, dateISO) {
  try {
    const newOffset = dateISO ? Date.parse(dateISO) - Date.now() : 0
    await User.findByIdAndUpdate(
      user._id,
      { $set: { offset: newOffset } }
    )
    return calcDateISOstring(newOffset)
  } catch (err) {
    throw 'setTime'
  }
}

module.exports = { getTime, setTime }
