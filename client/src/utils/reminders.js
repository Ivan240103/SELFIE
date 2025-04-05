/**
 * Calcola quando mandare la notifica in termini di minuti, ore o giorni
 * 
 * @param {number} minutes minuti di anticipo
 * @returns oggetto contenente l'anticipo e sensibilità della notifica
 */
export function calcReminder(minutes) {
  if (minutes < 60) {
    return { before: minutes, time: 'm' }
  } else if (minutes < 60*24) {
    return { before: minutes / 60, time: 'h' }
  } else {
    return { before: minutes / (60*24), time: 'd' }
  }
}

/**
 * Converte i promemoria in una stringa unica
 * 
 * @param {JSON} email oggetto emailReminder
 * @param {JSON} push oggetto pushReminder
 * @returns stringa che codifica i reminders assieme
 */
export function remindersToString(email, push) {
  const calcMinutes = (t, b) => t === 'm' ? b : (t === 'h' ? b * 60 : b * 60 * 24)
  const rem = []
  if (email.checked) {
    const minutes = calcMinutes(email.time, email.before)
    rem.push(`${email.method}:${minutes}`)
  }
  if (push.checked) {
    const minutes = calcMinutes(push.time, push.before)
    rem.push(`${push.method}:${minutes}`)
  }
  return rem.length > 0 ? rem.join(',') : ''
}
