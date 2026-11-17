const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, minlength: 2 },
  sku: { type: String, required: true, unique: true, trim: true, uppercase: true },
  category: { type: String, required: true, trim: true },
  price: { type: Number, required: true, min: 0 },
  quantity: { type: Number, required: true, min: 0, validate: Number.isInteger },
  reorderLevel: { type: Number, default: 5, min: 0, validate: Number.isInteger },
  supplier: { type: String, default: '', trim: true }
}, { timestamps: true, toJSON: { virtuals: true } });

productSchema.virtual('stockValue').get(function () { return this.price * this.quantity; });
module.exports = mongoose.model('Product', productSchema);
