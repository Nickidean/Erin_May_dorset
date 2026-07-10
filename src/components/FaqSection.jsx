import React from 'react'
import { FAQS } from '../lib/constants.js'

export default function FaqSection() {
  return (
    <section className="faq-section container">
      <h2>FAQs</h2>
      <div className="faq-list">
        {FAQS.map((faq) => (
          <div className="faq-item" key={faq.question}>
            <div className="faq-question">{faq.question}</div>
            <div className="faq-answer">{faq.answer}</div>
          </div>
        ))}
      </div>
    </section>
  )
}
