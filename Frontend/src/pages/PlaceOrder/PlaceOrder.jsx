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

    try {
      const orderItems = food_list
        .filter((item) => cartItem[item._id] > 0)
        .map((item) => ({
          name: item.name,
          price: item.price,
          quantity: cartItem[item._id],
        }));

      const response = await axiosInstance.post("/api/orders/place", {
        items: orderItems,
        amount: total,
        address: { ...data },
      });

      if (response.data.success && response.data.session_url) {
        window.location.href = response.data.session_url;
      } else {
        alert("Error placing order: " + response.data.message);
      }
    } catch (err) {
      console.error("🔥 Place Order Error:", err.response?.data || err.message);
      alert("Something went wrong while placing your order.");
    }
  };

  

  return (
    <form className="place-order" onSubmit={handleSubmit}>
      <div className="place-order-left">
        <p className="title">Delivery Information</p>
        <div className="multi-fields">
          <input
            name="firstName"
            value={data.firstName}
            onChange={onChangeHandler}
            type="text"
            placeholder="First name"
            required
            autoComplete="given-name"
          />
          <input
            name="lastName"
            value={data.lastName}
            onChange={onChangeHandler}
            type="text"
            placeholder="Last name"
            required
            autoComplete="family-name"
          />
        </div>
        <input
          name="email"
          value={data.email}
          onChange={onChangeHandler}
          type="email"
          placeholder="Email address"
          required
          autoComplete="email"
        />
        <input
          name="street"
          value={data.street}
          onChange={onChangeHandler}
          type="text"
          placeholder="Street"
          required
          autoComplete="street-address"
        />
        <div className="multi-fields">
          <input
            name="city"
            value={data.city}
            onChange={onChangeHandler}
            type="text"
            placeholder="City"
            required
            autoComplete="address-level2"
          />
          <input
            name="state"
            value={data.state}
            onChange={onChangeHandler}
            type="text"
            placeholder="State"
            required
            autoComplete="address-level1"
          />
        </div>
        <div className="multi-fields">
          <input
            name="zipcode"
            value={data.zipcode}
            onChange={onChangeHandler}
            type="text"
            placeholder="Zip code"
            required
            autoComplete="postal-code"
          />
          <input
            name="country"
            value={data.country}
            onChange={onChangeHandler}
            type="text"
            placeholder="Country"
            required
            autoComplete="country"
          />
        </div>
        <input
          name="phone"
          value={data.phone}
          onChange={onChangeHandler}
          type="tel"
          placeholder="Phone"
          required
          autoComplete="tel"
        />
      </div>

      <div className="place-order-right">
        <div className="cart-total">
          <h2>Cart Total</h2>
          <div className="cart-total-details">
            <p>
              Subtotal: <span>{formatNaira(subtotal)}</span>
            </p>
            <p>
              Delivery Fee: <span>{formatNaira(deliveryFee)}</span>
            </p>
            <hr />
            <h3>
              Total: <span>{formatNaira(total)}</span>
            </h3>
          </div>
          <button type="submit" className="place-order-btn">
            Proceed to Payment
          </button>
        </div>
      </div>
    </form>
  );
};

export default PlaceOrder;
