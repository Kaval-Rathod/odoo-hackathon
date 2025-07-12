const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  image: {
    type: String,
    required: true
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true
  },
  countInStock: {
    type: Number,
    default: 0,
    min: 0
  },
  brand: {
    type: String,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  sizes: [{ type: String }],
  models: [{ type: String }],
  options: [
    {
      name: { type: String, required: true },
      values: [{ type: String, required: true }]
    }
  ]
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
