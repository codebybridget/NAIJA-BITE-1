import React, { useState } from 'react';
import './Navbar.css';
import { assets } from '../../assets/assets';

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => setMenuOpen(!menuOpen);

  return (
    <nav className="navbar">
      <img className="logo" src={assets.logo} alt="Logo" />

      {/* Profile dropdown */}
      <div className="navbar-profile-container">
        <button
          className="navbar-profile"
          onClick={toggleMenu}
          aria-haspopup="true"
          aria-expanded={menuOpen}
        >
          <img src={assets.profile_image} alt="User profile" />
        </button>

        {menuOpen && (
          <ul className="navbar-menu">
            <li>
              <a href="/myorders">My Orders</a>
            </li>
            <li>
              <a href="/profile">Profile</a>
            </li>
            <li>
              <a href="/logout">Logout</a>
            </li>
          </ul>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
