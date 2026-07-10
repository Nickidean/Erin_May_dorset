import React from 'react'

export default function Footer({ vintedUrl, whatsappUrl }) {
  const year = new Date().getFullYear()

  return (
    <footer className="site-footer">
      <div className="site-footer-tagline">Handmade in Dorset · {year}</div>
      <div className="site-footer-nav">
        <a href={vintedUrl} target="_blank" rel="noopener noreferrer" className="btn btn-blue">
          Buy a bracelet
        </a>
        <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="btn btn-pink">
          Join us on WhatsApp
        </a>
      </div>
    </footer>
  )
}
