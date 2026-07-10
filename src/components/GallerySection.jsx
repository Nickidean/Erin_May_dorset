import React, { useEffect, useState } from 'react'

export default function GallerySection({ images }) {
  const [openIndex, setOpenIndex] = useState(null)

  useEffect(() => {
    if (openIndex === null) return
    function onKey(e) {
      if (e.key === 'Escape') setOpenIndex(null)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [openIndex])

  if (!images || images.length === 0) {
    return null
  }

  return (
    <section className="gallery-section container">
      <h2>Gallery</h2>
      <div className="gallery-grid">
        {images.map((img, i) => (
          <button
            key={img.id}
            className="gallery-grid-item"
            onClick={() => setOpenIndex(i)}
            aria-label="View larger photo"
          >
            <img src={img.url} alt="Handmade bracelet by Erin May" loading="lazy" />
          </button>
        ))}
      </div>

      {openIndex !== null && (
        <div className="gallery-lightbox" onClick={() => setOpenIndex(null)}>
          <button className="gallery-lightbox-close" onClick={() => setOpenIndex(null)} aria-label="Close">✕</button>
          <img
            src={images[openIndex].url}
            alt="Handmade bracelet by Erin May"
            className="gallery-lightbox-img"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </section>
  )
}
