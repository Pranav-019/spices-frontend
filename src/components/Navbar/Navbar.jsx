import React, { useContext, useState, useEffect } from 'react';
import './Navbar.css';
import { assets } from '../../assets/assets';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { StoreContext } from '../../Context/StoreContext';
import { AuthContext } from '../../Context/AuthContext';
import { FaBars, FaTimes, FaUserCircle, FaSearch, FaShoppingBasket } from 'react-icons/fa';

const Navbar = ({ setShowLogin }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [menu, setMenu] = useState("home");
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  
  const { getTotalCartAmount, foodList } = useContext(StoreContext);
  const { user, logout } = useContext(AuthContext);

  // Handle scroll effect for sticky navbar
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menus when route changes
  useEffect(() => {
    setShowSearch(false);
    setIsMenuOpen(false);
    setShowUserMenu(false);
    setSearchQuery("");
    setSearchResults([]);
  }, [location]);

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
    if (!isMenuOpen) {
      setShowSearch(false);
      setShowUserMenu(false);
    }
  };

  const closeAllMenus = () => {
    setIsMenuOpen(false);
    setShowSearch(false);
    setShowUserMenu(false);
  };

  const handleUserMenuClick = () => {
    setShowUserMenu(!showUserMenu);
    setShowSearch(false);
  };

  const scrollToFooter = () => {
    const footer = document.getElementById('footer');
    if (footer) {
      footer.scrollIntoView({ behavior: 'smooth' });
    }
    closeAllMenus();
  };

  const menuItems = [
    { name: "home", label: "Home", path: "/" },
    { name: "order", label: "Orders", path: "/orders" },
    { name: "mob-app", label: "Pre Booking", path: "custom-order" },
    { name: "contact", label: "Contact us", onClick: scrollToFooter }
  ];

  return (
    <div className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="navbar-container">
        <Link to='/' className='logo-link' onClick={closeAllMenus}>
          <img className='logo' src={assets.logo} alt="Masala Mingle" />
        </Link>

        <div className="hamburger" onClick={toggleMenu}>
          {isMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
        </div>

        {/* Desktop Menu */}
        <ul className="navbar-menu desktop-menu">
          {menuItems.map((item) => (
            item.onClick ? (
              <a
                key={item.name}
                href="#footer"
                onClick={(e) => {
                  e.preventDefault();
                  setMenu(item.name);
                  item.onClick();
                }}
                className={`${menu === item.name ? "active" : ""}`}
              >
                {item.label}
              </a>
            ) : (
              <Link
                key={item.name}
                to={item.path}
                onClick={() => {
                  setMenu(item.name);
                  closeAllMenus();
                }}
                className={`${menu === item.name ? "active" : ""}`}
              >
                {item.label}
              </Link>
            )
          ))}
        </ul>

        {/* Mobile Menu */}
        <div className={`mobile-menu ${isMenuOpen ? 'active' : ''}`}>
          <div className="mobile-menu-header">
            <img className='logo' src={assets.logo} alt="Masala Mingle" />
            <FaTimes className="close-menu" onClick={closeAllMenus} size={24} />
          </div>
          <ul className="mobile-menu-items">
            {menuItems.map((item) => (
              <li key={item.name}>
                {item.onClick ? (
                  <a
                    href="#footer"
                    onClick={(e) => {
                      e.preventDefault();
                      setMenu(item.name);
                      item.onClick();
                    }}
                    className={`${menu === item.name ? "active" : ""}`}
                  >
                    {item.label}
                  </a>
                ) : (
                  <Link
                    to={item.path}
                    onClick={() => {
                      setMenu(item.name);
                      closeAllMenus();
                    }}
                    className={`${menu === item.name ? "active" : ""}`}
                  >
                    {item.label}
                  </Link>
                )}
              </li>
            ))}
            <li className="mobile-user-section">
              {user ? (
                <>
                  <div className="mobile-user-info">
                    <FaUserCircle className="user-icon" size={24} />
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
                  closeAllMenus();
                }}>
                  Sign in
                </button>
              )}
            </li>
          </ul>
        </div>

        <div className="navbar-right">
          <div className="search-container">
            <FaSearch 
              className="search-icon"
              onClick={handleSearchIconClick}
              size={20}
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
                          closeAllMenus();
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
          
          <Link to='/cart' className='navbar-cart-icon' onClick={closeAllMenus}>
            <FaShoppingBasket size={20} />
            {getTotalCartAmount() > 0 && <div className="dot"></div>}
          </Link>
          
          {user ? (
            <div className="user-menu-container">
              <div className="user-menu-trigger" onClick={handleUserMenuClick}>
                <FaUserCircle className="user-icon" size={24} />
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
    </div>
  );
};

export default Navbar;