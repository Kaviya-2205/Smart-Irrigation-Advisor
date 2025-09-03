import { useState, useEffect } from 'react'
import axios from 'axios'

// ✅ Removed /api here (so you don't get /api/api/...)
const API_BASE_URL = 'http://localhost:8000'

const useApi = (endpoint, options = {}) => {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const response = await axios.get(`${API_BASE_URL}${endpoint}`)
        setData(response.data)
        setError(null)
      } catch (err) {
        setError(err.message)
        setData(null)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [endpoint])

  const postData = async (postEndpoint, postData) => {
    try {
      setLoading(true)
      const response = await axios.post(`${API_BASE_URL}${postEndpoint}`, postData)
      setData(response.data)
      setError(null)
      return response.data
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  return { data, loading, error, postData }
}

export default useApi
