import React, { useEffect, useState } from 'react'

const AUTO_ADVANCE_MS = 4500

export default function Carousel({ images }) {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    if (images.length < 2) return
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % images.length)
    }, AUTO_ADVANCE_MS)
    return () => clearInterval(timer)
  }, [images.length])

  useEffect(() => {
    if (index >= images.length) setIndex(0)
  }, [images.length, index])

  if (!images || images.length === 0) {
    return null
  }

  return (
    <section className="carousel-section">
      <div className="carousel-hero">
        {images.map((img, i) => (
          <img
            key={img.id}
            src={img.url}
            alt="Handmade bracelet by Erin May"
            className="carousel-hero-img"
            style={{ opacity: i === index ? 1 : 0 }}
            loading={i === 0 ? 'eager' : 'lazy'}
          />
        ))}
      </div>

      {images.length > 1 && (
        <div className="carousel-dots">
          {images.map((img, i) => (
            <button
              key={img.id}
              className={`carousel-dot ${i === index ? 'active' : ''}`}
              onClick={() => setIndex(i)}
              aria-label={`Show photo ${i + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  )
}
