import React from 'react'
import ImageCropUploader from './ImageCropUploader.jsx'
import { uploadGalleryImage, deleteGalleryImage } from '../../lib/adminApi.js'
import { getMediaPublicUrl } from '../../lib/supabase.js'
import { MAX_GALLERY_IMAGES, GALLERY_ASPECT_RATIO, MAX_IMAGE_DIMENSION } from '../../lib/constants.js'

export default function GalleryManager({ images, onChange }) {
  const sorted = [...images].sort((a, b) => a.sort_order - b.sort_order)

  async function handleUpload(dataUrl) {
    const { image } = await uploadGalleryImage(dataUrl)
    onChange([...images, image])
  }

  async function handleDelete(id) {
    await deleteGalleryImage(id)
    onChange(images.filter((img) => img.id !== id))
  }

  const atLimit = images.length >= MAX_GALLERY_IMAGES

  return (
    <div>
      <p className="carousel-manager-count">{images.length} / {MAX_GALLERY_IMAGES} images</p>

      {sorted.length > 0 && (
        <div className="gallery-manager-grid">
          {sorted.map((img) => (
            <div className="gallery-manager-item" key={img.id}>
              <img src={getMediaPublicUrl(img.storage_path)} alt="" />
              <button className="btn-icon btn-icon-danger gallery-manager-remove" onClick={() => handleDelete(img.id)} title="Remove">✕</button>
            </div>
          ))}
        </div>
      )}

      {!atLimit && (
        <ImageCropUploader
          aspectRatio={GALLERY_ASPECT_RATIO}
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
