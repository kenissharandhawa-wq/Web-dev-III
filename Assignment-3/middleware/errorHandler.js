module.exports = (err, req, res, next) => {
  if (err.code === 11000) return res.status(409).json({ message: 'SKU already exists' });
  if (err.name === 'ValidationError') return res.status(400).json({ message: err.message });
  if (err.name === 'CastError') return res.status(400).json({ message: 'Invalid product ID' });
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) return res.status(400).json({ message: 'Invalid JSON body' });
  console.error(err);
  res.status(500).json({ message: 'Internal server error' });
};
