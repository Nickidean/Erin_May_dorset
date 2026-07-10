import { getSession, clearSession } from './session.js'

async function request(path, { method = 'POST', body } = {}) {
  const session = getSession()
  const headers = { 'Content-Type': 'application/json' }
  if (session?.token) headers.Authorization = `Bearer ${session.token}`

  const res = await fetch(`/api/${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })

  if (res.status === 401) {
    clearSession()
    window.location.href = '/admin/login'
    throw new Error('Session expired')
  }

  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(data.error || `Request failed (${res.status})`)
  }
  return data
}

export function login(admin, pin) {
  return request('admin-login', { body: { admin, pin } })
}

export function logout() {
  return request('admin-logout')
}

export function getDraftContent() {
  return request('draft-content', { method: 'GET' })
}

export function saveDraft(fields) {
  return request('save-draft', { body: fields })
}

export function publish() {
  return request('publish')
}

export function uploadLogo(imageBase64) {
  return request('upload-logo', { body: { imageBase64 } })
}

export function removeLogo() {
  return request('remove-logo')
}

export function uploadCarouselImage(imageBase64) {
  return request('upload-carousel-image', { body: { imageBase64 } })
}

export function deleteCarouselImage(imageId) {
  return request('delete-carousel-image', { body: { imageId } })
}

export function reorderCarouselImages(order) {
  return request('reorder-carousel-images', { body: { order } })
}

export function updateCarouselCaption(imageId, caption) {
  return request('update-carousel-caption', { body: { imageId, caption } })
}

export function uploadGalleryImage(imageBase64) {
  return request('upload-gallery-image', { body: { imageBase64 } })
}

export function deleteGalleryImage(imageId) {
  return request('delete-gallery-image', { body: { imageId } })
}

export function getActivityLog() {
  return request('activity-log', { method: 'GET' })
}
