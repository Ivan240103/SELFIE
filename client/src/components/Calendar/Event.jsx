import React, { useState, useEffect } from 'react';
import { useTime } from '../../contexts/TimeContext'
import TitleDescription from './FormFields/TitleDescription';
import Place from './FormFields/Place';
import Reminder from './FormFields/Reminder';
import { getDatetimeString, getDateString } from '../../utils/dates';
import { calcReminder, remindersToString } from '../../utils/reminders';
import { showError, showSuccess } from '../../utils/toasts';

import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ScrollShadow,
  Form,
  NumberInput,
  DatePicker,
  DateRangePicker,
  Checkbox,
  Select,
  SelectItem,
  RadioGroup,
  Radio,
  ButtonGroup,
  Button
} from "@heroui/react";
import { parseDate, parseDateTime } from "@internationalized/date";

function Event({
  eventId, user, onSaveEvent, onUpdateEvent, onDeleteEvent, isModalOpen, setIsModalOpen
}) {
  // tempo in vigore per l'utente (fuso orario UTC)
  const { time } = useTime();
  const [event, setEvent] = useState({})
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [start, setStart] = useState(new Date());
  const [end, setEnd] = useState(new Date());
  const [isAllDay, setIsAllDay] = useState(true);
  const [place, setPlace] = useState('');
  const [mapsLocated, setMapsLocated] = useState(false)
  const [googleId, setGoogleId] = useState('')
  const [isRecurrent, setIsRecurrent] = useState(false);
  const [freq, setFreq] = useState('');
  const [interval, setInterval] = useState(0);
  const [term, setTerm] = useState('');
  const [until, setUntil] = useState(new Date())
  const [count, setCount] = useState(0)
  const [emailReminder, setEmailReminder] = useState({})
  const [pushReminder, setPushReminder] = useState({})
  const [isEditing, setIsEditing] = useState(!!!eventId)

  // recupera l'evento specifico dal backend
  useEffect(() => {
    const fetchEvent = async () => {
      if (eventId) {
        try {
          const response = await fetch(`${process.env.REACT_APP_API}/api/events/${eventId}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          });
          if (response.ok) { 
            const event = await response.json();
            setEvent(event)
          } else {
            throw new Error()
          }
        } catch (error) {
          showError("Couldn't retrieve event")
          setEvent({})
        }
      } else {
        setEvent({})
      }
    }

    fetchEvent()
  }, [eventId])

  // popola i campi
  useEffect(() => {
    const setFields = () => {
      setTitle(event.title || "")
      setDescription(event.description || "")
      setStart(event.start ? new Date(event.start) : time)
      setEnd(event.end ? new Date(event.end) : time)
      setIsAllDay(event.isAllDay ?? true)
      setPlace(event.place ?? "")
      setMapsLocated(event.mapsLocated ?? false)
      setGoogleId(event.googleId ?? '')
      setIsRecurrent(event.rrule ? true : false)
      setFreq(event.rrule?.freq || 'daily')
      setInterval(event.rrule?.interval || 1)
      if (event.rrule?.until) {
        setTerm('u')
        setUntil(event.rrule.until)
        setCount(1)
      } else if (event.rrule?.count) {
        setTerm('c')
        setUntil(time)
        setCount(event.rrule.count)
      } else {
        setTerm('n')
        setUntil(time)
        setCount(1)
      }
      if (event.reminders) {
        event.reminders.split(',').forEach(reminder => {
          const r = reminder.split(':')
          const calc = calcReminder(parseInt(r[1]))
          if (r[0] === "email") {
            setEmailReminder({ checked: true, method: r[0], ...calc })
          } else if (r[0] === "push") {
            setPushReminder({ checked: true, method: r[0], ...calc })
          }
        })
      } else {
        setEmailReminder({ checked: false, method: 'email', before: 15, time: 'm' })
        setPushReminder({ checked: false, method: 'push', before: 15, time: 'm' })
      }
    }

    setFields()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [event])

  /**
   * Crea un oggetto rrule che rispetti il formato per il
   * plugin di FullCalendar
   * 
   * @returns oggetto rappresentante una RRule
   */
  function createRRule() {
    const base = {
      freq: freq,
      interval: interval,
      dtstart: start
    }
    if (term === 'n') {
      return base
    } else if (term === 'u') {
      return { ...base, until: until }
    } else {
      return { ...base, count: count }
    }
  }

  const handleSave = async () => {
    const eventData = {
      title: title,
      description: description,
      start: isAllDay ? getDateString(start) : start.toISOString(),
      end: isAllDay ? getDateString(end) : end.toISOString(),
      isAllDay: isAllDay,
      rrule: isRecurrent ? createRRule() : null,
      place: place,
      mapsLocated: mapsLocated,
      reminders: remindersToString(emailReminder, pushReminder)
    };

    try {
      const response = await fetch(`${process.env.REACT_APP_API}/api/events/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(eventData)
      });

      if (!response.ok) {
        throw new Error();
      }
      const result = await response.json()
      showSuccess('Evento salvato')
      onSaveEvent(result)
    } catch (err) {
      showError('Errore nel salvataggio')
    }
  }

  const handleUpdate = async () => {
    const eventData = {
      title: title,
      description: description,
      start: isAllDay ? getDateString(start) : start.toISOString(),
      end: isAllDay ? getDateString(end) : end.toISOString(),
      isAllDay: isAllDay,
      rrule: isRecurrent ? createRRule() : null,
      place: place,
      mapsLocated: mapsLocated,
      reminders: remindersToString(emailReminder, pushReminder)
    };

    try {
      const response = await fetch(`${process.env.REACT_APP_API}/api/events/${eventId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(eventData)
      });

      if (!response.ok) {
        throw new Error();
      }
      const result = await response.json();
      showSuccess('Evento aggiornato')
      onUpdateEvent(result);
    } catch (err) {
      showError("Errore nell'aggiornamento")
    }
  }

  const handleDelete = async () => {
    setIsEditing(false)
    try {
      const response = await fetch(`${process.env.REACT_APP_API}/api/events/${eventId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error();
      }
      showSuccess('Evento eliminato')
      onDeleteEvent(eventId);
    } catch (err) {
      showError("Errore nell'eliminazione")
    }
  }

  // artificio per resettare i campi del form
  const handleReset = () => {
    setIsEditing(false)
    setEvent(JSON.parse(JSON.stringify(event)))
  }

  // formatta le date per passarle al componente heroui
  function getDatePickerValue() {
    const s = isAllDay ? getDateString(start) : getDatetimeString(start)
    const e = isAllDay ? getDateString(end) : getDatetimeString(end)
    return {
      start: isAllDay ? parseDate(s) : parseDateTime(s),
      end: isAllDay ? parseDate(e) : parseDateTime(e)
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setIsEditing(false)
    if (eventId) {
      await handleUpdate()
    } else {
      await handleSave()
    }
  }

  return (
    <Modal
      className='min-w-[32vw] max-h-[80vh] lg:px-5 py-3'
      classNames={{ header: 'text-xl' }}
      isOpen={isModalOpen}
      onClose={() => setIsModalOpen(false)}
      draggable
      tabIndex={2}
    >
      <ModalContent>
        <ModalHeader>Evento</ModalHeader>
        <ScrollShadow hideScrollBar>
          <ModalBody className='w-full lg:w-[88%] m-auto'>
            <Form
              className="flex flex-col items-center"
              validationBehavior="native"
              onSubmit={handleSubmit}
            >
              <TitleDescription
                title={title}
                setTitle={setTitle}
                description={description}
                setDescription={setDescription}
                isEditing={isEditing}
              />
              <Checkbox
                className='self-start ml-2'
                color='primary'
                isSelected={isAllDay}
                onValueChange={setIsAllDay}
                isReadOnly={!isEditing}
              >
                <span>Evento per tutto il giorno</span>
              </Checkbox>
              <DateRangePicker
                label='Durata'
                description='Seleziona uno o più giorni'
                firstDayOfWeek='mon'
                hourCycle={24}
                value={getDatePickerValue()}
                onChange={(e) => {
                  setStart(e.start.toDate())
                  setEnd(e.end.toDate())
                }}
                isReadOnly={!isEditing}
                isRequired
              />
              <Checkbox
                className='self-start ml-2'
                color='primary'
                isSelected={isRecurrent}
                onValueChange={setIsRecurrent}
                isReadOnly={!isEditing}
              >
                <span>Evento ricorrente</span>
              </Checkbox>
              {isRecurrent && <div className='w-full flex flex-col items-start ml-3 pt-1 pb-3'>
                <div className='w-full flex flex-row items-center justify-between gap-2 lg:gap-3'>
                  <span className='block'>Ripeti&nbsp;ogni</span>
                  <NumberInput
                    className='w-24 lg:w-32'
                    size='sm'
                    radius='md'
                    minValue={1}
                    value={interval}
                    onValueChange={setInterval}
                    isReadOnly={!isEditing}
                  />
                  <Select
                    className='w-1/2'
                    classNames={{
                      trigger: 'py-6'
                    }}
                    selectedKeys={[freq]}
                    onChange={(e) => setFreq(e.target.value)}
                    isDisabled={!isEditing}
                  >
                    <SelectItem key='daily'>{interval === 1 ? 'Giorno' : 'Giorni'}</SelectItem>
                    <SelectItem key='weekly'>{interval === 1 ? 'Settimana' : 'Settimane'}</SelectItem>
                    <SelectItem key='monthly'>{interval === 1 ? 'Mese' : 'Mesi'}</SelectItem>
                    <SelectItem key='yearly'>{interval === 1 ? 'Anno' : 'Anni'}</SelectItem>
                  </Select>
                </div>
                <RadioGroup
                  classNames={{
                    label: 'text-gray-800'
                  }}
                  label='Scade'
                  value={term}
                  onValueChange={setTerm}
                  isReadOnly={!isEditing}
                >
                  <Radio className='ml-1' value='n'>mai</Radio>
                  <div className='flex flex-row gap-3'>
                    <Radio className='ml-1' value='u'>il</Radio>
                    <DatePicker
                      classNames={{
                        inputWrapper: 'py-6'
                      }}
                      showMonthAndYearPickers
                      firstDayOfWeek='mon'
                      value={parseDate(getDateString(until))}
                      onChange={(e) => setUntil(e.toDate())}
                      isReadOnly={!isEditing}
                    />
                  </div>
                  <div className='flex flex-row items-center gap-3'>
                    <Radio className='ml-1' value='c'>dopo</Radio>
                    <NumberInput
                      className='w-28'
                      size='sm'
                      radius='md'
                      minValue={1}
                      value={count}
                      onValueChange={setCount}
                      isReadOnly={!isEditing}
                    />
                    <span className='block'>{count === 1 ? 'ripetizione' : 'ripetizioni'}</span>
                  </div>
                </RadioGroup>
              </div>}
              <Place
                place={place}
                setPlace={setPlace}
                mapsLocated={mapsLocated}
                setMapsLocated={setMapsLocated}
                isEditing={isEditing}
              />
              {user.notification && <div className='self-start w-full ml-1'>
                <span className='block text-gray-800 self-start'>Promemoria</span>
                <Reminder
                  type='Email'
                  reminder={emailReminder}
                  setReminder={setEmailReminder}
                  isEditing={isEditing}
                />
                <Reminder
                  type='Push'
                  reminder={pushReminder}
                  setReminder={setPushReminder}
                  isEditing={isEditing}
                />
              </div>}
              {!googleId && <>
                {!eventId ? (
                  <ButtonGroup>
                    <Button className='w-32' type='submit' color='primary' variant='solid'>
                      Crea evento
                    </Button>
                  </ButtonGroup>
                ) : isEditing && (
                  <ButtonGroup className='mt-1'>
                    <Button className='w-36 lg:w-40' type='button' color='primary' variant='flat' onPress={handleReset}>
                      Annulla modifiche
                    </Button>
                    <Button className='w-36 lg:w-40' type='submit' color='primary' variant='solid'>
                      Aggiorna evento
                    </Button>
                  </ButtonGroup>
                )}
              </>}
            </Form>
            {!googleId && eventId && !isEditing && (
              <ButtonGroup>
                <Button className='w-36 lg:w-40' color='danger' variant='flat' onPress={handleDelete}>
                  Elimina evento
                </Button>
                <Button className='w-36 lg:w-40' color='primary' variant='solid' onPress={() => setIsEditing(true)}>
                  Modifica evento
                </Button>
              </ButtonGroup>
            )}
          </ModalBody>
        </ScrollShadow>
      </ModalContent>
    </Modal>
  );
}

export default Event;
