const API_BASE = '/api'

export class ApiError extends Error {
  constructor(message, { status, fields } = {}) {
    super(message)
    this.status = status
    this.fields = fields
  }
}

export async function apiRequest(path, { body, ...options } = {}) {
  let response
  try {
    response = await fetch(`${API_BASE}${path}`, {
      ...options,
      credentials: 'same-origin',
      headers: {
        Accept: 'application/json',
        ...(body !== undefined && { 'Content-Type': 'application/json' }),
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    })
  } catch (error) {
    if (error.name === 'AbortError') throw error
    throw new ApiError('Could not reach the server. Check your connection and try again.')
  }

  const result = await response.json().catch(() => null)
  if (!response.ok || result?.success !== true) {
    throw new ApiError(
      response.status >= 500
        ? 'The server is temporarily unavailable. Please try again.'
        : result?.error?.message ?? 'The server returned an unexpected response. Please try again.',
      { status: response.status, fields: result?.error?.fields },
    )
  }
  return result
}
