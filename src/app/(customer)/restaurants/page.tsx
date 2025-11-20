'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

interface Restaurant {
  id: string
  name: string
  cuisine_type: string
  city: string
  address: string
  rating: number
  images: string[]
  delivery_available: boolean
  delivery_fee: number
  min_order_amount: number
}

export default function RestaurantsPage() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [loading, setLoading] = useState(true)
  const [location, setLocation] = useState('')
  const [cuisine, setCuisine] = useState('')

  useEffect(() => {
    fetchRestaurants()
  }, [])

  const fetchRestaurants = async () => {
    try {
      const params = new URLSearchParams()
      if (location) params.append('location', location)
      if (cuisine) params.append('cuisine', cuisine)

      const response = await fetch(`/api/restaurants?${params}`)
      const data = await response.json()
      setRestaurants(data)
    } catch (error) {
      console.error('Error fetching restaurants:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="p-8">Loading...</div>
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-8">Restaurants</h1>

      <div className="mb-6 flex gap-4">
        <input
          type="text"
          placeholder="Search by location..."
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && fetchRestaurants()}
          className="px-4 py-2 border rounded-lg flex-1"
        />
        <input
          type="text"
          placeholder="Search by cuisine..."
          value={cuisine}
          onChange={(e) => setCuisine(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && fetchRestaurants()}
          className="px-4 py-2 border rounded-lg flex-1"
        />
        <button
          onClick={fetchRestaurants}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg"
        >
          Search
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {restaurants.map((restaurant) => (
          <Link
            key={restaurant.id}
            href={`/customer/restaurants/${restaurant.id}`}
            className="border rounded-lg overflow-hidden hover:shadow-lg transition"
          >
            {restaurant.images && restaurant.images[0] && (
              <img
                src={restaurant.images[0]}
                alt={restaurant.name}
                className="w-full h-48 object-cover"
              />
            )}
            <div className="p-4">
              <h3 className="text-xl font-semibold mb-2">{restaurant.name}</h3>
              <p className="text-gray-600 mb-2">{restaurant.cuisine_type}</p>
              <p className="text-gray-600 mb-2">{restaurant.city}</p>
              {restaurant.rating > 0 && (
                <p className="text-yellow-500">⭐ {restaurant.rating.toFixed(1)}</p>
              )}
              {restaurant.delivery_available && (
                <p className="text-sm text-gray-600 mt-2">
                  Delivery: ${restaurant.delivery_fee} | Min: ${restaurant.min_order_amount}
                </p>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}

