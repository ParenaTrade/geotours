'use client'

import { useEffect, useState } from 'react'

interface Order {
  id: string
  user_id: string
  items: any[]
  delivery_type: string
  delivery_address: string | null
  total_price: number
  status: string
  payment_status: string
  special_instructions: string | null
  profiles: {
    full_name: string
    email: string
    phone: string
  }
  restaurants: {
    name: string
  }
}

export default function BusinessOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('pending')

  useEffect(() => {
    fetchOrders()
  }, [statusFilter])

  const fetchOrders = async () => {
    try {
      const response = await fetch(
        `/api/business/restaurants/orders${statusFilter ? `?status=${statusFilter}` : ''}`
      )
      const data = await response.json()
      setOrders(data)
    } catch (error) {
      console.error('Error fetching orders:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAccept = async (orderId: string) => {
    try {
      const response = await fetch('/api/business/restaurants/orders/accept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order_id: orderId,
          estimated_preparation_time: 20,
          notes: 'Order accepted',
        }),
      })

      if (response.ok) {
        fetchOrders()
      } else {
        alert('Failed to accept order')
      }
    } catch (error) {
      console.error('Error accepting order:', error)
      alert('Failed to accept order')
    }
  }

  const handleReject = async (orderId: string) => {
    const reason = prompt('Please provide a reason for rejection:')
    if (!reason) return

    try {
      const response = await fetch('/api/business/restaurants/orders/reject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order_id: orderId,
          reason,
        }),
      })

      if (response.ok) {
        fetchOrders()
      } else {
        alert('Failed to reject order')
      }
    } catch (error) {
      console.error('Error rejecting order:', error)
      alert('Failed to reject order')
    }
  }

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    try {
      const response = await fetch('/api/business/restaurants/orders/update-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order_id: orderId,
          status: newStatus,
        }),
      })

      if (response.ok) {
        fetchOrders()
      } else {
        alert('Failed to update order status')
      }
    } catch (error) {
      console.error('Error updating order status:', error)
      alert('Failed to update order status')
    }
  }

  if (loading) {
    return <div className="p-8">Loading...</div>
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-8">Restaurant Orders</h1>

      <div className="mb-6">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border rounded-lg"
        >
          <option value="">All</option>
          <option value="pending">Pending</option>
          <option value="accepted">Accepted</option>
          <option value="preparing">Preparing</option>
          <option value="ready">Ready</option>
          <option value="dispatched">Dispatched</option>
          <option value="delivered">Delivered</option>
        </select>
      </div>

      {orders.length === 0 ? (
        <p className="text-gray-600">No orders found.</p>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="border rounded-lg p-6 hover:shadow-lg transition"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold mb-2">
                    {order.restaurants?.name}
                  </h3>
                  <div className="space-y-1 text-sm mb-4">
                    <p>
                      <span className="font-medium">Customer:</span>{' '}
                      {order.profiles?.full_name} ({order.profiles?.email})
                    </p>
                    <p>
                      <span className="font-medium">Phone:</span>{' '}
                      {order.profiles?.phone}
                    </p>
                    <p>
                      <span className="font-medium">Delivery Type:</span>{' '}
                      {order.delivery_type}
                    </p>
                    {order.delivery_address && (
                      <p>
                        <span className="font-medium">Address:</span>{' '}
                        {order.delivery_address}
                      </p>
                    )}
                    <p>
                      <span className="font-medium">Items:</span>{' '}
                      {Array.isArray(order.items)
                        ? order.items.length
                        : 0} items
                    </p>
                    <p>
                      <span className="font-medium">Total:</span> ${order.total_price}
                    </p>
                    {order.special_instructions && (
                      <p>
                        <span className="font-medium">Special Instructions:</span>{' '}
                        {order.special_instructions}
                      </p>
                    )}
                  </div>
                </div>
                <div className="text-right ml-4">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      order.status === 'delivered'
                        ? 'bg-green-100 text-green-800'
                        : order.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {order.status}
                  </span>
                  {order.status === 'pending' && (
                    <div className="mt-4 space-x-2">
                      <button
                        onClick={() => handleAccept(order.id)}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => handleReject(order.id)}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                      >
                        Reject
                      </button>
                    </div>
                  )}
                  {order.status === 'accepted' && (
                    <div className="mt-4 space-x-2">
                      <button
                        onClick={() => handleUpdateStatus(order.id, 'preparing')}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      >
                        Start Preparing
                      </button>
                    </div>
                  )}
                  {order.status === 'preparing' && (
                    <div className="mt-4 space-x-2">
                      <button
                        onClick={() => handleUpdateStatus(order.id, 'ready')}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                      >
                        Mark Ready
                      </button>
                    </div>
                  )}
                  {order.status === 'ready' && (
                    <div className="mt-4 space-x-2">
                      <button
                        onClick={() => handleUpdateStatus(order.id, 'dispatched')}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      >
                        Dispatch
                      </button>
                    </div>
                  )}
                  {order.status === 'dispatched' && (
                    <div className="mt-4 space-x-2">
                      <button
                        onClick={() => handleUpdateStatus(order.id, 'delivered')}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                      >
                        Mark Delivered
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

