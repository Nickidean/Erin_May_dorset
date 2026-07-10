import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage.jsx'
import AdminLoginPage from './pages/admin/AdminLoginPage.jsx'
import AdminDashboardPage from './pages/admin/AdminDashboardPage.jsx'
import AdminActivityLogPage from './pages/admin/AdminActivityLogPage.jsx'
import AdminGuard from './components/admin/AdminGuard.jsx'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route
          path="/admin"
          element={
            <AdminGuard>
              <AdminDashboardPage />
            </AdminGuard>
          }
        />
        <Route
          path="/admin/activity"
          element={
            <AdminGuard>
              <AdminActivityLogPage />
            </AdminGuard>
          }
        />
      </Routes>
    </BrowserRouter>
  )
}
