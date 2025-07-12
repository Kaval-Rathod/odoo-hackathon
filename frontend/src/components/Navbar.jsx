// src/components/Navbar.jsx
import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingCart, User, Search, Heart } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { useWishlist } from '../contexts/WishlistContext';
import styles from '../styles/Navbar.module.css';

const SearchModal = ({ isOpen, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchTerm.trim())}`);
      onClose();
      setSearchTerm('');
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.searchModalOverlay} onClick={onClose}>
      <div className={styles.searchModalContent} onClick={(e) => e.stopPropagation()}>
        <form onSubmit={handleSubmit}>
          <input
            ref={inputRef}
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search for products..."
            className={styles.searchInput}
          />
          <button type="submit" className={styles.searchButton}>
            <Search size={22} />
          </button>
        </form>
      </div>
    </div>
  );
};

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const { getCartCount } = useCart();
  const { getWishlistCount } = useWishlist();
  const navigate = useNavigate();
  const location = useLocation();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const userMenuRef = useRef(null);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    setIsDropdownOpen(false);
  }, [location.pathname]);

  return (
    <>
      <header className={styles.header}>
        <div className={styles.container}>
          <Link to="/" className={styles.logo}>
            getcart
          </Link>
          
          <nav className={styles.navLinks}>
            <Link to="/" className={styles.navLink}>Home</Link>
            <Link to="/products" className={styles.navLink}>Shop</Link>
            <Link to="/about" className={styles.navLink}>About Us</Link>
            <Link to="/contact" className={styles.navLink}>Contact</Link>
          </nav>
          
          <div className={styles.navActions}>
            <button className={styles.actionBtn} onClick={() => setIsSearchOpen(true)}>
              <Search size={22} />
            </button>
            <Link to="/wishlist" className={`${styles.actionBtn} ${styles.cartLink}`}>
              <Heart size={22} />
              {getWishlistCount() > 0 && (
                <span className={styles.cartBadge}>{getWishlistCount()}</span>
              )}
            </Link>
            <Link to="/cart" className={`${styles.actionBtn} ${styles.cartLink}`}>
              <ShoppingCart size={22} />
              {getCartCount() > 0 && (
                <span className={styles.cartBadge}>{getCartCount()}</span>
              )}
            </Link>
            
            <div className={styles.separator}></div>

            {isAuthenticated ? (
              <div className={styles.userMenu} ref={userMenuRef}>
                <button className={styles.userButton} onClick={toggleDropdown}>
                  <User size={20} />
                  <span>{user?.name || 'My Account'}</span>
                </button>
                <div className={`${styles.userDropdown} ${isDropdownOpen ? styles.dropdownOpen : ''}`}>
                  {user?.isAdmin ? (
                    <Link to="/admin">Admin Dashboard</Link>
                  ) : (
                    <Link to="/myorders">My Orders</Link>
                  )}
                  <button onClick={handleLogout}>Logout</button>
                </div>
              </div>
            ) : (
              <Link to="/login" className={styles.loginLink}>Login</Link>
            )}
          </div>
        </div>
      </header>
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
};

export default Navbar;
