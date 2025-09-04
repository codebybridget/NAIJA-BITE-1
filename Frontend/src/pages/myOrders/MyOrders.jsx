import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { StoreContext } from "../../context/StoreContext";
import { assets } from "../../asset/assets";
import "./MyOrders.css";

const MyOrders = () => {
  const { url, token } = useContext(StoreContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch orders function
  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.post(
        `${url}/api/orders/userorders`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setOrders(response.data.orders || []);
    } catch (err) {
      console.error("🔥 Fetch Orders Error:", err.response?.data || err.message);
      setError(err.response?.data?.message || err.message || "Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchOrders();
  }, [token]);

  if (!token) return <p>Please log in to see your orders.</p>;
  if (loading) return <p>Loading orders...</p>;
  if (error) return <p style={{ color: "red" }}>Error: {error}</p>;
  if (orders.length === 0) return <p>No orders found.</p>;

  return (
    <div className="myOrders">
      <h2>My Orders</h2>
      <div className="container">
        {orders.map((order) => {
          const totalItems = order.items.reduce((sum, item) => sum + item.quantity, 0);

          return (
            <div key={order._id} className="my-orders-order">
              <img src={assets.parcel_icon} alt="Parcel" />
              <div>
                <p>
                  {order.items.map((item, idx) => (
                    <span key={idx}>
                      {item.name} x {item.quantity} (₦{item.price * item.quantity})
                      {idx !== order.items.length - 1 ? ", " : ""}
                    </span>
                  ))}
                </p>
                <p><strong>Total Items:</strong> {totalItems}</p>
                <p><strong>Total Amount:</strong> ₦{order.amount}</p>
                <p><strong>Payment Status:</strong> {order.payment ? "Paid" : "Pending"}</p>
                <p><span> &#x25cf; </span> <b>{order.status}</b></p>

                {/* Track Order button now refreshes orders */}
                <button onClick={fetchOrders}>
                  Track Order
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MyOrders;
