import { useId, useState } from 'react'
import { Plus } from 'lucide-react'

export function AccordionItem({ title, children, defaultOpen = false, tone = 'dark' }) {
  const [open, setOpen] = useState(defaultOpen)
  const id = useId()
  const border = tone === 'dark' ? 'border-sand' : 'border-white/10'
  return (
    <div className={`border-b ${border}`}>
      <h3 className="m-0 font-sans text-base" style={{ fontStretch: '100%', letterSpacing: 0 }}>
        <button
          type="button"
          aria-expanded={open}
          aria-controls={id}
          onClick={() => setOpen((o) => !o)}
          className="flex w-full items-center justify-between gap-6 py-5 text-left font-medium transition-colors duration-200 hover:text-gold-deep"
        >
          {title}
          <Plus size={18} className={`flex-none transition-transform duration-300 ease-out ${open ? 'rotate-45' : ''}`} aria-hidden="true" />
        </button>
      </h3>
      <div id={id} role="region" className={`grid transition-[grid-template-rows] duration-300 ease-out ${open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
        <div className="overflow-hidden">
          <div className={`pb-5 text-[0.95rem] leading-relaxed ${tone === 'dark' ? 'text-muted' : 'text-paper/70'}`}>{children}</div>
        </div>
      </div>
    </div>
  )
}
