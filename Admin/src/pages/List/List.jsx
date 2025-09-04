import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './List.css';
import { toast } from "react-toastify";

const List = ({ url }) => {
  const [foods, setFoods] = useState([]);

  // Fetch food list
  const fetchFoods = async () => {
    try {
      const res = await axios.get(`${url}/api/food/list`);
      if (res.data.success) {
        setFoods(res.data.foods);
      }
    } catch (error) {
      console.error('Error fetching foods:', error);
      toast.error("❌ Failed to fetch food list");
    }
  };

  useEffect(() => {
    fetchFoods();
  }, []);

  // Remove a food item
  const removeFood = async (id) => {
    try {
      const res = await axios.post(`${url}/api/food/remove`, { id });
      if (res.data.success) {
        setFoods(foods.filter(food => food._id !== id));
        toast.success("✅ Food removed successfully!");
      } else {
        toast.error("❌ Failed to remove food");
      }
    } catch (error) {
      console.error('Error removing food:', error);
      toast.error("❌ Failed to remove food");
    }
  };

  return (
    <div className="list">
      <p>Food List</p>
      <div className="list-table">
        <div className="list-table-format title">
          <p>Image</p>
          <p>Name</p>
          <p>Description</p>
          <p>Price</p>
          <p>Category</p>
          <p>Action</p>
        </div>
        {foods.map((item) => (
          <div key={item._id} className="list-table-format">
            <img src={`${url}${item.image}`} alt={item.name} />
            <p>{item.name}</p>
            <p>{item.description}</p>
            <p>₦{item.price.toLocaleString()}</p>
            <p>{item.category}</p>
            <p onClick={() => removeFood(item._id)} className="remove-btn">❌</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default List;
