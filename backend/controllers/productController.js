const Product = require('../models/Product');

// Create product (Admin only)
exports.createProduct = async (req, res) => {
  try {
    const product = await Product.create(req.body);
    const populatedProduct = await Product.findById(product._id)
      .populate('category', 'name');
    res.status(201).json(populatedProduct);
  } catch (err) {
    console.error(err);
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

    const products = await Product.find({
      ...keyword,
      ...category,
      ...price,
      isActive: true
    })
    .populate('category', 'name')
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
      .populate('category', 'name');
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.status(200).json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update product (Admin only)
exports.updateProduct = async (req, res) => {
  try {
    const updated = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate('category', 'name');
    if (!updated) return res.status(404).json({ message: 'Product not found' });
    res.status(200).json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Delete product (Admin only)
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.status(200).json({ message: 'Product deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
