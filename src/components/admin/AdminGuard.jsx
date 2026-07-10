import React from 'react'
import { Navigate } from 'react-router-dom'
import { getSession } from '../../lib/session.js'

export default function AdminGuard({ children }) {
  const session = getSession()
  if (!session) {
    return <Navigate to="/admin/login" replace />
  }
  return children
}
