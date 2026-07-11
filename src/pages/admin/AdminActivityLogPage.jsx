import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getActivityLog } from '../../lib/adminApi.js'

const ACTION_LABELS = {
  login: 'Logged in',
  edit_content: 'Edited content',
  add_image: 'Added a photo',
  remove_image: 'Removed a photo',
  reorder_images: 'Reordered photos',
  edit_caption: 'Edited a photo caption',
  add_gallery_image: 'Added a gallery photo',
  remove_gallery_image: 'Removed a gallery photo',
  change_logo: 'Changed the logo',
  remove_logo: 'Removed the logo',
  publish: 'Published changes',
}

export default function AdminActivityLogPage() {
  const [entries, setEntries] = useState(null)
  const [refreshing, setRefreshing] = useState(false)

  function load() {
    return getActivityLog().then(({ entries }) => setEntries(entries))
  }

  useEffect(() => {
    load()
  }, [])

  async function handleRefresh() {
    setRefreshing(true)
    try {
      await load()
    } finally {
      setRefreshing(false)
    }
  }

  return (
    <div className="admin-shell">
      <header className="admin-header">
        <span className="admin-header-title">Activity log</span>
        <nav className="admin-header-nav">
          <button className="admin-nav-link admin-refresh-btn" onClick={handleRefresh} disabled={refreshing}>
            {refreshing ? 'Refreshing…' : '↻ Refresh'}
          </button>
          <Link to="/admin" className="admin-nav-link">Back to admin</Link>
        </nav>
      </header>

      <main className="admin-main">
        {entries === null ? (
          <div className="loading">Loading…</div>
        ) : entries.length === 0 ? (
          <div className="empty-state">No activity yet.</div>
        ) : (
          <div className="activity-log-list">
            {entries.map((entry) => (
              <div className="activity-log-item" key={entry.id}>
                <span>
                  <span className="activity-log-admin">{capitalize(entry.admin_name)}</span>
                  {' — '}
                  <span className="activity-log-action">{ACTION_LABELS[entry.action] || entry.action}</span>
                </span>
                <span className="activity-log-time">{formatTime(entry.created_at)}</span>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

function capitalize(s) {
  return s ? s[0].toUpperCase() + s.slice(1) : s
}

function formatTime(iso) {
  return new Date(iso).toLocaleString('en-GB', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}
