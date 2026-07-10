import React from 'react'
import { FAQS as FAQS_DEFAULT } from '../lib/constants.js'

export default function FaqSection({ faqs }) {
  const items = faqs && faqs.length ? faqs : FAQS_DEFAULT

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
