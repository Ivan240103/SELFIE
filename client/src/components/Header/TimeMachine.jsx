import React, { useState } from "react"
import { useTime } from "../../contexts/TimeContext"
import { useAuth } from "../../contexts/AuthenticationContext"
import { getDatetimeString } from '../../utils/dates'

import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  Form,
  DatePicker,
  Button
} from '@heroui/react'
import { parseDateTime } from "@internationalized/date"

function TimeMachine() {
  const { time, updateTime, resetTime } = useTime()
  const { isAuthenticated } = useAuth()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedTime, setSelectedTime] = useState(time)

  /**
   * Sposta il tempo in avanti o indietro
   */
  async function backToTheFuture(e) {
    e.preventDefault()
    await updateTime(selectedTime)
    setIsModalOpen(false)
  }

  /**
   * Riporta il tempo al presente
   */
  async function reset() {
    await resetTime()
    setIsModalOpen(false)
  }

  return(
    <div className="justify-self-center">
      <Button
        color="secondary"
        variant="light"
        onPress={() => {
          setSelectedTime(time)
          setIsModalOpen(true)
        }}
        isDisabled={!isAuthenticated}
        style={{ color: 'black' }}
      >
        {time.toLocaleString('it-IT').slice(0, -3).replace(', ', ' - ')}
      </Button>
      <Modal
        isOpen={isModalOpen}
        backdrop="blur"
        onClose={() => setIsModalOpen(false)}
        tabIndex={2}
      >
        <ModalContent>
          <ModalHeader>Time Machine</ModalHeader>
          <ModalBody>
            <Form
              className="flex flex-col items-center"
              validationBehavior="native"
              onSubmit={backToTheFuture}
            >
              <DatePicker
                label='Seleziona data e ora'
                showMonthAndYearPickers
                firstDayOfWeek='mon'
                hourCycle={24}
                value={parseDateTime(getDatetimeString(selectedTime))}
                onChange={(d) => setSelectedTime(d.toDate())}
              />
              <div>
                <Button
                  color="primary"
                  variant="flat"
                  onPress={() => reset()}
                  >
                  Resetta
                </Button>
                <Button
                  type="submit"
                  color="primary"
                  variant="solid"
                >
                  Viaggia
                </Button>
              </div>
            </Form>
          </ModalBody>
        </ModalContent>
      </Modal>
    </div>
  )
}

export default TimeMachine
