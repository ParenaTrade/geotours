'use client'

import { useEffect, useState } from 'react'
import MultiImageUpload from '@/components/MultiImageUpload'

interface Property {
  id: string
  property_type: string
  listing_type: string
  title: string
  address: string
  city: string
  price: number
  rent_price: number | null
  status: string
  images: string[]
  interior_images: string[]
}

export default function BusinessPropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)

  useEffect(() => {
    fetchProperties()
  }, [])

  const fetchProperties = async () => {
    try {
      // Get business properties
      const response = await fetch('/api/business/properties')
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
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">My Properties</h1>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          {showAddForm ? 'Cancel' : '+ Add Property'}
        </button>
      </div>

      {showAddForm && (
        <PropertyForm onSuccess={() => {
          setShowAddForm(false)
          fetchProperties()
        }} />
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {properties.map((property) => (
          <div
            key={property.id}
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
              <p className="text-gray-600 mb-2">{property.city}</p>
              <p className="text-lg font-bold text-blue-600">
                ${property.listing_type === 'rent' && property.rent_price
                  ? property.rent_price
                  : property.price}
              </p>
              <span className="text-sm text-gray-500 capitalize">
                {property.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function PropertyForm({ onSuccess }: { onSuccess: () => void }) {
  const [formData, setFormData] = useState({
    property_type: 'apartment',
    listing_type: 'rent',
    title: '',
    description: '',
    address: '',
    city: '',
    price: '',
    rent_price: '',
    area: '',
    bedrooms: '',
    bathrooms: '',
    amenities: [] as string[],
  })
  const [exteriorImages, setExteriorImages] = useState<string[]>([])
  const [interiorImages, setInteriorImages] = useState<string[]>([])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const response = await fetch('/api/properties', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          price: parseFloat(formData.price),
          rent_price: formData.rent_price ? parseFloat(formData.rent_price) : null,
          area: formData.area ? parseFloat(formData.area) : null,
          bedrooms: formData.bedrooms ? parseInt(formData.bedrooms) : null,
          bathrooms: formData.bathrooms ? parseInt(formData.bathrooms) : null,
          images: exteriorImages,
          interior_images: interiorImages,
        }),
      })

      if (response.ok) {
        onSuccess()
      } else {
        alert('Failed to create property')
      }
    } catch (error) {
      console.error('Error creating property:', error)
      alert('Failed to create property')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mb-8 border rounded-lg p-6 space-y-4">
      <h2 className="text-2xl font-semibold mb-4">Add New Property</h2>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Property Type</label>
          <select
            value={formData.property_type}
            onChange={(e) => setFormData({ ...formData, property_type: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg"
            required
          >
            <option value="apartment">Apartment</option>
            <option value="house">House</option>
            <option value="villa">Villa</option>
            <option value="commercial">Commercial</option>
            <option value="land">Land</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Listing Type</label>
          <select
            value={formData.listing_type}
            onChange={(e) => setFormData({ ...formData, listing_type: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg"
            required
          >
            <option value="rent">For Rent</option>
            <option value="sale">For Sale</option>
            <option value="both">Both</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Title</label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className="w-full px-4 py-2 border rounded-lg"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Description</label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="w-full px-4 py-2 border rounded-lg"
          rows={3}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Address</label>
          <input
            type="text"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">City</label>
          <input
            type="text"
            value={formData.city}
            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Price (Sale)</label>
          <input
            type="number"
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Rent Price (Monthly)</label>
          <input
            type="number"
            value={formData.rent_price}
            onChange={(e) => setFormData({ ...formData, rent_price: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg"
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Area (m²)</label>
          <input
            type="number"
            value={formData.area}
            onChange={(e) => setFormData({ ...formData, area: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Bedrooms</label>
          <input
            type="number"
            value={formData.bedrooms}
            onChange={(e) => setFormData({ ...formData, bedrooms: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Bathrooms</label>
          <input
            type="number"
            value={formData.bathrooms}
            onChange={(e) => setFormData({ ...formData, bathrooms: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Exterior Images</label>
        <MultiImageUpload
          bucket="property-exterior"
          onUploadComplete={setExteriorImages}
          existingImages={exteriorImages}
          maxFiles={10}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Interior Images</label>
        <MultiImageUpload
          bucket="property-interior"
          onUploadComplete={setInteriorImages}
          existingImages={interiorImages}
          maxFiles={10}
        />
      </div>

      <button
        type="submit"
        className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
      >
        Create Property
      </button>
    </form>
  )
}


