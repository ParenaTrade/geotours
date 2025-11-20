'use client'

import { useEffect, useState } from 'react'

interface Booking {
  id: string
  hotel_id: string
  check_in_date: string
  check_out_date: string
  room_type: string
  guests: number
  total_price: number
  status: string
  payment_status: string
  confirmation_number: string | null
  hotels: {
    name: string
    address: string
  }
}

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchBookings()
  }, [])

  const fetchBookings = async () => {
    try {
      const response = await fetch('/api/hotel-bookings')
      const data = await response.json()
      setBookings(data)
    } catch (error) {
      console.error('Error fetching bookings:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return <div className="p-8">Loading...</div>
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-8">My Bookings</h1>

      {bookings.length === 0 ? (
        <p className="text-gray-600">No bookings found.</p>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <div
              key={booking.id}
              className="border rounded-lg p-6 hover:shadow-lg transition"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-semibold mb-2">
                    {booking.hotels?.name}
                  </h3>
                  <p className="text-gray-600 mb-2">{booking.hotels?.address}</p>
                  <div className="space-y-1 text-sm">
                    <p>
                      <span className="font-medium">Check-in:</span>{' '}
                      {new Date(booking.check_in_date).toLocaleDateString()}
                    </p>
                    <p>
                      <span className="font-medium">Check-out:</span>{' '}
                      {new Date(booking.check_out_date).toLocaleDateString()}
                    </p>
                    <p>
                      <span className="font-medium">Room:</span> {booking.room_type}
                    </p>
                    <p>
                      <span className="font-medium">Guests:</span> {booking.guests}
                    </p>
                    <p>
                      <span className="font-medium">Total:</span> ${booking.total_price}
                    </p>
                    {booking.confirmation_number && (
                      <p>
                        <span className="font-medium">Confirmation:</span>{' '}
                        {booking.confirmation_number}
                      </p>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                      booking.status
                    )}`}
                  >
                    {booking.status}
                  </span>
                  <p className="text-sm text-gray-600 mt-2">
                    Payment: {booking.payment_status}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}



