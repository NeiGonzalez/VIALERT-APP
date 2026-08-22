import { useState } from 'react'

export function useLocalStorage(key, initialValue) {
  const readStored = () => {
    try {
      const item = window.localStorage.getItem(key)
      return item !== null ? JSON.parse(item) : initialValue
    } catch {
      return initialValue
    }
  }

  const [stored, setStoredState] = useState(readStored)

  const setStored = (value) => {
    // IMPORTANT: write synchronously BEFORE React schedules navigation/unmount.
    // Do not put localStorage.setItem inside a React state-updater callback.
    const current = readStored()
    const next = typeof value === 'function' ? value(current) : value
    try {
      if (next === null || next === undefined) {
        window.localStorage.removeItem(key)
      } else {
        window.localStorage.setItem(key, JSON.stringify(next))
      }
    } catch (err) {
      console.error(`ViAlert-APP: no se pudo guardar ${key}`, err)
    }
    setStoredState(next)
    return next
  }

  return [stored, setStored]
}
