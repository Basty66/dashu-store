import { useEffect, useState, useCallback } from 'react'
import { api } from '../lib/api'

let catalogPromise = null

export function loadCatalog(force = false) {
  if (!catalogPromise || force) {
    catalogPromise = api('/products').catch((error) => {
      catalogPromise = null
      throw error
    })
  }
  return catalogPromise
}

// Estado de carga uniforme para vistas que dependen de la API.
function useAsync(loader, deps) {
  const [state, setState] = useState({ data: null, error: null, loading: true })
  const [attempt, setAttempt] = useState(0)
  const retry = useCallback(() => setAttempt((a) => a + 1), [])

  useEffect(() => {
    let alive = true
    setState((s) => ({ ...s, loading: true, error: null }))
    loader(attempt > 0)
      .then((data) => alive && setState({ data, error: null, loading: false }))
      .catch((error) => alive && setState({ data: null, error, loading: false }))
    return () => {
      alive = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, attempt])

  return { ...state, retry }
}

export function useProducts() {
  return useAsync((force) => loadCatalog(force), [])
}

export function useProduct(slug) {
  return useAsync(async (force) => {
    const list = await loadCatalog(force).catch(() => null)
    const cached = list?.find((p) => p.slug === slug || String(p.id) === slug)
    return cached || api(`/products/${encodeURIComponent(slug)}`)
  }, [slug])
}
