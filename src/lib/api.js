export class ApiError extends Error {
  constructor(status, data) {
    super(data?.error || `Error ${status}`)
    this.status = status
    this.fields = data?.fields || {}
    this.problems = data?.problems || []
  }
}

export async function api(path, { method = 'GET', body, signal } = {}) {
  let res
  try {
    res = await fetch(`/api${path}`, {
      method,
      signal,
      credentials: 'same-origin',
      headers: body ? { 'Content-Type': 'application/json' } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    })
  } catch (error) {
    if (error.name === 'AbortError') throw error
    throw new ApiError(0, { error: 'Sin conexión. Revisa tu internet e intenta de nuevo.' })
  }
  const data = await res.json().catch(() => null)
  if (!res.ok) throw new ApiError(res.status, data)
  return data
}
