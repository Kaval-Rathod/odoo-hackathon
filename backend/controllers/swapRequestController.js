const SwapRequest = require('../models/SwapRequest');
const Product = require('../models/Product');
const User = require('../models/User');

// Create a swap or point redemption request
exports.createSwapRequest = async (req, res) => {
  try {
    const { itemId, type } = req.body;
    if (!itemId || !type) return res.status(400).json({ message: 'Missing itemId or type' });
    const item = await Product.findById(itemId);
    if (!item) return res.status(404).json({ message: 'Item not found' });
    if (item.status !== 'approved') return res.status(400).json({ message: 'Item not available for swap/redeem' });
    if (item.uploader.toString() === req.user._id.toString()) return res.status(400).json({ message: 'Cannot request your own item' });
    // Only one pending request per user per item
    const existing = await SwapRequest.findOne({ requester: req.user._id, item: itemId, status: 'pending' });
    if (existing) return res.status(400).json({ message: 'You already have a pending request for this item' });
    const swapRequest = await SwapRequest.create({
      requester: req.user._id,
      item: itemId,
      type
    });
    res.status(201).json(swapRequest);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Accept a swap/point request (item uploader only)
exports.acceptSwapRequest = async (req, res) => {
  try {
    const swapRequest = await SwapRequest.findById(req.params.id).populate('item');
    if (!swapRequest) return res.status(404).json({ message: 'Request not found' });
    if (swapRequest.item.uploader.toString() !== req.user._id.toString()) return res.status(403).json({ message: 'Not authorized' });
    if (swapRequest.status !== 'pending') return res.status(400).json({ message: 'Request is not pending' });
    // Mark as accepted
    swapRequest.status = 'accepted';
    await swapRequest.save();
    // Mark item as swapped/redeemed
    swapRequest.item.status = swapRequest.type === 'swap' ? 'swapped' : 'redeemed';
    await swapRequest.item.save();
    // If point redemption, deduct points from user and add to uploader
    if (swapRequest.type === 'points') {
      const requester = await User.findById(swapRequest.requester);
      const uploader = await User.findById(swapRequest.item.uploader);
      const pointsCost = 10; // Example: each item costs 10 points
      if (requester.points < pointsCost) return res.status(400).json({ message: 'Not enough points' });
      requester.points -= pointsCost;
      uploader.points += pointsCost;
      await requester.save();
      await uploader.save();
    }
    res.json({ message: 'Request accepted', swapRequest });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Reject a swap/point request (item uploader only)
exports.rejectSwapRequest = async (req, res) => {
  try {
    const swapRequest = await SwapRequest.findById(req.params.id).populate('item');
    if (!swapRequest) return res.status(404).json({ message: 'Request not found' });
    if (swapRequest.item.uploader.toString() !== req.user._id.toString()) return res.status(403).json({ message: 'Not authorized' });
    if (swapRequest.status !== 'pending') return res.status(400).json({ message: 'Request is not pending' });
    swapRequest.status = 'rejected';
    await swapRequest.save();
    res.json({ message: 'Request rejected', swapRequest });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// List swap/point requests for current user
exports.getMySwapRequests = async (req, res) => {
  try {
    const requests = await SwapRequest.find({ requester: req.user._id })
      .populate('item');
    res.json(requests);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// List swap/point requests for items uploaded by current user
exports.getRequestsForMyItems = async (req, res) => {
  try {
    // Find all items uploaded by user
    const myItems = await Product.find({ uploader: req.user._id });
    const itemIds = myItems.map(i => i._id);
    const requests = await SwapRequest.find({ item: { $in: itemIds } })
      .populate('item')
      .populate('requester', 'name email');
    res.json(requests);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}; 