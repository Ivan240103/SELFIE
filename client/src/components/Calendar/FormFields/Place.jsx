import React, { useState, useCallback } from "react";
import _ from 'lodash';

import {
  Autocomplete,
  AutocompleteItem,
  Button
} from '@heroui/react'

function Place({
  place, setPlace, mapsLocated, setMapsLocated, isEditing
}) {
  const [userInput, setUserInput] = useState(place ?? '');
  const [selectedKey, setSelectedKey] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const debouncedFetchSuggestions = useCallback(
    _.debounce(async (loc) => {
      if (loc.length < 3) {
        setSuggestions([])
        return
      }
      
      // usa LocationIQ (OpenStreetMap) che è gratis
      try {
        setIsLoading(true)
        const response = await fetch(
          `https://us1.locationiq.com/v1/search?key=pk.7116bbd07a01adaf5eb1e5740b977e7e&q=${encodeURIComponent(loc)}&format=json`
        )

        if (!response.ok) {
          throw new Error()
        }
        const data = await response.json()
        setIsLoading(false)
        setSuggestions(data)
      } catch (error) {
        setIsLoading(false)
        setSuggestions([])
      }
    }, 1000),
    []
  )

  // apre google maps alla destinazione impostata
  function openMaps() {
    const encodedDest = encodeURIComponent(place)
    // se siamo su un mobile usa il geo protocol
    const isMobile = /Android|webOS|iPhone|iPad/i.test(navigator.userAgent)
    
    const url = isMobile ? `geo:0,0?q=${encodedDest}` : `https://www.google.com/maps/search/?api=1&query=${encodedDest}`
    window.open(url, '_blank')
  }

  function handleInputChange(i) {
    setUserInput(i)
    setSelectedKey('')
    setPlace(i)
    setMapsLocated(false)
    debouncedFetchSuggestions(i)
  }

  function handleSelectionChange(k) {
    if (k) {
      const p = suggestions.find(s => s.place_id === k)
      setSelectedKey(p.place_id)
      setUserInput(p.display_name)
      setPlace(p.display_name)
      setMapsLocated(true)
      setSuggestions([p])
    }
  }

  return (
    <div>
      <Autocomplete
        label='Luogo'
        description="Puoi geolocalizzare l'evento"
        allowsCustomValue
        items={suggestions}
        inputValue={userInput}
        selectedKey={selectedKey}
        onInputChange={handleInputChange}
        onSelectionChange={handleSelectionChange}
        isLoading={isLoading}
        isReadOnly={!isEditing}
      >
        {(item) => (
          <AutocompleteItem
            key={item.place_id}
            textValue={item.display_name}
          >
            {item.display_name}
          </AutocompleteItem>
        )}
      </Autocomplete>
      {mapsLocated && (
        <Button
          color="primary"
          isIconOnly
          onPress={() => openMaps()}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="#FFFFFF"/>
          </svg>
        </Button>
      )}
    </div>
  )
}

export default Place
