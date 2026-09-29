import { useCallback, useEffect, useState } from 'react'
import { api } from '../lib/api'

function useRequest(path) {
  const [state, setState] = useState({ data: null, error: null, loading: true })
  const load = useCallback(() => {
    let alive = true
    setState((s) => ({ ...s, loading: true, error: null }))
    api(path)
      .then((data) => alive && setState({ data, error: null, loading: false }))
      .catch((error) => alive && setState({ data: null, error, loading: false }))
    return () => {
      alive = false
    }
  }, [path])
  useEffect(() => load(), [load])
  return { ...state, retry: load }
}

export const useSeminars = () => useRequest('/seminars')
export const useSeminar = (slug) => useRequest(`/seminars/${encodeURIComponent(slug)}`)
