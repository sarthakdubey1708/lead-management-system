import { useEffect, useState } from 'react'

// Retain settled data during a refresh of the same query so controls keep their focus.
export function useResource(load, revision = 0) {
  const [settled, setSettled] = useState(null)
  const matches = settled?.load === load
  const data = matches ? settled.data : null
  const error = matches && settled.revision === revision ? settled.error : null
  const loading = !matches || settled.revision !== revision

  useEffect(() => {
    const controller = new AbortController()
    load(controller.signal).then(
      (data) => {
        if (!controller.signal.aborted) setSettled({ load, revision, data, error: null })
      },
      (error) => {
        if (!controller.signal.aborted) {
          setSettled((previous) => ({
            load, revision, error, data: previous?.load === load ? previous.data : null,
          }))
        }
      },
    )
    return () => controller.abort()
  }, [load, revision])

  return { data, error, loading, previousData: settled?.data }
}
