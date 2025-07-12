import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ordersAPI } from '../api/orders';
import { DEFAULT_PRODUCT_IMAGE } from '../utils/constants';
import styles from '../styles/OrderDetail.module.css';

const OrderDetail = () => {
    const { orderId } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                setLoading(true);
                const data = await ordersAPI.getOrderById(orderId);
                setOrder(data);
            } catch (err) {
                setError('Failed to load order details');
            } finally {
                setLoading(false);
            }
        };
        fetchOrder();
    }, [orderId]);

    if (loading) {
        return <div className={styles.loadingWrapper}><div className={styles.spinner}></div></div>;
    }
    if (error) {
        return <div className={styles.errorWrapper}><p>{error}</p></div>;
    }
    if (!order) return null;

    const {
        _id,
        createdAt,
        status,
        orderItems,
        shippingAddress,
        totalAmount
    } = order;

    return (
        <div className={styles.orderDetailContainer}>
            <button onClick={() => navigate(-1)} className={styles.backBtn}>&larr; Back to Orders</button>

            <header className={styles.orderHeader}>
                <h1>Order Details</h1>
                <div className={styles.headerInfo}>
                    <span>Order #{_id}</span>
                    <span>Placed on {new Date(createdAt).toLocaleDateString()}</span>
                </div>
                <div style={{ marginTop: '1rem', fontSize: '1.1rem' }}>
                  <strong>User:</strong> {order.user?.name || 'N/A'} ({order.user?.email || 'N/A'})
                </div>
            </header>

            <div className={styles.orderDetailsGrid}>
                <div className={styles.mainContent}>
                    <div className={styles.orderStatusCard}>
                        <h4>Order Status: <span className={`${styles.status} ${styles[status?.toLowerCase()]}`}>{status}</span></h4>
                        {/* Can add a progress bar here in the future */}
                    </div>

                    <div className={styles.itemsCard}>
                        <h3>Items Ordered ({orderItems.length})</h3>
                        <div className={styles.itemsList}>
                            {orderItems.map(item => (
                                <div key={item.product?._id || 'unknown-product'} className={styles.itemRow}>
                                    <img 
                                        src={item.product?.image || DEFAULT_PRODUCT_IMAGE}
                                        alt={item.product?.name}
                                        className={styles.itemImage}
                                        onError={(e) => e.target.src = DEFAULT_PRODUCT_IMAGE}
                                    />
                                    <div className={styles.itemInfo}>
                                        <p className={styles.itemName}>{item.product?.name}</p>
                                        <p className={styles.itemSku}>SKU: {item.product?._id}</p>
                                    </div>
                                    <div className={styles.itemPrice}>
                                        <p>₹{item.product?.price?.toLocaleString()}</p>
                                        <p className={styles.itemQuantity}>Qty: {item.quantity}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {order.trackingHistory && order.trackingHistory.length > 0 && (
                        <div className={styles.trackingCard}>
                            <h3>Tracking History</h3>
                            <div className={styles.trackingTimeline}>
                                {order.trackingHistory.slice().reverse().map((entry, index) => (
                                    <div key={index} className={`${styles.timelineItem} ${index === 0 ? styles.latestItem : ''}`}>
                                        <div className={styles.timelineDot}></div>
                                        <div className={styles.timelineContent}>
                                            <p className={styles.timelineStatus}>{entry.status}</p>
                                            <p className={styles.timelineLocation}>{entry.location}</p>
                                            <p className={styles.timelineTime}>{new Date(entry.timestamp).toLocaleString()}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <aside className={styles.sidebar}>
                    <div className={styles.summaryCard}>
                        <h3>Order Summary</h3>
                        <div className={styles.summaryDetails}>
                            <div className={styles.summaryRow}>
                                <span>Subtotal</span>
                                <span>₹{totalAmount?.toLocaleString()}</span>
                            </div>
                            <div className={styles.summaryRow}>
                                <span>Shipping</span>
                                <span>FREE</span>
                            </div>
                            <div className={styles.summaryTotal}>
                                <span>Total</span>
                                <span>₹{totalAmount?.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>
                    {shippingAddress && (
                        <div className={styles.shippingCard}>
                            <h4>Shipping Address</h4>
                            <address>
                                {shippingAddress.address}<br />
                                {shippingAddress.city}, {shippingAddress.postalCode}<br />
                                {shippingAddress.country}
                            </address>
                        </div>
                    )}
                </aside>
            </div>
        </div>
    );
};

export default OrderDetail; 