import React from "react";

import {
  Input,
  Textarea
} from '@heroui/react'

function TitleDescription({
  title, setTitle, description, setDescription, isEditing
}) {
  return (
    <>
      <Input
        type='text'
        label='Titolo'
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        isReadOnly={!isEditing}
      />
      <Textarea
        label='Descrizione'
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        minRows={3}
        maxRows={8}
        isReadOnly={!isEditing}
      />
    </>
  )
}

export default TitleDescription
