import { useEffect, useState } from 'react'

export const apiUrl = import.meta.env.VITE_API_URL || 'https://api.frankfurter.dev/v2'

export function useFetch(url, reload) {
  const [data, setData] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    if (url === '') return

    let ignore = false
    setData(null)
    setError('')

    async function loadData() {
      try {
        const response = await fetch(url)
        if (!response.ok) {
          throw new Error('Request failed')
        }

        const json = await response.json()
        if (!ignore) setData(json)
      } catch {
        if (!ignore) setError('Could not load data. Please try again.')
      }
    }

    loadData()
    return () => {
      ignore = true
    }
  }, [url, reload])

  return { data, error }
}
