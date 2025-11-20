'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

interface Hotel {
  id: string
  name: string
  city: string
  address: string
  rating: number
  images: string[]
  businesses: {
    business_name: string
  }
}

export default function HotelsPage() {
  const [hotels, setHotels] = useState<Hotel[]>([])
  const [loading, setLoading] = useState(true)
  const [city, setCity] = useState('')

  useEffect(() => {
    fetchHotels()
  }, [])

  const fetchHotels = async () => {
    try {
      const params = new URLSearchParams()
      if (city) params.append('city', city)
      
      const response = await fetch(`/api/hotels?${params}`)
      const data = await response.json()
      setHotels(data)
    } catch (error) {
      console.error('Error fetching hotels:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="p-8">Loading...</div>
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-8">Hotels</h1>
      
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search by city..."
          value={city}
          onChange={(e) => setCity(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && fetchHotels()}
          className="px-4 py-2 border rounded-lg w-full max-w-md"
        />
        <button
          onClick={fetchHotels}
          className="ml-2 px-4 py-2 bg-blue-600 text-white rounded-lg"
        >
          Search
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {hotels.map((hotel) => (
          <Link
            key={hotel.id}
            href={`/customer/hotels/${hotel.id}`}
            className="border rounded-lg overflow-hidden hover:shadow-lg transition"
          >
            {hotel.images && hotel.images[0] && (
              <img
                src={hotel.images[0]}
                alt={hotel.name}
                className="w-full h-48 object-cover"
              />
            )}
            <div className="p-4">
              <h3 className="text-xl font-semibold mb-2">{hotel.name}</h3>
              <p className="text-gray-600 mb-2">{hotel.city}</p>
              {hotel.rating > 0 && (
                <p className="text-yellow-500">⭐ {hotel.rating.toFixed(1)}</p>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}



