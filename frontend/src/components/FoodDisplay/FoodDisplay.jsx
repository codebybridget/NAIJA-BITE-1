import React, { useContext } from 'react';
import './FoodDisplay.css';
import { StoreContext } from '../../context/StoreContext';
import FoodItem from '../FoodItem/FoodItem';

const FoodDisplay = ({ category }) => {
  const { food_list = [], loading, error } = useContext(StoreContext);

  if (loading) return <div>Loading food items...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!food_list.length) return <div>No food items available yet.</div>;

  // Normalize function (must match ExploreMenu)
  const normalize = str => str?.trim().toLowerCase();

  const selectedCatNormalized = normalize(category || 'all');

  const foodsToDisplay = food_list.filter(item => {
    if (!item.category) return false;
    return selectedCatNormalized === 'all' || normalize(item.category) === selectedCatNormalized;
  });

  if (!foodsToDisplay.length) return <div>No food items found in this category.</div>;

  return (
    <div className='food-display'>
      <h2>Top dishes near you</h2>
      <div className="food-display-list">
        {foodsToDisplay.map((item, index) => (
          <FoodItem
            key={item._id || index}
            id={item._id}
            name={item.name}
            description={item.description}
            price={item.price}
            image={item.image}
          />
        ))}
      </div>
    </div>
  );
};

export default FoodDisplay;
