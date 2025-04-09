/**
 * Mappa un evento con i campi di FullCalendar
 * 
 * @param {Event} event evento da mappare
 * @returns evento mappato
 */
export function mapEvent(event) {
  // TODO: customize color?
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
  const notDoneColor = () => time > new Date(task.deadline) ? '#ff8080' : '#ffff80'
  return {
    id: task._id,
    title: task.title,
    start: task.deadline,
    allDay: true,
    color: task.isDone ? '#b3ffb3' : notDoneColor(),
    textColor: 'black',
    eventType: 'task',
    isDone: task.isDone
  }
}
