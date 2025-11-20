'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

interface Property {
  id: string
  property_type: string
  listing_type: string
  title: string
  description: string
  city: string
  address: string
  price: number
  rent_price: number | null
  currency: string
  area: number | null
  bedrooms: number | null
  bathrooms: number | null
  images: string[]
  businesses: {
    business_name: string
  }
}

export default function PropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    city: '',
    property_type: '',
    listing_type: '',
    min_price: '',
    max_price: '',
  })

  useEffect(() => {
    fetchProperties()
  }, [])

  const fetchProperties = async () => {
    try {
      const params = new URLSearchParams()
      if (filters.city) params.append('city', filters.city)
      if (filters.property_type) params.append('property_type', filters.property_type)
      if (filters.listing_type) params.append('listing_type', filters.listing_type)
      if (filters.min_price) params.append('min_price', filters.min_price)
      if (filters.max_price) params.append('max_price', filters.max_price)

      const response = await fetch(`/api/properties?${params}`)
      const data = await response.json()
      setProperties(data)
    } catch (error) {
      console.error('Error fetching properties:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="p-8">Loading...</div>
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-8">Real Estate</h1>

      {/* Filters */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-5 gap-4">
        <input
          type="text"
          placeholder="City..."
          value={filters.city}
          onChange={(e) => setFilters({ ...filters, city: e.target.value })}
          className="px-4 py-2 border rounded-lg"
        />
        <select
          value={filters.property_type}
          onChange={(e) => setFilters({ ...filters, property_type: e.target.value })}
          className="px-4 py-2 border rounded-lg"
        >
          <option value="">All Types</option>
          <option value="apartment">Apartment</option>
          <option value="house">House</option>
          <option value="villa">Villa</option>
          <option value="commercial">Commercial</option>
          <option value="land">Land</option>
        </select>
        <select
          value={filters.listing_type}
          onChange={(e) => setFilters({ ...filters, listing_type: e.target.value })}
          className="px-4 py-2 border rounded-lg"
        >
          <option value="">All Listings</option>
          <option value="rent">For Rent</option>
          <option value="sale">For Sale</option>
        </select>
        <input
          type="number"
          placeholder="Min Price"
          value={filters.min_price}
          onChange={(e) => setFilters({ ...filters, min_price: e.target.value })}
          className="px-4 py-2 border rounded-lg"
        />
        <input
          type="number"
          placeholder="Max Price"
          value={filters.max_price}
          onChange={(e) => setFilters({ ...filters, max_price: e.target.value })}
          className="px-4 py-2 border rounded-lg"
        />
        <button
          onClick={fetchProperties}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg"
        >
          Search
        </button>
      </div>

      {/* Properties Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {properties.map((property) => (
          <Link
            key={property.id}
            href={`/customer/properties/${property.id}`}
            className="border rounded-lg overflow-hidden hover:shadow-lg transition"
          >
            {property.images && property.images[0] && (
              <img
                src={property.images[0]}
                alt={property.title}
                className="w-full h-48 object-cover"
              />
            )}
            <div className="p-4">
              <h3 className="text-xl font-semibold mb-2">{property.title}</h3>
              <p className="text-gray-600 mb-2">{property.city}, {property.address}</p>
              <div className="flex justify-between items-center mb-2">
                <span className="text-lg font-bold text-blue-600">
                  {property.listing_type === 'rent' && property.rent_price
                    ? `$${property.rent_price}/month`
                    : `$${property.price}`}
                </span>
                <span className="text-sm text-gray-500 capitalize">
                  {property.property_type}
                </span>
              </div>
              <div className="flex gap-4 text-sm text-gray-600">
                {property.area && <span>📐 {property.area} m²</span>}
                {property.bedrooms && <span>🛏️ {property.bedrooms}</span>}
                {property.bathrooms && <span>🚿 {property.bathrooms}</span>}
              </div>
            </div>
          </Link>
        ))}
      </div>

      {properties.length === 0 && (
        <p className="text-center text-gray-600 mt-8">No properties found.</p>
      )}
    </div>
  )
}



