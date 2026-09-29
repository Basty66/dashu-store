import { Eyebrow } from '../atoms/Misc'

export function SectionHeading({ eyebrow, title, description, align = 'left', tone = 'dark', className = '', as: Tag = 'h2' }) {
  const center = align === 'center' ? 'mx-auto text-center items-center' : ''
  const titleColor = tone === 'dark' ? 'text-ink' : 'text-paper'
  const descColor = tone === 'dark' ? 'text-muted' : 'text-paper/65'
  return (
    <div className={`flex max-w-2xl flex-col gap-3 ${center} ${className}`}>
      {eyebrow && <Eyebrow tone={tone === 'dark' ? 'gold' : 'light'}>{eyebrow}</Eyebrow>}
      <Tag className={`display-lg ${titleColor}`}>{title}</Tag>
      {description && <p className={`text-base leading-relaxed sm:text-lg ${descColor}`}>{description}</p>}
    </div>
  )
}
