import React from 'react'

export default function AboutSection({ text }) {
  return (
    <section className="about-section container">
      <h2>About us</h2>
      <p>{text}</p>
    </section>
  )
}
