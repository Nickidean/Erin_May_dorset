import React, { useRef } from 'react'

export default function PinPad({ value, onChange, disabled }) {
  const inputRef = useRef(null)

  function handleChange(e) {
    const digits = e.target.value.replace(/\D/g, '').slice(0, 4)
    onChange(digits)
  }

  return (
    <input
      ref={inputRef}
      type="tel"
      inputMode="numeric"
      autoComplete="off"
      maxLength={4}
      value={value}
      onChange={handleChange}
      disabled={disabled}
      placeholder="••••"
      className="pin-input"
      autoFocus
    />
  )
}
