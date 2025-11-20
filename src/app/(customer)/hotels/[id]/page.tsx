'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'

interface Hotel {
  id: string
  name: string
  description: string
  city: string
  address: string
  rating: number
  images: string[]
  amenities: string[]
}

export default function HotelDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [hotel, setHotel] = useState<Hotel | null>(null)
  const [loading, setLoading] = useState(true)
  const [checkIn, setCheckIn] = useState('')
  const [checkOut, setCheckOut] = useState('')
  const [guests, setGuests] = useState(1)
  const [roomType, setRoomType] = useState('Standard')
  const [notes, setNotes] = useState('')

  useEffect(() => {
    fetchHotel()
  }, [])

  const fetchHotel = async () => {
    try {
      const response = await fetch(`/api/hotels`)
      const data = await response.json()
      const foundHotel = data.find((h: Hotel) => h.id === params.id)
      setHotel(foundHotel)
    } catch (error) {
      console.error('Error fetching hotel:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleBooking = async () => {
    if (!checkIn || !checkOut) {
      alert('Please select check-in and check-out dates')
      return
    }

    try {
      // Calculate price (simplified)
      const nights = Math.ceil(
        (new Date(checkOut).getTime() - new Date(checkIn).getTime()) /
          (1000 * 60 * 60 * 24)
      )
      const basePrice = 100 // This should come from hotel_rooms table
      const totalPrice = basePrice * nights * 1.1 // 10% tax

      const response = await fetch('/api/hotel-bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hotel_id: params.id,
          check_in_date: checkIn,
          check_out_date: checkOut,
          room_type: roomType,
          guests,
          total_price: totalPrice,
          notes,
        }),
      })

      const data = await response.json()
      if (data.error) {
        alert(data.error)
      } else {
        router.push('/customer/bookings')
      }
    } catch (error) {
      console.error('Error creating booking:', error)
      alert('Failed to create booking')
    }
  }

  if (loading) {
    return <div className="p-8">Loading...</div>
  }

  if (!hotel) {
    return <div className="p-8">Hotel not found</div>
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-8">{hotel.name}</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          {hotel.images && hotel.images[0] && (
            <img
              src={hotel.images[0]}
              alt={hotel.name}
              className="w-full h-96 object-cover rounded-lg mb-4"
            />
          )}
          <p className="text-gray-700 mb-4">{hotel.description}</p>
          <div className="mb-4">
            <h3 className="font-semibold mb-2">Amenities:</h3>
            <div className="flex flex-wrap gap-2">
              {hotel.amenities?.map((amenity, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 bg-gray-100 rounded-full text-sm"
                >
                  {amenity}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="border rounded-lg p-6">
          <h2 className="text-2xl font-semibold mb-4">Book Now</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Check-in Date
              </label>
              <input
                type="date"
                value={checkIn}
                onChange={(e) => setCheckIn(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg"
                min={new Date().toISOString().split('T')[0]}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Check-out Date
              </label>
              <input
                type="date"
                value={checkOut}
                onChange={(e) => setCheckOut(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg"
                min={checkIn || new Date().toISOString().split('T')[0]}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Guests</label>
              <input
                type="number"
                value={guests}
                onChange={(e) => setGuests(parseInt(e.target.value))}
                min={1}
                className="w-full px-4 py-2 border rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Room Type</label>
              <select
                value={roomType}
                onChange={(e) => setRoomType(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg"
              >
                <option value="Standard">Standard</option>
                <option value="Deluxe">Deluxe</option>
                <option value="Suite">Suite</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Special Requests
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg"
                rows={3}
              />
            </div>

            <button
              onClick={handleBooking}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Book Now
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}



