import React, { useState } from 'react';
import './Footer.css';
import { assets } from '../../assets/assets';
import 'bootstrap/dist/css/bootstrap.min.css';

const Footer = () => {
  const [activeDropdown, setActiveDropdown] = useState(null);

  const toggleDropdown = (section) => {
    setActiveDropdown(activeDropdown === section ? null : section);
  };

  const dropdownContent = {
    about: "Masala Mingle was founded in 2020 with a mission to bring global flavors to your doorstep. We partner with top chefs worldwide to create authentic culinary experiences.",
    careers: "Join our passionate team! We're always looking for culinary enthusiasts, tech innovators, and customer service stars. Check our job board for current openings.",
    team: "Our diverse team includes Michelin-starred chefs, food technologists, and logistics experts working together to revolutionize your dining experience.",
    help: "Need assistance? Our 24/7 support team is here to help with orders, deliveries, or any questions. Call us at 1-800-MINGLE or chat via our app.",
    ride: "Become a delivery partner and earn competitive rates with flexible hours. Our rider app makes managing deliveries simple and efficient.",
    terms: "By using our services, you agree to our terms which outline the legal agreement between you and Masala Mingle regarding platform usage.",
    cookie: "We use cookies to enhance your experience, analyze traffic, and for advertising purposes. You can manage your preferences in account settings.",
    privacy: "Your privacy matters. We collect minimal data required for service and never share it without consent. Review how we protect your information.",
    investor: "Masala Mingle is a privately held company with backing from top venture firms. For investment inquiries, please contact ir@masalamingle.com."
  };

  return (
    <div className='footer' id='footer'>
      <div className="container">
        <div className="row gx-5">
          <div className="col-lg-4 col-md-6 mb-4">
            <div className="footer-brand">
              <a href="#home">
                <img src={assets.logo} alt="Masala Mingle" className="img-fluid" style={{maxWidth: '150px'}} />
              </a>
              <p className="mt-3">
                Masala Mingle: Your Global Culinary Hub. Explore a world of flavors, order chef-prepared meals, 
                join virtual cooking classes, and connect with fellow foodies. Easy ordering, fresh ingredients, 
                and delivery tracking make every meal an adventure.
              </p>
              <div className="social-icons d-flex gap-3">
                <a href="https://facebook.com"><img src={assets.facebook_icon} alt="Facebook" width="30" /></a>
                <a href="https://twitter.com"><img src={assets.twitter_icon} alt="Twitter" width="30" /></a>
                <a href="https://linkedin.com"><img src={assets.linkedin_icon} alt="LinkedIn" width="30" /></a>
              </div>
            </div>
          </div>

          <div className="col-lg-2 col-md-6 mb-4">
            <h3 className="footer-heading">Company</h3>
            <ul className="footer-links">
              <li className="dropdown-container">
                <button 
                  className="dropdown-btn" 
                  onClick={() => toggleDropdown('about')}
                  aria-expanded={activeDropdown === 'about'}
                >
                  About
                </button>
                {activeDropdown === 'about' && (
                  <div className="dropdown-content">
                    <p>{dropdownContent.about}</p>
                  </div>
                )}
              </li>
              <li className="dropdown-container">
                <button 
                  className="dropdown-btn" 
                  onClick={() => toggleDropdown('careers')}
                  aria-expanded={activeDropdown === 'careers'}
                >
                  Careers
                </button>
                {activeDropdown === 'careers' && (
                  <div className="dropdown-content">
                    <p>{dropdownContent.careers}</p>
                  </div>
                )}
              </li>
              <li className="dropdown-container">
                <button 
                  className="dropdown-btn" 
                  onClick={() => toggleDropdown('team')}
                  aria-expanded={activeDropdown === 'team'}
                >
                  Team
                </button>
                {activeDropdown === 'team' && (
                  <div className="dropdown-content">
                    <p>{dropdownContent.team}</p>
                  </div>
                )}
              </li>
            </ul>
          </div>

          <div className="col-lg-3 col-md-6 mb-4">
            <h3 className="footer-heading">Contact us</h3>
            <ul className="footer-links">
              <li className="dropdown-container">
                <button 
                  className="dropdown-btn" 
                  onClick={() => toggleDropdown('help')}
                  aria-expanded={activeDropdown === 'help'}
                >
                  Help & Support
                </button>
                {activeDropdown === 'help' && (
                  <div className="dropdown-content">
                    <p>{dropdownContent.help}</p>
                  </div>
                )}
              </li>
              <li className="dropdown-container">
                <button 
                  className="dropdown-btn" 
                  onClick={() => toggleDropdown('ride')}
                  aria-expanded={activeDropdown === 'ride'}
                >
                  Ride with us
                </button>
                {activeDropdown === 'ride' && (
                  <div className="dropdown-content">
                    <p>{dropdownContent.ride}</p>
                  </div>
                )}
              </li>
            </ul>
          </div>

          <div className="col-lg-3 col-md-6 mb-4">
            <h3 className="footer-heading">Legal</h3>
            <ul className="footer-links">
              <li className="dropdown-container">
                <button 
                  className="dropdown-btn" 
                  onClick={() => toggleDropdown('terms')}
                  aria-expanded={activeDropdown === 'terms'}
                >
                  Terms & Conditions
                </button>
                {activeDropdown === 'terms' && (
                  <div className="dropdown-content">
                    <p>{dropdownContent.terms}</p>
                  </div>
                )}
              </li>
              <li className="dropdown-container">
                <button 
                  className="dropdown-btn" 
                  onClick={() => toggleDropdown('cookie')}
                  aria-expanded={activeDropdown === 'cookie'}
                >
                  Cookie Policy
                </button>
                {activeDropdown === 'cookie' && (
                  <div className="dropdown-content">
                    <p>{dropdownContent.cookie}</p>
                  </div>
                )}
              </li>
              <li className="dropdown-container">
                <button 
                  className="dropdown-btn" 
                  onClick={() => toggleDropdown('privacy')}
                  aria-expanded={activeDropdown === 'privacy'}
                >
                  Privacy Policy
                </button>
                {activeDropdown === 'privacy' && (
                  <div className="dropdown-content">
                    <p>{dropdownContent.privacy}</p>
                  </div>
                )}
              </li>
              <li className="dropdown-container">
                <button 
                  className="dropdown-btn" 
                  onClick={() => toggleDropdown('investor')}
                  aria-expanded={activeDropdown === 'investor'}
                >
                  Investor Relations
                </button>
                {activeDropdown === 'investor' && (
                  <div className="dropdown-content">
                    <p>{dropdownContent.investor}</p>
                  </div>
                )}
              </li>
            </ul>
          </div>
        </div>
        
        <hr className="my-4" />
        
        <div className="text-center">
          <p className="copyright">© 2024 Masala Mingle. All Rights Reserved.</p>
        </div>
      </div>
    </div>
  );
};

export default Footer;