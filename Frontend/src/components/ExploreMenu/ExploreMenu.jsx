import React from 'react';
import './ExploreMenu.css';
import { menu_list } from '../../asset/assets';

const ExploreMenu = ({ category, setCategory }) => {

  const normalize = str => str?.trim().toLowerCase();

  return (
    <div className='explore-menu' id='explore-menu'>
      <h1>Explore our menu</h1>
      <p className='explore-menu-text'>
        Discover a vibrant fusion of Nigeria’s rich culinary heritage, where every dish tells a story.
        From spicy suya to soulful jollof rice, our menu is crafted with love, tradition, and a modern twist.
        Whether you're craving street food classics or home-style comfort, we've got something that tastes like home.
      </p>

      <div className="explore-menu-list">
        {menu_list.map((item, index) => (
          <div
            key={index}
            className={`explore-menu-list-item ${normalize(category) === normalize(item.menu_name) ? 'active' : ''}`}
            onClick={() => setCategory(normalize(item.menu_name))}
          >
            <div className="menu-img-container">
              <img
                className={normalize(category) === normalize(item.menu_name) ? 'active' : ''}
                src={item.menu_image}
                alt={item.menu_name}
              />
              <span className="menu-dot"></span>
            </div>
            <p>{item.menu_name}</p>
          </div>
        ))}
      </div>
      <hr />
    </div>
  );
};

export default ExploreMenu;
