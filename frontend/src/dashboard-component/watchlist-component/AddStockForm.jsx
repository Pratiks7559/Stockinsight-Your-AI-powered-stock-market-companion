import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'

const AddStockForm = ({ onStockAdded }) => {
  const [symbol, setSymbol] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { user } = useAuth()

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!symbol.trim()) {
      setError('Please enter a stock symbol')
      return
    }

    setLoading(true)
    setError('')

    try {
      const token = localStorage.getItem('token')
      const response = await fetch('http://localhost:5000/api/watchlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ symbol: symbol.toUpperCase() })
      })

      const data = await response.json()

      if (response.ok) {
        onStockAdded(data.stock)
        setSymbol('')
      } else {
        setError(data.message || 'Failed to add stock')
      }
    } catch (error) {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative">
      <form onSubmit={handleSubmit} className="flex items-center">
        <input
          type="text"
          placeholder="Add stock (e.g., AAPL)"
          value={symbol}
          onChange={(e) => setSymbol(e.target.value)}
          className="bg-slate-800 text-white px-4 py-2 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-40"
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white px-4 py-2 rounded-r-lg transition-all duration-300 disabled:opacity-50"
        >
          {loading ? 'Adding...' : 'Add'}
        </button>
      </form>
      
      {error && (
        <div className="absolute top-full left-0 mt-1 bg-red-500 text-white text-sm px-3 py-1 rounded">
          {error}
        </div>
      )}
    </div>
  )
}

export default AddStockForm