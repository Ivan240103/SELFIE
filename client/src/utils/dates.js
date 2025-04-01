/**
 * Converte un datetime in una stringa nel formato yyyy-MM-ddThh:mm  
 * (leggibile da un <input type="datetime-local">)
 * 
 * @param {Date} datetime datetime da convertire
 * @returns stringa in formato yyyy-MM-ddThh:mm
 */
export function getDatetimeString(datetime) {
  // aggiunge lo zero prima dei numeri a cifra singola
  const pad = (num) => String(num).padStart(2, '0');
  
  const dd = pad(datetime.getDate());
  const MM = pad(datetime.getMonth() + 1);
  const yyyy = datetime.getFullYear();
  const hh = pad(datetime.getHours());
  const mm = pad(datetime.getMinutes());
  
  return `${yyyy}-${MM}-${dd}T${hh}:${mm}`;
}

/**
 * Converte un datetime in una stringa nel formato yyyy-MM-dd  
 * (leggibile da un <input type="date">)
 * 
 * @param {Date} datetime datetime da convertire
 * @returns stringa in formato yyyy-MM-dd
 */
export function getDateString(datetime) {
  // aggiunge lo zero prima dei numeri a cifra singola
  const pad = (num) => String(num).padStart(2, '0');
  
  const dd = pad(datetime.getDate());
  const MM = pad(datetime.getMonth() + 1);
  const yyyy = datetime.getFullYear();
  
  return `${yyyy}-${MM}-${dd}`;
}
