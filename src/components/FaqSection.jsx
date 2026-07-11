import React from 'react'
import { FAQS as FAQS_DEFAULT } from '../lib/constants.js'

export default function FaqSection({ faqs }) {
  // undefined = content hasn't loaded yet (or Supabase isn't configured) -> show defaults.
  // an array (even empty) = real published data -> respect it, including "no FAQs at all".
  const items = faqs === undefined ? FAQS_DEFAULT : faqs

  if (items.length === 0) {
    return null
  }

  return (
    <section className="faq-section container">
      <h2>FAQs</h2>
      <div className="faq-list">
        {items.map((faq) => (
          <div className="faq-item" key={faq.question}>
            <div className="faq-question">{faq.question}</div>
            <div className="faq-answer">{faq.answer}</div>
          </div>
        ))}
      </div>
    </section>
  )
}
