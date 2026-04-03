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
      console.error(err);
      alert("Payment error");
    }
  };

  return (
    <form className="place-order" onSubmit={handleSubmit}>
      <div className="place-order-left">
        <p className="title">Delivery Information</p>

        <input name="firstName" onChange={onChangeHandler} placeholder="First name" required />
        <input name="lastName" onChange={onChangeHandler} placeholder="Last name" required />
        <input name="email" onChange={onChangeHandler} placeholder="Email" required />
        <input name="street" onChange={onChangeHandler} placeholder="Street" required />
        <input name="city" onChange={onChangeHandler} placeholder="City" required />
        <input name="state" onChange={onChangeHandler} placeholder="State" required />
        <input name="zipcode" onChange={onChangeHandler} placeholder="Zipcode" required />
        <input name="country" onChange={onChangeHandler} placeholder="Country" required />
        <input name="phone" onChange={onChangeHandler} placeholder="Phone" required />

        <button type="submit">Proceed to Payment</button>
      </div>
    </form>
  );
};

export default PlaceOrder;