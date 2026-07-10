import React from 'react'

export default function Carousel({ images }) {
  if (!images || images.length === 0) {
    return null
  }

  return (
    <section className="carousel-section">
      <div className="carousel-track">
        {images.map((img) => (
          <div className="carousel-item" key={img.id}>
            <img src={img.url} alt="Handmade bracelet by Erin May" loading="lazy" />
          </div>
        ))}
      </div>
    </section>
  )
}
