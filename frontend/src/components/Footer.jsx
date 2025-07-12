import React from 'react';
import styles from '../styles/Footer.module.css';
import { Link } from 'react-router-dom';

const Footer = () => (
  <footer className={styles.footer}>
    <div className={styles.footerContainer}>
      <div className={styles.footerBrand}>
        <Link to="/" className={styles.logo}>getcart</Link>
        <p className={styles.tagline}>Curated products for a modern lifestyle.</p>
        <div className={styles.socials}>
          {/* Social icons placeholder */}
          <a href="#" aria-label="Instagram"><i className="fab fa-instagram"></i></a>
          <a href="#" aria-label="Twitter"><i className="fab fa-twitter"></i></a>
          <a href="#" aria-label="Facebook"><i className="fab fa-facebook"></i></a>
        </div>
      </div>
      <div className={styles.footerLinks}>
        <div>
          <h4>Shop</h4>
          <Link to="/products">All Products</Link>
          <Link to="/categories">Categories</Link>
          <Link to="/wishlist">Wishlist</Link>
          <Link to="/cart">Cart</Link>
          <Link to="/gift-cards">Gift Cards</Link>
          <Link to="/new-arrivals">New Arrivals</Link>
          <Link to="/best-sellers">Best Sellers</Link>
        </div>
        <div>
          <h4>Account</h4>
          <Link to="/myorders">My Orders</Link>
          <Link to="/login">Login/Register</Link>
          <Link to="/track-order">Track Order</Link>
          <Link to="/account-settings">Account Settings</Link>
          <Link to="/returns">Returns & Exchanges</Link>
        </div>
        <div>
          <h4>Info</h4>
          <Link to="/about">About Us</Link>
          <Link to="/contact">Contact</Link>
          <Link to="/faq">FAQ</Link>
          <Link to="/shipping">Shipping & Delivery</Link>
          <Link to="/privacy">Privacy Policy</Link>
          <Link to="/terms">Terms & Conditions</Link>
          <Link to="/careers">Careers</Link>
          <Link to="/blog">Blog</Link>
        </div>
      </div>
    </div>
    <div className={styles.copyright}>
      &copy; {new Date().getFullYear()} getcart. All rights reserved.
    </div>
  </footer>
);

export default Footer; 