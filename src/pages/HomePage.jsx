import React, { useEffect, useState } from 'react'
import Header from '../components/Header.jsx'
import Carousel from '../components/Carousel.jsx'
import AboutSection from '../components/AboutSection.jsx'
import GallerySection from '../components/GallerySection.jsx'
import FaqSection from '../components/FaqSection.jsx'
import Footer from '../components/Footer.jsx'
import { ABOUT_TEXT_DEFAULT, VINTED_URL_DEFAULT, WHATSAPP_URL_DEFAULT } from '../lib/constants.js'
import { supabase, isSupabaseConfigured, getMediaPublicUrl } from '../lib/supabase.js'

export default function HomePage() {
  const [content, setContent] = useState(null)
  const [images, setImages] = useState([])
  const [galleryImages, setGalleryImages] = useState([])

  useEffect(() => {
    if (!isSupabaseConfigured()) return

    supabase
      .from('site_content')
      .select('*')
      .eq('state', 'published')
      .maybeSingle()
      .then(({ data }) => {
        if (data) setContent(data)
      })

    supabase
      .from('carousel_images')
      .select('*')
      .eq('state', 'published')
      .order('sort_order')
      .then(({ data }) => {
        setImages(
          (data || []).map((row) => ({
            id: row.id,
            url: getMediaPublicUrl(row.storage_path),
            caption: row.caption,
          }))
        )
      })

    supabase
      .from('gallery_images')
      .select('*')
      .eq('state', 'published')
      .order('sort_order')
      .then(({ data }) => {
        setGalleryImages(
          (data || []).map((row) => ({
            id: row.id,
            url: getMediaPublicUrl(row.storage_path),
          }))
        )
      })
  }, [])

  const logoUrl = content?.logo_path ? getMediaPublicUrl(content.logo_path) : null
  const aboutText = content?.about_text || ABOUT_TEXT_DEFAULT
  const vintedUrl = content?.vinted_url || VINTED_URL_DEFAULT
  const whatsappUrl = content?.whatsapp_url || WHATSAPP_URL_DEFAULT
  const faqs = content?.faqs

  return (
    <div className="site">
      <Header logoUrl={logoUrl} vintedUrl={vintedUrl} whatsappUrl={whatsappUrl} />
      <Carousel images={images} vintedUrl={vintedUrl} />
      <AboutSection text={aboutText} />
      <GallerySection images={galleryImages} />
      <FaqSection faqs={faqs} />
      <Footer vintedUrl={vintedUrl} whatsappUrl={whatsappUrl} />
    </div>
  )
}
