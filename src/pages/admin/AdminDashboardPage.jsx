import React, { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AutosaveIndicator from '../../components/admin/AutosaveIndicator.jsx'
import ImageCropUploader from '../../components/admin/ImageCropUploader.jsx'
import CarouselManager from '../../components/admin/CarouselManager.jsx'
import { getDraftContent, saveDraft, publish as publishSite, uploadLogo, removeLogo, logout } from '../../lib/adminApi.js'
import { getMediaPublicUrl } from '../../lib/supabase.js'
import { getSession, clearSession } from '../../lib/session.js'
import { LOGO_MAX_DIMENSION, FAQS as FAQS_DEFAULT } from '../../lib/constants.js'

export default function AdminDashboardPage() {
  const navigate = useNavigate()
  const session = getSession()
  const [content, setContent] = useState(null)
  const [images, setImages] = useState([])
  const [saveStatus, setSaveStatus] = useState('')
  const [faqSaveStatus, setFaqSaveStatus] = useState('')
  const [publishStatus, setPublishStatus] = useState('')
  const [logoBusy, setLogoBusy] = useState(false)
  const saveTimer = useRef(null)
  const faqSaveTimer = useRef(null)

  useEffect(() => {
    getDraftContent().then(({ content, images }) => {
      setContent({
        ...content,
        faqs: content.faqs && content.faqs.length ? content.faqs : FAQS_DEFAULT,
      })
      setImages(images)
    })
  }, [])

  function handleFieldChange(field, value) {
    setContent((prev) => ({ ...prev, [field]: value }))
    setSaveStatus('saving')
    clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(async () => {
      await saveDraft({ [field]: value })
      setSaveStatus('saved')
      setTimeout(() => setSaveStatus(''), 2000)
    }, 800)
  }

  function handleFaqChange(index, field, value) {
    setContent((prev) => {
      const faqs = prev.faqs.map((faq, i) => (i === index ? { ...faq, [field]: value } : faq))
      scheduleFaqSave(faqs)
      return { ...prev, faqs }
    })
  }

  function scheduleFaqSave(faqs) {
    setFaqSaveStatus('saving')
    clearTimeout(faqSaveTimer.current)
    faqSaveTimer.current = setTimeout(async () => {
      await saveDraft({ faqs })
      setFaqSaveStatus('saved')
      setTimeout(() => setFaqSaveStatus(''), 2000)
    }, 800)
  }

  async function handleLogoUpload(dataUrl) {
    const { logoPath } = await uploadLogo(dataUrl)
    setContent((prev) => ({ ...prev, logo_path: logoPath }))
  }

  async function handleLogoRemove() {
    setLogoBusy(true)
    try {
      await removeLogo()
      setContent((prev) => ({ ...prev, logo_path: null }))
    } finally {
      setLogoBusy(false)
    }
  }

  async function handlePublish() {
    setPublishStatus('publishing')
    await publishSite()
    setPublishStatus('published')
    setTimeout(() => setPublishStatus(''), 2500)
  }

  async function handleLogout() {
    await logout().catch(() => {})
    clearSession()
    navigate('/admin/login', { replace: true })
  }

  if (!content) return <div className="loading">Loading…</div>

  return (
    <div className="admin-shell">
      <header className="admin-header">
        <span className="admin-header-title">Erin May admin</span>
        <nav className="admin-header-nav">
          <span className="admin-nav-link">{session?.adminName}</span>
          <Link to="/admin/activity" className="admin-nav-link">Activity log</Link>
          <a href="/" target="_blank" rel="noopener noreferrer" className="admin-nav-link">View site ↗</a>
          <button className="btn btn-outline" onClick={handleLogout}>Log out</button>
        </nav>
      </header>

      <main className="admin-main">
        <div className="admin-section">
          <h2>About us</h2>
          <p className="admin-section-hint">This text appears in the About section on the homepage.</p>
          <div className="field-group">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span className="field-label">About text</span>
              <AutosaveIndicator status={saveStatus} />
            </div>
            <textarea
              className="field-textarea"
              rows={5}
              value={content.about_text || ''}
              onChange={(e) => handleFieldChange('about_text', e.target.value)}
            />
          </div>
        </div>

        <div className="admin-section">
          <h2>Links</h2>
          <p className="admin-section-hint">Where the "Buy a bracelet" and "Join us on WhatsApp" buttons go.</p>
          <div className="field-group">
            <label className="field-label">Buy a bracelet (Vinted URL)</label>
            <input
              className="field-input"
              value={content.vinted_url || ''}
              onChange={(e) => handleFieldChange('vinted_url', e.target.value)}
            />
          </div>
          <div className="field-group">
            <label className="field-label">Join us on WhatsApp (Channel URL)</label>
            <input
              className="field-input"
              value={content.whatsapp_url || ''}
              onChange={(e) => handleFieldChange('whatsapp_url', e.target.value)}
            />
          </div>
        </div>

        <div className="admin-section">
          <h2>Logo</h2>
          <p className="admin-section-hint">Optional. If no logo is uploaded, the site shows "Erin May" as text instead.</p>
          <div className="image-uploader">
            {content.logo_path && (
              <img src={getMediaPublicUrl(content.logo_path)} alt="Current logo" className="image-uploader-preview" />
            )}
            <ImageCropUploader
              maxDimension={LOGO_MAX_DIMENSION}
              mimeType="image/png"
              label={content.logo_path ? 'Replace logo' : 'Upload logo'}
              onUpload={handleLogoUpload}
            />
            {content.logo_path && (
              <button className="btn btn-outline" onClick={handleLogoRemove} disabled={logoBusy}>
                {logoBusy ? 'Removing…' : 'Remove logo'}
              </button>
            )}
          </div>
        </div>

        <div className="admin-section">
          <h2>Photo carousel</h2>
          <p className="admin-section-hint">Up to 5 photos. They're cropped automatically so the layout can't break.</p>
          <CarouselManager images={images} onChange={setImages} />
        </div>

        <div className="admin-section">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h2>FAQs</h2>
            <AutosaveIndicator status={faqSaveStatus} />
          </div>
          <p className="admin-section-hint">The four questions and answers shown on the homepage.</p>
          {content.faqs.map((faq, i) => (
            <div className="field-group" key={i}>
              <label className="field-label">Question {i + 1}</label>
              <input
                className="field-input"
                value={faq.question}
                onChange={(e) => handleFaqChange(i, 'question', e.target.value)}
                style={{ marginBottom: '0.5rem' }}
              />
              <textarea
                className="field-textarea"
                rows={2}
                value={faq.answer}
                onChange={(e) => handleFaqChange(i, 'answer', e.target.value)}
              />
            </div>
          ))}
        </div>

        <div className="publish-bar">
          <span className="publish-bar-status">
            {publishStatus === 'publishing' && 'Publishing…'}
            {publishStatus === 'published' && 'Published — live on the site.'}
            {!publishStatus && 'Changes save automatically as a draft. Publish to make them live.'}
          </span>
          <button className="btn btn-blue" onClick={handlePublish} disabled={publishStatus === 'publishing'}>
            Publish
          </button>
        </div>
      </main>
    </div>
  )
}
