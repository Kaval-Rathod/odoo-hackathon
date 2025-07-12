const Product = require('../models/Product');

// Create product (User or Admin)
exports.createProduct = async (req, res) => {
  try {
    const productData = {
      ...req.body,
      uploader: req.user._id,
      status: 'pending',
    };
    const product = await Product.create(productData);
    const populatedProduct = await Product.findById(product._id)
      .populate('category', 'name')
      .populate('uploader', 'name email');
    res.status(201).json(populatedProduct);
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: err.message });
  }
};

// Approve product (Admin only)
exports.approveProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { status: 'approved' },
      { new: true }
    );
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.status(200).json(product);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Reject product (Admin only)
exports.rejectProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { status: 'rejected' },
      { new: true }
    );
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.status(200).json(product);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Get all products (with search/filter)
exports.getAllProducts = async (req, res) => {
  try {
    const keyword = req.query.search
      ? { name: { $regex: req.query.search, $options: 'i' } }
      : {};

    const category = req.query.category
      ? { category: req.query.category }
      : {};

    const priceFilter = {};
    if (req.query.minPrice) priceFilter.$gte = req.query.minPrice;
    if (req.query.maxPrice) priceFilter.$lte = req.query.maxPrice;

    const price = Object.keys(priceFilter).length ? { price: priceFilter } : {};

    let statusFilter = { status: 'approved' };
    if (req.user && req.user.isAdmin) {
      statusFilter = {};
    }
    // If myUploads param, filter by uploader
    let uploaderFilter = {};
    if (req.query.myUploads && req.user) {
      uploaderFilter = { uploader: req.user._id };
      statusFilter = {}; // show all statuses for own uploads
    }

    const products = await Product.find({
      ...keyword,
      ...category,
      ...price,
      ...statusFilter,
      ...uploaderFilter,
      isActive: true
    })
    .populate('category', 'name')
    .populate('uploader', 'name email')
    .sort({ createdAt: -1 });

    res.status(200).json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get single product
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('category', 'name')
      .populate('uploader', 'name email');
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.status(200).json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update product (User can update their own, admin can update any)
exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    if (!req.user.isAdmin && product.uploader.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }
    const updated = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate('category', 'name');
    res.status(200).json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Delete product (User can delete their own, admin can delete any)
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    if (!req.user.isAdmin && product.uploader.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }
    await Product.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Product deleted' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
