<<<<<<< HEAD
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function Footer() {
  const [clickCount, setClickCount] = useState(0)
  const navigate = useNavigate()

  const handleLogoClick = () => {
    const next = clickCount + 1
    setClickCount(next)
    if (next >= 5) {
      setClickCount(0)
      navigate('/admin')
    }
    setTimeout(() => setClickCount(prev => Math.max(0, prev - 1)), 2000)
  }

  return (
    <footer className="w-full py-8" style={{ background: '#1f1b18', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
      <div className="max-w-[1280px] mx-auto px-6 md:px-20 flex flex-col md:flex-row justify-between items-center gap-4">
        <button onClick={handleLogoClick} className="h-md text-lg text-white/80 tracking-tight cursor-pointer hover:text-white transition-colors">
          DASHU FOR MEN
        </button>
        <span className="text-sm text-white/40" style={{ fontFamily: 'Inter, sans-serif' }}>© {new Date().getFullYear()} DASHU FOR MEN. All Rights Reserved.</span>
=======
export default function Footer() {
  return (
    <footer className="w-full py-8 bg-[#1f1b18] text-white/60 border-t border-white/5">
      <div className="max-w-[1280px] mx-auto px-6 md:px-20 flex flex-col md:flex-row justify-between items-center gap-4">
        <span className="font-display font-semibold text-lg text-white/80 tracking-tight">DASHU FOR MEN</span>
        <span className="text-sm text-white/40">© 2025 DASHU FOR MEN. All Rights Reserved.</span>
>>>>>>> ec609ef59daaa2cb67669e3e72f00cd9dbfec85b
      </div>
    </footer>
  )
}
