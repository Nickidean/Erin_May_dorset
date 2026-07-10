import { SESSION_STORAGE_KEY } from './constants.js'

export function getSession() {
  const raw = localStorage.getItem(SESSION_STORAGE_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

export function setSession({ token, adminName }) {
  localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify({ token, adminName }))
}

export function clearSession() {
  localStorage.removeItem(SESSION_STORAGE_KEY)
}
