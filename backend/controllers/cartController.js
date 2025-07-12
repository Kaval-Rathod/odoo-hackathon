const Cart = require('../models/Cart');

// GET /api/cart - Get current user's cart
exports.getCart = async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
  res.json(cart || { items: [] });
};

// POST /api/cart - Add or update an item in cart
exports.addToCart = async (req, res) => {
  const { productId, quantity } = req.body;

  if (req.user && req.user.isAdmin) {
    return res.status(403).json({ message: 'Admins cannot add products to cart' });
  }

  let cart = await Cart.findOne({ user: req.user._id });

  if (!cart) {
    cart = new Cart({ user: req.user._id, items: [] });
  }

  const existingItem = cart.items.find(item => item.product.toString() === productId);

  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    cart.items.push({ product: productId, quantity });
  }

  await cart.save();
  res.status(200).json(cart);
};

// DELETE /api/cart/:cartItemId - Remove item from cart
exports.removeFromCart = async (req, res) => {
  const { cartItemId } = req.params;

  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) return res.status(404).json({ message: 'Cart not found' });

  const itemIndex = cart.items.findIndex(item => item._id.toString() === cartItemId);

  if (itemIndex > -1) {
    cart.items.splice(itemIndex, 1);
    await cart.save();
    const populatedCart = await Cart.findOne({ user: req.user._id }).populate('items.product');
    res.status(200).json(populatedCart);
  } else {
    res.status(404).json({ message: 'Item not found in cart' });
  }
};

// PUT /api/cart/:cartItemId - Update item quantity
exports.updateCartItemQuantity = async (req, res) => {
  const { cartItemId } = req.params;
  const { quantity } = req.body;

  if (quantity == null || quantity < 1) {
    return res.status(400).json({ message: 'Invalid quantity' });
  }

  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) return res.status(404).json({ message: 'Cart not found' });

  const item = cart.items.id(cartItemId);

  if (item) {
    item.quantity = quantity;
    await cart.save();
    const populatedCart = await Cart.findOne({ user: req.user._id }).populate('items.product');
    res.status(200).json(populatedCart);
  } else {
    res.status(404).json({ message: 'Item not found in cart' });
  }
};
