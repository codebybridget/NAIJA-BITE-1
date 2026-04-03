import React, { useContext } from 'react';
import './FoodItem.css';
import { assets } from '../../asset/assets';
import { StoreContext } from '../../context/StoreContext';

const FoodItem = ({ id, name, price, description, image }) => {
  const { cartItem, addToCart, removeFromCart, url } = useContext(StoreContext);

  const imageUrl = image
    ? image.startsWith('http')
      ? image
      : `${url}${image.startsWith('/') ? '' : '/'}${image}`
    : assets.placeholder;

  return (
    <div className='food-item'>
      <div className="food-item-img-container">
        <img className="food-item-image" src={imageUrl} alt={name} />

        {!cartItem[id] ? (
          <img className='add' onClick={() => addToCart(id)} src={assets.add_icon_white} alt="Add" />
        ) : (
          <div className='food-item-counter'>
            <img onClick={() => removeFromCart(id)} src={assets.remove_icon_red} alt="Remove" />
            <p>{cartItem[id]}</p>
            <img onClick={() => addToCart(id)} src={assets.add_icon_green} alt="Add" />
          </div>
        )}
      </div>

      <div className="food-item-info">
        <div className="food-item-name-rating">
          <p>{name}</p>
          <img src={assets.rating_starts} alt="Rating" />
        </div>
        <p className='food-item-desc'>{description}</p>
        <p className='food-item-price'>₦{price.toLocaleString()}</p>
      </div>
    </div>
  );
};

export default FoodItem;
