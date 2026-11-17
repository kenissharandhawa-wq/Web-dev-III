const router = require('express').Router();
const mongoose = require('mongoose');
const Product = require('../models/Product');
const asyncRoute = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
const validId = (req, res, next) => mongoose.isValidObjectId(req.params.id) ? next() : res.status(400).json({ message: 'Invalid product ID' });
const allowed = ['name', 'sku', 'category', 'price', 'quantity', 'reorderLevel', 'supplier'];
const cleanBody = body => Object.fromEntries(Object.entries(body).filter(([key]) => allowed.includes(key)));
router.use((req, res, next) => {
  if (['POST', 'PUT', 'PATCH'].includes(req.method) && (!req.body || typeof req.body !== 'object' || Array.isArray(req.body))) {
    return res.status(400).json({ message: 'A JSON object body is required' });
  }
  next();
});
const badNumber = (v) => v === '' || !Number.isFinite(Number(v));

router.get('/low-stock', asyncRoute(async (req, res) => {
  const lowStockItems = await Product.find({ $expr: { $lte: ['$quantity', '$reorderLevel'] } }).sort({ quantity: 1 });
  res.json({ count: lowStockItems.length, lowStockItems });
}));

router.get('/summary', asyncRoute(async (req, res) => {
  const summary = await Product.aggregate([
    { $group: { _id: '$category', totalItems: { $sum: 1 }, totalQuantity: { $sum: '$quantity' }, totalStockValue: { $sum: { $multiply: ['$price', '$quantity'] } }, avgPrice: { $avg: '$price' } } },
    { $project: { totalItems: 1, totalQuantity: 1, totalStockValue: { $round: ['$totalStockValue', 2] }, avgPrice: { $round: ['$avgPrice', 2] } } },
    { $sort: { _id: 1 } }
  ]);
  res.json({ categories: summary.length, summary });
}));

router.post('/', asyncRoute(async (req, res) => {
  const product = await Product.create(cleanBody(req.body));
  res.status(201).json(product);
}));

router.get('/', asyncRoute(async (req, res) => {
  const page = Number(req.query.page ?? 1);
  const limit = Number(req.query.limit ?? 10);
  if (!Number.isInteger(page) || page < 1 || !Number.isInteger(limit) || limit < 1 || limit > 100) return res.status(400).json({ message: 'page must be positive and limit must be 1-100' });
  const filter = {};
  if (req.query.category) {
    if (typeof req.query.category !== 'string') return res.status(400).json({ message: 'Invalid category' });
    filter.category = req.query.category;
  }
  if (req.query.search && typeof req.query.search !== 'string') return res.status(400).json({ message: 'Invalid search' });
  if (req.query.search) filter.name = { $regex: String(req.query.search).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' };
  if (req.query.minPrice !== undefined) {
    if (badNumber(req.query.minPrice) || Number(req.query.minPrice) < 0) return res.status(400).json({ message: 'Invalid minPrice' });
    filter.price = { ...filter.price, $gte: Number(req.query.minPrice) };
  }
  if (req.query.maxPrice !== undefined) {
    if (badNumber(req.query.maxPrice) || Number(req.query.maxPrice) < 0) return res.status(400).json({ message: 'Invalid maxPrice' });
    filter.price = { ...filter.price, $lte: Number(req.query.maxPrice) };
  }
  const sortFields = ['name', 'price', 'quantity', 'createdAt', 'category'];
  const sortBy = String(req.query.sortBy || 'createdAt');
  if (!sortFields.includes(sortBy)) return res.status(400).json({ message: 'Invalid sortBy field' });
  if (req.query.order && !['asc', 'desc'].includes(req.query.order)) return res.status(400).json({ message: 'order must be asc or desc' });
  const order = req.query.order === 'asc' ? 1 : -1;
  const [total, products] = await Promise.all([
    Product.countDocuments(filter),
    Product.find(filter).sort({ [sortBy]: order }).skip((page - 1) * limit).limit(limit)
  ]);
  res.json({ total, page, totalPages: Math.ceil(total / limit), count: products.length, products });
}));

router.get('/:id', validId, asyncRoute(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ message: 'Product not found' });
  res.json(product);
}));

router.put('/:id', validId, asyncRoute(async (req, res) => {
  if (Object.keys(cleanBody(req.body)).length === 0) return res.status(400).json({ message: 'No valid product fields provided' });
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ message: 'Product not found' });
  Object.assign(product, cleanBody(req.body));
  await product.save();
  res.json(product);
}));

router.patch('/:id/stock', validId, asyncRoute(async (req, res) => {
  const { change } = req.body;
  if (!Number.isSafeInteger(change) || change === 0) return res.status(400).json({ message: 'change must be a non-zero integer' });
  const product = await Product.findOneAndUpdate(
    { _id: req.params.id, quantity: change < 0 ? { $gte: -change } : { $lte: Number.MAX_SAFE_INTEGER - change } },
    { $inc: { quantity: change } },
    { new: true, runValidators: true }
  );
  if (!product) {
    const exists = await Product.exists({ _id: req.params.id });
    return res.status(exists ? 400 : 404).json({ message: exists ? 'Insufficient stock' : 'Product not found' });
  }
  res.json({ message: 'Stock updated', product });
}));

router.delete('/:id', validId, asyncRoute(async (req, res) => {
  const product = await Product.findByIdAndDelete(req.params.id);
  if (!product) return res.status(404).json({ message: 'Product not found' });
  res.json({ message: 'Product deleted', id: product.id });
}));

module.exports = router;
