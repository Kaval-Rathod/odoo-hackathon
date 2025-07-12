import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ordersAPI } from '../api/orders';
import toast from 'react-hot-toast';
import styles from '../styles/AdminOrderEdit.module.css';
import { Trash2 } from 'lucide-react';

const statusOptions = ['Pending', 'Processing', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled'];

const AdminOrderEdit = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newLocation, setNewLocation] = useState('');
  const [newStatus, setNewStatus] = useState('Processing');
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        const data = await ordersAPI.getOrderById(orderId);
        setOrder(data);
        if (data.status) {
          setNewStatus(data.status);
        }
      } catch (err) {
        setError('Failed to load order details.');
        toast.error('Failed to load order details.');
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [orderId]);

  const handleTrackingSubmit = async (e) => {
    e.preventDefault();
    if (!newLocation.trim()) {
      toast.error('Please enter a location.');
      return;
    }
    setIsUpdating(true);
    try {
      const res = await ordersAPI.updateOrderTracking(orderId, {
        location: newLocation,
        status: newStatus,
      });
      setOrder(res.order);
      toast.success('Tracking information updated successfully!');
      setNewLocation('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update tracking information.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteTracking = async (trackingId) => {
    const originalOrder = { ...order };
    
    // Optimistically update UI
    const updatedTrackingHistory = order.trackingHistory.filter(entry => entry._id !== trackingId);
    setOrder({ ...order, trackingHistory: updatedTrackingHistory });

    try {
      await ordersAPI.deleteOrderTracking(orderId, trackingId);
      toast.success('Tracking entry deleted.');
      // Refetch to ensure data consistency
      const data = await ordersAPI.getOrderById(orderId);
      setOrder(data);
    } catch (err) {
      // Revert on error
      setOrder(originalOrder);
      toast.error(err.response?.data?.message || 'Failed to delete entry.');
    }
  };

  if (loading) return <div className={styles.loadingWrapper}><div className={styles.spinner}></div></div>;
  if (error) return <div className={styles.errorWrapper}><p>{error}</p></div>;
  if (!order) return null;

  return (
    <div className={styles.pageContainer}>
      <div className={styles.headerContainer}>
        <button onClick={() => navigate('/admin/products')} className={styles.backBtn}>
          &larr; Back to Orders
        </button>
      </div>
      <div className={styles.card}>
        <h1 className={styles.title}>Order Details</h1>
        <div className={styles.detailsGrid}>
          <p><strong>Order ID:</strong> {order._id}</p>
          <p><strong>User:</strong> {order.user?.name || 'N/A'} ({order.user?.email || 'N/A'})</p>
          <p><strong>Total Amount:</strong> ₹{order.totalAmount.toLocaleString()}</p>
          <p>
            <strong>Current Status:</strong>
            <span className={`${styles.statusBadge} ${styles[order.status?.toLowerCase().replace(' ', '')]}`}>
              {order.status}
            </span>
          </p>
        </div>
        <hr className={styles.divider} />
        <div className={styles.updateSection}>
          <h2 className={styles.subtitle}>Update Tracking Information</h2>
          <form onSubmit={handleTrackingSubmit}>
            <div className={styles.formGroup}>
              <label htmlFor="newLocation">New Location</label>
              <input
                id="newLocation"
                type="text"
                value={newLocation}
                onChange={(e) => setNewLocation(e.target.value)}
                placeholder="e.g., 'Warehouse, New York'"
                className={styles.input}
                required
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="newStatus">New Status</label>
              <select
                id="newStatus"
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className={styles.select}
                required
              >
                {statusOptions.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>
            <button type="submit" className={styles.submitBtn} disabled={isUpdating}>
              {isUpdating ? 'Updating...' : 'Add Tracking Update'}
            </button>
          </form>
        </div>
        <hr className={styles.divider} />
        <div className={styles.historySection}>
          <h2 className={styles.subtitle}>Tracking History</h2>
          {order.trackingHistory && order.trackingHistory.length > 0 ? (
            <div className={styles.trackingTimeline}>
              {order.trackingHistory.slice().reverse().map((entry, idx) => (
                <div key={idx} className={`${styles.timelineItem} ${idx === 0 ? styles.latestItem : ''}`}>
                  <div className={styles.timelineDot}></div>
                  <div className={styles.timelineContent}>
                    <p className={styles.timelineStatus}>{entry.status}</p>
                    <p className={styles.timelineLocation}>{entry.location}</p>
                    <p className={styles.timelineTime}>{new Date(entry.timestamp).toLocaleString()}</p>
                  </div>
                  <button onClick={() => handleDeleteTracking(entry._id)} className={styles.deleteTrackingBtn}>
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p>No tracking history available.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminOrderEdit; 