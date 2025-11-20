'use client'

import { useEffect, useState } from 'react'
import MultiImageUpload from '@/components/MultiImageUpload'

interface Hotel {
  id: string
  name: string
  description: string
  city: string
  address: string
  images: string[]
}

export default function ManageHotelsPage() {
  const [hotels, setHotels] = useState<Hotel[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedHotel, setSelectedHotel] = useState<Hotel | null>(null)
  const [exteriorImages, setExteriorImages] = useState<string[]>([])
  const [interiorImages, setInteriorImages] = useState<string[]>([])

  useEffect(() => {
    fetchHotels()
  }, [])

  const fetchHotels = async () => {
    try {
      const response = await fetch('/api/business/hotels')
      const data = await response.json()
      setHotels(data)
      if (data.length > 0 && !selectedHotel) {
        setSelectedHotel(data[0])
        setExteriorImages(data[0].images || [])
      }
    } catch (error) {
      console.error('Error fetching hotels:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveImages = async () => {
    if (!selectedHotel) return

    try {
      const response = await fetch(`/api/business/hotels/${selectedHotel.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          images: exteriorImages,
        }),
      })

      if (response.ok) {
        alert('Images saved successfully')
        fetchHotels()
      }
    } catch (error) {
      console.error('Error saving images:', error)
      alert('Failed to save images')
    }
  }

  if (loading) {
    return <div className="p-8">Loading...</div>
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-8">Manage Hotel Images</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div>
          <h2 className="text-xl font-semibold mb-4">Select Hotel</h2>
          <div className="space-y-2">
            {hotels.map((hotel) => (
              <button
                key={hotel.id}
                onClick={() => {
                  setSelectedHotel(hotel)
                  setExteriorImages(hotel.images || [])
                }}
                className={`w-full text-left p-4 border rounded-lg ${
                  selectedHotel?.id === hotel.id
                    ? 'border-blue-600 bg-blue-50'
                    : 'hover:bg-gray-50'
                }`}
              >
                <h3 className="font-semibold">{hotel.name}</h3>
                <p className="text-sm text-gray-600">{hotel.city}</p>
              </button>
            ))}
          </div>
        </div>

        {selectedHotel && (
          <div className="lg:col-span-2">
            <h2 className="text-xl font-semibold mb-4">
              {selectedHotel.name} - Images
            </h2>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Exterior Images
                </label>
                <MultiImageUpload
                  bucket="hotel-exterior"
                  folder={selectedHotel.id}
                  onUploadComplete={setExteriorImages}
                  existingImages={exteriorImages}
                  maxFiles={10}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Interior/Room Images
                </label>
                <MultiImageUpload
                  bucket="hotel-interior"
                  folder={selectedHotel.id}
                  onUploadComplete={setInteriorImages}
                  existingImages={interiorImages}
                  maxFiles={20}
                />
              </div>

              <button
                onClick={handleSaveImages}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Save Images
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

