import React from 'react'
import './Footer.css'
import { assets } from '../../asset/assets'

const Footer = () => {
  return (
    <div className='footer' id='footer'>
      <div className="footer-content">
        <div className="footer-content-left">
          <img src={assets.logo} alt=""/>
          <p>Serving fresh and flavorful dishes straight from our kitchen to your doorstep. At NAIJA BITE, we believe great food brings people together.</p>
          <div className="footer-social-icons">
            <img src={assets.facebook_icon} alt=""/>
            <img src={assets.twitter_icon} alt=""/>
            <img src={assets.linkedin_icon} alt=""/>
          </div>
        </div>
        <div className="footer-content-center">
          <h2>COMPANY</h2>
          <ul>
            <li><a href="#home">Home</a></li>
            <li><a href="#about-us">About us</a></li>
            <li><a href="#delivery">Delivery</a></li>
            <li><a href="#privacy-policy">Privacy Policy</a></li>
          </ul>
        </div>
        <div className="footer-content-right">
          <h2>GET IN TOUCH</h2>
          <ul>
            <li>+234 08121378785</li>
            <li>contact@naijabite.com</li>
          </ul>
        </div>
      </div>
      <hr />
      <p className='footer-copyright'></p>
      <p>© 2025 NAIJA BITE. All rights reserved. Fresh food. Fast delivery. Guaranteed satisfaction.</p>
    </div>
  )
}

export default Footer
