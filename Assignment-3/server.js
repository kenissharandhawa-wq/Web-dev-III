require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const productRoutes = require('./routes/products');
const errorHandler = require('./middleware/errorHandler');

const app = express();
app.use(express.json());
app.get('/', (req, res) => res.json({ message: 'Inventory Management API is running' }));
app.use('/api/products', productRoutes);
app.use((req, res) => res.status(404).json({ message: 'Route not found' }));
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
if (!process.env.MONGO_URI) { console.error('Set MONGO_URI in .env'); process.exit(1); }
mongoose.connect(process.env.MONGO_URI)
  .then(() => app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`)))
  .catch(err => { console.error('MongoDB connection failed:', err.message); process.exit(1); });
