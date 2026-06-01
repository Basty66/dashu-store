import { useRef } from 'react'
import { useSpotlight } from '../hooks/useMousePosition'

export default function SpotlightCard({ children, className = '', as = 'div' }) {
  const ref = useRef(null)
  useSpotlight(ref)

  const Tag = as
  return (
    <Tag ref={ref} className={`spotlight-card ${className}`}>
      {children}
    </Tag>
  )
}
