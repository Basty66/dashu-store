import { useEffect } from 'react'
import { STORE } from '@shared/store.js'

export function useSeo({ title, description }) {
  useEffect(() => {
    document.title = title ? `${title} · ${STORE.name}` : `${STORE.name} — Crema alisadora coreana en Chile`
    if (description) document.querySelector('meta[name="description"]')?.setAttribute('content', description)
  }, [title, description])
}
