'use client'

import { useEffect, useState } from 'react'
import { useOrderStatus } from '@/hooks/useRealtime'

interface Order {
  id: string
  restaurant_id: string
  items: any[]
  delivery_type: string
  delivery_address: string | null
  total_price: number
  status: string
  payment_status: string
  estimated_delivery_time: string | null
  restaurants: {
    name: string
    address: string
  }
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/restaurant-orders')
      const data = await response.json()
      setOrders(data)
    } catch (error) {
      console.error('Error fetching orders:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-100 text-green-800'
      case 'pending':
      case 'accepted':
        return 'bg-yellow-100 text-yellow-800'
      case 'preparing':
      case 'ready':
      case 'dispatched':
        return 'bg-blue-100 text-blue-800'
      case 'cancelled':
      case 'rejected':
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
      <h1 className="text-3xl font-bold mb-8">My Orders</h1>

      {orders.length === 0 ? (
        <p className="text-gray-600">No orders found.</p>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <OrderCard key={order.id} order={order} getStatusColor={getStatusColor} />
          ))}
        </div>
      )}
    </div>
  )
}

function OrderCard({ order, getStatusColor }: { order: Order; getStatusColor: (status: string) => string }) {
  const realtimeStatus = useOrderStatus(order.id)
  const status = realtimeStatus || order.status

  return (
    <div className="border rounded-lg p-6 hover:shadow-lg transition">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-xl font-semibold mb-2">
            {order.restaurants?.name}
          </h3>
          <p className="text-gray-600 mb-2">{order.restaurants?.address}</p>
          <div className="space-y-1 text-sm">
            <p>
              <span className="font-medium">Items:</span>{' '}
              {Array.isArray(order.items) ? order.items.length : 0} items
            </p>
            <p>
              <span className="font-medium">Delivery Type:</span> {order.delivery_type}
            </p>
            {order.delivery_address && (
              <p>
                <span className="font-medium">Address:</span> {order.delivery_address}
              </p>
            )}
            <p>
              <span className="font-medium">Total:</span> ${order.total_price}
            </p>
            {order.estimated_delivery_time && (
              <p>
                <span className="font-medium">Estimated Delivery:</span>{' '}
                {new Date(order.estimated_delivery_time).toLocaleString()}
              </p>
            )}
          </div>
        </div>
        <div className="text-right">
          <span
            className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(status)}`}
          >
            {status}
          </span>
          <p className="text-sm text-gray-600 mt-2">
            Payment: {order.payment_status}
          </p>
        </div>
      </div>
    </div>
  )
}



