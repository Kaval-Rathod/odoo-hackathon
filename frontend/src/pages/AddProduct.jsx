import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Upload, Image as ImageIcon, X } from 'lucide-react';
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

  const [images, setImages] = useState([]); // Array of image files/URLs
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [condition, setCondition] = useState('');
  const [type, setType] = useState('');
  const [sizes, setSizes] = useState([]);
  const [sizeInput, setSizeInput] = useState('');
  const [imageUrlInput, setImageUrlInput] = useState('');

  useEffect(() => {
    if (!user) {
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

  // --- IMAGE UPLOAD HANDLERS ---
  const handleImagesChange = (e) => {
    const files = Array.from(e.target.files);
    const validFiles = files.filter(file => file.type.startsWith('image/'));
    setImages(prev => [...prev, ...validFiles]);
  };
  const handleAddImageUrl = () => {
    if (imageUrlInput.trim() && /^https?:\/\//i.test(imageUrlInput.trim())) {
      setImages(prev => [...prev, imageUrlInput.trim()]);
      setImageUrlInput('');
    }
  };
  const handleRemoveImage = (idx) => {
    setImages(prev => prev.filter((_, i) => i !== idx));
  };

  // --- TAGS HANDLERS ---
  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags(prev => [...prev, tagInput.trim()]);
      setTagInput('');
    }
  };
  const handleRemoveTag = (tag) => {
    setTags(prev => prev.filter(t => t !== tag));
  };

  // --- SIZES HANDLERS ---
  const handleAddSize = () => {
    if (sizeInput.trim() && !sizes.includes(sizeInput.trim())) {
      setSizes(prev => [...prev, sizeInput.trim()]);
      setSizeInput('');
    }
  };
  const handleRemoveSize = (size) => {
    setSizes(prev => prev.filter(s => s !== size));
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

    if (images.length === 0) {
      newErrors.images = 'Please upload at least one image';
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

  const uploadImages = async (filesOrUrls) => {
    const urls = [];
    for (const item of filesOrUrls) {
      if (typeof item === 'string') {
        urls.push(item); // Already a URL
      } else {
        const formData = new FormData();
        formData.append('image', item);
        const response = await fetch('/api/upload', { method: 'POST', body: formData });
        if (!response.ok) throw new Error('Failed to upload image');
        const data = await response.json();
        urls.push(data.imageUrl);
      }
    }
    return urls;
  };

  const selectedCategory = categories.find(cat => cat._id === formData.category);
  const selectedCategoryName = selectedCategory ? selectedCategory.name.toLowerCase() : '';

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      let imageUrls = [];

      if (images.length > 0) {
        imageUrls = await uploadImages(images);
      }

      // Ensure at least one image URL is present
      if (!imageUrls[0]) {
        setErrors(prev => ({ ...prev, images: 'Please upload at least one image.' }));
        setLoading(false);
        return;
      }

      const productData = {
        name: formData.name,
        description: formData.description,
        price: formData.price,
        image: imageUrls[0], // Always send the first image as 'image'
        images: imageUrls,   // Optionally send all images
        category: formData.category,
        countInStock: formData.countInStock,
        brand: formData.brand,
        type,
        sizes,
        condition,
        tags
      };

      await productsAPI.create(productData);
      if (user.isAdmin) {
        toast.success('Product added successfully!');
        navigate('/admin/products');
      } else {
        toast.success('Product submitted for approval! It will be visible in the shop after admin approval.');
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Failed to add product:', error);
      toast.error('Failed to add product');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return null; // or a spinner
  }

  return (
    <div className={styles.adminLayout}>
      <div className={styles.formContainer}>
        <div className={styles.formHeader}>
          <h1 className={styles.formTitle}>Add New Item</h1>
          <Link to={user.isAdmin ? "/admin/products" : "/dashboard"} className={styles.backLink}>
            <ArrowLeft size={18} />
            Back
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

            {/* --- IMAGE UPLOAD --- */}
            <div className={`${styles.formGroup} ${styles.fullWidth}`}>
              <label className={styles.formLabel}>Product Images</label>
              <div className={styles.imageUploadBox}>
                <input type="file" multiple accept="image/*" onChange={handleImagesChange} className={styles.fileInput} />
                <div className={styles.imagePreviewRow}>
                  {images.map((img, idx) => (
                    <div key={idx} className={styles.imageThumbWrapper}>
                      <img
                        src={typeof img === 'string' ? img : URL.createObjectURL(img)}
                        alt="Preview"
                        className={styles.imageThumb}
                        onError={e => { e.target.src = '/default-product.svg'; }}
                      />
                      <button type="button" className={styles.removeImageBtn} onClick={() => handleRemoveImage(idx)}><X size={16}/></button>
                    </div>
                  ))}
                </div>
                <div className={styles.urlInputRow}>
                  <input type="text" value={imageUrlInput} onChange={e => setImageUrlInput(e.target.value)} className={styles.formInput} placeholder="Paste image URL and press Add" />
                  <button type="button" className={styles.addTagBtn} onClick={handleAddImageUrl}>Add</button>
                </div>
                {errors.images && <div className={styles.errorMsg}>{errors.images}</div>}
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Tags</label>
              <div className={styles.tagsInputRow}>
                <input type="text" value={tagInput} onChange={e => setTagInput(e.target.value)} className={styles.formInput} placeholder="Add tag and press Enter" onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddTag(); }}} />
                <button type="button" className={styles.addTagBtn} onClick={handleAddTag}>Add</button>
              </div>
              <div className={styles.tagsList}>
                {tags.map((tag, i) => (
                  <span key={i} className={styles.tagChip}>{tag} <button type="button" onClick={() => handleRemoveTag(tag)} className={styles.removeTagBtn}><X size={12}/></button></span>
                ))}
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Type</label>
              <input type="text" value={type} onChange={e => setType(e.target.value)} className={styles.formInput} placeholder="e.g. Shirt, Pants, Dress" />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Condition</label>
              <select value={condition} onChange={e => setCondition(e.target.value)} className={styles.formSelect}>
                <option value="">Select condition</option>
                <option value="new">New</option>
                <option value="like new">Like New</option>
                <option value="gently used">Gently Used</option>
                <option value="used">Used</option>
              </select>
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Sizes</label>
              <div className={styles.sizesInputRow}>
                <input type="text" value={sizeInput} onChange={e => setSizeInput(e.target.value)} className={styles.formInput} placeholder="Add size and press Enter" onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddSize(); }}} />
                <button type="button" className={styles.addSizeBtn} onClick={handleAddSize}>Add</button>
              </div>
              <div className={styles.sizesList}>
                {sizes.map((size, i) => (
                  <span key={i} className={styles.sizeChip}>{size} <button type="button" onClick={() => handleRemoveSize(size)} className={styles.removeSizeBtn}><X size={12}/></button></span>
                ))}
              </div>
            </div>
          </div>

          <div className={styles.formActions}>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving...' : 'Save Item'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProduct; 