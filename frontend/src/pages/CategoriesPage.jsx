import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { categoriesAPI } from '../api/categories';
import toast from 'react-hot-toast';
import { DEFAULT_CATEGORY_IMAGE } from '../utils/constants';
import styles from '../styles/CategoriesPage.module.css';

const CategoriesPage = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                setLoading(true);
                const data = await categoriesAPI.getAll();
                setCategories(data);
            } catch (error) {
                toast.error("Failed to load categories.");
            } finally {
                setLoading(false);
            }
        };
        fetchCategories();
    }, []);

    if (loading) {
        return (
            <div className="container" style={{ textAlign: 'center', padding: '4rem 0' }}>
                <div className="spinner"></div>
            </div>
        );
    }

    return (
        <div className={styles.categoriesPage}>
            <div className="container">
                <h1 className={styles.pageTitle}>All Categories</h1>
                <div className={styles.categoriesGrid}>
                    {categories.map((cat) => (
                        <Link to={`/products?category=${cat._id}`} key={cat._id} className={styles.categoryCard}>
                             <div className={styles.categoryImageWrapper}>
                                <img 
                                    src={cat.image || DEFAULT_CATEGORY_IMAGE} 
                                    alt={cat.name} 
                                    className={styles.categoryImage}
                                    onError={(e) => { e.target.src = DEFAULT_CATEGORY_IMAGE; }}
                                />
                            </div>
                            <h3 className={styles.categoryName}>{cat.name}</h3>
                        </Link>
                    ))}
                </div>
                {categories.length === 0 && <p>No categories found.</p>}
            </div>
        </div>
    );
};

export default CategoriesPage; 