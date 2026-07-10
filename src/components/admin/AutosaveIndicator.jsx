import React from 'react'

export default function AutosaveIndicator({ status }) {
  if (!status) return null
  return (
    <span className={`autosave-indicator ${status}`}>
      {status === 'saving' ? 'Saving…' : 'Saved'}
    </span>
  )
}
