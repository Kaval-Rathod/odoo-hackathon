import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Upload, Image as ImageIcon } from 'lucide-react';
import { productsAPI } from '../api/products';
import { categoriesAPI } from '../api/categories';
import toast from 'react-hot-toast';
import styles from '../styles/ProductForm.module.css';
import { useAuth } from '../contexts/AuthContext';

const EditProduct = () => {
  const { id } = useParams();
  const [formData, setFormData] = useState(null);
  const [categories, setCategories] = useState([]);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [sizesInput, setSizesInput] = useState('');
  const [modelsInput, setModelsInput] = useState('');
  const [options, setOptions] = useState([{ name: '', values: '' }]);
  
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (!user?.isAdmin) {
        navigate('/login');
        return;
    }
    
    const fetchProductAndCategories = async () => {
        try {
            const [productData, categoriesData] = await Promise.all([
                productsAPI.getById(id),
                categoriesAPI.getAll()
            ]);
            setFormData({
                ...productData,
                category: productData.category?._id || productData.category || ''
            });
            setImagePreview(productData.image || '');
            setCategories(categoriesData);
            if (productData) {
                setSizesInput(productData.sizes ? productData.sizes.join(', ') : '');
                setModelsInput(productData.models ? productData.models.join(', ') : '');
                
                // Initialize options from the product data
                if (productData.options && productData.options.length > 0) {
                    setOptions(productData.options.map(opt => ({
                        name: opt.name,
                        values: opt.values.join(', ')
                    })));
                }
            }
        } catch (error) {
            toast.error("Failed to load product data.");
            navigate('/admin/products');
        } finally {
            setFetching(false);
        }
    };

    fetchProductAndCategories();
  }, [id, user, navigate]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setFormData(prev => ({ ...prev, image: '' }));
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleOptionNameChange = (idx, value) => {
    setOptions(prev => prev.map((opt, i) => i === idx ? { ...opt, name: value } : opt));
  };
  
  const handleOptionValuesChange = (idx, value) => {
    setOptions(prev => prev.map((opt, i) => i === idx ? { ...opt, values: value } : opt));
  };
  
  const handleAddOption = () => {
    setOptions(prev => [...prev, { name: '', values: '' }]);
  };
  
  const handleRemoveOption = (idx) => {
    setOptions(prev => prev.filter((_, i) => i !== idx));
  };

  const selectedCategory = categories.find(cat => cat._id === formData?.category);
  const isFashion = selectedCategory && selectedCategory.name.toLowerCase().includes('fashion');
  const isElectronics = selectedCategory && selectedCategory.name.toLowerCase().includes('electronic');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      let finalImageUrl = formData.image;
      if (imageFile) {
        const uploadData = new FormData();
        uploadData.append('image', imageFile);
        const res = await fetch('/api/upload', { method: 'POST', body: uploadData });
        const data = await res.json();
        finalImageUrl = data.imageUrl;
      }
      
      const optionsArray = options
        .filter(opt => opt.name && opt.values)
        .map(opt => ({ name: opt.name, values: opt.values.split(',').map(v => v.trim()).filter(Boolean) }));
      
      const productData = {
        ...formData,
        image: finalImageUrl,
        sizes: isFashion && sizesInput ? sizesInput.split(',').map(s => s.trim()).filter(Boolean) : [],
        models: isElectronics && modelsInput ? modelsInput.split(',').map(m => m.trim()).filter(Boolean) : [],
        options: optionsArray
      };
      
      await productsAPI.update(id, productData);
      toast.success('Product updated successfully!');
      navigate('/admin/products');
    } catch (error) {
      toast.error('Failed to update product.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };
  
  if (fetching || !formData) {
    return (
        <div className="container" style={{ textAlign: 'center', padding: '4rem 0' }}>
            <div className="spinner"></div>
        </div>
    );
  }

  return (
    <div className={styles.adminLayout}>
        <div className={styles.formContainer}>
            <div className={styles.formHeader}>
                <h1 className={styles.formTitle}>Edit Product</h1>
                <Link to="/admin/products" className={styles.backLink}>
                    <ArrowLeft size={18} />
                    Back to Products
                </Link>
            </div>

            <form onSubmit={handleSubmit}>
                <div className={styles.formGrid}>
                    <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                        <label htmlFor="name" className={styles.formLabel}>Product Name</label>
                        <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} className={styles.formInput} />
                    </div>

                    <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                        <label htmlFor="description" className={styles.formLabel}>Description</label>
                        <textarea id="description" name="description" value={formData.description} onChange={handleChange} className={styles.formTextarea} />
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="price" className={styles.formLabel}>Price</label>
                        <input type="number" id="price" name="price" value={formData.price} onChange={handleChange} className={styles.formInput} />
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="countInStock" className={styles.formLabel}>Stock</label>
                        <input type="number" id="countInStock" name="countInStock" value={formData.countInStock} onChange={handleChange} className={styles.formInput} />
                    </div>

                    <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                        <label htmlFor="category" className={styles.formLabel}>Category</label>
                        <select id="category" name="category" value={formData.category} onChange={handleChange} className={styles.formSelect}>
                            <option value="">Select a category</option>
                            {categories.map(cat => (
                                <option key={cat._id} value={cat._id}>{cat.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className={`${styles.formGroup} ${styles.imageUploadSection}`}>
                        <label className={styles.formLabel}>Product Image</label>
                        <div className={styles.imagePreview}>
                            {imagePreview ? <img src={imagePreview} alt="Preview"/> : <ImageIcon size={40} className={styles.uploadIcon}/>}
                        </div>
                        <div className={styles.imageInputs}>
                            <label htmlFor="imageFile" className={styles.fileInputLabel}>
                                <Upload size={16}/> Upload New File
                            </label>
                            <input type="file" id="imageFile" onChange={handleImageChange} className={styles.fileInput} accept="image/*"/>
                            <span className={styles.orSeparator}>Or</span>
                            <input type="text" name="image" value={formData.image} onChange={handleChange} className={styles.formInput} placeholder="Enter image URL"/>
                        </div>
                    </div>

                    {isFashion && (
                      <div className={styles.formGroup}>
                        <label className={styles.formLabel}>Sizes (comma separated)</label>
                        <input type="text" value={sizesInput} onChange={e => setSizesInput(e.target.value)} className={styles.formInput} placeholder="e.g. S, M, L, XL" />
                      </div>
                    )}
                    {isElectronics && (
                      <div className={styles.formGroup}>
                        <label className={styles.formLabel}>Models/Storage (comma separated)</label>
                        <input type="text" value={modelsInput} onChange={e => setModelsInput(e.target.value)} className={styles.formInput} placeholder="e.g. 64GB, 128GB, 256GB" />
                      </div>
                    )}
                    
                    <div className={styles.formGroup}>
                        <label className={styles.formLabel}>Product Options</label>
                        {options.map((opt, idx) => (
                            <div key={idx} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                <input
                                    type="text"
                                    placeholder="Option name (e.g. Color)"
                                    value={opt.name}
                                    onChange={e => handleOptionNameChange(idx, e.target.value)}
                                    className={styles.formInput}
                                    style={{ flex: 1 }}
                                />
                                <input
                                    type="text"
                                    placeholder="Values (comma separated, e.g. Red, Blue)"
                                    value={opt.values}
                                    onChange={e => handleOptionValuesChange(idx, e.target.value)}
                                    className={styles.formInput}
                                    style={{ flex: 2 }}
                                />
                                {options.length > 1 && (
                                    <button type="button" onClick={() => handleRemoveOption(idx)} style={{ background: 'red', color: 'white', border: 'none', borderRadius: '3px', padding: '0 8px' }}>-</button>
                                )}
                                {idx === options.length - 1 && (
                                    <button type="button" onClick={handleAddOption} style={{ background: 'green', color: 'white', border: 'none', borderRadius: '3px', padding: '0 8px' }}>+</button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                <div className={styles.formActions}>
                    <button type="submit" className="btn btn-primary" disabled={loading}>
                        {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </form>
        </div>
    </div>
  );
};

export default EditProduct; 