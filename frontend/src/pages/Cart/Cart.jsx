import React, { useContext, useState, useEffect } from 'react';
import './Cart.css';
import { StoreContext } from '../../context/StoreContext';
import { useNavigate } from 'react-router-dom';

const Cart = () => {
  const { cartItem, food_list, removeFromCart, url } = useContext(StoreContext);
  const navigate = useNavigate();

  const [promoCode, setPromoCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [step, setStep] = useState('apply'); // 'apply', 'submit', 'done'

  const validPromoCodes = {
    SAVE10: 0.10,
    SAVE20: 0.20,
  };

  const subtotal = food_list.reduce((acc, item) => {
    const quantity = cartItem[item._id] || 0;
    return acc + item.price * quantity;
  }, 0);

  useEffect(() => {
    if (subtotal === 0) {
      setPromoCode('');
      setDiscount(0);
      setStep('apply');
    }
  }, [subtotal]);

  const deliveryFee = subtotal > 0 ? 500 : 0; // assume delivery fee in Naira
  const discountAmount = subtotal * discount;
  const total = subtotal - discountAmount + deliveryFee;

  const handlePromoAction = () => {
    const code = promoCode.toUpperCase();
    if (step === 'apply') {
      if (validPromoCodes[code]) {
        alert('Promo code is valid. Click again to submit.');
        setStep('submit');
      } else {
        alert('Invalid promo code!');
      }
    } else if (step === 'submit') {
      setDiscount(validPromoCodes[code]);
      setStep('done');
      alert(`Promo code "${code}" submitted and applied.`);
    }
  };

  // Helper to format numbers with commas and ₦ symbol
  const formatNaira = (amount) => `₦${amount.toLocaleString()}`;

  return (
    <div className='cart'>
      <h2>Your Cart</h2>

      <div className="cart-items">
        <div className="cart-items-title">
          <p>Image</p>
          <p>Name</p>
          <p>Price</p>
          <p>Qty</p>
          <p>Total</p>
          <p>Remove</p>
        </div>
        <hr />

        {food_list.map((item) => {
          const quantity = cartItem[item._id] || 0;
          if (quantity > 0) {
            const imageUrl = item.image.startsWith('http') ? item.image : `${url}${item.image.startsWith('/') ? '' : '/'}${item.image}`;

            return (
              <div className="cart-items-title cart-items-item" key={item._id}>
                <img src={imageUrl} alt={item.name} />
                <p>{item.name}</p>
                <p>{formatNaira(item.price)}</p>
                <p>{quantity}</p>
                <p>{formatNaira(item.price * quantity)}</p>
                <p className="remove-btn" onClick={() => removeFromCart(item._id)}>x</p>
              </div>
            );
          }
          return null;
        })}
      </div>

      <div className="promo-section">
        <input
          type="text"
          placeholder="Enter promo code"
          value={promoCode}
          onChange={(e) => setPromoCode(e.target.value)}
          disabled={step === 'done' || subtotal === 0}
        />
        <button onClick={handlePromoAction} disabled={step === 'done' || subtotal === 0}>
          {step === 'apply' && 'Apply'}
          {step === 'submit' && 'Submit'}
          {step === 'done' && 'Applied'}
        </button>
        {step === 'done' && (
          <p className="success-msg">Promo code "{promoCode.toUpperCase()}" applied.</p>
        )}
      </div>

      <div className="cart-summary">
        <p>Subtotal: <span>{formatNaira(subtotal)}</span></p>
        {subtotal > 0 && <p>Delivery Fee: <span>{formatNaira(deliveryFee)}</span></p>}
        {discount > 0 && <p>Discount: <span>-{formatNaira(discountAmount)}</span></p>}
        <hr />
        <h3>Total: <span>{formatNaira(total)}</span></h3>

        <button
          onClick={() => navigate('/order')}
          className="checkout-btn"
          disabled={subtotal === 0}
        >
          {subtotal === 0 ? 'Cart is Empty' : 'Proceed to Checkout'}
        </button>
      </div>
    </div>
  );
};

export default Cart;
