import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Edit, Trash2, ArrowLeft, Folder } from 'lucide-react';
import { categoriesAPI } from '../api/categories';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import styles from '../styles/CategoryManagement.module.css';

const CategoryManagement = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '', image: '' });
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user?.isAdmin) {
      navigate('/login');
      return;
    }
    fetchCategories();
  }, [user, navigate]);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const data = await categoriesAPI.getAllAdmin();
      setCategories(data);
    } catch (error) {
      toast.error('Failed to load categories.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveCategory = async (e) => {
    e.preventDefault();
    try {
      if (editingCategory) {
        await categoriesAPI.update(editingCategory._id, formData);
        toast.success('Category updated successfully!');
      } else {
        await categoriesAPI.create(formData);
        toast.success('Category created successfully!');
      }
      fetchCategories();
      setShowAddForm(false);
      setEditingCategory(null);
      setFormData({ name: '', description: '', image: '' });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save category.');
    }
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name || '',
      description: category.description || '',
      image: category.image || ''
    });
    setShowAddForm(true);
    window.scrollTo(0, 0);
  };

  const handleDelete = async (categoryId) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
        await categoriesAPI.delete(categoryId);
        toast.success('Category deleted successfully');
        fetchCategories();
      } catch (error) {
        toast.error('Failed to delete category.');
      }
    }
  };
  
  const handleCancel = () => {
    setShowAddForm(false);
    setEditingCategory(null);
    setFormData({ name: '', description: '', image: '' });
  };


  if (loading) {
    return (
        <div className="container" style={{ textAlign: 'center', padding: '4rem 0' }}>
          <div className="spinner"></div>
        </div>
    );
  }
  
  return (
    <main className={styles.mainContent}>
      <header className={styles.mainHeader}>
          <h1 className={styles.mainTitle}>Category Management</h1>
          {!showAddForm && (
            <button onClick={() => setShowAddForm(true)} className="btn btn-primary">
                <Plus size={18} />
                Add Category
            </button>
          )}
      </header>
      
      {showAddForm && (
        <div className={styles.categoryCard} style={{marginBottom: '2rem'}}>
          <form onSubmit={handleSaveCategory} className={styles.modalForm} style={{padding: '1.5rem'}}>
            <h2 style={{fontSize: '1.5rem', fontWeight: '600', marginBottom: '1.5rem'}}>{editingCategory ? 'Edit Category' : 'Add New Category'}</h2>
            <div className={styles.formGroup}>
                <label htmlFor="name">Category Name</label>
                <input type="text" id="name" name="name" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required />
            </div>
            <div className={styles.formGroup}>
                <label htmlFor="description">Description</label>
                <textarea id="description" name="description" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} />
            </div>
            <div className={styles.formGroup}>
                <label htmlFor="image">Image URL</label>
                <input type="url" id="image" name="image" value={formData.image} onChange={(e) => setFormData({...formData, image: e.target.value})} required />
            </div>
            <div className={styles.formActions}>
                <button type="button" className="btn btn-secondary" onClick={handleCancel} >Cancel</button>
                <button type="submit" className="btn btn-primary">{editingCategory ? 'Update' : 'Create'}</button>
            </div>
          </form>
        </div>
      )}
      
      <div className={styles.categoriesList}>
          {categories.map(category => (
              <div key={category._id} className={styles.categoryCard}>
                  <img 
                      src={category.image} 
                      alt={category.name} 
                      className={styles.categoryImage}
                      onError={(e) => e.target.src = 'https://via.placeholder.com/300x200?text=No+Image'}
                  />
                  <div className={styles.categoryInfo}>
                      <h3 className={styles.categoryName}>{category.name}</h3>
                      <p className={styles.categoryDescription}>{category.description}</p>
                      <span className={category.isActive ? styles.activeBadge : styles.inactiveBadge}>
                          {category.isActive ? 'Active' : 'Inactive'}
                      </span>
                  </div>
                  <div className={styles.categoryActions}>
                      <button onClick={() => handleEdit(category)}><Edit size={16} /></button>
                      <button onClick={() => handleDelete(category._id)}><Trash2 size={16} /></button>
                  </div>
              </div>
          ))}
      </div>
      {!loading && categories.length === 0 && <p>No categories found.</p>}
    </main>
  );
};

export default CategoryManagement; 