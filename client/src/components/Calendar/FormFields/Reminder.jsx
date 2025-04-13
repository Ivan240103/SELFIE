import React from "react";

import {
  Checkbox,
  NumberInput,
  Select,
  SelectItem
} from '@heroui/react'

function Reminder({ type, reminder, setReminder, isEditing }) {
  return (
    <div className='w-full m-2 flex flex-row items-center justify-start gap-3'>
      <Checkbox
        color='primary'
        isSelected={reminder.checked}
        onValueChange={(v) => setReminder(prev => ({
          ...prev,
          checked: v
        }))}
        isReadOnly={!isEditing}
      >
        {type}
      </Checkbox>
      <NumberInput
        className='w-24'
        size='sm'
        radius='md'
        minValue={reminder.time === 'm' ? 5 : 1}
        value={reminder.before}
        onValueChange={(v) => setReminder(prev => ({
          ...prev,
          before: v
        }))}
        isDisabled={!reminder.checked}
        isReadOnly={!isEditing}
      />
      <Select
        className='w-1/3'
        classNames={{
          trigger: 'py-6'
        }}
        selectedKeys={[reminder.time]}
        onChange={(e) => setReminder(prev => ({
          ...prev,
          time: e.target.value
        }))}
        isDisabled={!reminder.checked || !isEditing}
      >
        <SelectItem key='m'>{reminder.before === 1 ? 'Minuto' : 'Minuti'}</SelectItem>
        <SelectItem key='h'>{reminder.before === 1 ? 'Ora' : 'Ore'}</SelectItem>
        <SelectItem key='d'>{reminder.before === 1 ? 'Giorno' : 'Giorni'}</SelectItem>
      </Select>
      <span>prima</span>
    </div>
  )
}

export default Reminder
