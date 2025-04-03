import React, { useContext, useState } from 'react'
import './Navbar.css'
import { assets } from '../../assets/assets'
import { Link, useNavigate } from 'react-router-dom'
import { StoreContext } from '../../Context/StoreContext'
import { AuthContext } from '../../Context/AuthContext'
import { FaBars, FaTimes, FaUserCircle } from 'react-icons/fa'

const Navbar = ({setShowLogin, onMenuClick}) => {
  const navigate = useNavigate();
  const [menu, setMenu] = useState("home");
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  
  const {getTotalCartAmount, foodList} = useContext(StoreContext);
  const { user, logout } = useContext(AuthContext);

  const handleSearch = (query) => {
    setSearchQuery(query);
    if (query.trim() === '') {
      setSearchResults([]);
      return;
    }

    const filteredResults = foodList.filter(item => 
      item.name.toLowerCase().includes(query.toLowerCase()) ||
      item.description.toLowerCase().includes(query.toLowerCase())
    );
    setSearchResults(filteredResults);
  };

  const handleSearchItemClick = (item) => {
    navigate(`/food/${item._id}`);
    setShowSearch(false);
    setSearchQuery("");
    setSearchResults([]);
  };

  const handleSearchIconClick = () => {
    setShowSearch(!showSearch);
    if (showSearch) {
      setSearchQuery("");
      setSearchResults([]);
    }
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const handleUserMenuClick = () => {
    setShowUserMenu(!showUserMenu);
  };

  const menuItems = [
    { name: "home", label: "Home", path: "/" },
    { name: "order", label: "Orders", path: "/orders" },
    { name: "mob-app", label: "Pre Booking", path: "custom-order" },
    { name: "contact", label: "Contact us", path: "/footer" }
  ];

  return (
    <div className='navbar'>
      <Link to='' className='logo-link'>
        <img className='logo' src={assets.logo} alt="" />
      </Link>

      <div className="hamburger" onClick={toggleMenu}>
        {isMenuOpen ? <FaTimes /> : <FaBars />}
      </div>

      {/* Desktop Menu */}
      <ul className="navbar-menu desktop-menu">
        {menuItems.map((item) => (
          <Link
            key={item.name}
            to={item.path}
            onClick={() => {
              setMenu(item.name);
              if (item.onClick) item.onClick();
            }}
            className={`${menu === item.name ? "active" : ""}`}
          >
            {item.label}
          </Link>
        ))}
      </ul>

      {/* Mobile Menu */}
      <div className={`mobile-menu ${isMenuOpen ? 'active' : ''}`}>
        <div className="mobile-menu-header">
          <img className='logo' src={assets.logo} alt="" />
          <FaTimes className="close-menu" onClick={closeMenu} />
        </div>
        <ul className="mobile-menu-items">
          {menuItems.map((item) => (
            <li key={item.name}>
              <Link
                to={item.path}
                onClick={() => {
                  setMenu(item.name);
                  closeMenu();
                }}
                className={`${menu === item.name ? "active" : ""}`}
              >
                {item.label}
              </Link>
            </li>
          ))}
          <li className="mobile-user-section">
            {user ? (
              <>
                <div className="mobile-user-info">
                  <FaUserCircle className="user-icon" />
                  <div>
                    <p className="user-name">{user.name}</p>
                    <p className="user-email">{user.email}</p>
                  </div>
                </div>
                <button onClick={logout} className="mobile-logout-button">
                  Logout
                </button>
              </>
            ) : (
              <button onClick={() => {
                setShowLogin(true);
                closeMenu();
              }}>
                Sign in
              </button>
            )}
          </li>
        </ul>
      </div>

      <div className="navbar-right">
        <div className="search-container">
          <img 
            src={assets.search_icon} 
            alt="search" 
            onClick={handleSearchIconClick}
            className="search-icon"
          />
          {showSearch && (
            <div className="search-box">
              <input
                type="text"
                placeholder="Search items..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                autoFocus
              />
              {searchResults.length > 0 && (
                <div className="search-results">
                  {searchResults.map((item) => (
                    <div 
                      key={item._id}
                      className="search-result-item"
                      onClick={() => {
                        handleSearchItemClick(item);
                        closeMenu();
                      }}
                    >
                      <img src={item.image} alt={item.name} />
                      <div className="search-result-info">
                        <h4>{item.name}</h4>
                        <p>₹{item.price}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
        <Link to='/cart' className='navbar-cart-icon'>
          <img src={assets.basket_icon} alt="" />
          <div className={getTotalCartAmount()>0?"dot":""}></div>
        </Link>
        
        {user ? (
          <div className="user-menu-container">
            <div className="user-menu-trigger" onClick={handleUserMenuClick}>
              <FaUserCircle className="user-icon" />
              <span className="user-name">{user.name}</span>
            </div>
            {showUserMenu && (
              <div className="user-menu-dropdown">
                <div className="user-menu-header">
                  <p>Welcome, {user.name}!</p>
                  <p className="user-email">{user.email}</p>
                </div>
                <div className="user-menu-items">
                  <button onClick={logout} className="logout-button">
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <button className="desktop-sign-in" onClick={() => setShowLogin(true)}>
            Sign in
          </button>
        )}
      </div>
    </div>
  )
}

export default Navbar
