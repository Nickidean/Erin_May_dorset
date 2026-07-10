import React from 'react'

export default function Header({ logoUrl, vintedUrl, whatsappUrl }) {
  return (
    <header className="site-header">
      <div className="site-header-inner">
        <a href="/" className="site-brand">
          {logoUrl ? (
            <img src={logoUrl} alt="Erin May" className="site-logo-img" />
          ) : (
            <span className="site-wordmark">Erin May</span>
          )}
        </a>
        <nav className="site-nav">
          <a href={vintedUrl} target="_blank" rel="noopener noreferrer" className="btn btn-blue">
            Buy a bracelet
          </a>
          <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="btn btn-pink">
            Join us on WhatsApp
          </a>
        </nav>
      </div>
    </header>
  )
}
