import React, { useRef, useState } from 'react'
import ImageCropUploader from './ImageCropUploader.jsx'
import { uploadCarouselImage, deleteCarouselImage, reorderCarouselImages, updateCarouselCaption } from '../../lib/adminApi.js'
import { getMediaPublicUrl } from '../../lib/supabase.js'
import { MAX_CAROUSEL_IMAGES, CAROUSEL_ASPECT_RATIO, MAX_IMAGE_DIMENSION } from '../../lib/constants.js'

function CarouselManagerItem({ img, isFirst, isLast, onMove, onDelete, onCaptionSaved }) {
  const [caption, setCaption] = useState(img.caption || '')
  const timerRef = useRef(null)

  function handleCaptionChange(value) {
    setCaption(value)
    clearTimeout(timerRef.current)
    timerRef.current = setTimeout(async () => {
      await updateCarouselCaption(img.id, value)
      onCaptionSaved(img.id, value)
    }, 800)
  }

  return (
    <div>
      <div className="carousel-manager-item">
        <img src={getMediaPublicUrl(img.storage_path)} alt="" />
        <div className="carousel-manager-item-controls">
          {!isFirst && (
            <button className="btn-icon" onClick={() => onMove(img.id, -1)} title="Move earlier">←</button>
          )}
          {!isLast && (
            <button className="btn-icon" onClick={() => onMove(img.id, 1)} title="Move later">→</button>
          )}
          <button className="btn-icon btn-icon-danger" onClick={() => onDelete(img.id)} title="Remove">✕</button>
        </div>
      </div>
      <input
        className="field-input carousel-manager-caption"
        placeholder="Caption (optional)"
        value={caption}
        onChange={(e) => handleCaptionChange(e.target.value)}
      />
    </div>
  )
}

export default function CarouselManager({ images, onChange }) {
  const sorted = [...images].sort((a, b) => a.sort_order - b.sort_order)

  async function handleUpload(dataUrl) {
    const { image } = await uploadCarouselImage(dataUrl)
    onChange([...images, image])
  }

  async function handleDelete(id) {
    await deleteCarouselImage(id)
    onChange(images.filter((img) => img.id !== id))
  }

  async function handleMove(id, direction) {
    const index = sorted.findIndex((img) => img.id === id)
    const swapIndex = index + direction
    if (swapIndex < 0 || swapIndex >= sorted.length) return

    const reordered = [...sorted]
    ;[reordered[index], reordered[swapIndex]] = [reordered[swapIndex], reordered[index]]
    const withNewOrder = reordered.map((img, i) => ({ ...img, sort_order: i }))

    onChange(withNewOrder)
    await reorderCarouselImages(withNewOrder.map((img) => ({ id: img.id, sortOrder: img.sort_order })))
  }

  function handleCaptionSaved(id, caption) {
    onChange(images.map((img) => (img.id === id ? { ...img, caption } : img)))
  }

  const atLimit = images.length >= MAX_CAROUSEL_IMAGES

  return (
    <div>
      <p className="carousel-manager-count">{images.length} / {MAX_CAROUSEL_IMAGES} images</p>

      {sorted.length > 0 && (
        <div className="carousel-manager-grid">
          {sorted.map((img, i) => (
            <CarouselManagerItem
              key={img.id}
              img={img}
              isFirst={i === 0}
              isLast={i === sorted.length - 1}
              onMove={handleMove}
              onDelete={handleDelete}
              onCaptionSaved={handleCaptionSaved}
            />
          ))}
        </div>
      )}

      {!atLimit && (
        <ImageCropUploader
          aspectRatio={CAROUSEL_ASPECT_RATIO}
          maxDimension={MAX_IMAGE_DIMENSION}
          mimeType="image/jpeg"
          quality={0.85}
          label="+ Add photo"
          onUpload={handleUpload}
        />
      )}
    </div>
  )
}
