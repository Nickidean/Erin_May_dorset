import React from 'react'
import ImageCropUploader from './ImageCropUploader.jsx'
import { uploadCarouselImage, deleteCarouselImage, reorderCarouselImages } from '../../lib/adminApi.js'
import { getMediaPublicUrl } from '../../lib/supabase.js'
import { MAX_CAROUSEL_IMAGES, CAROUSEL_ASPECT_RATIO, MAX_IMAGE_DIMENSION } from '../../lib/constants.js'

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

  const atLimit = images.length >= MAX_CAROUSEL_IMAGES

  return (
    <div>
      <p className="carousel-manager-count">{images.length} / {MAX_CAROUSEL_IMAGES} images</p>

      {sorted.length > 0 && (
        <div className="carousel-manager-grid">
          {sorted.map((img, i) => (
            <div className="carousel-manager-item" key={img.id}>
              <img src={getMediaPublicUrl(img.storage_path)} alt="" />
              <div className="carousel-manager-item-controls">
                {i > 0 && (
                  <button className="btn-icon" onClick={() => handleMove(img.id, -1)} title="Move earlier">←</button>
                )}
                {i < sorted.length - 1 && (
                  <button className="btn-icon" onClick={() => handleMove(img.id, 1)} title="Move later">→</button>
                )}
                <button className="btn-icon btn-icon-danger" onClick={() => handleDelete(img.id)} title="Remove">✕</button>
              </div>
            </div>
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
