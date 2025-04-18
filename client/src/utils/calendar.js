/**
 * Mappa un evento con i campi di FullCalendar
 * 
 * @param {Event} event evento da mappare
 * @returns evento mappato
 */
export function mapEvent(event) {
  return {
    ...event,
    id: event.googleId || event._id,
    eventType: 'event',
    allDay: event.isAllDay
  }
}

/**
 * Mappa un task con i campi di FullCalendar
 * 
 * @param {Task} task attività da mappare
 * @param {Date} time orario in vigore per l'utente
 * @returns attività mappata
 */
export function mapTask(task, time) {
  const notDoneColor = () => time > new Date(task.deadline) ? '#f87171' : '#fde68a'
  return {
    id: task._id,
    title: task.title,
    start: task.deadline,
    allDay: true,
    color: task.isDone ? '#86efac' : notDoneColor(),
    textColor: 'black',
    eventType: 'task',
    isDone: task.isDone
  }
}
