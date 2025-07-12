import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { productsAPI } from '../api/products';
import { swapAPI } from '../api/index';
import styles from '../styles/ProductList.module.css';
import { toast } from 'react-hot-toast';

const SwapPage = () => {
  const { user } = useAuth();
  const [myProducts, setMyProducts] = useState([]);
  const [otherProducts, setOtherProducts] = useState([]);
  const [selectedMine, setSelectedMine] = useState(null);
  const [selectedOther, setSelectedOther] = useState(null);
  const [loading, setLoading] = useState(true);
  const [requesting, setRequesting] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const all = await productsAPI.getAll();
        setMyProducts(all.filter(p => p.uploader?._id === user?.id));
        setOtherProducts(all.filter(p => p.uploader?._id !== user?.id && p.status === 'approved'));
      } catch (err) {
        toast.error('Failed to load products');
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchProducts();
  }, [user]);

  const handleRequestSwap = async () => {
    if (!selectedMine || !selectedOther) return;
    setRequesting(true);
    try {
      await swapAPI.create({ itemId: selectedOther._id, offerItemId: selectedMine._id, type: 'swap' });
      toast.success('Swap request sent!');
      setSelectedMine(null);
      setSelectedOther(null);
    } catch (err) {
      toast.error('Failed to send swap request');
    } finally {
      setRequesting(false);
    }
  };

  if (!user) return <div style={{textAlign:'center',marginTop:40}}>Please log in to swap products.</div>;
  if (loading) return <div style={{textAlign:'center',marginTop:40}}>Loading...</div>;

  return (
    <div style={{maxWidth:1200,margin:'0 auto',padding:'2rem 1rem'}}>
      <div style={{display:'flex',gap:32,justifyContent:'center',alignItems:'flex-start',flexWrap:'wrap'}}>
        {/* My Products */}
        <div style={{flex:1,minWidth:280}}>
          <h2 style={{textAlign:'center',marginBottom:16,fontWeight:700,fontSize:'1.4rem'}}>Your Products</h2>
          <div className={styles.productGrid} style={{minHeight:200}}>
            {myProducts.length === 0 ? <div style={{gridColumn:'1/-1',textAlign:'center',color:'#888'}}>No uploads yet.</div> : myProducts.map(p => (
              <div
                key={p._id}
                className={styles.productCard}
                style={{
                  border: selectedMine?._id === p._id ? '2px solid #008080' : '1px solid #e5e7eb',
                  boxShadow: selectedMine?._id === p._id ? '0 4px 16px #00808022' : '0 2px 8px #0001',
                  cursor:'pointer',
                  transition:'box-shadow 0.2s, border 0.2s',
                  background: selectedMine?._id === p._id ? '#f0fdfa' : '#fff',
                }}
                onClick={() => setSelectedMine(p)}
                onMouseEnter={e => e.currentTarget.style.boxShadow = '0 6px 18px #00808033'}
                onMouseLeave={e => e.currentTarget.style.boxShadow = selectedMine?._id === p._id ? '0 4px 16px #00808022' : '0 2px 8px #0001'}
              >
                <img src={p.image || '/default-product.svg'} alt={p.name} className={styles.productImage} style={{height:180,objectFit:'cover'}} />
                <div className={styles.productCardBody}>
                  <div className={styles.productName}>{p.name}</div>
                  <div className={styles.productPrice}>₹{p.price}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
        {/* Other Products */}
        <div style={{flex:1,minWidth:280}}>
          <h2 style={{textAlign:'center',marginBottom:16,fontWeight:700,fontSize:'1.4rem'}}>Available Products</h2>
          <div className={styles.productGrid} style={{minHeight:200}}>
            {otherProducts.length === 0 ? (
              <div style={{gridColumn:'1/-1',textAlign:'center',color:'#888',padding:'2rem 0'}}>
                <div style={{fontSize:'2.5rem',marginBottom:8}}>🛒</div>
                <div>No products found.<br/><span style={{fontSize:'1rem',color:'#aaa'}}>Check back later or invite friends to list items!</span></div>
              </div>
            ) : otherProducts.map(p => (
              <div
                key={p._id}
                className={styles.productCard}
                style={{
                  border: selectedOther?._id === p._id ? '2px solid #008080' : '1px solid #e5e7eb',
                  boxShadow: selectedOther?._id === p._id ? '0 4px 16px #00808022' : '0 2px 8px #0001',
                  cursor:'pointer',
                  transition:'box-shadow 0.2s, border 0.2s',
                  background: selectedOther?._id === p._id ? '#f0fdfa' : '#fff',
                }}
                onClick={() => setSelectedOther(p)}
                onMouseEnter={e => e.currentTarget.style.boxShadow = '0 6px 18px #00808033'}
                onMouseLeave={e => e.currentTarget.style.boxShadow = selectedOther?._id === p._id ? '0 4px 16px #00808022' : '0 2px 8px #0001'}
              >
                <img src={p.image || '/default-product.svg'} alt={p.name} className={styles.productImage} style={{height:180,objectFit:'cover'}} />
                <div className={styles.productCardBody}>
                  <div className={styles.productName}>{p.name}</div>
                  <div className={styles.productPrice}>₹{p.price}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* Request Button */}
      <div style={{display:'flex',justifyContent:'center',marginTop:32}}>
        <button
          className="btn btn-primary"
          style={{padding:'1rem 2.5rem',fontSize:'1.1rem',minWidth:180,boxShadow:'0 2px 8px #0001'}}
          disabled={!selectedMine || !selectedOther || requesting}
          onClick={handleRequestSwap}
        >
          {requesting ? 'Requesting...' : 'Request Swap'}
        </button>
      </div>
    </div>
  );
};

export default SwapPage; 