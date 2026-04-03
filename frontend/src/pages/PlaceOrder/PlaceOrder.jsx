import React, { useContext, useState } from "react";
import "./PlaceOrder.css";
import { StoreContext } from "../../context/StoreContext";

const PlaceOrder = () => {
  const { food_list, cartItem, axiosInstance } = useContext(StoreContext);

  const [data, setData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    street: "",
    city: "",
    state: "",
    zipcode: "",
    country: "",
    phone: "",
  });

  const onChangeHandler = (e) => {
    const { name, value } = e.target;
    setData((prev) => ({ ...prev, [name]: value }));
  };

  const deliveryFee = 1500;

  const subtotal = food_list.reduce((acc, item) => {
    const quantity = cartItem[item._id] || 0;
    return acc + item.price * quantity;
  }, 0);

  const total = subtotal + deliveryFee;

  const formatNaira = (amount) => `₦${amount.toLocaleString()}`;

  const handleSubmit = async (e) => {
    e.preventDefault();

    const orderItems = food_list
      .filter((item) => cartItem[item._id] > 0)
      .map((item) => ({
        name: item.name,
        price: item.price,
        quantity: cartItem[item._id],
      }));

    if (orderItems.length === 0) {
      alert("Your cart is empty");
      return;
    }

    try {
      // ✅ ONLY place order (backend already handles payment)
      const response = await axiosInstance.post("/api/orders/place", {
        items: orderItems,
        amount: total,
        address: { ...data },
      });

      if (response.data.success && response.data.session_url) {
        window.location.href = response.data.session_url;
      } else {
        alert(response.data.message || "Order failed");
      }
    } catch (err) {
      console.error("🔥 Place Order Error:", err.response?.data || err.message);
      alert(err.response?.data?.message || "Payment error");
    }
  };

  return (
    <form className="place-order" onSubmit={handleSubmit}>
      <div className="place-order-left">
        <p className="title">Delivery Information</p>

        <div className="multi-fields">
          <input name="firstName" value={data.firstName} onChange={onChangeHandler} placeholder="First name" required />
          <input name="lastName" value={data.lastName} onChange={onChangeHandler} placeholder="Last name" required />
        </div>

        <input name="email" value={data.email} onChange={onChangeHandler} placeholder="Email" required />
        <input name="street" value={data.street} onChange={onChangeHandler} placeholder="Street" required />

        <div className="multi-fields">
          <input name="city" value={data.city} onChange={onChangeHandler} placeholder="City" required />
          <input name="state" value={data.state} onChange={onChangeHandler} placeholder="State" required />
        </div>

        <div className="multi-fields">
          <input name="zipcode" value={data.zipcode} onChange={onChangeHandler} placeholder="Zipcode" required />
          <input name="country" value={data.country} onChange={onChangeHandler} placeholder="Country" required />
        </div>

        <input name="phone" value={data.phone} onChange={onChangeHandler} placeholder="Phone" required />
      </div>

      <div className="place-order-right">
        <div className="cart-total">
          <h2>Cart Total</h2>

          <p>Subtotal: {formatNaira(subtotal)}</p>
          <p>Delivery Fee: {formatNaira(deliveryFee)}</p>
          <hr />
          <h3>Total: {formatNaira(total)}</h3>

          <button type="submit" className="place-order-btn">
            Proceed to Payment
          </button>
        </div>
      </div>
    </form>
  );
};

export default PlaceOrder;