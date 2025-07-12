const Wishlist = require('../models/Wishlist');

// @desc    Get user's wishlist
// @route   GET /api/wishlist
// @access  Private
exports.getWishlist = async (req, res) => {
    try {
        const wishlist = await Wishlist.findOne({ user: req.user._id }).populate('products');
        if (!wishlist) {
            return res.json({ products: [] });
        }
        res.json(wishlist);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Add product to wishlist
// @route   POST /api/wishlist
// @access  Private
exports.addToWishlist = async (req, res) => {
    const { productId } = req.body;
    try {
        let wishlist = await Wishlist.findOne({ user: req.user._id });

        if (!wishlist) {
            wishlist = await Wishlist.create({ user: req.user._id, products: [productId] });
        } else {
            if (!wishlist.products.includes(productId)) {
                wishlist.products.push(productId);
                await wishlist.save();
            }
        }
        const populatedWishlist = await Wishlist.findById(wishlist._id).populate('products');
        res.status(200).json(populatedWishlist);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Remove product from wishlist
// @route   DELETE /api/wishlist/:productId
// @access  Private
exports.removeFromWishlist = async (req, res) => {
    const { productId } = req.params;
    try {
        const wishlist = await Wishlist.findOne({ user: req.user._id });
        if (wishlist) {
            wishlist.products = wishlist.products.filter(p => p.toString() !== productId);
            await wishlist.save();
        }
        const populatedWishlist = await Wishlist.findOne({ user: req.user._id }).populate('products');
        res.status(200).json(populatedWishlist);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
}; 