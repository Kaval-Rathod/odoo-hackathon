import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { productsAPI } from '../api/products';
import { swapAPI } from '../api/index';
import { Link, useNavigate } from 'react-router-dom';
import styles from '../styles/OrderHistoryPage.module.css';
import ProductCard from '../components/ProductCard';
import toast from 'react-hot-toast';

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

  if (!user) return <div>Please log in to view your dashboard.</div>;

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
        <h1 className={styles.pageTitle}>My Dashboard</h1>
        <div style={{ marginBottom: 24 }}>
          <strong>Name:</strong> {user.name} <br />
          <strong>Email:</strong> {user.email} <br />
          <strong>Points:</strong> {user.points ?? 0}
        </div>
        <h2>My Uploaded Items</h2>
        {loading ? <div className="spinner" /> : (
          uploads.length === 0 ? <p>No uploads yet.</p> : (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
              {uploads.map(product => (
                <div key={product._id} style={{ position: 'relative' }}>
                  <ProductCard product={product} />
                  <div style={{ position: 'absolute', top: 8, right: 8, background: '#eee', padding: '2px 8px', borderRadius: 4, fontSize: 12 }}>
                    {product.status === 'pending' ? 'Pending Approval' : product.status.charAt(0).toUpperCase() + product.status.slice(1)}
                  </div>
                  <div style={{ position: 'absolute', bottom: 8, right: 8, display: 'flex', gap: 8 }}>
                    <button className="btn btn-secondary" onClick={() => navigate(`/products/edit/${product._id}`)}>Edit</button>
                    <button className="btn btn-danger" onClick={() => handleDelete(product._id)}>Delete</button>
                  </div>
                </div>
              ))}
            </div>
          )
        )}
        <h2 style={{ marginTop: 32 }}>My Swap/Redemption Requests</h2>
        {loading ? <div className="spinner" /> : (
          swaps.length === 0 ? <p>No swap or redemption requests yet.</p> : (
            <table className={styles.orderTable} style={{ marginTop: 12 }}>
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
                    <td>{req.type}</td>
                    <td>{req.status}</td>
                    <td>{new Date(req.createdAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )
        )}
      </div>
    </div>
  );
};

export default UserDashboard; 