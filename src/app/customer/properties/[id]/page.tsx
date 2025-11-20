'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'

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
  interior_images: string[]
  amenities: string[]
  businesses: {
    business_name: string
    phone: string
    email: string
  }
}

export default function PropertyDetailPage() {
  const params = useParams()
  const [property, setProperty] = useState<Property | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProperty()
  }, [])

  const fetchProperty = async () => {
    try {
      const response = await fetch(`/api/properties/${params.id}`)
      const data = await response.json()
      setProperty(data)
    } catch (error) {
      console.error('Error fetching property:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="p-8">Loading...</div>
  }

  if (!property) {
    return <div className="p-8">Property not found</div>
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-8">{property.title}</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          {/* Exterior Images */}
          {property.images && property.images.length > 0 && (
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-4">Exterior Images</h2>
              <div className="grid grid-cols-2 gap-4">
                {property.images.map((image, index) => (
                  <img
                    key={index}
                    src={image}
                    alt={`Exterior ${index + 1}`}
                    className="w-full h-48 object-cover rounded-lg"
                  />
                ))}
              </div>
            </div>
          )}

          {/* Interior Images */}
          {property.interior_images && property.interior_images.length > 0 && (
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-4">Interior Images</h2>
              <div className="grid grid-cols-2 gap-4">
                {property.interior_images.map((image, index) => (
                  <img
                    key={index}
                    src={image}
                    alt={`Interior ${index + 1}`}
                    className="w-full h-48 object-cover rounded-lg"
                  />
                ))}
              </div>
            </div>
          )}

          <div className="mb-4">
            <p className="text-gray-700">{property.description}</p>
          </div>

          {property.amenities && property.amenities.length > 0 && (
            <div className="mb-4">
              <h3 className="font-semibold mb-2">Amenities:</h3>
              <div className="flex flex-wrap gap-2">
                {property.amenities.map((amenity, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 bg-gray-100 rounded-full text-sm"
                  >
                    {amenity}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="border rounded-lg p-6">
          <h2 className="text-2xl font-semibold mb-4">Property Details</h2>

          <div className="space-y-4 mb-6">
            <div>
              <span className="font-medium">Price:</span>{' '}
              <span className="text-2xl font-bold text-blue-600">
                {property.listing_type === 'rent' && property.rent_price
                  ? `$${property.rent_price}/month`
                  : `$${property.price}`}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              {property.area && (
                <div>
                  <span className="font-medium">Area:</span> {property.area} m²
                </div>
              )}
              {property.bedrooms && (
                <div>
                  <span className="font-medium">Bedrooms:</span> {property.bedrooms}
                </div>
              )}
              {property.bathrooms && (
                <div>
                  <span className="font-medium">Bathrooms:</span> {property.bathrooms}
                </div>
              )}
              <div>
                <span className="font-medium">Type:</span>{' '}
                <span className="capitalize">{property.property_type}</span>
              </div>
            </div>

            <div>
              <span className="font-medium">Location:</span> {property.address}, {property.city}
            </div>

            <div>
              <span className="font-medium">Contact:</span>
              <p>{property.businesses?.phone}</p>
              <p>{property.businesses?.email}</p>
            </div>
          </div>

          <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Contact Owner
          </button>
        </div>
      </div>
    </div>
  )
}

