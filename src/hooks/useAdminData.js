import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../lib/api'

// Carga datos del admin y manda al login si la sesión expiró.
export function useAdminData(path) {
  const navigate = useNavigate()
  const [state, setState] = useState({ data: null, error: null, loading: true })

  const handleError = useCallback(
    (error) => {
      if (error.status === 401) navigate('/admin/login', { replace: true })
      return error
    },
    [navigate],
  )

  const reload = useCallback(async () => {
    if (!path) return
    setState((s) => ({ ...s, loading: true }))
    try {
      const data = await api(path)
      setState({ data, error: null, loading: false })
    } catch (error) {
      setState({ data: null, error: handleError(error), loading: false })
    }
  }, [path, handleError])

  useEffect(() => {
    reload()
  }, [reload])

  const mutate = useCallback(
    async (url, options) => {
      try {
        return await api(url, options)
      } catch (error) {
        throw handleError(error)
      }
    },
    [handleError],
  )

  return { ...state, reload, mutate, setData: (data) => setState((s) => ({ ...s, data })) }
}
