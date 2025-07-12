// src/pages/OrderHistoryPage.jsx
import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Package, Calendar, MapPin, CreditCard, Clock, Eye } from 'lucide-react';
import { ordersAPI } from '../api/orders';
import { useAuth } from '../contexts/AuthContext';
import { DEFAULT_PRODUCT_IMAGE } from '../utils/constants';
import styles from '../styles/OrderHistoryPage.module.css';
import wishlistStyles from '../styles/WishlistPage.module.css';

const OrderHistoryPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    } else if (user?.isAdmin) {
      navigate('/admin/products');
    } else {
      fetchOrders();
    }
  }, [isAuthenticated, user, navigate]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const data = await ordersAPI.getMyOrders();
      setOrders(data);
    } catch (err) {
      setError('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const getStatusClass = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending': return styles.pending;
      case 'processing': return styles.processing;
      case 'shipped': return styles.shipped;
      case 'delivered': return styles.delivered;
      case 'cancelled': return styles.cancelled;
      default: return styles.defaultStatus;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true
    });
  };

  const formatShortDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric', month: 'long', year: 'numeric'
    });
  };

  if (!isAuthenticated) {
    return null;
  }

  if (loading) {
    return (
      <div className={wishlistStyles.wishlistPage}>
        <div className="spinner" />
      </div>
    );
  }

  if (error) {
    return (
      <div className={wishlistStyles.wishlistPage}>
        <div className={wishlistStyles.emptyWishlistContainer}>
          <p className={styles.errorMessage}>{error}</p>
          <button onClick={fetchOrders} className="btn btn-primary">Try Again</button>
        </div>
      </div>
    );
  }

  return (
    <div className={wishlistStyles.wishlistPage}>
      <div className="container">
        <h1 className={wishlistStyles.pageTitle}>My Orders</h1>
        {orders.length === 0 ? (
          <div className={wishlistStyles.emptyWishlistContainer}>
            <Package size={60} className={wishlistStyles.emptyWishlistIcon} />
            <h2 className={wishlistStyles.emptyWishlistTitle}>No orders yet</h2>
            <p className={wishlistStyles.emptyWishlistText}>Start shopping to see your orders here!</p>
            <Link to="/products" className="btn btn-primary">Shop Now</Link>
          </div>
        ) : (
          <div className={styles.ordersList} style={{marginTop: '2rem'}}>
            {orders.map((order) => (
              <div key={order._id} className={styles.orderCard}>
                <div className={styles.cardHeader}>
                  <div>
                    <h3 className={styles.orderId}>Order #{order._id.substring(order._id.length - 8)}</h3>
                    <div className={styles.orderMeta}>
                      <span><Calendar size={14} /> {formatDate(order.createdAt)}</span>
                      <span><CreditCard size={14} /> {order.paymentMethod}</span>
                    </div>
                  </div>
                  <div className={`${styles.statusBadge} ${getStatusClass(order.status)}`}>
                    {order.status}
                  </div>
                </div>
                <div className={styles.cardBody}>
                  {order.shippingAddress && (
                    <div className={styles.shippingSection}>
                      <h4 className={styles.sectionTitle}><MapPin size={16} /> Shipping Address</h4>
                      <div className={styles.addressBox}>
                        <p>{order.shippingAddress.street}</p>
                        <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}</p>
                        <p>{order.shippingAddress.country}</p>
                      </div>
                    </div>
                  )}
                </div>
                <div className={styles.cardFooter}>
                  <div className={styles.footerMeta}>
                    <Clock size={14} />
                    <span>Order placed on {formatShortDate(order.createdAt)}</span>
                    {order.phone && <span className={styles.phone}>Phone: {order.phone}</span>}
                  </div>
                  <div className={styles.footerActions}>
                    <Link to={`/orders/${order._id}`} className={styles.viewDetailsBtn}>
                      <Eye size={16} />
                      <span>View Details & Tracking</span>
                    </Link>
                    <div className={styles.totalAmount}>
                      <span className={styles.totalLabel}>Total Amount</span>
                      <span className={styles.totalValue}>₹{order.totalAmount?.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderHistoryPage;
