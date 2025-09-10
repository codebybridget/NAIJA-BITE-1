import React, { useState, useEffect } from 'react';
import './Orders.css';
import { toast } from 'react-toastify';
import axios from 'axios';
import { assets } from '../../assets/assets';
import { io } from 'socket.io-client';

const Orders = ({ url }) => {
  const [orders, setOrders] = useState([]);

  // ✅ Connect to socket
  useEffect(() => {
    if (!url) return;

    const socket = io(url, {
      transports: ["websocket"], // ensure reliable connection
      withCredentials: true,
    });

    socket.on("connect", () =>
      console.log("⚡ Connected to socket:", socket.id)
    );

    // Listen for refresh event from backend
    socket.on("refreshOrders", () => {
      fetchAllOrders();
    });

    return () => {
      socket.disconnect();
    };
  }, [url]);

  // ✅ Fetch all orders
  const fetchAllOrders = async () => {
    try {
      const response = await axios.get(`${url}/api/orders/list`);
      if (response.data.success) {
        setOrders(response.data.data || []);
      } else {
        toast.error(response.data.message || 'Error fetching orders');
      }
    } catch (err) {
      console.error('🔥 Error fetching orders:', err);
      toast.error('Network error while fetching orders');
    }
  };

  // ✅ Handle status change
  const statusHandler = async (e, orderId) => {
    const newStatus = e.target.value;

    try {
      const response = await axios.post(`${url}/api/orders/status`, {
        orderId,
        status: newStatus,
      });

      if (response.data.success) {
        toast.success('Order status updated successfully');

        // Optimistic UI update
        setOrders(prevOrders =>
          prevOrders.map(order =>
            order._id === orderId ? { ...order, status: newStatus } : order
          )
        );
      } else {
        toast.error(response.data.message || 'Failed to update order status');
      }
    } catch (err) {
      console.error('🔥 Status update error:', err);
      toast.error('Network error while updating status');
    }
  };

  // ✅ Initial fetch on mount
  useEffect(() => {
    fetchAllOrders();
  }, []);

  return (
    <div className="order add">
      <p>Order Page</p>
      <div className="order-list">
        {orders.length === 0 ? (
          <p>No orders found.</p>
        ) : (
          orders.map(order => (
            <div key={order._id} className="order-items">
              <img src={assets.parcel_icon} alt="Parcel Icon" />

              <p className="order-item-food">
                {order.items.map((item, idx) => (
                  <span key={idx}>
                    {item.name} x {item.quantity}
                    {idx !== order.items.length - 1 ? ', ' : ''}
                  </span>
                ))}
              </p>

              <p className="order-item-name">
                {order.address.firstName} {order.address.lastName}
              </p>

              <div className="order-item-address">
                <p>{order.address.street},</p>
                <p>
                  {order.address.city}, {order.address.state},{' '}
                  {order.address.country}, {order.address.zipcode}
                </p>
              </div>

              <p className="order-item-phone">{order.address.phone}</p>

              <p>Items: {order.items.length}</p>
              <p>₦{order.amount}</p>

              <select
                onChange={e => statusHandler(e, order._id)}
                value={order.status}
              >
                <option value="Food processing">Food processing</option>
                <option value="Out for delivery">Out for delivery</option>
                <option value="Delivered">Delivered</option>
              </select>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Orders;
