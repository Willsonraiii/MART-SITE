import { useEffect } from 'react'

function upsertMeta(attr, key, content) {
  if (!content) return
  let el = document.head.querySelector(`meta[${attr}="${key}"]`)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, key)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

export default function Seo({
  title,
  description,
  path,
  image = '/images/wai-wai.jpg',
  type = 'website',
  jsonLd,
}) {
  const ld = jsonLd ? JSON.stringify(jsonLd) : ''

  useEffect(() => {
    const prev = document.title
    document.title = title
    upsertMeta('name', 'description', description)
    upsertMeta('property', 'og:title', title)
    upsertMeta('property', 'og:description', description)
    upsertMeta('property', 'og:type', type)
    upsertMeta('property', 'og:image', image)
    upsertMeta('name', 'twitter:card', 'summary_large_image')
    upsertMeta('name', 'twitter:title', title)
    upsertMeta('name', 'twitter:description', description)
    if (image) upsertMeta('name', 'twitter:image', image)

    let link = document.head.querySelector('link[rel="canonical"]')
    if (path) {
      if (!link) {
        link = document.createElement('link')
        link.setAttribute('rel', 'canonical')
        document.head.appendChild(link)
      }
      link.setAttribute('href', path)
    }

    document.getElementById('seo-jsonld')?.remove()
    let script
    if (ld) {
      script = document.createElement('script')
      script.type = 'application/ld+json'
      script.id = 'seo-jsonld'
      script.textContent = ld
      document.head.appendChild(script)
    }

    return () => {
      document.title = prev
      script?.remove()
    }
  }, [title, description, path, image, type, ld])

  return null
}
