import { useEffect, useRef, useState } from 'react'

export default function useInView(options = {}) {
  const { threshold = 0.16, once = true } = options
  const ref = useRef(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return undefined

    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true)
          if (once) obs.disconnect()
        } else if (!once) {
          setInView(false)
        }
      },
      { threshold },
    )

    obs.observe(el)
    return () => obs.disconnect()
  }, [threshold, once])

  return [ref, inView]
}
