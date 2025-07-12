import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Upload, Image as ImageIcon } from 'lucide-react';
import { productsAPI } from '../api/products';
import { categoriesAPI } from '../api/categories';
import toast from 'react-hot-toast';
import styles from '../styles/ProductForm.module.css';
import { useAuth } from '../contexts/AuthContext';

const AddProduct = () => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    image: '',
    countInStock: '',
    brand: ''
  });
  const [categories, setCategories] = useState([]);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [sizesInput, setSizesInput] = useState('');
  const [modelsInput, setModelsInput] = useState('');
  
  const { user } = useAuth();
  const navigate = useNavigate();

  const [options, setOptions] = useState([{ name: '', values: '' }]);

  useEffect(() => {
    if (!user?.isAdmin) {
        navigate('/login');
        return;
    }
    fetchCategories();
  }, [user, navigate]);

  const fetchCategories = async () => {
    try {
      const data = await categoriesAPI.getAll();
      setCategories(data);
    } catch (error) {
      toast.error('Failed to load categories.');
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setErrors(prev => ({
          ...prev,
          image: 'Image size should be less than 5MB'
        }));
        return;
      }

      if (!file.type.startsWith('image/')) {
        setErrors(prev => ({
          ...prev,
          image: 'Please upload an image file'
        }));
        return;
      }

      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setFormData(prev => ({ ...prev, image: '' })); // Clear image URL when file is selected
    }
  };

  const handleImageUrlChange = (e) => {
    const url = e.target.value;
    setFormData(prev => ({ ...prev, image: url }));
    setImageFile(null); // Clear file when URL is entered
    setImagePreview(url);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Product name is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Product description is required';
    }

    if (!formData.price || formData.price <= 0) {
      newErrors.price = 'Valid price is required';
    }

    if (!formData.category) {
      newErrors.category = 'Category is required';
    }

    if (!formData.countInStock || formData.countInStock < 0) {
      newErrors.countInStock = 'Valid stock quantity is required';
    }

    if (!imageFile && !formData.image) {
      newErrors.image = 'Please provide an image file or URL';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const uploadImage = async (file) => {
    const formData = new FormData();
    formData.append('image', file);
    
    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Failed to upload image');
      }
      
      const data = await response.json();
      return data.imageUrl;
    } catch (error) {
      console.error('Image upload failed:', error);
      throw new Error('Failed to upload image');
    }
  };

  const selectedCategory = categories.find(cat => cat._id === formData.category);
  const selectedCategoryName = selectedCategory ? selectedCategory.name.toLowerCase() : '';

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      let imageUrl = formData.image;

      if (imageFile) {
        imageUrl = await uploadImage(imageFile);
      }

      const optionsArray = options
        .filter(opt => opt.name && opt.values)
        .map(opt => ({ name: opt.name, values: opt.values.split(',').map(v => v.trim()).filter(Boolean) }));
      const productData = {
        ...formData,
        image: imageUrl,
        options: optionsArray
      };

      await productsAPI.create(productData);
      toast.success('Product added successfully!');
      navigate('/admin/products');
    } catch (error) {
      console.error('Failed to add product:', error);
      toast.error('Failed to add product');
    } finally {
      setLoading(false);
    }
  };

  if (!user?.isAdmin) {
    return (
      <div className={styles.addProductContainer}>
        <div className={styles.accessDeniedBox}>
          <h1 className={styles.accessDeniedTitle}>Access Denied</h1>
          <p className={styles.accessDeniedText}>You don't have permission to add products.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.adminLayout}>
      <div className={styles.formContainer}>
        <div className={styles.formHeader}>
          <h1 className={styles.formTitle}>Add New Product</h1>
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
                  <Upload size={16}/> Upload File
                </label>
                <input type="file" id="imageFile" onChange={handleImageChange} className={styles.fileInput} accept="image/*"/>
                <span className={styles.orSeparator}>Or</span>
                <input type="text" name="image" value={formData.image} onChange={handleImageUrlChange} className={styles.formInput} placeholder="Enter image URL"/>
              </div>
            </div>

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
              {loading ? 'Saving...' : 'Save Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProduct; 