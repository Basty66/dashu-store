import { useEffect, useRef, useState } from 'react'

export default function KineticText({ text, className = '', tag: Tag = 'h2', delay = 0, stagger = 0.06 }) {
  const [visible, setVisible] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect() } },
      { threshold: 0.2 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  const words = text.split(' ')

  return (
    <Tag ref={ref} className={className} style={{ perspective: '600px' }}>
      {words.map((word, i) => (
        <span
          key={i}
          className="inline-block mr-[0.3em]"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? 'translateY(0) rotateX(0)' : 'translateY(40px) rotateX(12deg)',
            transition: `opacity 0.7s cubic-bezier(0.16, 1, 0.3, 1) ${delay + i * stagger}s, transform 0.7s cubic-bezier(0.16, 1, 0.3, 1) ${delay + i * stagger}s`,
          }}
        >
          {word}
        </span>
      ))}
    </Tag>
  )
}
