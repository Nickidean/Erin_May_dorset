import React, { useRef, useState } from 'react'
import { cropAndResizeImage, resizeImage, blobToDataUrl } from '../../lib/imageProcessing.js'

// Generic crop-then-upload widget. If aspectRatio is given, the image is
// center-cropped to that ratio (carousel images); otherwise it's just
// scaled down preserving its own aspect ratio (logo, which needs transparency).
export default function ImageCropUploader({
  aspectRatio,
  maxDimension,
  mimeType,
  quality,
  onUpload,
  label = 'Upload image',
  disabled,
}) {
  const inputRef = useRef(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function handleFile(e) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return

    setBusy(true)
    setError('')
    try {
      const blob = aspectRatio
        ? await cropAndResizeImage(file, { aspectRatio, maxDimension, mimeType, quality })
        : await resizeImage(file, { maxDimension, mimeType, quality })
      const dataUrl = await blobToDataUrl(blob)
      await onUpload(dataUrl)
    } catch (err) {
      setError(err.message || 'Could not upload image')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div>
      <div
        className="image-uploader-dropzone"
        onClick={() => !disabled && !busy && inputRef.current?.click()}
        role="button"
        tabIndex={0}
      >
        {busy ? 'Uploading…' : label}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFile}
        style={{ display: 'none' }}
        disabled={disabled || busy}
      />
      {error && <p className="admin-login-error">{error}</p>}
    </div>
  )
}
