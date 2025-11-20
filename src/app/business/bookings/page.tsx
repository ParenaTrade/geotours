'use client'

import { useEffect, useState } from 'react'

interface Booking {
  id: string
  user_id: string
  check_in_date: string
  check_out_date: string
  room_type: string
  guests: number
  total_price: number
  status: string
  payment_status: string
  special_requests: string | null
  profiles: {
    full_name: string
    email: string
    phone: string
  }
  hotels: {
    name: string
  }
}

export default function BusinessBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('pending')

  useEffect(() => {
    fetchBookings()
  }, [statusFilter])

  const fetchBookings = async () => {
    try {
      const response = await fetch(
        `/api/business/hotels/bookings${statusFilter ? `?status=${statusFilter}` : ''}`
      )
      const data = await response.json()
      setBookings(data)
    } catch (error) {
      console.error('Error fetching bookings:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAccept = async (bookingId: string) => {
    try {
      const response = await fetch('/api/business/hotels/bookings/accept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          booking_id: bookingId,
          notes: 'Booking confirmed',
        }),
      })

      if (response.ok) {
        fetchBookings()
      } else {
        alert('Failed to accept booking')
      }
    } catch (error) {
      console.error('Error accepting booking:', error)
      alert('Failed to accept booking')
    }
  }

  const handleReject = async (bookingId: string) => {
    const reason = prompt('Please provide a reason for rejection:')
    if (!reason) return

    try {
      const response = await fetch('/api/business/hotels/bookings/reject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          booking_id: bookingId,
          reason,
        }),
      })

      if (response.ok) {
        fetchBookings()
      } else {
        alert('Failed to reject booking')
      }
    } catch (error) {
      console.error('Error rejecting booking:', error)
      alert('Failed to reject booking')
    }
  }

  if (loading) {
    return <div className="p-8">Loading...</div>
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-8">Hotel Bookings</h1>

      <div className="mb-6">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border rounded-lg"
        >
          <option value="">All</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="cancelled">Cancelled</option>
          <option value="completed">Completed</option>
        </select>
      </div>

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
                <div className="flex-1">
                  <h3 className="text-xl font-semibold mb-2">
                    {booking.hotels?.name}
                  </h3>
                  <div className="space-y-1 text-sm mb-4">
                    <p>
                      <span className="font-medium">Guest:</span>{' '}
                      {booking.profiles?.full_name} ({booking.profiles?.email})
                    </p>
                    <p>
                      <span className="font-medium">Phone:</span>{' '}
                      {booking.profiles?.phone}
                    </p>
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
                    {booking.special_requests && (
                      <p>
                        <span className="font-medium">Special Requests:</span>{' '}
                        {booking.special_requests}
                      </p>
                    )}
                  </div>
                </div>
                <div className="text-right ml-4">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      booking.status === 'confirmed'
                        ? 'bg-green-100 text-green-800'
                        : booking.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {booking.status}
                  </span>
                  {booking.status === 'pending' && (
                    <div className="mt-4 space-x-2">
                      <button
                        onClick={() => handleAccept(booking.id)}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => handleReject(booking.id)}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

