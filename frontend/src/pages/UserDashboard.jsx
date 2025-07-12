import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { productsAPI } from '../api/products';
import { swapAPI } from '../api/index';
import { Link, useNavigate } from 'react-router-dom';
import styles from '../styles/OrderHistoryPage.module.css';
import ProductCard from '../components/ProductCard';
import toast from 'react-hot-toast';
import { User, PlusCircle, PackageSearch, RefreshCcw } from 'lucide-react';

const UserDashboard = () => {
  const { user } = useAuth();
  const [uploads, setUploads] = useState([]);
  const [swaps, setSwaps] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [myUploads, mySwaps] = await Promise.all([
          productsAPI.getMyUploads(),
          swapAPI.getMy(),
        ]);
        setUploads(myUploads);
        setSwaps(mySwaps);
      } catch (err) {
        setUploads([]);
        setSwaps([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (!user) return <div className={styles.noOrdersContainer}><User size={48} className={styles.noOrdersIcon} /><h2 className={styles.noOrdersTitle}>Please log in to view your dashboard.</h2></div>;

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await productsAPI.delete(id);
        setUploads(uploads.filter(p => p._id !== id));
        toast.success('Product deleted successfully');
      } catch (err) {
        toast.error('Failed to delete product');
      }
    }
  };

  return (
    <div className={styles.orderHistoryPage}>
      <div className="container">
        {/* Profile Card */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 24, marginBottom: 32, background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px #0001', padding: 24 }}>
          <div style={{ background: '#f3f4f6', borderRadius: '50%', width: 72, height: 72, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <User size={40} color="#006666" />
          </div>
          <div>
            <h2 style={{ fontWeight: 700, fontSize: '1.5rem', margin: 0 }}>{user.name}</h2>
            <div style={{ color: '#666', fontSize: '1rem', marginBottom: 4 }}>{user.email}</div>
            <div style={{ fontWeight: 500, color: '#006666', fontSize: '1.1rem' }}>Points: <span style={{ fontWeight: 700 }}>{user.points ?? 0}</span></div>
          </div>
          <div style={{ marginLeft: 'auto' }}>
            <button className="btn btn-primary" onClick={() => navigate('/add-product')}><PlusCircle size={18} style={{ marginRight: 6 }} /> List New Item</button>
          </div>
        </div>

        {/* Uploaded Items Section */}
        <h2 className={styles.sectionTitle}><PackageSearch size={22} /> My Uploaded Items</h2>
        {loading ? <div className="spinner" /> : (
          uploads.length === 0 ? (
            <div className={styles.noOrdersContainer}>
              <img src={'/default-product.svg'} alt="No uploads" style={{ width: 120, opacity: 0.7, marginBottom: 16 }} />
              <h3 className={styles.noOrdersTitle}>No uploads yet.</h3>
              <p className={styles.noOrdersText}>List your first item and start swapping!</p>
              <button className="btn btn-primary" onClick={() => navigate('/add-product')}><PlusCircle size={16} style={{ marginRight: 4 }} /> List an Item</button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24 }}>
              {uploads.map(product => (
                <div key={product._id} style={{ position: 'relative', background: '#fff', borderRadius: 10, boxShadow: '0 1px 4px #0001', padding: 12, minWidth: 220, maxWidth: 260, flex: '0 0 auto' }}>
                  <ProductCard product={product} />
                  <div style={{ position: 'absolute', top: 12, left: 12, background: product.status === 'pending' ? '#fef9c3' : product.status === 'approved' ? '#dcfce7' : '#e0e7ff', color: product.status === 'pending' ? '#ca8a04' : product.status === 'approved' ? '#16a34a' : '#4f46e5', padding: '2px 10px', borderRadius: 8, fontSize: 12, fontWeight: 600, textTransform: 'capitalize' }}>
                    {product.status === 'pending' ? 'Pending Approval' : product.status}
                  </div>
                  <div style={{ position: 'absolute', bottom: 12, right: 12, display: 'flex', gap: 8 }}>
                    <button className="btn btn-secondary" onClick={() => navigate(`/products/edit/${product._id}`)}>Edit</button>
                    <button className="btn btn-danger" onClick={() => handleDelete(product._id)}>Delete</button>
                  </div>
                </div>
              ))}
            </div>
          )
        )}

        {/* Divider */}
        <hr style={{ margin: '48px 0 32px 0', border: 0, borderTop: '1.5px solid #e5e7eb' }} />

        {/* Swaps/Redemptions Section */}
        <h2 className={styles.sectionTitle}><RefreshCcw size={20} /> My Swap/Redemption Requests</h2>
        {loading ? <div className="spinner" /> : (
          swaps.length === 0 ? (
            <div className={styles.noOrdersContainer}>
              <img src={'/default-product.svg'} alt="No swaps" style={{ width: 120, opacity: 0.7, marginBottom: 16 }} />
              <h3 className={styles.noOrdersTitle}>No swap or redemption requests yet.</h3>
              <p className={styles.noOrdersText}>Request a swap or redeem an item to see it here.</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className={styles.orderTable} style={{ marginTop: 12, minWidth: 480 }}>
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>Type</th>
                    <th>Status</th>
                    <th>Requested At</th>
                  </tr>
                </thead>
                <tbody>
                  {swaps.map(req => (
                    <tr key={req._id}>
                      <td><Link to={`/products/${req.item?._id}`}>{req.item?.name || 'Item'}</Link></td>
                      <td style={{ textTransform: 'capitalize' }}>{req.type}</td>
                      <td>
                        <span style={{
                          display: 'inline-block',
                          padding: '2px 10px',
                          borderRadius: 8,
                          fontWeight: 600,
                          fontSize: 13,
                          background: req.status === 'pending' ? '#fef9c3' : req.status === 'accepted' ? '#dcfce7' : req.status === 'completed' ? '#e0e7ff' : '#fee2e2',
                          color: req.status === 'pending' ? '#ca8a04' : req.status === 'accepted' ? '#16a34a' : req.status === 'completed' ? '#4f46e5' : '#dc2626',
                          textTransform: 'capitalize'
                        }}>{req.status}</span>
                      </td>
                      <td>{new Date(req.createdAt).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default UserDashboard; 